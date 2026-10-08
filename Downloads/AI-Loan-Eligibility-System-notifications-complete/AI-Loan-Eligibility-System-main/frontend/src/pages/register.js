import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Register.css";
import LotusNavbar from "../components/LotusNavbar";

import { provinces } from "../data/provinces";
import { districts } from "../data/districts";

import { FaEye, FaEyeSlash } from "react-icons/fa";


function Register() {
    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        name: "",
        email: "",
        phoneNumber: "",
        nationalId: "",
        dateOfBirth: "",
        gender: "",
        province: "",
        district: "",
        address: "",
        employmentStatus: "Employed",
        monthlyIncome: "",
        password: "",
        confirmPassword: ""

    });



    const [selectedDistricts, setSelectedDistricts] = useState([]);


    const [showPassword, setShowPassword] = useState(false);


    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const [agreeTerms, setAgreeTerms] = useState(false);




    const handleChange = (e)=>{


        const {name,value} = e.target;



        setFormData({

            ...formData,

            [name]:value

        });



        if(name === "province"){


            setSelectedDistricts(

                districts[value] || []

            );



            setFormData((prev)=>({

                ...prev,

                province:value,

                district:""

            }));


        }


    };






    const handleSubmit = async(e)=>{


        e.preventDefault();




        if(formData.password !== formData.confirmPassword){


            alert("Passwords do not match!");

            return;

        }





        if(!agreeTerms){


            alert("Please accept Terms & Conditions");

            return;

        }





        try{


            const response = await fetch(

                "http://localhost:5000/api/users/request-otp",

                {


                    method:"POST",


                    headers:{


                        "Content-Type":"application/json"


                    },


                    body:JSON.stringify({

    name: formData.name,

    email: formData.email,

    phoneNumber: formData.phoneNumber,

    nationalId: formData.nationalId,

    dateOfBirth: formData.dateOfBirth,

    gender: formData.gender,

    password: formData.password,

    province: formData.province,

    district: formData.district,

    address: formData.address,

    employmentStatus: formData.employmentStatus,

    monthlyIncome: Number(formData.monthlyIncome),

    role:"customer"

})


                }


            );





            const data = await response.json();
            console.log("OTP RESPONSE:", data);




if(response.ok){

    console.log("STEP 1");

    alert("OTP sent successfully");


    console.log("STEP 2");


    localStorage.setItem(
        "requestId",
        data.requestId
    );


    localStorage.setItem(
        "email",
        formData.email
    );


    console.log("STEP 3");


    navigate("/verify-otp");


    console.log("STEP 4");

}



        }

        catch(error){

    console.log("REGISTER ERROR:", error);

    alert(error.message);

}





    };







    return(



        <div className="lotus-shell">

            <LotusNavbar />

            <div className="register-container">



            <div className="register-card">



                <div className="logo">

                    🌸

                </div>




                <h1>

                    Lotus Finance

                </h1>



                <h2>

                    Create Account

                </h2>




                <p className="subtitle">

                    Secure AI Loan Eligibility Platform

                </p>





                <form onSubmit={handleSubmit}>


                    {/* Name */}

                    <label>

                        Full Name

                    </label>


                    <input

                        type="text"

                        name="name"

                        value={formData.name}

                        onChange={handleChange}

                        placeholder="Enter your name"

                        required

                    />

                    <label>Phone Number</label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter phone number" required />

                    <label>NIC / National ID</label>
                    <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} placeholder="Enter national ID" required />

                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />

                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                    </select>





                    {/* Province */}


                    <label>

                        Province

                    </label>


                    <select

                        name="province"

                        value={formData.province}

                        onChange={handleChange}

                        required

                    >


                        <option value="">

                            Select Province

                        </option>


                        {

                            provinces.map((province)=>(


                                <option

                                    key={province}

                                    value={province}

                                >

                                    {province}

                                </option>



                            ))

                        }


                    </select>

                    <label>Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter residential address" required />

                    <label>Employment Status</label>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required>
                        <option value="Employed">Employed</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Student">Student</option>
                        <option value="Retired">Retired</option>
                    </select>

                    <label>Monthly Income</label>
                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} placeholder="Enter monthly income" min="0" required />







                    {/* District */}



                    <label>

                        District

                    </label>



                    <select

                        name="district"

                        value={formData.district}

                        onChange={handleChange}

                        required

                    >


                        <option value="">


                            Select District


                        </option>




                        {

                            selectedDistricts.map((district)=>(


                                <option

                                    key={district}

                                    value={district}

                                >

                                    {district}

                                </option>



                            ))

                        }



                    </select>







                    {/* Email */}



                    <label>

                        Email

                    </label>


                    <input


                        type="email"

                        name="email"

                        value={formData.email}

                        onChange={handleChange}

                        placeholder="example@gmail.com"

                        required


                    />









                    {/* Password */}



                    <label>

                        Password

                    </label>



                    <div className="password-field">


                        <input


                            type={showPassword ? "text":"password"}


                            name="password"


                            value={formData.password}


                            onChange={handleChange}


                            placeholder="Enter password"


                            required


                        />



                        <span

                            className="eye-icon"

                            onClick={()=>setShowPassword(!showPassword)}

                        >


                            {

                                showPassword

                                ?

                                <FaEyeSlash/>

                                :

                                <FaEye/>

                            }


                        </span>


                    </div>







                    {/* Confirm Password */}




                    <label>

                        Confirm Password

                    </label>




                    <div className="password-field">



                        <input


                            type={showConfirmPassword ? "text":"password"}


                            name="confirmPassword"


                            value={formData.confirmPassword}


                            onChange={handleChange}


                            placeholder="Confirm password"


                            required


                        />




                        <span

                            className="eye-icon"

                            onClick={()=>setShowConfirmPassword(!showConfirmPassword)}

                        >



                            {

                                showConfirmPassword

                                ?

                                <FaEyeSlash/>

                                :

                                <FaEye/>

                            }


                        </span>



                    </div>









                    {/* Terms */}




                    <div className="terms">


                        <input


                            type="checkbox"


                            checked={agreeTerms}


                            onChange={(e)=>setAgreeTerms(e.target.checked)}


                        />



                        <span>

                            I agree to Terms & Conditions

                        </span>


                    </div>







                    <button

                        type="submit"

                    >


                        Create Account


                    </button>






                    <p className="login-text">


                        Already have an account?


                        <span>

                            Login

                        </span>


                    </p>





                </form>





            </div>

        </div>

        </div>


    );


}



export default Register;