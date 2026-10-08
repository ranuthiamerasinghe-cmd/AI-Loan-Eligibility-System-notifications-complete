const express = require("express");

const router = express.Router();


const {

    requestRegistrationOtp,

    verifyRegistrationOtp,

    resendRegistrationOtp,

    loginUser,

    getCustomers

} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRole } = require("../middleware/roleMiddleware");





// Register Step 1 - Send OTP

router.post(

    "/request-otp",

    requestRegistrationOtp

);





// Register Step 2 - Verify OTP

router.post(

    "/verify-otp",

    verifyRegistrationOtp

);





// Resend OTP

router.post(

    "/resend-otp",

    resendRegistrationOtp

);





// Login

router.post(

    "/login",

    loginUser

);

router.get(

    "/admin/customers",

    protect,

    authorizeRole("admin"),

    getCustomers

);



module.exports = router;