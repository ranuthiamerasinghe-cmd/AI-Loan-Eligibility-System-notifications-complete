import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style.css";

import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Notifications from "./pages/notifications";
import AdminDashboard from "./pages/adminDashboard";
import AdminRoute from "./pages/adminRoute";
import VerifyOTP from "./pages/verifyOTP";
import CustomerDashboard from "./pages/customerDashboard";
import CustomerProfile from "./pages/customerProfile";
import LoanApplication from "./pages/loanapplication";
import AboutUs from "./pages/aboutUs";
import LotusFooter from "./components/LotusFooter";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/about-us"
          element={<AboutUs />}
        />

        {/* Admin */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Customer */}
        <Route
          path="/customer-dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customer-profile"
          element={<CustomerProfile />}
        />

        {/* Loan Application */}
        <Route
          path="/loan-application"
          element={<LoanApplication />}
        />

      </Routes>
      <LotusFooter />
    </BrowserRouter>
  );
}

export default App;