import React, {useEffect, useState} from "react";
import LotusNavbar from "../components/LotusNavbar";
import "../styles/Profile.css";


function CustomerProfile(){

    const [user,setUser] = useState(null);


    useEffect(()=>{

        const data = localStorage.getItem("lotusUser");

        if(data){

            setUser(JSON.parse(data));

        }

    },[]);



    return(

        <div className="lotus-shell">

            <LotusNavbar />

            <div className="profile-card">

                <div className="profile-card__heading">
                    <div>
                        <div className="profile-eyebrow">Account profile</div>
                        <h1>Customer Profile</h1>
                    </div>
                    <span className="profile-status">{user?.accountStatus || "Verified"}</span>
                </div>

                <div className="profile-details">
                    <div><span>Full Name</span><strong>{user?.name || "Not provided"}</strong></div>
                    <div><span>Email Address</span><strong>{user?.email || "Not provided"}</strong></div>
                    <div><span>Phone Number</span><strong>{user?.phoneNumber || "Not provided"}</strong></div>
                    <div><span>NIC / National ID</span><strong>{user?.nationalId || "Not provided"}</strong></div>
                    <div><span>Date of Birth</span><strong>{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}</strong></div>
                    <div><span>Gender</span><strong>{user?.gender || "Not provided"}</strong></div>
                    <div><span>Province</span><strong>{user?.province || "Not provided"}</strong></div>
                    <div><span>District</span><strong>{user?.district || "Not provided"}</strong></div>
                    <div className="profile-details__wide"><span>Address</span><strong>{user?.address || "Not provided"}</strong></div>
                    <div><span>Employment Status</span><strong>{user?.employmentStatus || "Not provided"}</strong></div>
                </div>



            </div>


        </div>

    );

}


export default CustomerProfile;