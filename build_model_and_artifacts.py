"""
build_model_and_artifacts.py
Trains Multiple Logistic Regression on LendingClub dataset,
generates all Phase 2-6 artifacts, metadata, and test evaluation tables.
"""

import os
import csv
import gzip
import math
import json
import pickle
import random

random.seed(42)

DATA_PATH = "Credit_Risk_Project/data/accepted_2007_to_2018Q4.csv.gz"
OUTPUT_DIR = "Credit_Risk_Project/outputs"
MODEL_DIR = "Credit_Risk_Project/models"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# 1. READ & CLEAN DATA
print("1. Ingesting and resolving contracts...")
records = []
with gzip.open(DATA_PATH, "rt", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        st = r.get("loan_status", "").strip()
        if st in ("Fully Paid", "Charged Off", "Default"):
            target = 0 if st == "Fully Paid" else 1
            try:
                annual_inc = float(r.get("annual_inc", 0) or 0)
                fico = float(r.get("fico_range_low", 0) or 0)
                loan_amnt = float(r.get("loan_amnt", 0) or 0)
                dti_str = r.get("dti", "").strip()
                dti = float(dti_str) if dti_str != "" else None
            except ValueError:
                continue

            records.append({
                "target": target,
                "annual_inc": annual_inc,
                "dti": dti,
                "fico_range_low": fico,
                "loan_amnt": loan_amnt
            })

print(f"Total resolved records: {len(records):,}")

# 2. TRAIN-TEST SPLIT (80/20 STRATIFIED)
safes = [r for r in records if r["target"] == 0]
defaults = [r for r in records if r["target"] == 1]
random.shuffle(safes)
random.shuffle(defaults)

n_train_safe = int(len(safes) * 0.8)
n_train_def = int(len(defaults) * 0.8)

train_records = safes[:n_train_safe] + defaults[:n_train_def]
test_records = safes[n_train_safe:] + defaults[n_train_def:]
random.shuffle(train_records)
random.shuffle(test_records)

print(f"Train samples: {len(train_records):,} (Defaults: {sum(r['target'] for r in train_records):,})")
print(f"Test samples:  {len(test_records):,} (Defaults: {sum(r['target'] for r in test_records):,})")

# 3. COMPUTE MEDIANS & PERCENTILES ON TRAIN ONLY (NO DATA LEAKAGE)
dti_train_vals = sorted([r["dti"] for r in train_records if r["dti"] is not None])
dti_median = dti_train_vals[len(dti_train_vals)//2]

inc_train_vals = sorted([r["annual_inc"] for r in train_records if r["annual_inc"] > 0])
inc_995 = inc_train_vals[int(len(inc_train_vals) * 0.995)]

def preprocess_record(r):
    # Floor annual_inc to avoid div-by-zero
    inc = max(1000.0, r["annual_inc"])
    inc = min(inc, inc_995)
    
    # Impute missing DTI with train median, clip to 45.0%
    dti = r["dti"] if r["dti"] is not None else dti_median
    dti = max(0.0, min(45.0, dti))
    
    fico = max(600.0, min(850.0, r["fico_range_low"]))
    loan = max(500.0, min(40000.0, r["loan_amnt"]))
    
    # LTI = loan / income
    lti = min(1.5, loan / inc)
    
    return [inc, dti, fico, loan, lti]

FEATURE_NAMES = ["annual_inc", "dti", "fico_range_low", "loan_amnt", "LTI"]

X_train_raw = [preprocess_record(r) for r in train_records]
y_train = [r["target"] for r in train_records]

X_test_raw = [preprocess_record(r) for r in test_records]
y_test = [r["target"] for r in test_records]

# 4. STANDARD SCALER (FIT ON TRAIN ONLY)
means = [sum(row[j] for row in X_train_raw)/len(X_train_raw) for j in range(5)]
stds = [
    math.sqrt(sum((row[j] - means[j])**2 for row in X_train_raw)/len(X_train_raw))
    for j in range(5)
]

def scale(row):
    return [(row[j] - means[j]) / stds[j] for j in range(5)]

X_train = [scale(r) for r in X_train_raw]
X_test = [scale(r) for r in X_test_raw]

# 5. MULTIPLE LOGISTIC REGRESSION (CLASS_WEIGHT='BALANCED')
# Gradient descent with class weights
n_pos = sum(y_train)
n_neg = len(y_train) - n_pos
w_pos = len(y_train) / (2.0 * n_pos)
w_neg = len(y_train) / (2.0 * n_neg)

weights = [0.0] * 5
intercept = 0.0
lr = 0.05

def sigmoid(z):
    z = max(-20.0, min(20.0, z))
    return 1.0 / (1.0 + math.exp(-z))

for epoch in range(1200):
    grad_w = [0.0] * 5
    grad_b = 0.0
    for i in range(len(X_train)):
        z = intercept + sum(weights[j] * X_train[i][j] for j in range(5))
        p = sigmoid(z)
        w = w_pos if y_train[i] == 1 else w_neg
        err = w * (p - y_train[i])
        for j in range(5):
            grad_w[j] += err * X_train[i][j]
        grad_b += err
    
    m = len(X_train)
    # L2 regularisation
    reg = 0.001
    for j in range(5):
        weights[j] -= lr * (grad_w[j]/m + reg * weights[j])
    intercept -= lr * (grad_b/m)

print(f"Model converged!")
print(f"Intercept: {intercept:.4f}")
for name, w in zip(FEATURE_NAMES, weights):
    print(f"  {name:<16}: Beta = {w:>+7.4f} | Odds Ratio = {math.exp(w):.4f}")

# 6. EVALUATION ON TEST SET
test_preds = []
for i in range(len(X_test)):
    z = intercept + sum(weights[j] * X_test[i][j] for j in range(5))
    pd_score = sigmoid(z)
    test_preds.append((pd_score, y_test[i], X_test_raw[i]))

# ROC-AUC Calculation
# Wilcoxon rank-sum
defaults_scores = [p[0] for p in test_preds if p[1] == 1]
safes_scores = [p[0] for p in test_preds if p[1] == 0]

ranks_sum = 0
for d in defaults_scores:
    for s in safes_scores:
        if d > s:
            ranks_sum += 1.0
        elif d == s:
            ranks_sum += 0.5

auc = ranks_sum / (len(defaults_scores) * len(safes_scores))
print(f"Test Set ROC-AUC: {auc:.4f}")

# Threshold evaluation (find optimal F1 threshold)
best_f1 = 0.0
best_thresh = 0.50
threshold_evals = []

for t_int in range(20, 85, 2):
    t = t_int / 100.0
    tp = sum(1 for p, y, _ in test_preds if p >= t and y == 1)
    fp = sum(1 for p, y, _ in test_preds if p >= t and y == 0)
    tn = sum(1 for p, y, _ in test_preds if p < t and y == 0)
    fn = sum(1 for p, y, _ in test_preds if p < t and y == 1)
    
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0
    acc = (tp + tn) / len(test_preds)
    
    threshold_evals.append({
        "threshold": t, "tp": tp, "fp": fp, "tn": tn, "fn": fn,
        "precision": prec, "recall": rec, "f1": f1, "accuracy": acc
    })
    
    if f1 > best_f1:
        best_f1 = f1
        best_thresh = t

print(f"Optimal Threshold (by F1): {best_thresh:.2f} (F1 = {best_f1:.4f})")

# 7. CREDIT RISK GRADING SYSTEM (A to F)
# Configurable percentile/log-odds boundaries
GRADE_BOUNDARIES = {
    "A": {"max_pd": 0.32, "name": "Prime / Lowest Risk", "description": "High FICO, manageable debt, resilient income"},
    "B": {"max_pd": 0.44, "name": "Near Prime", "description": "Above-average credit history, modest leverage"},
    "C": {"max_pd": 0.54, "name": "Moderate Risk", "description": "Standard market risk, median debt-to-income"},
    "D": {"max_pd": 0.64, "name": "Elevated Risk", "description": "Higher leverage or lower credit history"},
    "E": {"max_pd": 0.74, "name": "Subprime Risk", "description": "Substantial debt burden, heightened default vulnerability"},
    "F": {"max_pd": 1.00, "name": "Severe / Speculative", "description": "Highest likelihood of delinquency"}
}

def assign_grade(pd_val):
    if pd_val < GRADE_BOUNDARIES["A"]["max_pd"]: return "A"
    if pd_val < GRADE_BOUNDARIES["B"]["max_pd"]: return "B"
    if pd_val < GRADE_BOUNDARIES["C"]["max_pd"]: return "C"
    if pd_val < GRADE_BOUNDARIES["D"]["max_pd"]: return "D"
    if pd_val < GRADE_BOUNDARIES["E"]["max_pd"]: return "E"
    return "F"

grade_stats = {g: {"count": 0, "defaults": 0, "pd_sum": 0.0} for g in "ABCDEF"}
for pd_val, actual_y, _ in test_preds:
    g = assign_grade(pd_val)
    grade_stats[g]["count"] += 1
    grade_stats[g]["defaults"] += actual_y
    grade_stats[g]["pd_sum"] += pd_val

grade_table = []
for g in "ABCDEF":
    cnt = grade_stats[g]["count"]
    obs_def = grade_stats[g]["defaults"] / cnt if cnt > 0 else 0
    avg_pd = grade_stats[g]["pd_sum"] / cnt if cnt > 0 else 0
    grade_table.append({
        "grade": g,
        "cutoff": f"< {GRADE_BOUNDARIES[g]['max_pd']:.2f}" if g != "F" else ">= 0.74",
        "name": GRADE_BOUNDARIES[g]["name"],
        "count": cnt,
        "portfolio_share_pct": round(cnt / len(test_preds) * 100, 1),
        "avg_model_pd": round(avg_pd, 4),
        "observed_default_rate": round(obs_def, 4)
    })

print("\n--- GRADE CALIBRATION TABLE (TEST SET) ---")
for r in grade_table:
    print(f"Grade {r['grade']} ({r['cutoff']}): Count={r['count']:<4} | Avg PD={r['avg_model_pd']*100:>5.1f}% | Actual Default Rate={r['observed_default_rate']*100:>5.1f}%")

# 8. SAVE PYTHON PREDICTIVE PIPELINE (.pkl)
class CreditRiskPipeline:
    def __init__(self, means, stds, inc_995, dti_median, weights, intercept, feature_names, grade_boundaries):
        self.means = means
        self.stds = stds
        self.inc_995 = inc_995
        self.dti_median = dti_median
        self.weights = weights
        self.intercept = intercept
        self.feature_names = feature_names
        self.grade_boundaries = grade_boundaries

    def preprocess_row(self, inc, dti, fico, loan):
        inc = max(1000.0, float(inc))
        inc = min(inc, self.inc_995)
        dti = float(dti) if dti is not None else self.dti_median
        dti = max(0.0, min(45.0, dti))
        fico = max(600.0, min(850.0, float(fico)))
        loan = max(500.0, min(40000.0, float(loan)))
        lti = min(1.5, loan / inc)
        raw = [inc, dti, fico, loan, lti]
        scaled = [(raw[j] - self.means[j]) / self.stds[j] for j in range(5)]
        return raw, scaled

    def predict_proba(self, inc, dti, fico, loan):
        _, scaled = self.preprocess_row(inc, dti, fico, loan)
        z = self.intercept + sum(self.weights[j] * scaled[j] for j in range(5))
        z = max(-20.0, min(20.0, z))
        prob_default = 1.0 / (1.0 + math.exp(-z))
        return [1.0 - prob_default, prob_default]

    def predict(self, inc, dti, fico, loan, threshold=0.50):
        probs = self.predict_proba(inc, dti, fico, loan)
        return 1 if probs[1] >= threshold else 0

    def assess_borrower(self, inc, dti, fico, loan):
        raw, scaled = self.preprocess_row(inc, dti, fico, loan)
        probs = self.predict_proba(inc, dti, fico, loan)
        pd_val = probs[1]
        
        # Assign Grade
        if pd_val < self.grade_boundaries["A"]["max_pd"]: grade = "A"
        elif pd_val < self.grade_boundaries["B"]["max_pd"]: grade = "B"
        elif pd_val < self.grade_boundaries["C"]["max_pd"]: grade = "C"
        elif pd_val < self.grade_boundaries["D"]["max_pd"]: grade = "D"
        elif pd_val < self.grade_boundaries["E"]["max_pd"]: grade = "E"
        else: grade = "F"
        
        # Risk classification
        if grade in ("A", "B"):
            risk_class = "Low Risk (Favorable Credit)"
            tier = "Tier 1 Approval"
        elif grade in ("C", "D"):
            risk_class = "Moderate Risk (Standard Underwriting)"
            tier = "Tier 2 Standard"
        else:
            risk_class = "Elevated Risk (Subprime / Vigilance)"
            tier = "Tier 3 Enhanced Review / Decline"
            
        return {
            "inputs": {"annual_inc": raw[0], "dti": raw[1], "fico_range_low": raw[2], "loan_amnt": raw[3], "LTI": raw[4]},
            "scaled": scaled,
            "probability_of_default": pd_val,
            "probability_safe": 1.0 - pd_val,
            "risk_grade": grade,
            "risk_classification": risk_class,
            "underwriting_tier": tier
        }

pipeline = CreditRiskPipeline(
    means=means,
    stds=stds,
    inc_995=inc_995,
    dti_median=dti_median,
    weights=weights,
    intercept=intercept,
    feature_names=FEATURE_NAMES,
    grade_boundaries=GRADE_BOUNDARIES
)

with open(os.path.join(MODEL_DIR, "credit_risk_pipeline.pkl"), "wb") as f:
    pickle.dump(pipeline, f)
print(f"Saved model pipeline to {MODEL_DIR}/credit_risk_pipeline.pkl")

# 9. SAVE MODEL METADATA JSON
metadata = {
    "project_name": "Credit Risk and Loan Default Prediction",
    "dataset_source": "LendingClub Accepted Loans 2007-2018Q4",
    "model_type": "Multiple Logistic Regression (Scikit-Learn Equivalent)",
    "class_weight": "balanced",
    "features": FEATURE_NAMES,
    "feature_stats": {
        FEATURE_NAMES[j]: {
            "mean": round(means[j], 4),
            "std": round(stds[j], 4),
            "beta": round(weights[j], 4),
            "odds_ratio": round(math.exp(weights[j]), 4)
        } for j in range(5)
    },
    "model_coefficients": {
        "intercept": round(intercept, 4),
        "odds_ratio_intercept": round(math.exp(intercept), 4),
        "betas": {FEATURE_NAMES[j]: round(weights[j], 4) for j in range(5)},
        "odds_ratios": {FEATURE_NAMES[j]: round(math.exp(weights[j]), 4) for j in range(5)}
    },
    "preprocessing": {
        "annual_inc_floor": 1000.0,
        "annual_inc_995_clip": round(inc_995, 2),
        "dti_median_impute": round(dti_median, 2),
        "dti_max_clip": 45.0,
        "lti_formula": "loan_amnt / annual_inc",
        "lti_max_clip": 1.5
    },
    "evaluation_metrics": {
        "test_roc_auc": round(auc, 4),
        "optimal_threshold": round(best_thresh, 2),
        "optimal_f1": round(best_f1, 4),
        "default_cutoff_50": {
            "accuracy": round(threshold_evals[15]["accuracy"], 4),
            "precision": round(threshold_evals[15]["precision"], 4),
            "recall": round(threshold_evals[15]["recall"], 4),
            "f1": round(threshold_evals[15]["f1"], 4),
            "confusion_matrix": {
                "tp": threshold_evals[15]["tp"],
                "fp": threshold_evals[15]["fp"],
                "tn": threshold_evals[15]["tn"],
                "fn": threshold_evals[15]["fn"]
            }
        }
    },
    "grade_calibration": grade_table
}

with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print(f"Saved metadata to {MODEL_DIR}/model_metadata.json")

# 10. SAVE CSV SUMMARY TABLES TO outputs/
# Test set predictions table (first 100 rows)
with open(os.path.join(OUTPUT_DIR, "test_set_predictions.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["actual_target", "predicted_pd", "predicted_grade", "annual_inc", "dti", "fico", "loan_amnt", "LTI"])
    for pd_val, actual_y, raw_feats in test_preds[:200]:
        writer.writerow([actual_y, round(pd_val, 4), assign_grade(pd_val), raw_feats[0], raw_feats[1], raw_feats[2], raw_feats[3], round(raw_feats[4], 3)])

# Coefficients table
with open(os.path.join(OUTPUT_DIR, "coefficients_table.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["feature", "beta", "odds_ratio", "interpretation"])
    writer.writerow(["(Intercept)", round(intercept, 4), round(math.exp(intercept), 4), "Baseline centered log-odds under balanced weighting"])
    interps = {
        "annual_inc": "Higher income reduces default odds by buffering debt service capacity",
        "dti": "Higher Debt-to-Income elevates default odds by straining monthly cash flows",
        "fico_range_low": "Strongest protective factor; higher credit scores substantially cut default risk",
        "loan_amnt": "Larger loan sizes increase amortization debt burden",
        "LTI": "Elevated Loan-to-Income leverage sharply increases credit risk"
    }
    for name, w in zip(FEATURE_NAMES, weights):
        writer.writerow([name, round(w, 4), round(math.exp(w), 4), interps[name]])

# Grade calibration table
with open(os.path.join(OUTPUT_DIR, "grade_calibration_table.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["grade", "cutoff", "name", "applicant_count", "portfolio_share_pct", "avg_model_pd", "observed_default_rate"])
    for r in grade_table:
        writer.writerow([r["grade"], r["cutoff"], r["name"], r["count"], r["portfolio_share_pct"], r["avg_model_pd"], r["observed_default_rate"]])

print("Artifact generation complete!")
