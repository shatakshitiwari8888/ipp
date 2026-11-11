# Credit Risk and Loan Default Prediction

**Course:** Introduction to Python Programming (College Term Project)  
**Methodology:** Multiple Logistic Regression & Econometric Credit Underwriting  
**Dataset:** LendingClub Accepted Loans (2007–2018Q4)  
**Target Variable:** Probability of Default ($PD \in [0, 1]$)

---

## 1. Executive Summary & Methodology (One-Paragraph Brief)

This project models the Probability of Default (PD) for unsecured retail loan applicants using Multiple Logistic Regression on LendingClub's loan portfolio. The model processes historical borrower characteristics—Annual Income, Debt-to-Income (DTI), FICO credit score, Loan Amount, and an engineered Loan-to-Income (LTI) ratio—to estimate the log-odds of loan non-performance. To reflect institutional credit practices (Basel Accord standards), unresolved active loans are filtered out to prevent **Look-Ahead Bias**, and feature standardization is fitted strictly on the training partition to avoid **Data Leakage**. Using `class_weight='balanced'` to overcome severe class imbalance (~80% paid vs. ~20% default), the engine derives standardized Beta coefficients and Odds Ratios ($e^{\beta}$), maps continuous default probabilities to calibrated credit tiers (**Grades A through F**), and quotes risk-adjusted interest rates (APRs) via an automated underwriting scorecard.

---

## 2. Pipeline Flowchart

The execution flow matches standard regulatory credit risk pipelines:

```text
┌────────────────────────────────┐
│  1. Raw Data Ingestion         │  --> Load selected columns with usecols
│     (try-except file handling) │      (id, member_id, loan_status, annual_inc, dti, fico, loan_amnt)
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  2. Data Hygiene & Cleaning    │  --> Filter resolved contracts ("Fully Paid" vs "Charged Off/Default")
│     (Eliminate Look-Ahead Bias)│  --> Drop ids, median-impute missing numeric values
└───────────────┬────────────────┘  --> Floor zero-income, clip extreme 99.5% outliers
                ▼
┌────────────────────────────────┐
│  3. Feature Engineering        │  --> Compute Loan-to-Income: LTI = loan_amnt / annual_inc
│     (LTI Ratio)                │  --> Final features: [annual_inc, dti, fico, loan_amnt, LTI]
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  4. Data Partitioning          │  --> 80/20 Train-Test split (stratified on target)
│     (Stratified Split)         │  --> Preserves true default prevalence in both folds
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  5. Normalization              │  --> StandardScaler fitted ON TRAIN SET ONLY
│     (Prevent Data Leakage)     │  --> Transform both train and test partitions
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  6. Logistic Regression        │  --> Scikit-Learn LogisticRegression(class_weight="balanced")
│     (Balanced Model Training)  │  --> Optional Statsmodels Logit for econometrics p-values & SE
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  7. Probability Generation     │  --> clf.predict_proba() yields continuous PD
│     (Model Evaluation)         │  --> ROC-AUC score, confusion matrix, classification report
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  8. Business Logic & Grading   │  --> if-elif-else maps PD -> Grades A through F
│     (Risk-Based Pricing)       │  --> Dictionary maps Grade -> APR (6.99% to 28.99%)
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  9. Applicant Underwriting     │  --> score_applicant(profile_dict) function
│     (Scorecard Demo)           │  --> Underwrite Low, Medium, and High-Risk profiles
└────────────────────────────────┘
```

---

## 3. Dataset Instructions

### Option A: Real Kaggle LendingClub Dataset (1.6 GB)
1. Visit Kaggle: [Lending Club Loan Data (2007–2018Q4)](https://www.kaggle.com/datasets/wordsforthewise/lending-club)
2. Download and unzip the archive.
3. Locate `accepted_2007_2018Q4.csv` and move it to:
   ```bash
   data/accepted_2007_2018Q4.csv
   ```

### Option B: Built-in Synthetic Sample Generator (Zero Download!)
If you haven't downloaded the 1.6 GB file yet, run the included sample generator script:
```bash
python generate_sample_data.py
```
This generates `data/accepted_2007_2018Q4.csv` with 5,000 realistic rows matching the exact Kaggle schema, including "Current" loans to demonstrate data filtering!

---

## 4. Installation & How to Run

### Step 1: Create and activate a Python virtual environment
```bash
# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### Step 2: Install required packages
```bash
pip install -r requirements.txt
```

### Step 3: Run the Python Pipeline Script
```bash
python credit_risk.py
```
*Outputs will print cleanly to your terminal and all 5 publication-ready charts will be saved to the `outputs/` folder.*

### Step 4: Run the Interactive Jupyter Notebook
```bash
jupyter notebook credit_risk_notebook.ipynb
```

---

## 5. Course Rubric Concepts Demonstrated

| Rubric Requirement | Visible Implementation in `credit_risk.py` |
|---|---|
| **Variables & Numeric Types** | Floats for APR and PD, ints for FICO and loan counts, booleans for filtering masks. |
| **String Handling** | `.strip()`, `.upper()`, `.lower()`, f-string formatting, and text status standardizing. |
| **Conditionals (if-elif-else)** | `assign_grade()` branching logic across calibrated thresholds; bounds checking. |
| **Loops (for & while)** | `for` loops iterating over coefficients, dictionaries, and applicant test profiles. |
| **Modular Functions** | 10 modular, well-documented functions with docstrings and type annotations. |
| **Dictionaries & Lists** | `GRADE_CUTOFFS`, `INTEREST_RATES`, borrower profile dictionaries, and feature lists. |
| **Exception Handling (try-except)** | Handling `FileNotFoundError`, `pd.errors.ParserError`, and optional `statsmodels` imports. |
| **NumPy** | Vectorized math (`np.exp()`, `np.clip()`, `np.linspace()`, `np.dot()`). |
| **Pandas DataFrames** | `.value_counts()`, `.groupby()`, `.fillna()`, `.median()`, `.quantile()`, and boolean indexing. |
| **Matplotlib & Seaborn** | 5 financial charts: Class Distribution, Logistic S-Curve, ROC Curve, Calibration, and Betas. |
| **Scikit-Learn & Statsmodels**| `StandardScaler`, `LogisticRegression`, `roc_auc_score`, and `sm.Logit`. |

---

## 6. Generated Visualizations (`outputs/`)

1. `01_class_distribution.png`: Bar chart displaying actual proportions of Paid vs. Defaulted loans.
2. `02_logistic_scurve.png`: The non-linear sigmoid S-curve ($P(Y=1) = \frac{1}{1 + e^{-z}}$) mapping composite risk scores ($z$) to default probability.
3. `03_roc_curve.png`: Receiver Operating Characteristic curve displaying True Positive Rate vs False Positive Rate, annotated with the ROC-AUC score.
4. `04_grades_and_default_rate.png`: Dual-bar chart proving **Monotonicity**—verifying that Grade A has the lowest actual default rate and Grade F has the highest.
5. `05_standardized_coefficients.png`: Horizontal bar chart of standardized Beta coefficients, color-coded by positive risk impact (red) vs. protective credit impact (green).

---

## 7. Technical Methodology & Risk Governance FAQ

Key analytical rationale addressing core regulatory and modeling questions:

### Q1: Why did you use `class_weight='balanced'` in Logistic Regression?
> **Answer:** In retail lending, default is a minority event (~15–20% of loans). If an algorithm optimizes standard cross-entropy loss without weighting, it can achieve 80–85% overall accuracy simply by predicting *nobody* defaults. That would be catastrophic for a bank. Setting `class_weight='balanced'` inversely weights each class by its prevalence, heavily penalizing missed defaults and forcing the model to identify risk factors.

### Q2: Why are the PD grade cutoffs set between 0.30 and 0.75 instead of 0.05 and 0.15?
> **Answer:** Because `class_weight='balanced'` artificially shifts the regression intercept upward to treat classes equally, shifting the portfolio average predicted probability from ~18% to ~50%. In credit modeling, we use calibrated business cutoffs that match this shifted scale to produce a healthy bell curve of grades across the portfolio while maintaining strict risk ranking.

### Q3: What is Look-Ahead Bias, and why must we drop "Current" loans?
> **Answer:** Look-ahead bias occurs when future information not available at the decision date is mistakenly fed to the model. A loan marked "Current" today has not matured—the borrower might lose their job and default next year. Labeling them as "Safe (0)" injects false negative labels into the training set. We must restrict training strictly to resolved contracts ("Fully Paid" vs "Charged Off").

### Q4: Why must `StandardScaler` be fitted on the train set only?
> **Answer:** Fitting the scaler on the entire dataset would cause **Data Leakage**. The test set's mean and standard deviation would influence the training inputs, leading to unrealistically optimistic validation metrics that will degrade in live production.

### Q5: How do you interpret an Odds Ratio of 0.62 on FICO score?
> **Answer:** The Odds Ratio is $e^{\beta}$. An odds ratio of 0.62 means that for every 1-standard-deviation increase in a borrower's FICO score, their odds of default decrease by $38\%$ ($1 - 0.62 = 0.38$), holding other financial variables constant.
