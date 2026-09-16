const LoanApplication = require("../models/LoanApplication");
const Notification = require("../models/Notification");
const User = require("../models/user");
const { getAiEvaluation } = require("../utils/aiService");
const { sendLoanReportEmail } = require("../utils/sendemail");


const applyLoan = async (req, res) => {

    try {

        const {
    income,
    employmentStatus,
    loanAmount,
    loanPurpose,
    creditScore,
    existingDebts
} = req.body;


const userId = req.user.id;

        // Build the base application first
        const applicationData = {
            userId,
            income,
            employmentStatus,
            loanAmount,
            loanPurpose,
            creditScore,
            existingDebts
        };

        // Call the AI microservice (ML classification + Fuzzy risk + Rule-based explanation).
        // If the AI service is unreachable, we still save the application (status stays
        // "Pending") so a customer can never be blocked from applying because of the AI layer.
        let aiResult = null;
        try {
            aiResult = await getAiEvaluation({
                income,
                employmentStatus,
                loanAmount,
                loanPurpose,
                creditScore,
                existingDebts
            });

            applicationData.aiEligibility = aiResult.eligibility;
            applicationData.aiConfidence = aiResult.confidence_score;
            applicationData.aiRiskLevel = aiResult.risk_level;
            applicationData.aiRiskScore = aiResult.risk_score;
            applicationData.aiRecommendation = aiResult.recommendation;
            applicationData.aiExplanation = aiResult.explanation;
        } catch (aiError) {
            console.error("AI service unavailable:", aiError.message);
        }

        const loanApplication = await LoanApplication.create(applicationData);

        // Email the AI report to the applicant. This never blocks or fails the
        // application submission - if the AI service was down or the email fails
        // to send, we just log it and the applicant can still see results in-app.
        if (aiResult) {
            try {
                const applicant = await User.findById(userId).select("name email");
                if (applicant && applicant.email) {
                    await sendLoanReportEmail(
                        applicant.email,
                        applicant.name,
                        { loanAmount, loanPurpose },
                        aiResult
                    );
                }
            } catch (emailError) {
                console.error("Failed to send loan report email:", emailError.message);
            }
        }

        // Notification #1: confirms the application was received. Always created,
        // even if the AI service was down, so the customer always gets confirmation.
        try {
            await Notification.create({
                userId,
                title: "Application Submitted Successfully",
                message: `Your loan application for LKR ${Number(loanAmount).toLocaleString()} (${loanPurpose}) has been received and is pending review by a loan officer.`,
                type: "loan-status"
            });
        } catch (notificationError) {
            console.error("Failed to create submission notification:", notificationError.message);
        }

        // Notification #2: the AI prediction result, only created when the AI
        // service actually returned a result.
        if (aiResult) {
            try {
                await Notification.create({
                    userId,
                    title: "AI Eligibility Result Ready",
                    message: `Our AI assessment for your LKR ${Number(loanAmount).toLocaleString()} application: ${aiResult.eligibility} (${aiResult.confidence_score}% confidence), risk level ${aiResult.risk_level}. ${aiResult.recommendation || ""}`,
                    type: "ai-prediction"
                });
            } catch (notificationError) {
                console.error("Failed to create AI prediction notification:", notificationError.message);
            }
        }


        res.status(201).json({
            message: "Loan application submitted successfully",
            application: loanApplication
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


const getAllLoans = async (req, res) => {

    try {

        const loans = await LoanApplication.find()
            .populate("userId", "name email");


        res.status(200).json({
            applications: loans
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// Customer: view only their own loan applications, most recent first.
const getMyLoans = async (req, res) => {

    try {

        const userId = req.user.id;

        const loans = await LoanApplication.find({ userId })
            .sort({ createdAt: -1 });


        res.status(200).json({
            applications: loans
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


const updateLoanStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const loan = await LoanApplication.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            },
            {
                new: true
            }
        );


        if (!loan) {
            return res.status(404).json({
                message: "Loan application not found"
            });
        }

        if (status === "Approved" || status === "Rejected") {
            await Notification.create({
                userId: loan.userId,
                title: `Loan application ${status}`,
                message: `Your loan application for LKR ${Number(loan.loanAmount).toLocaleString()} has been ${status.toLowerCase()} by the loan officer.`,
                type: "loan-status"
            });
        }


        res.status(200).json({
            message: "Loan status updated successfully",
            application: loan
        });


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const updateLoanApplication = async (req, res) => {
    try {
        const allowedFields = [
            "income",
            "employmentStatus",
            "loanAmount",
            "loanPurpose",
            "creditScore",
            "existingDebts"
        ];
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = ["income", "loanAmount", "creditScore", "existingDebts"].includes(field)
                    ? Number(req.body[field])
                    : req.body[field];
            }
        });

        try {
            const aiResult = await getAiEvaluation({ ...updates });
            updates.aiEligibility = aiResult.eligibility;
            updates.aiConfidence = aiResult.confidence_score;
            updates.aiRiskLevel = aiResult.risk_level;
            updates.aiRiskScore = aiResult.risk_score;
            updates.aiRecommendation = aiResult.recommendation;
            updates.aiExplanation = aiResult.explanation;
        } catch (aiError) {
            console.error("AI service unavailable while updating:", aiError.message);
        }

        const loan = await LoanApplication.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!loan) {
            return res.status(404).json({ message: "Loan application not found" });
        }

        res.status(200).json({ message: "Loan application updated successfully", application: loan });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLoanApplication = async (req, res) => {
    try {
        const loan = await LoanApplication.findByIdAndDelete(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: "Loan application not found" });
        }

        res.status(200).json({ message: "Loan application deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLoan,
    getAllLoans,
    getMyLoans,
    updateLoanStatus,
    updateLoanApplication,
    deleteLoanApplication
};