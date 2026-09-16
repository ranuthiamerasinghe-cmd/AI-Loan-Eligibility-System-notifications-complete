import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
    const storedUser = localStorage.getItem("lotusUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;