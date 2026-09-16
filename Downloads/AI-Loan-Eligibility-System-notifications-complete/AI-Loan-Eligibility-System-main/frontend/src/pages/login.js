import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LotusNavbar from "../components/LotusNavbar";
import axios from "axios";


function Login(){

    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


    const [formData, setFormData] = useState({

        email: "",
        password: "",

    });


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");



    const handleChange = (event)=>{

        const {name,value} = event.target;


        setFormData((current)=>({

            ...current,

            [name]:value

        }));

    };




    const handleSubmit = async(event)=>{

        event.preventDefault();


        try{

            setLoading(true);

            setError("");



            const response = await axios.post(

                `${API_BASE_URL}/api/users/login`,

                formData

            );



            localStorage.setItem(

                "lotusToken",

                response.data.token

            );



            localStorage.setItem(

                "lotusUser",

                JSON.stringify(response.data.user)

            );



            window.dispatchEvent(new Event("storage"));



            const userRole = response.data.user.role;



            // Admin + Loan Officer

            if(userRole === "admin" || userRole === "loan_officer"){


                navigate("/admin-dashboard");

                return;

            }




            // Customer

            if(userRole === "customer"){


                navigate("/customer-dashboard");

                return;

            }



            // Other roles

            navigate("/");



        }


        catch(loginError){


            setError(

                loginError.response?.data?.message ||

                "Unable to login. Please try again."

            );


        }


        finally{


            setLoading(false);


        }


    };







    return(

        <div className="lotus-shell">


            <LotusNavbar />



            <section className="auth-grid">


                <div className="info-panel">


                    <div className="panel-badge">

                        Secure sign in

                    </div>



                    <h2>

                        Login to manage your loan journey.

                    </h2>



                    <p>

                        Return to your Lotus Finance dashboard to review applications, check eligibility, and continue where you left off.

                    </p>




                    <ul>

                        <li>
                            Clean, focused login flow
                        </li>


                        <li>
                            Built for customers and loan officers
                        </li>


                        <li>
                            Trust-led visual style with premium branding
                        </li>


                    </ul>



                </div>







                <div className="auth-card">


                    <h1>

                        Sign in

                    </h1>



                    <p className="helper-text">

                        Use your registered email and password to access the Lotus Finance portal.

                    </p>




                    {

                        error &&

                        <div className="form-error">

                            {error}

                        </div>

                    }






                    <form 

                        className="auth-form"

                        onSubmit={handleSubmit}

                    >



                        <input

                            className="lotus-input"

                            type="email"

                            name="email"

                            value={formData.email}

                            onChange={handleChange}

                            placeholder="Email address"

                            required

                        />





                        <input

                            className="lotus-input"

                            type="password"

                            name="password"

                            value={formData.password}

                            onChange={handleChange}

                            placeholder="Password"

                            required

                        />







                        <div className="form-meta">


                            <label className="checkbox-line">


                                <input type="checkbox" />


                                Remember me


                            </label>




                            <a href="#forgot">

                                Forgot password?

                            </a>



                        </div>







                        <button

                            type="submit"

                            className="emerald-pill w-100"

                            disabled={loading}

                        >


                            {

                                loading

                                ?

                                "Logging in..."

                                :

                                "Login"

                            }


                        </button>




                    </form>







                    <p className="auth-note">


                        New here?


                        <Link to="/register">

                            Create a Lotus Finance account

                        </Link>



                    </p>





                </div>



            </section>



        </div>


    );


}



export default Login;