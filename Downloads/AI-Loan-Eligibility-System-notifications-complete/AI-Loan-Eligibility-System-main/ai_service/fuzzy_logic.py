"""
fuzzy_logic.py
--------------
Fuzzy Logic module for the AI-Based Intelligent Loan Eligibility Checking
and Risk Assessment System (Section 3.2 of the project proposal).

Purpose:
    Assess the applicant's overall FINANCIAL RISK LEVEL (Low / Medium / High)
    using fuzzy inference, since financial risk is inherently a matter of
    degree rather than a strict yes/no boundary.

Inputs (crisp values passed in from the applicant's data):
    - monthly_income        : applicant's monthly income (LKR)
    - debt_to_income_ratio  : existing debt / monthly income (unitless ratio)
    - credit_score          : applicant's credit score (300-850 scale)

Output:
    - risk_score  : crisp fuzzy output, 0 (very safe) - 100 (very risky)
    - risk_level  : "Low", "Medium", or "High"

The membership function ranges below were derived from the distribution of
the project's training dataset (data/loan_data.csv):
    Monthly Income   : min ~1,500   | 25th pct ~110,000 | median ~160,000 | 75th pct ~218,000 | max ~496,000
    Debt-to-Income   : median ~1.4  | 25th pct ~0.70     | 75th pct ~2.54
    Credit Score     : 300-850 (standard credit score scale)
"""

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

# ---------------------------------------------------------------------------
# 1. Define fuzzy variables (Antecedents = inputs, Consequent = output)
# ---------------------------------------------------------------------------

income = ctrl.Antecedent(np.arange(0, 500001, 1000), 'income')
dti = ctrl.Antecedent(np.arange(0, 10.01, 0.01), 'dti')  # debt-to-income ratio
credit = ctrl.Antecedent(np.arange(300, 851, 1), 'credit')

risk = ctrl.Consequent(np.arange(0, 101, 1), 'risk')

# ---------------------------------------------------------------------------
# 2. Membership functions
# ---------------------------------------------------------------------------

# Monthly Income (LKR) - higher income => generally lower risk
income['low'] = fuzz.trapmf(income.universe, [0, 0, 60000, 120000])
income['medium'] = fuzz.trimf(income.universe, [80000, 170000, 260000])
income['high'] = fuzz.trapmf(income.universe, [200000, 300000, 500000, 500000])

# Debt-to-Income Ratio - higher ratio => higher risk
dti['low'] = fuzz.trapmf(dti.universe, [0, 0, 0.5, 1.2])
dti['medium'] = fuzz.trimf(dti.universe, [0.8, 1.8, 3.0])
dti['high'] = fuzz.trapmf(dti.universe, [2.2, 4.0, 10, 10])

# Credit Score (300-850) - higher score => lower risk
credit['poor'] = fuzz.trapmf(credit.universe, [300, 300, 550, 620])
credit['fair'] = fuzz.trimf(credit.universe, [580, 670, 740])
credit['good'] = fuzz.trapmf(credit.universe, [700, 780, 850, 850])

# Output Risk Score (0-100)
risk['low'] = fuzz.trapmf(risk.universe, [0, 0, 25, 45])
risk['medium'] = fuzz.trimf(risk.universe, [30, 50, 70])
risk['high'] = fuzz.trapmf(risk.universe, [55, 75, 100, 100])

# ---------------------------------------------------------------------------
# 3. Rule base (expert-defined IF-THEN rules)
# ---------------------------------------------------------------------------

rules = [
    # High risk situations
    ctrl.Rule(dti['high'] & credit['poor'], risk['high']),
    ctrl.Rule(dti['high'] & income['low'], risk['high']),
    ctrl.Rule(credit['poor'] & income['low'], risk['high']),
    ctrl.Rule(dti['high'] & credit['fair'], risk['high']),

    # Medium risk situations
    ctrl.Rule(dti['medium'] & credit['fair'], risk['medium']),
    ctrl.Rule(income['medium'] & credit['fair'], risk['medium']),
    ctrl.Rule(dti['medium'] & income['medium'], risk['medium']),
    ctrl.Rule(dti['low'] & credit['poor'], risk['medium']),
    ctrl.Rule(dti['high'] & credit['good'], risk['medium']),
    ctrl.Rule(income['high'] & dti['medium'], risk['medium']),

    # Low risk situations
    ctrl.Rule(dti['low'] & credit['good'], risk['low']),
    ctrl.Rule(income['high'] & credit['good'], risk['low']),
    ctrl.Rule(dti['low'] & income['high'], risk['low']),
    ctrl.Rule(dti['low'] & income['medium'] & credit['fair'], risk['low']),
]

risk_ctrl_system = ctrl.ControlSystem(rules)


def assess_risk(monthly_income: float, debt_to_income_ratio: float, credit_score: float):
    """
    Run the fuzzy inference system on a single applicant.

    Returns:
        dict with keys: risk_score (float 0-100), risk_level (str)
    """
    sim = ctrl.ControlSystemSimulation(risk_ctrl_system)

    # Clip inputs to the defined universes to avoid out-of-range errors
    sim.input['income'] = float(np.clip(monthly_income, 0, 500000))
    sim.input['dti'] = float(np.clip(debt_to_income_ratio, 0, 10))
    sim.input['credit'] = float(np.clip(credit_score, 300, 850))

    try:
        sim.compute()
        score = float(sim.output['risk'])
    except Exception:
        # Fallback: if no rule fired for an edge-case combination,
        # approximate risk from a simple weighted heuristic.
        norm_income = 1 - np.clip(monthly_income / 300000, 0, 1)
        norm_dti = np.clip(debt_to_income_ratio / 4, 0, 1)
        norm_credit = 1 - np.clip((credit_score - 300) / 550, 0, 1)
        score = float(100 * (0.35 * norm_income + 0.35 * norm_dti + 0.30 * norm_credit))

    if score < 40:
        level = "Low"
    elif score < 65:
        level = "Medium"
    else:
        level = "High"

    return {"risk_score": round(score, 2), "risk_level": level}


if __name__ == "__main__":
    # Quick manual test
    tests = [
        (300000, 0.4, 780),   # expect Low
        (150000, 1.8, 660),   # expect Medium
        (60000, 3.5, 520),    # expect High
    ]
    for inc, d, c in tests:
        print(inc, d, c, "->", assess_risk(inc, d, c))
