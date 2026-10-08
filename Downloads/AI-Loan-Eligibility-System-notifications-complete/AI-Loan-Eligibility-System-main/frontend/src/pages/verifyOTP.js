import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/verifyOTP.css";
import LotusNavbar from "../components/LotusNavbar";


function VerifyOTP(){

    const navigate = useNavigate();

    const [otp, setOtp] = useState("");

    const handleVerify = async(e)=>{

        e.preventDefault();


        const requestId = localStorage.getItem("requestId");


        if(!requestId){

            alert("OTP request not found. Please register again.");

            navigate("/register");

            return;

        }


        try{

            const response = await fetch(
                "http://localhost:5000/api/users/verify-otp",
                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        requestId: requestId,
                        otp: otp

                    })

                }
            );


            const data = await response.json();


            if(response.ok){

                alert("Account created successfully!");

                localStorage.removeItem("requestId");
                localStorage.removeItem("email");

                navigate("/login");

            }
            else{

                alert(data.message);

            }


        }
        catch(error){

            console.log(error);

            alert("Something went wrong");

        }


    };


    return(

        <div className="lotus-shell">

            <LotusNavbar />

            <div className="otp-container">


            <div className="otp-card">


                <h1>
                    Lotus Finance
                </h1>


                <h2>
                    Verify OTP
                </h2>


                <p>
                    Enter the OTP sent to your email
                </p>



                <form onSubmit={handleVerify}>


                    <input

                        type="text"

                        maxLength="6"

                        value={otp}

                        onChange={(e)=>setOtp(e.target.value)}

                        placeholder="Enter 6 digit OTP"

                        required

                    />



                    <button type="submit">

                        Verify OTP

                    </button>


                </form>


            </div>

        </div>

        </div>

    );


}


export default VerifyOTP;