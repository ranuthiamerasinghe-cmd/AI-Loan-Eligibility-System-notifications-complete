# AI-Based Intelligent Loan Eligibility Checking and Risk Assessment System

This package contains the two halves of the system:

```
backend/      -> Your existing Node.js/Express + MongoDB API (frontend talks to this)
ai_service/   -> New Python FastAPI microservice: ML + Fuzzy Logic + Rule-Based Reasoning
```

## How it fits together

```
Customer (React frontend)
        |
        v
POST /api/loans/apply   (backend, Node.js/Express)
        |
        v
backend/controllers/loanController.js
        |
        |  calls
        v
POST /predict  (ai_service, FastAPI, Python)
        |
        v
   1. ML Classification  -> Eligible / Not Eligible
   2. Fuzzy Logic         -> Risk Level (Low/Medium/High)
   3. Rule-Based Reasoning-> Explanation + Recommendation
        |
        v
Result saved onto the LoanApplication document in MongoDB
(aiEligibility, aiConfidence, aiRiskLevel, aiRiskScore, aiRecommendation, aiExplanation)
        |
        v
Loan Officer dashboard (GET /api/loans/all) sees the AI results
alongside the raw application and makes the final Approve/Reject decision.
```

The AI service does **not** replace the loan officer's decision — it only
populates the `ai*` fields as a recommendation, exactly as described in the
proposal (Section 2.1). `status` stays `"Pending"` until a loan officer
calls `PUT /api/loans/:id/status`.

If the AI service is down when a customer applies, the application is still
saved (the `ai*` fields are simply left empty) — the AI layer never blocks
a customer from submitting.

## Running everything locally

### 1. Start the AI service (Python)

```bash
cd ai_service
python3 -m venv venv
source venv/bin/activate          # on Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the model (only needs to be run once, or whenever data changes)
python3 train_model.py

# Start the API
uvicorn app:app --reload --port 8000
```

Check it's running: open http://localhost:8000/docs (interactive Swagger UI)
or http://localhost:8000/health

### 2. Start the backend (Node.js)

```bash
cd backend
npm install
# copy .env.example to .env and fill in your real values if you haven't already
npm start
```

Make sure `.env` contains:
```
AI_SERVICE_URL=http://localhost:8000
```

### 3. Start the frontend (React)

Run your existing React app as usual and point it at the backend (`/api/loans/apply`, etc.) — no changes needed there, since the AI fields just come back as extra properties on the loan application object.

## What changed in the backend (vs. what you uploaded)

- `models/LoanApplication.js` — added `aiEligibility`, `aiConfidence`, `aiRiskLevel`, `aiRiskScore`, `aiRecommendation`, `aiExplanation` fields.
- `controllers/loanController.js` — `applyLoan` now calls the AI service and stores the result before saving.
- `utils/aiService.js` — **new file**, small axios client for calling the FastAPI service.
- `package.json` — added `axios` dependency.
- `.env` / `.env.example` — added `AI_SERVICE_URL`.

Nothing else was touched (auth, users, OTP, roles all work exactly as before).

## Notes on model performance (for your report / viva)

The Logistic Regression classifier was trained only on the 6 fields your
form actually collects (`income`, `employmentStatus`, `loanAmount`,
`loanPurpose`, `creditScore`, `existingDebts`), so it's intentionally
lightweight and matches your real system end-to-end. On the held-out test
set it scores:

| Metric | Value |
|---|---|
| Accuracy | see `ai_service/models/metrics.json` after training |
| Precision / Recall / F1 | see same file |

If you want higher accuracy for the report, the original dataset has more
predictive fields (`Credit_History`, `ApplicantIncome`, `CoapplicantIncome`,
`Property_Area`, etc.) — you'd need to add those fields to the frontend
form and the MongoDB schema too. Happy to do that version if you want a
stronger accuracy number to report, at the cost of a bigger form.

## Testing the AI service directly (without the frontend)

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "income": 180000,
    "employmentStatus": "Employed",
    "loanAmount": 500000,
    "loanPurpose": "Home Improvement",
    "creditScore": 680,
    "existingDebts": 150000
  }'
```
