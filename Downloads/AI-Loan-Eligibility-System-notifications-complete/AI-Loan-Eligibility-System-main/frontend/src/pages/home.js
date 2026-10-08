import React from "react";
import { Link } from "react-router-dom";
import LotusNavbar from "../components/LotusNavbar";

function Home() {
    return (
        <div className="lotus-shell">

            {/* Navigation Bar */}
            <LotusNavbar />

            {/* Main Hero Section */}
            <section className="hero-grid">

                {/* Main Content */}
                <div className="hero-copy">

                    <h1 className="hero-title">
                        Smart Finance.
                        <br />
                        <span>Simple Decisions.</span>
                    </h1>

                    <p className="hero-subtitle">
                       Welcome to Lotus Finance,
                       <br />
                       an AI-powered loan eligibility platform designed to make the loan application process simple, fast and transparent.
                       <br />
                       Explore your options, understand your eligibility and move forward with clear guidance and confident financial decisions from one trusted place.
                    </p>

                    {/* Buttons */}
                    <div className="hero-actions">

                        <Link
                            to="/register"
                            className="pink-pill"
                        >
                            Get Started
                        </Link>

                        <Link
                            to="/login"
                            className="emerald-pill"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </section>

            {/* Simple Bottom Section */}
            <section className="content-strip">

                <div className="strip-card">
                    <div className="ai-chip">
                        AI Powered
                    </div>

                    <h3>
                        Intelligent Loan Eligibility
                    </h3>

                    <p>
                        Get a smarter assessment of your loan eligibility
                        using AI-powered decision support.
                    </p>
                </div>

                <div className="strip-card">
                    <div className="ai-chip">
                        Secure
                    </div>

                    <h3>
                        Simple & Secure
                    </h3>

                    <p>
                        Manage your loan applications through a secure and
                        user-friendly digital platform.
                    </p>
                </div>

                <div className="strip-card">
                    <div className="ai-chip">
                        Lotus Finance
                    </div>

                    <h3>
                        Your Finance Journey
                    </h3>

                    <p>
                        Apply for loans, track applications, and view your
                        eligibility results in one place.
                    </p>
                </div>

            </section>

        </div>
    );
}

export default Home;