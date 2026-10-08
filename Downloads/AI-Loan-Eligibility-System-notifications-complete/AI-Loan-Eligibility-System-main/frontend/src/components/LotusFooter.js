import React, { useEffect, useState } from "react";
import "../styles/fintech.css";

function LotusFooter() {
    const [footerContent, setFooterContent] = useState(() => {
        const savedContent = localStorage.getItem("lotusFooterContent");
        return savedContent ? JSON.parse(savedContent) : {
            branches: ["Colombo", "Kandy", "Galle", "Kurunegala"],
            hours: ["Monday - Friday: 8:30 AM - 4:30 PM", "Saturday: 9:00 AM - 1:00 PM", "Sunday: Closed", "Public Holidays: Closed"],
            support: ["Email: lotusfinance@gmail.com", "Customer Service: 011 234 5678"],
        };
    });

    useEffect(() => {
        const syncFooter = () => {
            const savedContent = localStorage.getItem("lotusFooterContent");
            if (savedContent) setFooterContent(JSON.parse(savedContent));
        };

        window.addEventListener("lotusFooterUpdated", syncFooter);
        return () => window.removeEventListener("lotusFooterUpdated", syncFooter);
    }, []);

    return (
        <footer className="lotus-footer">
            <div className="lotus-footer__inner">
                <div className="lotus-footer__block">
                    <h3>Our Branches</h3>
                    <ul>
                        {footerContent.branches.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>

                <div className="lotus-footer__block">
                    <h3>Opening Hours</h3>
                    <ul>
                        {footerContent.hours.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>

                <div className="lotus-footer__block">
                    <h3>Customer Support</h3>
                    <ul>
                        {footerContent.support.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default LotusFooter;