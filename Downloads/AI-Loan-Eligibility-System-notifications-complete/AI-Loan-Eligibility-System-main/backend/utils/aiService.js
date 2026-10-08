const axios = require("axios");

// Base URL of the Python FastAPI AI microservice (ml + fuzzy logic + rules).
// Set AI_SERVICE_URL in .env to override (e.g. for a deployed service).
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Calls the AI service's /predict endpoint with the loan application data
 * and returns the combined ML + Fuzzy Logic + Rule-Based result.
 *
 * @param {Object} applicationData - { income, employmentStatus, loanAmount, loanPurpose, creditScore, existingDebts }
 * @returns {Promise<Object>} AI prediction result
 */
const getAiEvaluation = async (applicationData) => {
    const {
        income,
        employmentStatus,
        loanAmount,
        loanPurpose,
        creditScore,
        existingDebts
    } = applicationData;

    const response = await axios.post(
        `${AI_SERVICE_URL}/predict`,
        {
            income,
            employmentStatus,
            loanAmount,
            loanPurpose,
            creditScore,
            existingDebts
        },
        { timeout: 5000 }
    );

    return response.data;
};

module.exports = { getAiEvaluation };
