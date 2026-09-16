import React from "react";
import {
    FaBrain,
    FaChartLine,
    FaCheckCircle,
    FaHome,
    FaCar,
    FaBriefcase,
    FaGraduationCap,
    FaHeartbeat,
    FaWallet,
    FaBalanceScale,
    FaEye,
    FaBullseye,
    FaRocket
} from "react-icons/fa";
import LotusNavbar from "../components/LotusNavbar";
import logoImage from "../images/logo.png";

function AboutUs() {
    return (
        <div className="lotus-shell">
            <LotusNavbar />

            <section className="about-page">
                <div className="about-hero">
                    <div className="about-hero__copy">
                        <div className="eyebrow">About Lotus Finance</div>
                        <h1>Modern finance with intelligent support</h1>
                        <p>
                            Lotus Finance is a fictional modern financial company that provides
                            loan solutions supported by AI-powered technology.
                        </p>
                    </div>

                    <div className="about-hero__visual">
                        <img src={logoImage} alt="Lotus Finance" />
                        <div className="about-hero__badge">
                            <FaBrain />
                            <span>AI-Powered Loan Intelligence</span>
                        </div>
                    </div>
                </div>

                <div className="about-grid">
                    <article className="about-card about-card--wide">
                        <h2>About Lotus Finance</h2>
                        <p>
                            Lotus Finance is a modern financial service provider focused on making
                            the loan application and assessment process simple, transparent and
                            convenient. Our AI-powered system analyzes customer information and
                            provides loan eligibility predictions and risk assessments to support
                            better financial decisions.
                        </p>
                    </article>

                    <article className="about-card">
                        <h2><FaBullseye /> Our Mission</h2>
                        <p>
                            To make financial services simple, transparent and accessible by using
                            modern technology and intelligent decision-support solutions.
                        </p>
                    </article>

                    <article className="about-card">
                        <h2><FaEye /> Our Vision</h2>
                        <p>
                            To become a trusted and technology-driven financial service provider
                            that helps customers make smarter financial decisions.
                        </p>
                    </article>
                </div>

                <section className="about-card">
                    <h2>What We Offer</h2>
                    <div className="offer-grid">
                        <div className="offer-item"><FaHome /><span>Home Loans</span></div>
                        <div className="offer-item"><FaCar /><span>Vehicle Loans</span></div>
                        <div className="offer-item"><FaBriefcase /><span>Business Loans</span></div>
                        <div className="offer-item"><FaGraduationCap /><span>Education Loans</span></div>
                        <div className="offer-item"><FaHeartbeat /><span>Medical Loans</span></div>
                        <div className="offer-item"><FaWallet /><span>Personal Financial Solutions</span></div>
                    </div>
                </section>

                <section className="about-card">
                    <h2>AI-Powered Assessment</h2>
                    <div className="ai-methods">
                        <div className="ai-method"><FaChartLine /><span>Faster pre-checks for customers</span></div>
                        <div className="ai-method"><FaBalanceScale /><span>Clear eligibility guidance</span></div>
                        <div className="ai-method"><FaCheckCircle /><span>Transparent risk explanations</span></div>
                    </div>
                    <p>
                        Our new customer facility focuses on convenience and clarity. The system
                        quickly reviews customer financial information, provides an easy-to-understand
                        eligibility prediction, and explains risk in simple language so customers can
                        make informed decisions with confidence.
                    </p>
                </section>

                <section className="about-card">
                    <h2>Why Lotus Finance?</h2>
                    <ul className="about-list">
                        <li>Simple and convenient application process</li>
                        <li>AI-powered assessment</li>
                        <li>Transparent recommendations</li>
                        <li>Risk awareness</li>
                        <li>Professional loan support</li>
                    </ul>
                </section>

                <section className="about-card about-card--highlight">
                    <h2><FaRocket /> Customer First</h2>
                    <p>
                        At Lotus Finance, technology supports our customers and loan officers,
                        while final loan decisions remain with authorized financial professionals.
                    </p>
                </section>
            </section>
        </div>
    );
}

export default AboutUs;