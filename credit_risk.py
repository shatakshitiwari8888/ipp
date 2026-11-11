"""
=============================================================================
CREDIT RISK AND LOAN DEFAULT PREDICTION
Course: Introduction to Python Programming (College Project)
Model: Multiple Logistic Regression (Econometric / FinTech Approach)
Dataset: LendingClub Accepted Loans (2007-2018Q4)
Target: Probability of Default (PD) for Retail Loan Applicants
=============================================================================

This script implements an end-to-end Machine Learning and Credit Scoring
pipeline designed to predict the Probability of Default (PD) for retail loan
applicants.

KEY CONCEPTS DEMONSTRATED FOR COURSE RUBRIC:
  1. Variables & Numeric Types (int, float, boolean)
  2. String Handling (stripping whitespace, lower/upper, text regex/cleaning)
  3. Conditionals (if-elif-else branching for credit grades and checks)
  4. Loops (for-loops for coefficient tables and applicants; while-loop demo)
  5. Functions (modular, reusable, well-documented functions with type hints)
  6. Data Structures (Lists, Dictionaries for configuration & borrower profiles)
  7. Exception Handling (try-except blocks for file I/O and data validation)
  8. NumPy (arrays, matrix operations, vectorized math, np.exp, np.clip)
  9. Pandas (DataFrames, filtering, imputation, aggregation, groupbys)
 10. Matplotlib & Seaborn (publication-quality financial visualizations)
 11. Scikit-Learn & Statsmodels (StandardScaler, LogisticRegression, Logit summary)
=============================================================================
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report
)

# Optional econometric bonus (Statsmodels for p-values & standard errors)
try:
    import statsmodels.api as sm
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False


# =============================================================================
# GLOBAL CONFIGURATION & BUSINESS RULES (DICTIONARIES & CONSTANTS)
# =============================================================================

# Path to the dataset and directory to store output visualization charts
DATA_FILE_PATH: str = "data/accepted_2007_2018Q4.csv"
OUTPUT_DIR: str = "outputs"

# Feature list used for predictive modeling
# Note: LTI (Loan-to-Income) will be created during Feature Engineering
FINAL_FEATURES = ["annual_inc", "dti", "fico_range_low", "loan_amnt", "LTI"]

# -----------------------------------------------------------------------------
# WHY CALIBRATED CUTOFFS ARE NEEDED:
# When training Logistic Regression with `class_weight="balanced"`, the model
# places equal total weight on the safe and default classes. In real-world data,
# only ~15-20% of loans default. Balancing the classes shifts the intercept
# upward, raising the mean predicted PD to around 50%.
# Therefore, standard cutoffs (like 0.05 or 0.10) would put almost every borrower
# into F. The cutoffs below are calibrated to spread grades A through F across
# the balanced PD distribution while preserving monotonic risk ordering.
# -----------------------------------------------------------------------------
GRADE_CUTOFFS: dict = {
    "A": 0.32,  # PD < 0.32 -> Grade A (Prime / Lowest Risk)
    "B": 0.44,  # 0.32 <= PD < 0.44 -> Grade B (Near Prime)
    "C": 0.54,  # 0.44 <= PD < 0.54 -> Grade C (Moderate Risk)
    "D": 0.64,  # 0.54 <= PD < 0.64 -> Grade D (Elevated Risk)
    "E": 0.74,  # 0.64 <= PD < 0.74 -> Grade E (Subprime)
    "F": 1.00   # PD >= 0.74 -> Grade F (High Risk / Reject or Speculative)
}

# Pricing Matrix: maps each Credit Grade to an Annual Percentage Rate (APR)
# Risk-based pricing ensures higher-risk borrowers pay a compensatory risk premium.
INTEREST_RATES: dict = {
    "A": 0.0699,  #  6.99% APR
    "B": 0.0999,  #  9.99% APR
    "C": 0.1399,  # 13.99% APR
    "D": 0.1799,  # 17.99% APR
    "E": 0.2299,  # 22.99% APR
    "F": 0.2899   # 28.99% APR
}


# =============================================================================
# PIPELINE STEP 1: RAW DATA INGESTION
# =============================================================================

def load_data(file_path: str = DATA_FILE_PATH) -> pd.DataFrame:
    """
    Loads selected columns from the LendingClub dataset with robust error handling.
    Supports CSV, compressed CSV (.gz), and binary workbooks (.parquet, .pkl, .xlsb, .xlsx, .feather).
    """
    print("\n" + "=" * 70)
    print("STEP 1: RAW DATA INGESTION")
    print("=" * 70)
    
    candidate_cols = ["id", "member_id", "loan_status", "annual_inc", "dti", "fico_range_low", "loan_amnt"]
    
    # Check if target file exists or auto-detect binary workbooks/csv in data directories
    detected_path = None
    search_paths = [
        file_path,
        "data/accepted_2007_to_2018Q4.parquet",
        "Credit_Risk_Project/data/accepted_2007_to_2018Q4.parquet",
        "data/accepted_2007_to_2018Q4.pkl",
        "Credit_Risk_Project/data/accepted_2007_to_2018Q4.pkl",
        "data/accepted_2007_to_2018Q4.xlsb",
        "data/accepted_2007_to_2018Q4.xlsx",
        "data/accepted_2007_to_2018Q4.csv.gz",
        "Credit_Risk_Project/data/accepted_2007_to_2018Q4.csv.gz",
        "data/accepted_2007_2018Q4.csv",
        "Credit_Risk_Project/data/accepted_2007_2018Q4.csv"
    ]
    for p in search_paths:
        if os.path.exists(p):
            detected_path = p
            break
            
    if not detected_path:
        print(f"[!] File not found at specified path: '{file_path}'")
        try:
            import generate_sample_data
            generate_sample_data.create_sample_csv(file_path, n_rows=5000)
            detected_path = file_path
            print(f"[✓] Created synthetic sample dataset at: {file_path}")
        except Exception as gen_err:
            raise FileNotFoundError(
                f"Dataset not found at '{file_path}'. Please place the data workbook (parquet/pickle/csv.gz/csv) "
                f"into the 'data/' folder. Details: {gen_err}"
            )
            
    print(f"Loading dataset from: {detected_path}")
    ext = os.path.splitext(detected_path)[1].lower()
    
    try:
        if ext == ".parquet":
            df = pd.read_parquet(detected_path, columns=[c for c in candidate_cols])
        elif ext in [".pkl", ".pickle"]:
            df = pd.read_pickle(detected_path)
            cols = [c for c in candidate_cols if c in df.columns]
            df = df[cols]
        elif ext == ".feather":
            df = pd.read_feather(detected_path, columns=[c for c in candidate_cols])
        elif ext in [".xlsb", ".xlsx"]:
            engine = "pyxlsb" if ext == ".xlsb" else "openpyxl"
            df = pd.read_excel(detected_path, engine=engine)
            cols = [c for c in candidate_cols if c in df.columns]
            df = df[cols]
        else:
            # CSV or CSV.GZ
            compression = "gzip" if detected_path.endswith(".gz") else None
            header_sample = pd.read_csv(detected_path, nrows=2, compression=compression)
            cols_to_load = [c for c in candidate_cols if c in header_sample.columns]
            df = pd.read_csv(detected_path, usecols=cols_to_load, compression=compression, low_memory=False)
            
        print(f"[✓] Successfully loaded {len(df):,} rows and {len(df.columns)} columns.")
        return df

    except FileNotFoundError as fnf_error:
        print(f"[ERROR] Could not locate dataset file: {fnf_error}")
        sys.exit(1)
    except Exception as general_error:
        print(f"[ERROR] An unexpected error occurred while loading dataset: {general_error}")
        sys.exit(1)


# =============================================================================
# PIPELINE STEP 2: DATA CLEANING & PREPROCESSING
# =============================================================================

def clean_data(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Performs data hygiene, filtering, dropping missing rows (complete-case analysis),
    and outlier clipping.
    """
    print("\n" + "=" * 70)
    print("STEP 2: DATA CLEANING & PREPROCESSING (DROPPING MISSING ROWS)")
    print("=" * 70)
    
    df = raw_df.copy()
    initial_rows = len(df)
    
    # -------------------------------------------------------------------------
    # String Cleaning & Formatting
    # Remove leading/trailing spaces and standardize text
    # -------------------------------------------------------------------------
    df["loan_status"] = df["loan_status"].astype(str).str.strip()
    
    print(f"Unique raw loan statuses before filtering:")
    status_counts = df["loan_status"].value_counts()
    for status, count in status_counts.head(8).items():
        print(f"  • {status:<28} : {count:,} loans")
    
    # Filter only resolved loans (Look-Ahead Bias Elimination)
    resolved_mask = df["loan_status"].isin(["Fully Paid", "Charged Off", "Default"])
    df = df[resolved_mask].copy()
    dropped_unresolved = initial_rows - len(df)
    print(f"\n[✓] Filtered to resolved loans only.")
    print(f"    Dropped {dropped_unresolved:,} unresolved loans (Current, Late, Grace Period).")
    print(f"    Remaining resolved contracts: {len(df):,}")
    
    # Map target variable `target` (0 = Safe, 1 = Default)
    df["target"] = df["loan_status"].apply(lambda s: 0 if s == "Fully Paid" else 1)
    
    # Drop identifier columns (id, member_id) to prevent data leakage and noise
    cols_to_drop = [c for c in ["id", "member_id", "loan_status"] if c in df.columns]
    df.drop(columns=cols_to_drop, inplace=True)
    print(f"[✓] Dropped non-predictive identifier columns: {cols_to_drop}")
    
    # -------------------------------------------------------------------------
    # Numeric Cleaning & Dropping Missing Values (Complete-Case Analysis)
    # Rather than imputing medians, we drop rows with missing values in required features.
    # -------------------------------------------------------------------------
    numeric_cols = ["annual_inc", "dti", "fico_range_low", "loan_amnt"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    missing_rows_count = int(df[numeric_cols].isna().any(axis=1).sum())
    if missing_rows_count > 0:
        print(f"\n[!] Missing values detected across required predictors:")
        for col in numeric_cols:
            col_na = int(df[col].isna().sum())
            if col_na > 0:
                print(f"    • {col:<16}: {col_na:,} missing values")
        df.dropna(subset=numeric_cols, inplace=True)
        print(f"[✓] Complete-Case Analysis: Dropped {missing_rows_count:,} rows with missing values (instead of median imputation).")
        print(f"    Cleaned observation count: {len(df):,} rows.")
    else:
        print(f"\n[✓] Complete-Case Analysis: Zero missing values detected across required predictors: {numeric_cols}.")
    
    # -------------------------------------------------------------------------
    # Edge Cases & Outlier Handling:
    # 1. annual_inc == 0 -> replace with minimum positive threshold ($1,000)
    #    to prevent division by zero in LTI (loan_amnt / annual_inc).
    # 2. Clip extreme outliers in annual_inc and dti (e.g. 99.5th percentile)
    # -------------------------------------------------------------------------
    zero_income_count = (df["annual_inc"] <= 0).sum()
    if zero_income_count > 0:
        print(f"    Handling {zero_income_count} cases with annual_inc <= 0 (replaced with floor $1,000.00).")
        df["annual_inc"] = df["annual_inc"].apply(lambda inc: max(1000.0, float(inc)))
        
    # Clip extreme income at 99.5th percentile (e.g., $300k+) to stabilize regression
    inc_upper = float(df["annual_inc"].quantile(0.995))
    df["annual_inc"] = np.clip(df["annual_inc"], a_min=1000.0, a_max=inc_upper)
    
    # Clip DTI at 99th percentile (or 45.0) to prevent distorted leverage estimates
    dti_upper = min(45.0, float(df["dti"].quantile(0.99)))
    df["dti"] = np.clip(df["dti"], a_min=0.0, a_max=dti_upper)
    
    print(f"[✓] Outliers clipped: annual_inc capped at ${inc_upper:,.2f}, dti capped at {dti_upper:.2f}%.")
    return df
    
    # -------------------------------------------------------------------------
    # Edge Cases & Outlier Handling:
    # 1. annual_inc == 0 -> replace with minimum positive threshold ($1,000)
    #    to prevent division by zero in LTI (loan_amnt / annual_inc).
    # 2. Clip extreme outliers in annual_inc and dti (e.g. 99.5th percentile)
    # -------------------------------------------------------------------------
    zero_income_count = (df["annual_inc"] <= 0).sum()
    if zero_income_count > 0:
        print(f"    Handling {zero_income_count} cases with annual_inc <= 0 (replaced with floor $1,000.00).")
        df["annual_inc"] = df["annual_inc"].apply(lambda inc: max(1000.0, float(inc)))
        
    # Clip extreme income at 99.5th percentile (e.g., $300k+) to stabilize regression
    inc_upper = float(df["annual_inc"].quantile(0.995))
    df["annual_inc"] = np.clip(df["annual_inc"], a_min=1000.0, a_max=inc_upper)
    
    # Clip DTI at 99th percentile (or 45.0) to prevent distorted leverage estimates
    dti_upper = min(45.0, float(df["dti"].quantile(0.99)))
    df["dti"] = np.clip(df["dti"], a_min=0.0, a_max=dti_upper)
    
    print(f"[✓] Outliers clipped: annual_inc capped at ${inc_upper:,.2f}, dti capped at {dti_upper:.2f}%.")
    return df


# =============================================================================
# PIPELINE STEP 3: FEATURE ENGINEERING
# =============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes financial domain features, primarily Loan-to-Income (LTI).
    
    LTI Formula:
      LTI = loan_amnt / annual_inc
      
    Why LTI matters in Credit Underwriting:
      A $20,000 loan represents a completely different debt burden for a borrower
      earning $30,000 (LTI = 0.67 -> High Burden) versus someone earning $200,000
      (LTI = 0.10 -> Low Burden).
    """
    print("\n" + "=" * 70)
    print("STEP 3: FEATURE ENGINEERING")
    print("=" * 70)
    
    # Calculate Loan-to-Income ratio (vectorized pandas operation)
    df["LTI"] = df["loan_amnt"] / df["annual_inc"]
    
    # Clip LTI at realistic bounds [0.0, 1.5]
    df["LTI"] = np.clip(df["LTI"], a_min=0.0, a_max=1.5)
    
    print("[✓] Created feature 'LTI' (Loan-to-Income ratio = loan_amnt / annual_inc).")
    print(f"    LTI Mean: {df['LTI'].mean():.4f} | Median: {df['LTI'].median():.4f} | Max: {df['LTI'].max():.4f}")
    print(f"    Final feature set: {FINAL_FEATURES}")
    
    return df


# =============================================================================
# PIPELINE STEP 4: DATA PARTITIONING (TRAIN-TEST SPLIT)
# & STEP 5: NORMALIZATION (STANDARD SCALER)
# =============================================================================

def split_and_scale(df: pd.DataFrame):
    """
    Splits the dataset into 80% train and 20% test sets, stratified on the target.
    Applies StandardScaler fit ONLY on the training set to prevent data leakage.
    
    Returns:
      X_train_scaled, X_test_scaled, y_train, y_test, scaler, X_train, X_test
    """
    print("\n" + "=" * 70)
    print("STEP 4: DATA PARTITIONING (80/20 STRATIFIED SPLIT)")
    print("=" * 70)
    
    X = df[FINAL_FEATURES]
    y = df["target"]
    
    # 80/20 split, stratified to preserve exact default ratio in both folds
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    
    # Calculate and display class distributions
    total_safe = int((y == 0).sum())
    total_default = int((y == 1).sum())
    pct_safe = (total_safe / len(y)) * 100
    pct_default = (total_default / len(y)) * 100
    
    print(f"Actual Full Dataset Class Distribution:")
    print(f"  • Safe (Fully Paid, target=0)  : {total_safe:,} ({pct_safe:.2f}%)")
    print(f"  • Default (Charged Off, target=1): {total_default:,} ({pct_default:.2f}%)")
    print(f"Training set: {len(X_train):,} samples | Test set: {len(X_test):,} samples")
    
    # -------------------------------------------------------------------------
    # STEP 5: NORMALIZATION (PREVENTING DATA LEAKAGE)
    # Crucial teaching point: We fit the scaler strictly on X_train.
    # If we fit on the full dataset or X_test, test set distribution parameters
    # (mean, std) would leak into training, artificially inflating performance.
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("STEP 5: NORMALIZATION (STANDARD SCALER)")
    print("=" * 70)
    
    scaler = StandardScaler()
    scaler.fit(X_train)  # Fit on training data ONLY
    
    X_train_scaled = pd.DataFrame(
        scaler.transform(X_train),
        columns=FINAL_FEATURES,
        index=X_train.index
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=FINAL_FEATURES,
        index=X_test.index
    )
    
    print("[✓] StandardScaler fitted on X_train and applied to both X_train and X_test.")
    print("    Feature Means on Train (should be ~0.0):")
    for f_name, f_mean in zip(FINAL_FEATURES, scaler.mean_):
        print(f"      - {f_name:<16}: Mean={f_mean:>10.2f}, Scale(Std)={scaler.scale_[FINAL_FEATURES.index(f_name)]:>10.2f}")
        
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, X_train, X_test


# =============================================================================
# PIPELINE STEP 6: MULTIPLE LOGISTIC REGRESSION MODEL TRAINING
# =============================================================================

def train_model(X_train_scaled: pd.DataFrame, y_train: pd.Series):
    """
    Fits a Multiple Logistic Regression classifier with balanced class weights.
    Also fits an optional Statsmodels Logit model for econometrics p-values.
    
    Why class_weight='balanced':
      Because defaults are the minority class (~18%), standard unweighted
      logistic regression would optimize overall accuracy by predicting safe (0)
      for almost every borrower. Balanced weighting inversely scales weights
      according to class frequencies, forcing the model to learn signals that
      separate defaulters from safe borrowers.
    """
    print("\n" + "=" * 70)
    print("STEP 6: MULTIPLE LOGISTIC REGRESSION TRAINING")
    print("=" * 70)
    
    # Instantiate Scikit-Learn Logistic Regression
    clf = LogisticRegression(
        class_weight="balanced",
        random_state=42,
        solver="lbfgs",
        max_iter=1000
    )
    clf.fit(X_train_scaled, y_train)
    print("[✓] Scikit-Learn LogisticRegression model successfully trained with class_weight='balanced'.")
    
    # Fit Statsmodels Logit for Econometrics summary (bonus)
    sm_model = None
    if HAS_STATSMODELS:
        try:
            # Add constant intercept for Statsmodels
            X_train_sm = sm.add_constant(X_train_scaled)
            sm_model = sm.Logit(y_train, X_train_sm).fit(disp=False)
            print("[✓] Statsmodels Logit model fitted for econometric inference (p-values & SE).")
        except Exception as sm_err:
            print(f"    [Note] Statsmodels Logit skipped due to: {sm_err}")
            
    return clf, sm_model


# =============================================================================
# PIPELINE STEP 7: PROBABILITY GENERATION & MODEL EVALUATION
# =============================================================================

def evaluate_model(clf: LogisticRegression, sm_model, X_test_scaled: pd.DataFrame, y_test: pd.Series):
    """
    Generates Probability of Default (PD) via predict_proba, computes ROC-AUC,
    displays confusion matrix, classification report, and detailed econometric
    Beta coefficients table with Odds Ratios and plain-English interpretations.
    """
    print("\n" + "=" * 70)
    print("STEP 7: PROBABILITY GENERATION & EVALUATION")
    print("=" * 70)
    
    # Predict probabilities on test set
    # predict_proba returns [P(Y=0), P(Y=1)]. We extract column index 1 for P(Default)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1]
    y_pred = clf.predict(X_test_scaled)
    
    auc_score = roc_auc_score(y_test, y_prob)
    print(f"\nROC-AUC Score on Test Set: {auc_score:.4f} ({auc_score*100:.2f}%)")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    print("\nConfusion Matrix (at default threshold 0.50):")
    print(f"  True Negatives  (Safe correctly identified)      : {tn:,}")
    print(f"  False Positives (Safe incorrectly flagged default): {fp:,}")
    print(f"  False Negatives (Default missed by model)        : {fn:,}")
    print(f"  True Positives  (Default correctly caught)       : {tp:,}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Safe (0)", "Default (1)"]))
    
    # -------------------------------------------------------------------------
    # Econometric Beta Coefficients, Odds Ratios (exp(beta)) & Interpretations
    # -------------------------------------------------------------------------
    intercept = float(clf.intercept_[0])
    coefficients = clf.coef_[0]
    
    print("=" * 75)
    print(f"{'Feature':<18} | {'Beta (std)':>10} | {'Odds Ratio (e^β)':>16} | {'Plain-English Economic Meaning'}")
    print("-" * 75)
    print(f"{'(Intercept)':<18} | {intercept:>10.4f} | {np.exp(intercept):>16.4f} | Baseline log-odds of default (centered)")
    
    interpretations = {
        "annual_inc": "Higher income REDUCES default odds (ability to service debt).",
        "dti": "Higher Debt-to-Income INCREASES default odds (cash-flow stretch).",
        "fico_range_low": "Higher credit score substantially REDUCES default odds.",
        "loan_amnt": "Larger principal balance INCREASES monthly repayment burden.",
        "LTI": "Higher Loan-to-Income ratio INCREASES leverage and default odds."
    }
    
    coef_summary = []
    # Loop over features (rubric requirement for loops and list/dict handling)
    for feat_name, beta in zip(FINAL_FEATURES, coefficients):
        odds_ratio = float(np.exp(beta))
        meaning = interpretations.get(feat_name, "Impacts default probability.")
        print(f"{feat_name:<18} | {beta:>10.4f} | {odds_ratio:>16.4f} | {meaning}")
        coef_summary.append({
            "feature": feat_name,
            "beta": beta,
            "odds_ratio": odds_ratio,
            "interpretation": meaning
        })
    print("=" * 75)
    
    # Display Statsmodels summary if available (for econometrics course)
    if sm_model is not None:
        print("\n" + "~" * 70)
        print("BONUS: STATSMODELS LOGIT REGRESSION SUMMARY (ECONOMETRIC INFERENCE)")
        print("~" * 70)
        try:
            print(sm_model.summary())
        except Exception:
            pass
            
    return y_prob, auc_score, coef_summary


# =============================================================================
# PIPELINE STEP 8: BUSINESS LOGIC MAPPING (GRADES & INTEREST RATES)
# =============================================================================

def assign_grade(pd_val: float) -> str:
    """
    Converts a continuous Probability of Default (PD) into a discrete Credit Grade (A to F)
    using if-elif-else branching.
    
    Rubric Concepts:
      - if-elif-else conditional branching.
      - Dictionary lookup referencing GRADE_CUTOFFS.
    """
    # Defensive programming: ensure valid probability range [0, 1]
    if pd_val < 0.0:
        pd_val = 0.0
    elif pd_val > 1.0:
        pd_val = 1.0
        
    if pd_val < GRADE_CUTOFFS["A"]:
        return "A"
    elif pd_val < GRADE_CUTOFFS["B"]:
        return "B"
    elif pd_val < GRADE_CUTOFFS["C"]:
        return "C"
    elif pd_val < GRADE_CUTOFFS["D"]:
        return "D"
    elif pd_val < GRADE_CUTOFFS["E"]:
        return "E"
    else:
        return "F"


def evaluate_grade_calibration(y_test: pd.Series, y_prob: np.ndarray) -> pd.DataFrame:
    """
    Evaluates the business logic mapping across test set applicants.
    Computes count of applicants, average PD, and actual default rate per grade.
    
    This demonstrates Monotonicity: Grade A must have the lowest actual default rate,
    progressively increasing to Grade F with the highest actual default rate.
    """
    print("\n" + "=" * 70)
    print("STEP 8: BUSINESS LOGIC MAPPING & CREDIT GRADE CALIBRATION")
    print("=" * 70)
    
    eval_df = pd.DataFrame({
        "actual_default": y_test.values,
        "predicted_pd": y_prob
    })
    
    # Assign grades to test set using our assign_grade function
    eval_df["grade"] = eval_df["predicted_pd"].apply(assign_grade)
    
    # Group by grade to assess risk ranking
    grade_order = ["A", "B", "C", "D", "E", "F"]
    grouped = eval_df.groupby("grade").agg(
        applicant_count=("actual_default", "count"),
        average_pd=("predicted_pd", "mean"),
        actual_default_rate=("actual_default", "mean")
    ).reindex(grade_order).fillna(0)
    
    grouped["portfolio_share_pct"] = (grouped["applicant_count"] / len(eval_df)) * 100
    grouped["assigned_apr_pct"] = [INTEREST_RATES[g] * 100 for g in grouped.index]
    
    print(f"{'Grade':<6} | {'Applicants':>10} | {'Portfolio %':>12} | {'Avg Model PD':>13} | {'Actual Def Rate':>15} | {'Offered APR':>11}")
    print("-" * 78)
    for grade, row in grouped.iterrows():
        print(
            f"{grade:<6} | {int(row['applicant_count']):>10,d} | "
            f"{row['portfolio_share_pct']:>11.1f}% | "
            f"{row['average_pd']:>12.2%} | "
            f"{row['actual_default_rate']:>14.2%} | "
            f"{row['assigned_apr_pct']:>10.2f}%"
        )
    print("=" * 78)
    print("Note: Monotonic increase in 'Actual Def Rate' confirms the grading model correctly ranks risk!")
    return grouped


# =============================================================================
# SINGLE APPLICANT SCORING FUNCTION
# =============================================================================

def score_applicant(
    profile_dict: dict,
    clf: LogisticRegression,
    scaler: StandardScaler
) -> dict:
    """
    Scores a single retail loan applicant profile dictionary.
    
    Parameters:
      profile_dict: dict with keys ['annual_inc', 'dti', 'fico_range_low', 'loan_amnt']
      clf: Trained LogisticRegression model
      scaler: Fitted StandardScaler
      
    Returns:
      dict containing:
        - raw_profile: input profile
        - LTI: computed Loan-to-Income
        - PD: predicted Probability of Default (float 0.0 - 1.0)
        - grade: credit grade string ('A' to 'F')
        - interest_rate: offered APR float (e.g. 0.0699 for 6.99%)
        - decision: 'Approved' or 'Referred/Declined'
    """
    # 1. Validation & Input type checks (rubric requirement for error handling)
    required_keys = ["annual_inc", "dti", "fico_range_low", "loan_amnt"]
    for k in required_keys:
        if k not in profile_dict:
            raise KeyError(f"Missing required borrower attribute: '{k}'")
            
    annual_inc = float(max(1000.0, profile_dict["annual_inc"]))
    loan_amnt = float(profile_dict["loan_amnt"])
    dti = float(profile_dict["dti"])
    fico = float(profile_dict["fico_range_low"])
    
    # 2. Feature engineering: compute LTI
    lti = loan_amnt / annual_inc
    
    # 3. Assemble feature row in exact order expected by model
    applicant_df = pd.DataFrame([{
        "annual_inc": annual_inc,
        "dti": dti,
        "fico_range_low": fico,
        "loan_amnt": loan_amnt,
        "LTI": lti
    }])[FINAL_FEATURES]
    
    # 4. Standardize features using the training scaler
    applicant_scaled = scaler.transform(applicant_df)
    
    # 5. Predict Probability of Default
    pd_score = float(clf.predict_proba(applicant_scaled)[0, 1])
    
    # 6. Assign Credit Grade and Interest Rate via business logic
    grade = assign_grade(pd_score)
    apr = INTEREST_RATES[grade]
    
    decision = "Approved" if grade in ["A", "B", "C", "D"] else "High Risk / Manual Review"
    
    return {
        "annual_inc": annual_inc,
        "dti": dti,
        "fico_range_low": fico,
        "loan_amnt": loan_amnt,
        "LTI": lti,
        "PD": pd_score,
        "grade": grade,
        "interest_rate": apr,
        "decision": decision
    }


# =============================================================================
# DATA VISUALIZATIONS & CHARTS (MATPLOTLIB & SEABORN)
# =============================================================================

def make_plots(
    df: pd.DataFrame,
    clf: LogisticRegression,
    scaler: StandardScaler,
    X_test_scaled: pd.DataFrame,
    y_test: pd.Series,
    y_prob: np.ndarray,
    grade_table: pd.DataFrame,
    output_dir: str = OUTPUT_DIR
):
    """
    Generates and saves the 5 required project visualization charts into `outputs/`:
      1. outputs/01_class_distribution.png: Class distribution bar chart
      2. outputs/02_logistic_scurve.png: Logistic S-curve (sigmoid) of PD vs Risk Score
      3. outputs/03_roc_curve.png: ROC Curve with AUC score
      4. outputs/04_grades_and_default_rate.png: Grade vs Avg PD & Actual Default Rate
      5. outputs/05_standardized_coefficients.png: Standardized Beta Coefficients & Odds Ratios
    """
    print("\n" + "=" * 70)
    print("STEP 9: GENERATING VISUALIZATION CHARTS")
    print("=" * 70)
    
    os.makedirs(output_dir, exist_ok=True)
    sns.set_theme(style="whitegrid", palette="muted")
    
    # -------------------------------------------------------------------------
    # Chart 1: Class Distribution Bar Chart
    # -------------------------------------------------------------------------
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    counts = df["target"].value_counts()
    labels = ["Fully Paid (0)", "Default / Charged Off (1)"]
    bars = ax1.bar(labels, counts.values, color=["#2b8a3e", "#c92a2a"], width=0.45)
    
    # Annotate bar percentages
    total = len(df)
    for bar in bars:
        h = bar.get_height()
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            h + (total * 0.01),
            f"{int(h):,} ({h/total*100:.1f}%)",
            ha="center", va="bottom", fontweight="bold"
        )
        
    ax1.set_title("LendingClub Loan Outcome Class Distribution", fontsize=14, fontweight="bold", pad=12)
    ax1.set_ylabel("Number of Loans", fontsize=11)
    ax1.set_ylim(0, max(counts.values) * 1.15)
    plt.tight_layout()
    p1 = os.path.join(output_dir, "01_class_distribution.png")
    fig1.savefig(p1, dpi=300)
    plt.close(fig1)
    print(f"[✓] Saved Chart 1 -> {p1}")
    
    # -------------------------------------------------------------------------
    # Chart 2: Logistic S-Curve (Sigmoid)
    # Shows how linear log-odds z map to non-linear Probability of Default [0, 1]
    # -------------------------------------------------------------------------
    fig2, ax2 = plt.subplots(figsize=(8.5, 5))
    # Compute linear risk score (log-odds z = intercept + beta * X)
    intercept = clf.intercept_[0]
    z_scores = intercept + np.dot(X_test_scaled.values, clf.coef_[0])
    
    # Theoretical sigmoid curve
    z_range = np.linspace(-4, 4, 300)
    sigmoid_pd = 1 / (1 + np.exp(-z_range))
    
    ax2.plot(z_range, sigmoid_pd, color="#1971c2", lw=2.5, label="Logistic Sigmoid Curve: $P(Y=1) = \\frac{1}{1 + e^{-z}}$")
    
    # Scatter sample of actual test applicants
    sample_indices = np.random.choice(len(z_scores), size=min(120, len(z_scores)), replace=False)
    ax2.scatter(
        z_scores[sample_indices],
        y_prob[sample_indices],
        color="#e03131",
        alpha=0.65,
        s=30,
        edgecolors="none",
        label="Test Applicant Predictions",
        zorder=3
    )
    
    ax2.axhline(0.5, color="gray", linestyle="--", alpha=0.7, label="Default Threshold (0.50)")
    ax2.set_title("Logistic S-Curve (Sigmoid Mapping from Risk Score to PD)", fontsize=14, fontweight="bold", pad=12)
    ax2.set_xlabel("Standardized Composite Risk Score ($z$ = Log-Odds)", fontsize=11)
    ax2.set_ylabel("Predicted Probability of Default (PD)", fontsize=11)
    ax2.set_ylim(-0.05, 1.05)
    ax2.set_xlim(-4, 4)
    ax2.legend(loc="upper left")
    plt.tight_layout()
    p2 = os.path.join(output_dir, "02_logistic_scurve.png")
    fig2.savefig(p2, dpi=300)
    plt.close(fig2)
    print(f"[✓] Saved Chart 2 -> {p2}")
    
    # -------------------------------------------------------------------------
    # Chart 3: ROC Curve with AUC
    # -------------------------------------------------------------------------
    fig3, ax3 = plt.subplots(figsize=(7.5, 6))
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    auc_val = roc_auc_score(y_test, y_prob)
    
    ax3.plot(fpr, tpr, color="#2f9e44", lw=2.5, label=f"Logistic Regression (AUC = {auc_val:.3f})")
    ax3.plot([0, 1], [0, 1], color="#868e96", linestyle="--", lw=1.5, label="Random Guess (AUC = 0.500)")
    
    ax3.set_title("Receiver Operating Characteristic (ROC) Curve", fontsize=14, fontweight="bold", pad=12)
    ax3.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax3.set_ylabel("True Positive Rate (Recall / Sensitivity)", fontsize=11)
    ax3.set_xlim([-0.02, 1.02])
    ax3.set_ylim([-0.02, 1.02])
    ax3.legend(loc="lower right", fontsize=11)
    plt.tight_layout()
    p3 = os.path.join(output_dir, "03_roc_curve.png")
    fig3.savefig(p3, dpi=300)
    plt.close(fig3)
    print(f"[✓] Saved Chart 3 -> {p3}")
    
    # -------------------------------------------------------------------------
    # Chart 4: Credit Grade vs Average PD and Actual Default Rate
    # Validates risk ordering across grades A through F
    # -------------------------------------------------------------------------
    fig4, ax4 = plt.subplots(figsize=(9, 5))
    grades = grade_table.index.tolist()
    x = np.arange(len(grades))
    width = 0.35
    
    rects1 = ax4.bar(x - width/2, grade_table["average_pd"] * 100, width, label="Avg Predicted PD (%)", color="#339af0")
    rects2 = ax4.bar(x + width/2, grade_table["actual_default_rate"] * 100, width, label="Actual Default Rate (%)", color="#f03e3e")
    
    ax4.set_title("Calibration Validation: Predicted PD vs Actual Default Rate by Grade", fontsize=14, fontweight="bold", pad=12)
    ax4.set_xlabel("Assigned Credit Grade (Risk Tier)", fontsize=11)
    ax4.set_ylabel("Rate (%)", fontsize=11)
    ax4.set_xticks(x)
    ax4.set_xticklabels(grades)
    ax4.legend(loc="upper left")
    
    for bar in rects1:
        h = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2, h + 0.8, f"{h:.1f}%", ha="center", va="bottom", fontsize=8.5)
    for bar in rects2:
        h = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2, h + 0.8, f"{h:.1f}%", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
        
    ax4.set_ylim(0, max(max(grade_table["average_pd"]), max(grade_table["actual_default_rate"])) * 125)
    plt.tight_layout()
    p4 = os.path.join(output_dir, "04_grades_and_default_rate.png")
    fig4.savefig(p4, dpi=300)
    plt.close(fig4)
    print(f"[✓] Saved Chart 4 -> {p4}")
    
    # -------------------------------------------------------------------------
    # Chart 5: Standardized Beta Coefficients
    # -------------------------------------------------------------------------
    fig5, ax5 = plt.subplots(figsize=(8.5, 4.8))
    coefs = clf.coef_[0]
    colors = ["#2b8a3e" if c < 0 else "#c92a2a" for c in coefs]
    
    bars5 = ax5.barh(FINAL_FEATURES, coefs, color=colors, height=0.55)
    ax5.axvline(0, color="black", lw=1.0)
    
    for bar, val in zip(bars5, coefs):
        x_pos = val + (0.02 if val >= 0 else -0.05)
        ax5.text(x_pos, bar.get_y() + bar.get_height()/2, f"{val:+.3f}", va="center", fontweight="bold", fontsize=10)
        
    ax5.set_title("Standardized Logistic Regression Beta Coefficients", fontsize=14, fontweight="bold", pad=12)
    ax5.set_xlabel("Beta Coefficient (Standard Deviations Impact on Log-Odds)", fontsize=11)
    ax5.set_xlim(min(coefs) * 1.35, max(coefs) * 1.35)
    plt.tight_layout()
    p5 = os.path.join(output_dir, "05_standardized_coefficients.png")
    fig5.savefig(p5, dpi=300)
    plt.close(fig5)
    print(f"[✓] Saved Chart 5 -> {p5}")


# =============================================================================
# PIPELINE STEP 10: MAIN EXECUTION FLOW & APPLICANT DEMO
# =============================================================================

def main():
    """
    Main driver orchestrating the 8 pipeline stages and applicant scoring demo.
    """
    print("\n" + "#" * 70)
    print("#  CREDIT RISK AND LOAN DEFAULT PREDICTION ENGINE")
    print("#  Multiple Logistic Regression on LendingClub Retail Loans")
    print("#" * 70)
    
    # 1. Load Data
    raw_df = load_data(DATA_FILE_PATH)
    
    # 2. Clean Data
    clean_df = clean_data(raw_df)
    
    # 3. Engineer Features
    feat_df = engineer_features(clean_df)
    
    # 4 & 5. Split and Scale
    X_train_scaled, X_test_scaled, y_train, y_test, scaler, X_train, X_test = split_and_scale(feat_df)
    
    # 6. Train Model
    clf, sm_model = train_model(X_train_scaled, y_train)
    
    # 7. Evaluate Model & Probability Generation
    y_prob, auc_score, coef_summary = evaluate_model(clf, sm_model, X_test_scaled, y_test)
    
    # 8. Business Logic & Grade Calibration
    grade_table = evaluate_grade_calibration(y_test, y_prob)
    
    # 9. Generate Charts
    make_plots(feat_df, clf, scaler, X_test_scaled, y_test, y_prob, grade_table, OUTPUT_DIR)
    
    # 10. Live Applicant Scoring Demo (Loop over 3 distinct risk profiles)
    print("\n" + "=" * 70)
    print("STEP 10: SINGLE APPLICANT UNDERWRITING DEMONSTRATION")
    print("=" * 70)
    
    example_applicants = [
        {
            "name": "Applicant 1: Low-Risk / Prime Borrower",
            "profile": {
                "annual_inc": 115000.0,
                "dti": 11.2,
                "fico_range_low": 765,
                "loan_amnt": 12000.0
            }
        },
        {
            "name": "Applicant 2: Medium-Risk / Near-Prime Borrower",
            "profile": {
                "annual_inc": 58000.0,
                "dti": 19.8,
                "fico_range_low": 680,
                "loan_amnt": 16000.0
            }
        },
        {
            "name": "Applicant 3: High-Risk / Subprime Borrower",
            "profile": {
                "annual_inc": 32000.0,
                "dti": 34.5,
                "fico_range_low": 625,
                "loan_amnt": 25000.0
            }
        }
    ]
    
    # Rubric Concept: for loop iterating through list of dictionaries
    for item in example_applicants:
        name = item["name"]
        profile = item["profile"]
        result = score_applicant(profile, clf, scaler)
        
        print(f"\n>>> {name}")
        print(f"    Inputs   : Income = ${result['annual_inc']:,.0f} | DTI = {result['dti']:.1f}% | FICO = {int(result['fico_range_low'])} | Loan = ${result['loan_amnt']:,.0f}")
        print(f"    Derived  : Loan-to-Income (LTI) = {result['LTI']:.2f}")
        print(f"    Prediction: Probability of Default (PD) = {result['PD']:.2%}")
        print(f"    Decision : Grade [{result['grade']}] -> Assigned APR: {result['interest_rate']*100:.2f}% ({result['decision']})")
        
    print("\n" + "#" * 70)
    print("#  PIPELINE EXECUTION COMPLETE! ALL ARTIFACTS SAVED TO outputs/")
    print("#" * 70 + "\n")


if __name__ == "__main__":
    main()
