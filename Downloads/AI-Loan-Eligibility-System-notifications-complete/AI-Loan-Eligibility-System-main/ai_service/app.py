"""
app.py
------
FastAPI microservice for the AI-Based Intelligent Loan Eligibility Checking
and Risk Assessment System.

This service is called by the group's existing Node.js/Express backend
(backend/controllers/loanController.js) whenever a loan application needs
an AI evaluation. The request schema below matches the LoanApplication
Mongoose model EXACTLY, so the Express backend can forward req.body as-is:

    income, employmentStatus, loanAmount, loanPurpose,
    creditScore, existingDebts

It combines all three AI techniques from the proposal:
    1. Machine Learning Classification  -> Eligible / Not Eligible
    2. Fuzzy Logic                      -> Risk Level (Low / Medium / High)
    3. Rule-Based Reasoning             -> Human-readable explanation

Run locally:
    uvicorn app:app --reload --port 8000

Then POST applicant data to:
    http://localhost:8000/predict
"""

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from fuzzy_logic import assess_risk
from rules import build_explanation

app = FastAPI(
    title="Loan Eligibility & Risk Assessment AI Service",
    description="AI microservice combining ML classification, Fuzzy Logic risk "
                "assessment, and Rule-Based explanation for loan applications.",
    version="1.0.0",
)

# Allow the Node.js/Express + React frontend to call this service directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your actual frontend/backend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/eligibility_model.joblib"
FEATURES_PATH = "models/feature_columns.joblib"

try:
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
except FileNotFoundError:
    model = None
    feature_columns = None


# ---------------------------------------------------------------------------
# Request schema - matches backend/models/LoanApplication.js EXACTLY
# ---------------------------------------------------------------------------

class LoanApplication(BaseModel):
    income: float = Field(..., examples=[180000], description="Applicant's monthly income (LKR)")
    employmentStatus: str = Field(..., examples=["Employed"], description="Employed / Self-Employed / Unemployed")
    loanAmount: float = Field(..., examples=[500000])
    loanPurpose: str = Field(..., examples=["Home Improvement"])
    creditScore: float = Field(..., examples=[680])
    existingDebts: float = Field(..., examples=[150000])


@app.get("/")
def root():
    return {
        "service": "Loan Eligibility & Risk Assessment AI Service",
        "status": "running" if model is not None else "MODEL NOT LOADED - run train_model.py first",
        "endpoints": {"predict": "/predict (POST)", "health": "/health (GET)"},
    }


@app.get("/health")
def health():
    return {"model_loaded": model is not None}


@app.post("/predict")
def predict(application: LoanApplication):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not found. Run 'python3 train_model.py' first to generate models/eligibility_model.joblib",
        )

    data = application.model_dump()

    # --- 1. Machine Learning Classification ---
    row = {col: data.get(col) for col in feature_columns}
    X = pd.DataFrame([row])

    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    confidence = float(proba[pred])

    # Apply the platform's confidence rule to the final eligibility decision.
    eligibility = "Not Eligible" if confidence > 0.60 else "Eligible"

    # --- 2. Fuzzy Logic Risk Assessment ---
    monthly_income = data["income"]
    existing_debt = data["existingDebts"]
    credit_score = data["creditScore"]
    dti_ratio = existing_debt / monthly_income if monthly_income else 10.0

    risk_result = assess_risk(
        monthly_income=monthly_income,
        debt_to_income_ratio=dti_ratio,
        credit_score=credit_score,
    )

    # --- 3. Rule-Based Reasoning / Explanation ---
    applicant_summary = {
        "creditScore": credit_score,
        "income": monthly_income,
        "debt_to_income_ratio": dti_ratio,
        "employmentStatus": data["employmentStatus"],
    }

    explanation = build_explanation(
        applicant=applicant_summary,
        eligibility=eligibility,
        confidence=confidence,
        risk_level=risk_result["risk_level"],
        risk_score=risk_result["risk_score"],
    )

    return {
        "eligibility": eligibility,
        "confidence_score": round(confidence * 100, 2),
        "risk_level": risk_result["risk_level"],
        "risk_score": risk_result["risk_score"],
        "debt_to_income_ratio": round(dti_ratio, 2),
        "recommendation": explanation["recommendation"],
        "explanation": explanation["explanation"],
        "reasons": explanation["reasons"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
