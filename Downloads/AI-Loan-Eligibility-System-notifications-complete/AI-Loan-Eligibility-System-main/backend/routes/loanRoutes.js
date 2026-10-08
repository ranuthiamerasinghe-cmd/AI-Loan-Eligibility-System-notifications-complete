const express = require("express");

const router = express.Router();

const { 
    applyLoan, 
    getAllLoans, 
    getMyLoans,
    updateLoanStatus,
    updateLoanApplication,
    deleteLoanApplication
} = require("../controllers/loanController");

const { protect } = require("../middleware/authMiddleware");

const { authorizeRole } = require("../middleware/roleMiddleware");


// Customer submit loan application
router.post(
    "/apply",
    protect,
    applyLoan
);


// Customer: view only their own loan applications (with AI results)
router.get(
    "/my",
    protect,
    getMyLoans
);


// Loan officer / Admin: view all applications
router.get(
    "/all",
    protect,
    authorizeRole("loan_officer", "admin"),
    getAllLoans
);

router.put(
    "/:id/status",
    protect,
    authorizeRole("loan_officer", "admin"),
    updateLoanStatus
);

router.put(
    "/:id",
    protect,
    authorizeRole("loan_officer", "admin"),
    updateLoanApplication
);

router.delete(
    "/:id",
    protect,
    authorizeRole("loan_officer", "admin"),
    deleteLoanApplication
);

module.exports = router;