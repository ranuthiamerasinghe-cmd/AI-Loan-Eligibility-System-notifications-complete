"""
rules.py
--------
Rule-Based Reasoning module (Section 3.3 of the project proposal).

Purpose:
    Provide a human-readable explanation for the AI recommendation by
    combining the Machine Learning eligibility prediction with the Fuzzy
    Logic risk level, using predefined IF-THEN rules built from expert/
    domain knowledge about loan evaluation.

This module does NOT make the eligibility or risk decision itself -
those come from the ML model and the Fuzzy Logic system respectively.
It only explains WHY, in plain language, and produces the final
AI Recommendation shown to the loan officer.
"""

from typing import Dict, List


def _describe_factor(name: str, value, good: bool) -> str:
    tag = "supports" if good else "raises concern about"
    return f"{name} ({value}) {tag} repayment ability"


def build_explanation(applicant: Dict, eligibility: str, confidence: float,
                       risk_level: str, risk_score: float) -> Dict:
    """
    Combine ML eligibility + Fuzzy risk level into a final recommendation
    and a plain-language explanation, using expert IF-THEN rules.

    Args:
        applicant: dict of the applicant's key fields (already validated)
        eligibility: "Eligible" or "Not Eligible" (from ML model)
        confidence: model confidence/probability (0-1)
        risk_level: "Low" / "Medium" / "High" (from Fuzzy Logic)
        risk_score: 0-100 fuzzy risk score

    Returns:
        dict with keys: recommendation, explanation (str), reasons (list[str])
    """
    reasons: List[str] = []

    credit_score = applicant.get("creditScore")
    monthly_income = applicant.get("income")
    dti = applicant.get("debt_to_income_ratio")
    employment_status = applicant.get("employmentStatus")

    # --- Individual factor explanations (expert rules) ---
    if credit_score is not None:
        if credit_score >= 700:
            reasons.append(_describe_factor("Good credit score", credit_score, True))
        elif credit_score >= 600:
            reasons.append(_describe_factor("Fair credit score", credit_score, True))
        else:
            reasons.append(_describe_factor("Low credit score", credit_score, False))

    if dti is not None:
        if dti <= 1.2:
            reasons.append(_describe_factor("Low debt-to-income ratio", round(dti, 2), True))
        elif dti <= 2.5:
            reasons.append(_describe_factor("Moderate debt-to-income ratio", round(dti, 2), False))
        else:
            reasons.append(_describe_factor("High debt-to-income ratio", round(dti, 2), False))

    if monthly_income is not None:
        if monthly_income >= 200000:
            reasons.append(_describe_factor("Strong monthly income", f"LKR {monthly_income:,.0f}", True))
        elif monthly_income >= 100000:
            reasons.append(_describe_factor("Moderate monthly income", f"LKR {monthly_income:,.0f}", True))
        else:
            reasons.append(_describe_factor("Limited monthly income", f"LKR {monthly_income:,.0f}", False))

    if employment_status is not None:
        if employment_status == "Unemployed":
            reasons.append("Applicant's employment status (Unemployed) raises concern about repayment ability")
        else:
            reasons.append(f"Stable employment status ({employment_status}) supports repayment ability")

    # --- Final recommendation rules (combining ML + Fuzzy outcomes) ---
    # IF Eligible AND Risk = Low       THEN Recommended for Approval
    # IF Eligible AND Risk = Medium    THEN Recommended for Approval (with monitoring)
    # IF Eligible AND Risk = High      THEN Requires Further Review
    # IF Not Eligible AND Risk = Low   THEN Requires Further Review
    # IF Not Eligible AND (Medium/High) THEN Recommended for Rejection

    if eligibility == "Eligible" and risk_level == "Low":
        recommendation = "Recommended for Approval"
    elif eligibility == "Eligible" and risk_level == "Medium":
        recommendation = "Recommended for Approval (with monitoring)"
    elif eligibility == "Eligible" and risk_level == "High":
        recommendation = "Requires Further Review"
    elif eligibility == "Not Eligible" and risk_level == "Low":
        recommendation = "Requires Further Review"
    else:
        recommendation = "Recommended for Rejection"

    summary = (
        f"The AI model predicts this applicant is '{eligibility}' "
        f"(confidence: {confidence*100:.1f}%) with a '{risk_level}' financial risk level "
        f"(risk score: {risk_score}/100). "
        f"Based on these two results, the system's recommendation is: '{recommendation}'."
    )

    explanation_text = summary + " Key contributing factors: " + "; ".join(reasons) + "."

    return {
        "recommendation": recommendation,
        "explanation": explanation_text,
        "reasons": reasons,
    }


if __name__ == "__main__":
    demo_applicant = {
        "creditScore": 720,
        "income": 210000,
        "debt_to_income_ratio": 1.1,
        "employmentStatus": "Employed",
    }
    result = build_explanation(demo_applicant, "Eligible", 0.87, "Low", 22.5)
    import json
    print(json.dumps(result, indent=2))
