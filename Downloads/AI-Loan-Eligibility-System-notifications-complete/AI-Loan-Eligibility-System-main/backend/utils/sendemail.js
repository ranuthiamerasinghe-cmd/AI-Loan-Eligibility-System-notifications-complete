const nodemailer = require("nodemailer");


const sendEmail = async (email, otp) => {


    const transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {

            user: process.env.EMAIL_USER,

            pass: process.env.EMAIL_PASS

        }

    });



    const mailOptions = {


        from: process.env.EMAIL_USER,


        to: email,


        subject: "Lotus Finance - Email Verification OTP",


        html: `

        <div style="font-family:Arial">

            <h2 style="color:#0F766E">
                🌸 Lotus Finance
            </h2>


            <p>
                Your verification OTP is:
            </p>


            <h1 style="color:#EC4899">

                ${otp}

            </h1>


            <p>
                This OTP is valid for 5 minutes.
            </p>


        </div>

        `


    };



    await transporter.sendMail(mailOptions);


};


/**
 * Sends the AI Loan Eligibility report to the applicant right after they submit
 * a loan application. Uses the same Gmail transporter as the OTP email.
 *
 * @param {string} email - applicant's email address
 * @param {string} name - applicant's name
 * @param {Object} loan - { loanAmount, loanPurpose } from the saved application
 * @param {Object} aiResult - raw response from the AI microservice's /predict endpoint
 *   { eligibility, confidence_score, risk_level, risk_score, debt_to_income_ratio,
 *     recommendation, explanation, reasons }
 */
const sendLoanReportEmail = async (email, name, loan, aiResult) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {
        eligibility,
        confidence_score,
        risk_level,
        risk_score,
        debt_to_income_ratio,
        recommendation,
        explanation,
        reasons
    } = aiResult;

    const eligibilityColor = eligibility === "Eligible" ? "#0F766E" : "#DC2626";

    const reasonsHtml = Array.isArray(reasons) && reasons.length
        ? `<ul style="padding-left:18px; margin:8px 0;">${reasons.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join("")}</ul>`
        : "";

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Lotus Finance - Your Loan Eligibility Report",
        html: `
        <div style="font-family:Arial; max-width:600px; margin:auto;">

            <h2 style="color:#0F766E">🌸 Lotus Finance</h2>

            <p>Hi ${name || "there"},</p>

            <p>Thank you for submitting your loan application. Here is the AI-generated
            eligibility report for your review:</p>

            <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">Loan Amount</td>
                    <td style="padding:8px; border:1px solid #E5E7EB;">LKR ${Number(loan.loanAmount).toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">Loan Purpose</td>
                    <td style="padding:8px; border:1px solid #E5E7EB;">${loan.loanPurpose}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">AI Eligibility</td>
                    <td style="padding:8px; border:1px solid #E5E7EB; color:${eligibilityColor}; font-weight:bold;">
                        ${eligibility} (${confidence_score}% confidence)
                    </td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">Risk Level</td>
                    <td style="padding:8px; border:1px solid #E5E7EB;">${risk_level} (score: ${risk_score}/100)</td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">Debt-to-Income Ratio</td>
                    <td style="padding:8px; border:1px solid #E5E7EB;">${debt_to_income_ratio}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border:1px solid #E5E7EB;">Recommendation</td>
                    <td style="padding:8px; border:1px solid #E5E7EB; font-weight:bold;">${recommendation}</td>
                </tr>
            </table>

            <p><strong>Explanation:</strong></p>
            <p style="color:#374151;">${explanation}</p>

            ${reasonsHtml}

            <p style="margin-top:16px; font-size:13px; color:#6B7280;">
                This is an automated AI assessment. Your loan officer will make the final
                decision, and you'll be notified once your application status is updated.
            </p>

        </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendLoanReportEmail = sendLoanReportEmail;