const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const PendingRegistration = require("../models/PendingRegistration");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Default Admin Account

const ADMIN_ACCOUNT = {

    name: "Lotus Finance",

    email: "lotusfinanceofficial@gmail.com",

    password: "1234",

    role: "admin"

};



// Create Admin Automatically

const ensureAdminUser = async () => {


    const existingAdmin = await User.findOne({

        email: ADMIN_ACCOUNT.email

    });



    if(existingAdmin){

        return;

    }



    const hashedPassword = await bcrypt.hash(

        ADMIN_ACCOUNT.password,

        10

    );



    await User.create({

        name: ADMIN_ACCOUNT.name,

        email: ADMIN_ACCOUNT.email,

        password: hashedPassword,

        role:"admin"

    });


    console.log("Default admin created");

};

const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: "customer" })
            .select("name email phoneNumber nationalId dateOfBirth gender province district address employmentStatus monthlyIncome accountStatus createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({ customers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// Email Transporter

const getMailer = () => {


    return nodemailer.createTransport({

        service:"gmail",

        auth:{

            user:process.env.EMAIL_USER,

            pass:process.env.EMAIL_PASS

        }

    });


};





// Send OTP Email

const sendOtpEmail = async ({email,name,otp})=>{


    const transporter = getMailer();



    await transporter.sendMail({


        from:`Lotus Finance <${process.env.EMAIL_USER}>`,


        to:email,


        subject:"Lotus Finance Email Verification OTP",



        html:`

        <div style="font-family:Arial">


        <h2 style="color:#0F766E">

        🌸 Lotus Finance

        </h2>


        <h3>
        Welcome ${name}
        </h3>


        <p>
        Your verification OTP is:
        </p>


        <h1 style="color:#EC4899">

        ${otp}

        </h1>


        <p>
        OTP expires in 5 minutes.
        </p>


        <p>
        Do not share this OTP.
        </p>


        </div>

        `


    });


};






// STEP 1 - Request OTP


const requestRegistrationOtp = async(req,res)=>{


    try{


        const { 
    name, 
    email, 
    password, 
    province,
    district,
    phoneNumber,
    nationalId,
    dateOfBirth,
    gender,
    address,
    employmentStatus,
    monthlyIncome,
    role 
} = req.body;



        if(!name || !email || !password){

            return res.status(400).json({

                message:"Name email password required"

            });

        }



        const normalizedEmail = email.toLowerCase();



        const existingUser = await User.findOne({

            email:normalizedEmail

        });



        if(existingUser){

            return res.status(400).json({

                message:"User already exists"

            });

        }



        await PendingRegistration.deleteMany({

            email:normalizedEmail

        });



        const otp = String(

            Math.floor(

                100000 + Math.random()*900000

            )

        );



        const hashedPassword = await bcrypt.hash(

            password,

            10

        );




        const requestId = crypto.randomUUID();




        await PendingRegistration.create({

    requestId,

    name,

    email: normalizedEmail,

    hashedPassword,

    province,

    district,

    phoneNumber,

    nationalId,

    dateOfBirth,

    gender,

    address,

    employmentStatus,

    monthlyIncome,

    role: role || "customer",

    otp,

    expiresAt: new Date(Date.now() + 5 * 60 * 1000),

});




        await sendOtpEmail({

            email:normalizedEmail,

            name,

            otp

        });




        res.status(200).json({


            message:"OTP sent successfully",


            requestId


        });



    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};









// STEP 2 - Verify OTP


const verifyRegistrationOtp = async(req,res)=>{


    try{


        const {

            requestId,

            otp

        } = req.body;




        const pending = await PendingRegistration.findOne({

            requestId

        });





        if(!pending){


            return res.status(400).json({

                message:"OTP expired or invalid request"

            });


        }





        if(

            pending.expiresAt < Date.now()

        ){


            await PendingRegistration.deleteOne({

                _id:pending._id

            });



            return res.status(400).json({

                message:"OTP expired"

            });


        }






        if(pending.otp !== otp){


            return res.status(400).json({

                message:"Invalid OTP"

            });


        }






        const user = await User.create({

    name: pending.name,

    email: pending.email,

    password: pending.hashedPassword,

    province: pending.province,

    district: pending.district,

    phoneNumber: pending.phoneNumber,

    nationalId: pending.nationalId,

    dateOfBirth: pending.dateOfBirth,

    gender: pending.gender,

    address: pending.address,

    employmentStatus: pending.employmentStatus,

    monthlyIncome: pending.monthlyIncome,

    role: pending.role,

});





        await PendingRegistration.deleteOne({

            _id:pending._id

        });


        // Welcome notification - shown on the customer's Notifications page
        // right after their account is created. Never blocks registration.
        try {

            await Notification.create({

                userId: user._id,

                title: `Welcome to Lotus Finance, ${user.name}!`,

                message: "Your account has been created successfully. You can now apply for a loan and track its status right here.",

                type: "account"

            });

        } catch (notificationError) {

            console.error("Failed to create welcome notification:", notificationError.message);

        }


        res.status(201).json({


            message:"Account created successfully",


            user:{


                id:user._id,


                name:user.name,


                email:user.email,


                role:user.role,

                phoneNumber:user.phoneNumber,

                nationalId:user.nationalId,

                dateOfBirth:user.dateOfBirth,

                gender:user.gender,

                province:user.province,

                district:user.district,

                address:user.address,

                employmentStatus:user.employmentStatus,

                monthlyIncome:user.monthlyIncome,

                accountStatus:user.accountStatus


            }


        });




    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};








// Resend OTP


const resendRegistrationOtp = async(req,res)=>{


    try{


        const {requestId}=req.body;



        const pending = await PendingRegistration.findOne({

            requestId

        });



        if(!pending){

            return res.status(400).json({

                message:"Request expired"

            });

        }



        const otp = String(

            Math.floor(

                100000+Math.random()*900000

            )

        );




        pending.otp=otp;


        pending.expiresAt=new Date(

            Date.now()+5*60*1000

        );


        await pending.save();




        await sendOtpEmail({

            email:pending.email,

            name:pending.name,

            otp

        });




        res.json({

            message:"OTP resent successfully"

        });



    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};









// LOGIN


const loginUser = async(req,res)=>{


    try{


        const {

            email,

            password

        }=req.body;




        const user = await User.findOne({

            email

        });





        if(!user){

            return res.status(400).json({

                message:"Invalid email or password"

            });

        }




        const match = await bcrypt.compare(

            password,

            user.password

        );





        if(!match){


            return res.status(400).json({

                message:"Invalid email or password"

            });


        }




        const token = jwt.sign(

            {


                id:user._id,


                role:user.role,
                phoneNumber:user.phoneNumber,
                nationalId:user.nationalId,
                dateOfBirth:user.dateOfBirth,
                gender:user.gender,
                province:user.province,
                district:user.district,
                address:user.address,
                employmentStatus:user.employmentStatus,
                monthlyIncome:user.monthlyIncome,
                accountStatus:user.accountStatus


            },


            process.env.JWT_SECRET,


            {

                expiresIn:"1d"

            }


        );





        res.json({


            message:"Login successful",


            token,

            user:{


                id:user._id,


                name:user.name,


                email:user.email,


                role:user.role,
                phoneNumber:user.phoneNumber,
                nationalId:user.nationalId,
                dateOfBirth:user.dateOfBirth,
                gender:user.gender,
                province:user.province,
                district:user.district,
                address:user.address,
                employmentStatus:user.employmentStatus,
                monthlyIncome:user.monthlyIncome,
                accountStatus:user.accountStatus


            }


        });




    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};








module.exports={


    ensureAdminUser,


    getCustomers,


    requestRegistrationOtp,


    verifyRegistrationOtp,


    resendRegistrationOtp,


    loginUser


};