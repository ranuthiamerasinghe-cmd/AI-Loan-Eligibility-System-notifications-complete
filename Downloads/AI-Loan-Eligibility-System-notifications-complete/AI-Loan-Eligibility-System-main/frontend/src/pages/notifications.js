import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LotusNavbar from "../components/LotusNavbar";

function Notifications() {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const token = localStorage.getItem("lotusToken");
                const response = await axios.get(`${API_BASE_URL}/api/notifications/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(response.data.notifications || []);
            } catch (notificationError) {
                setError(notificationError.response?.data?.message || "Unable to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [API_BASE_URL]);

    return (
        <div className="lotus-shell">

            <LotusNavbar />

            <div className="auth-card" style={{ maxWidth: "700px", margin: "60px auto" }}>

                <h1>🔔 Notifications</h1>

                <p className="helper-text">
                    Stay updated with your latest loan activities.
                </p>

                {loading && <p className="helper-text">Loading notifications...</p>}
                {error && <div className="fin-alert fin-alert--error">{error}</div>}
                {!loading && !error && notifications.length === 0 && (
                    <p className="helper-text">No loan status notifications yet.</p>
                )}
                {!loading && !error && notifications.map((notification) => (
                    <div className="notification-card" key={notification._id}>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </div>
                ))}

                <div style={{ marginTop: "30px" }}>
                    <Link
                        to="/customer-dashboard"
                        className="emerald-pill"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

            </div>

        </div>
    );
}

export default Notifications;