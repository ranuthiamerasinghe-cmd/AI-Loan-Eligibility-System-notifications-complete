import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/fintech.css";
import LotusNavbar from "../components/LotusNavbar";


function riskBarClass(riskLevel, index) {
    // 1 bar filled for Low, 2 for Medium, 3 for High
    const filledCount = riskLevel === "Low" ? 1 : riskLevel === "Medium" ? 2 : riskLevel === "High" ? 3 : 0;
    if (index >= filledCount) return "fin-risk__bar";

    if (riskLevel === "Low") return "fin-risk__bar fin-risk__bar--low";
    if (riskLevel === "Medium") return "fin-risk__bar fin-risk__bar--medium";
    if (riskLevel === "High") return "fin-risk__bar fin-risk__bar--high";
    return "fin-risk__bar";
}

function statusClass(status) {
    if (status === "Approved") return "fin-status fin-status--approved";
    if (status === "Rejected") return "fin-status fin-status--rejected";
    return "fin-status fin-status--pending";
}


function CustomerDashboard() {


    const location = useLocation();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const [user, setUser] = useState(null);

    const [applications, setApplications] = useState([]);

    const [loadingApplications, setLoadingApplications] = useState(true);

    const [applicationsError, setApplicationsError] = useState("");

    useEffect(() => {
        const submittedApplication = location.state?.submittedApplication;

        if (!submittedApplication?._id) return;

        setApplications((currentApplications) => {
            const alreadyIncluded = currentApplications.some(
                (application) => application._id === submittedApplication._id
            );

            return alreadyIncluded
                ? currentApplications
                : [submittedApplication, ...currentApplications];
        });
    }, [location.state]);



    useEffect(() => {

        const storedUser = localStorage.getItem("lotusUser");

        if(storedUser){
            setUser(JSON.parse(storedUser));
        }

    }, []);




    useEffect(() => {

        const fetchApplications = async () => {

            try{

                setLoadingApplications(true);
                setApplicationsError("");

                const token = localStorage.getItem("lotusToken");

                const response = await axios.get(
                    `${API_BASE_URL}/api/loans/my`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setApplications(response.data.applications || []);

            }
            catch(fetchError){

                if (fetchError.response?.status === 401) {
                    localStorage.removeItem("lotusToken");
                    localStorage.removeItem("lotusUser");
                    navigate("/login");
                    return;
                }

                setApplicationsError(
                    fetchError.response?.data?.message ||
                    "Unable to load your loan applications."
                );

            }
            finally{

                setLoadingApplications(false);

            }

        };

        const token = localStorage.getItem("lotusToken");

        if(token){
            fetchApplications();
        }
        else {
            setLoadingApplications(false);
        }

    }, [API_BASE_URL, navigate]);




    const customerName = user?.name || "Customer";


    const pendingCount = applications.filter(a => a.status === "Pending").length;
    const approvedCount = applications.filter(a => a.status === "Approved").length;
    const totalAmount = applications.reduce((sum, a) => sum + Number(a.loanAmount || 0), 0);



    return (

        <div className="fin-page">

            <LotusNavbar />


            <div className="fin-container">

                <div className="fin-header">
                    <div className="fin-eyebrow">Dashboard</div>
                    <h1 className="fin-title">Welcome back, {customerName}</h1>
                    <p className="fin-subtitle">
                        Track every loan application you've submitted, along with the AI
                        system's eligibility prediction, risk level, and recommendation for each.
                    </p>
                </div>


                <div className="fin-kpi-grid">

                    <div className="fin-kpi">
                        <div className="fin-kpi__label">Applications</div>
                        <div className="fin-kpi__value">{applications.length}</div>
                    </div>

                    <div className="fin-kpi">
                        <div className="fin-kpi__label">Pending review</div>
                        <div className="fin-kpi__value">{pendingCount}</div>
                    </div>

                    <div className="fin-kpi">
                        <div className="fin-kpi__label">Approved</div>
                        <div className="fin-kpi__value">{approvedCount}</div>
                    </div>

                    <div className="fin-kpi">
                        <div className="fin-kpi__label">Total requested</div>
                        <div className="fin-kpi__value">
                            LKR {totalAmount.toLocaleString()}
                        </div>
                    </div>

                </div>


                {loadingApplications && <p style={{ color: "var(--fin-muted)" }}>Loading your applications...</p>}

                {!loadingApplications && applicationsError && (
                    <div className="fin-alert fin-alert--error">{applicationsError}</div>
                )}

                {!loadingApplications && !applicationsError && applications.length === 0 && (
                    <div className="fin-empty">
                        You haven't submitted any loan applications yet.{" "}
                        <Link to="/loan-application">Apply for one now</Link>.
                    </div>
                )}

                {!loadingApplications && !applicationsError && applications.length > 0 && (

                    <div style={{ marginTop: 24 }}>

                        {applications.map((app) => (

                            <div className="fin-card" key={app._id}>

                                <div className="fin-card__top">

                                    <div>
                                        <div className="fin-card__name">
                                            {app.loanPurpose} — LKR {Number(app.loanAmount).toLocaleString()}
                                        </div>
                                        <div className="fin-card__meta">
                                            Submitted {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="fin-card__chips">

                                        <span className={statusClass(app.status)}>
                                            {app.status}
                                        </span>

                                        {app.aiRiskLevel && (
                                            <div className="fin-risk">
                                                <div className="fin-risk__bars">
                                                    {[0, 1, 2].map((i) => (
                                                        <div key={i} className={riskBarClass(app.aiRiskLevel, i)} />
                                                    ))}
                                                </div>
                                                <span className="fin-risk__label">{app.aiRiskLevel} risk</span>
                                            </div>
                                        )}

                                    </div>

                                </div>


                                {app.aiEligibility ? (
                                    <>
                                        <div className="fin-ai-summary">
                                            AI eligibility: <strong>{app.aiEligibility}</strong>
                                            {" "}({app.aiConfidence}% confidence) · Recommendation:{" "}
                                            <strong>{app.aiRecommendation}</strong>
                                        </div>

                                        <div className="fin-explanation">
                                            {app.aiExplanation}
                                        </div>
                                    </>
                                ) : (
                                    <div className="fin-ai-summary">
                                        AI evaluation not available for this application.
                                    </div>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );

}



export default CustomerDashboard;