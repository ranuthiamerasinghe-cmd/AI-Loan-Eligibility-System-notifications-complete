import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/fintech.css";
import logoImage from "../images/logo.png";

function LotusNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const syncUser = () => {
            const storedUser = localStorage.getItem("lotusUser");
            setUser(storedUser ? JSON.parse(storedUser) : null);
        };

        syncUser();
        window.addEventListener("storage", syncUser);

        return () => window.removeEventListener("storage", syncUser);
    }, []);

    const isLoggedIn = Boolean(user?.email);
    const isAdminLoggedIn = user?.role === "admin" || user?.role === "loan_officer";
    const isAdminUser = user?.role === "admin";
    const dashboardPath = isAdminLoggedIn ? "/admin-dashboard" : "/customer-dashboard";
    const isActive = (path) => location.pathname === path;

    const handleSignOut = () => {
        localStorage.removeItem("lotusUser");
        localStorage.removeItem("lotusToken");
        window.dispatchEvent(new Event("storage"));
        navigate("/login");
    };

    return (
        <div className="fin-topbar">
            <Link to="/" className="fin-brand">
                <img className="fin-brand__logo" src={logoImage} alt="Lotus Finance logo" />
                <span>Lotus Finance</span>
            </Link>

            <div className="fin-navlinks">
                <Link to="/" className={`fin-navlink${isActive("/") ? " fin-navlink--active" : ""}`}>
                    Home
                </Link>
                <Link to={dashboardPath} className={`fin-navlink${isActive(dashboardPath) ? " fin-navlink--active" : ""}`}>
                    Loans
                </Link>
                {isAdminUser && (
                    <Link to="/admin-dashboard?view=customers" className={`fin-navlink${location.search === "?view=customers" ? " fin-navlink--active" : ""}`}>
                        Customers
                    </Link>
                )}
                {!isAdminLoggedIn && (
                    <Link to="/loan-application" className={`fin-navlink fin-navlink--primary${isActive("/loan-application") ? " fin-navlink--active" : ""}`}>
                        Apply for a loan
                    </Link>
                )}
                {!isAdminLoggedIn && (
                    <Link to="/notifications" className={`fin-navlink${isActive("/notifications") ? " fin-navlink--active" : ""}`}>
                        Notifications
                    </Link>
                )}
                <Link to="/about-us" className={`fin-navlink${isActive("/about-us") ? " fin-navlink--active" : ""}`}>
                    About Us
                </Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/customer-profile" className={`fin-navlink${isActive("/customer-profile") ? " fin-navlink--active" : ""}`}>
                            Profile
                        </Link>
                        <button type="button" className="fin-navlink" onClick={handleSignOut}>
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="fin-navlink fin-navlink--login">Login</Link>
                        <Link to="/register" className="fin-navlink fin-navlink--accent">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default LotusNavbar;