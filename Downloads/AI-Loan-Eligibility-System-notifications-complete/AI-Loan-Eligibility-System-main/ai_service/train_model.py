

import json
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATA_PATH = "data/loan_data.csv"
MODEL_DIR = "models"

# These map 1:1 to the LoanApplication Mongoose schema fields in the
# group's existing backend (backend/models/LoanApplication.js)
NUMERIC_FEATURES = [
    "income",          # <- Monthly Income
    "loanAmount",      # <- LoanAmount
    "creditScore",     # <- Credit Score
    "existingDebts",   # <- Existing Debt
]

CATEGORICAL_FEATURES = [
    "employmentStatus",  # <- Employment Status
    "loanPurpose",       # <- Loan Purpose
]

TARGET = "Loan_Status"

# Rename columns from the raw Kaggle-style CSV to match the schema field
# names used by the Node.js backend, so the trained pipeline speaks the
# same "language" as the rest of the system end-to-end.
COLUMN_RENAME_MAP = {
    "Monthly Income": "income",
    "LoanAmount": "loanAmount",
    "Credit Score": "creditScore",
    "Existing Debt": "existingDebts",
    "Employment Status": "employmentStatus",
    "Loan Purpose": "loanPurpose",
}


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.rename(columns=COLUMN_RENAME_MAP)
    return df


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, NUMERIC_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES),
    ])

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])
    return pipeline


def main():
    import os
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = load_data(DATA_PATH)

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = (df[TARGET] == "Y").astype(int)  # 1 = Eligible, 0 = Not Eligible

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
        "f1_score": round(f1_score(y_test, y_pred), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "test_set_size": int(len(y_test)),
        "train_set_size": int(len(y_train)),
    }

    print("=== Model Evaluation ===")
    print(json.dumps(metrics, indent=2))
    print()
    print(classification_report(y_test, y_pred, target_names=["Not Eligible", "Eligible"]))

    joblib.dump(pipeline, f"{MODEL_DIR}/eligibility_model.joblib")
    joblib.dump(NUMERIC_FEATURES + CATEGORICAL_FEATURES, f"{MODEL_DIR}/feature_columns.joblib")
    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved model to {MODEL_DIR}/eligibility_model.joblib")


if __name__ == "__main__":
    main()
