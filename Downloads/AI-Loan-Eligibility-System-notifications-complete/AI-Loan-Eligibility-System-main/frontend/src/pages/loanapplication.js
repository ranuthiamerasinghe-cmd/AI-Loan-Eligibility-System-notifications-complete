import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/fintech.css";
import LotusNavbar from "../components/LotusNavbar";

function formatLkr(value) {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parseLkr(value) {
    return Number(value.replace(/\s/g, ""));
}

function LoanApplication(){

    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


    const [formData, setFormData] = useState({

        income: "",
        employmentStatus: "",
        loanAmount: "",
        loanPurpose: "",
        creditScore: "",
        existingDebts: "",

    });


    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");



    const handleChange = (event)=>{

        const {name,value} = event.target;


        setFormData((current)=>({

            ...current,

            [name]:value

        }));

    };




    const handleSubmit = async(event)=>{

        event.preventDefault();

        if (!formData.employmentStatus || !formData.loanPurpose) {
            setError("Please select your employment status and loan purpose.");
            return;
        }


        try{

            setLoading(true);

            setError("");

            setSuccess("");


            const token = localStorage.getItem("lotusToken");


            const response = await axios.post(

                `${API_BASE_URL}/api/loans/apply`,

                {
                    income: parseLkr(formData.income),
                    employmentStatus: formData.employmentStatus,
                    loanAmount: parseLkr(formData.loanAmount),
                    loanPurpose: formData.loanPurpose,
                    creditScore: Number(formData.creditScore),
                    existingDebts: parseLkr(formData.existingDebts),
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );


            setSuccess(

                response.data.message ||

                "Loan application submitted successfully."

            );


            navigate("/customer-dashboard", {
                state: { submittedApplication: response.data.application }
            });



        }


        catch(applyError){

            if (applyError.response?.status === 401) {
                localStorage.removeItem("lotusToken");
                localStorage.removeItem("lotusUser");
                navigate("/login");
                return;
            }


            setError(

                applyError.response?.data?.message ||

                "Unable to submit application. Please try again."

            );


        }


        finally{


            setLoading(false);


        }


    };




    return(

        <div className="fin-page">

            <LotusNavbar />


            <div className="fin-container fin-container--narrow">

                <div className="fin-header">
                    <div className="fin-eyebrow">New application</div>
                    <h1 className="fin-title">Apply for a loan</h1>
                    <p className="fin-subtitle">
                        Enter your financial details below. Our AI system will assess your
                        eligibility and risk level to help our loan officers reach a faster,
                        more consistent decision.
                    </p>
                </div>


                <div className="fin-form-card">

                    {
                        error &&
                        <div className="fin-alert fin-alert--error">{error}</div>
                    }

                    {
                        success &&
                        <div className="fin-alert fin-alert--success">{success}</div>
                    }


                    <form onSubmit={handleSubmit}>

                        <div className="fin-field">
                            <label className="fin-label">Monthly income (LKR)</label>
                            <input
                                className="fin-input fin-input--mono"
                                type="text"
                                inputMode="numeric"
                                name="income"
                                value={formData.income}
                                onChange={(event) => setFormData((current) => ({
                                    ...current,
                                    income: formatLkr(event.target.value)
                                }))}
                                placeholder="180 000"
                                required
                            />
                        </div>

                        <div className="fin-field">
                            <label className="fin-label">Employment status</label>
                            <select
                                className="fin-select"
                                name="employmentStatus"
                                value={formData.employmentStatus}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select employment status</option>
                                <option value="Employed">Employed</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Unemployed">Unemployed</option>
                            </select>
                        </div>

                        <div className="fin-field">
                            <label className="fin-label">Loan amount requested (LKR)</label>
                            <input
                                className="fin-input fin-input--mono"
                                type="text"
                                inputMode="numeric"
                                name="loanAmount"
                                value={formData.loanAmount}
                                onChange={(event) => setFormData((current) => ({
                                    ...current,
                                    loanAmount: formatLkr(event.target.value)
                                }))}
                                placeholder="500 000"
                                required
                            />
                        </div>

                        <div className="fin-field">
                            <label className="fin-label">Loan purpose</label>
                            <select
                                className="fin-select"
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select loan purpose</option>
                                <option value="Home Improvement">Home Improvement</option>
                                <option value="Home Purchase">Home Purchase</option>
                                <option value="Home Renovation">Home Renovation</option>
                                <option value="Vehicle Purchase">Vehicle Purchase</option>
                                <option value="Vehicle Repair">Vehicle Repair</option>
                                <option value="Business Expansion">Business Expansion</option>
                                <option value="Working Capital">Working Capital</option>
                                <option value="Equipment Purchase">Equipment Purchase</option>
                                <option value="Study Abroad">Study Abroad</option>
                                <option value="Tuition Fees">Tuition Fees</option>
                                <option value="Medical Expenses">Medical Expenses</option>
                                <option value="Debt Consolidation">Debt Consolidation</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Travel">Travel</option>
                            </select>
                        </div>

                        <div className="fin-field">
                            <label className="fin-label">Credit score (300–850)</label>
                            <input
                                className="fin-input fin-input--mono"
                                type="number"
                                name="creditScore"
                                value={formData.creditScore}
                                onChange={handleChange}
                                placeholder="680"
                                min="300"
                                max="850"
                                required
                            />
                            <p className="fin-field__hint">
                                Your credit score helps estimate repayment reliability. Higher scores generally improve eligibility, while lower scores may increase the assessed risk.
                            </p>
                        </div>

                        <div className="fin-field">
                            <label className="fin-label">Existing debts (LKR)</label>
                            <input
                                className="fin-input fin-input--mono"
                                type="text"
                                inputMode="numeric"
                                name="existingDebts"
                                value={formData.existingDebts}
                                onChange={(event) => setFormData((current) => ({
                                    ...current,
                                    existingDebts: formatLkr(event.target.value)
                                }))}
                                placeholder="150 000"
                                required
                            />
                            <p className="fin-field__hint">
                                Enter your total current monthly debt payments. Existing debt is compared with your income to calculate your debt-to-income ratio and AI risk level.
                            </p>
                        </div>


                        <button
                            type="submit"
                            className="fin-btn fin-btn--primary fin-btn--full"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit application"}
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}



export default LoanApplication;