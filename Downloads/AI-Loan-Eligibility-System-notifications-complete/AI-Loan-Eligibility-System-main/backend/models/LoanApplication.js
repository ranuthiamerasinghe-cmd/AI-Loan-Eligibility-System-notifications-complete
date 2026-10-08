const mongoose = require("mongoose");


const loanApplicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        income: {
            type: Number,
            required: true
        },

        employmentStatus: {
            type: String,
            required: true
        },

        loanAmount: {
            type: Number,
            required: true
        },

        loanPurpose: {
            type: String,
            required: true
        },

        creditScore: {
            type: Number,
            required: true
        },

        existingDebts: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            default: "Pending"
        },

        // --- AI evaluation results (populated automatically on submission) ---
        aiEligibility: {
            type: String, // "Eligible" | "Not Eligible"
        },

        aiConfidence: {
            type: Number, // 0-100 (%)
        },

        aiRiskLevel: {
            type: String, // "Low" | "Medium" | "High"
        },

        aiRiskScore: {
            type: Number, // 0-100
        },

        aiRecommendation: {
            type: String, // e.g. "Recommended for Approval"
        },

        aiExplanation: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "LoanApplication",
    loanApplicationSchema
);