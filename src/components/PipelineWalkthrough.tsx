import React, { useState } from 'react';
import { 
  FileText, 
  Filter, 
  Sparkles, 
  Split, 
  Scale, 
  BrainCircuit, 
  Percent, 
  Tags,
  ChevronRight,
  Code2,
  CheckCircle
} from 'lucide-react';

export const PipelineWalkthrough: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Raw Data Ingestion',
      subtitle: 'Targeted Column Loading with Exception Handling',
      icon: FileText,
      badge: 'I/O & Memory Optimization',
      summary: 'Loads LendingClub CSV data at data/accepted_2007_2018Q4.csv using usecols to restrict memory footprint to 7 key columns.',
      whyItMatters: 'The full LendingClub dataset is ~1.6 GB with over 150 columns. Ingesting everything wastes gigabytes of RAM. usecols loads only what the model needs in seconds.',
      codeSnippet: `# Defensive file loading with usecols & try-except
try:
    candidate_cols = ["id", "member_id", "loan_status", "annual_inc", "dti", "fico_range_low", "loan_amnt"]
    # Check headers first to handle optional member_id
    header = pd.read_csv(file_path, nrows=2)
    cols = [c for c in candidate_cols if c in header.columns]
    
    df = pd.read_csv(file_path, usecols=cols, low_memory=False)
    print(f"Loaded {len(df):,} rows.")
except FileNotFoundError as e:
    print(f"File missing: {e}")
    sys.exit(1)`,
      rubricLink: 'Try-Except file handling, memory management, string path handling'
    },
    {
      num: 2,
      title: 'Data Hygiene & Look-Ahead Filter',
      subtitle: 'Eliminate Unresolved Loans & Drop Incomplete Records',
      icon: Filter,
      badge: 'Basel Regulatory Compliance',
      summary: 'Filters strictly resolved contracts ("Fully Paid" -> 0, "Charged Off" or "Default" -> 1). Drops ongoing loans and drops rows with missing predictor values for complete-case econometric validity.',
      whyItMatters: 'Look-Ahead Bias happens when data unknown at decision time enters training. Dropping rows with missing values ensures complete-case rigor rather than distorting feature variances with median imputation.',
      codeSnippet: `# 1. Filter resolved loans strictly
resolved_mask = df["loan_status"].isin(["Fully Paid", "Charged Off", "Default"])
df = df[resolved_mask].copy()

# 2. Binary target: 0 = Fully Paid, 1 = Default
df["target"] = df["loan_status"].apply(lambda s: 0 if s == "Fully Paid" else 1)

# 3. Drop non-predictive identifiers
df.drop(columns=["id", "member_id", "loan_status"], inplace=True, errors="ignore")

# 4. Complete-case analysis: drop rows with missing values
df.dropna(subset=["annual_inc", "dti", "fico_range_low", "loan_amnt"], inplace=True)

# 5. Handle division-by-zero & clip extreme 99.5% outliers
df["annual_inc"] = np.clip(df["annual_inc"], a_min=1000.0, a_max=df["annual_inc"].quantile(0.995))
df["dti"] = np.clip(df["dti"], a_min=0.0, a_max=45.0)`,
      rubricLink: 'Pandas filtering, lambda expressions, dropna complete-case, outlier clipping'
    },
    {
      num: 3,
      title: 'Feature Engineering: LTI Ratio',
      subtitle: 'Deriving Financial Leverage (Loan-to-Income)',
      icon: Sparkles,
      badge: 'Credit Risk Domain Feature',
      summary: 'Calculates the Loan-to-Income ratio (LTI = loan_amnt / annual_inc) to capture individual leverage.',
      whyItMatters: 'A $25,000 loan represents a modest debt burden for an earner making $150,000 (LTI = 0.17), but severe leverage for someone earning $30,000 (LTI = 0.83). LTI standardizes debt magnitude.',
      codeSnippet: `# Compute Loan-to-Income (LTI) ratio
df["LTI"] = df["loan_amnt"] / df["annual_inc"]

# Bound extreme values to prevent skewed distributions
df["LTI"] = np.clip(df["LTI"], a_min=0.0, a_max=1.5)

FINAL_FEATURES = ["annual_inc", "dti", "fico_range_low", "loan_amnt", "LTI"]`,
      rubricLink: 'Vectorized NumPy/Pandas math, division-by-zero mitigation'
    },
    {
      num: 4,
      title: 'Data Partitioning (80/20 Stratified)',
      subtitle: 'Train-Test Splitting with Class Stratification',
      icon: Split,
      badge: 'Statistical Rigor',
      summary: 'Partitions data into 80% training and 20% testing sets using stratified sampling to preserve the exact default ratio.',
      whyItMatters: 'If we used a naive random split, one partition might accidentally receive fewer defaults, skewing model metrics. Stratification ensures both folds mirror the actual portfolio distribution.',
      codeSnippet: `X = df[FINAL_FEATURES]
y = df["target"]

# 80/20 split stratified on target
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)
print(f"Train samples: {len(X_train):,} | Test samples: {len(X_test):,}")`,
      rubricLink: 'Scikit-learn model_selection, random_state reproducibility'
    },
    {
      num: 5,
      title: 'Normalization (StandardScaler)',
      subtitle: 'Leak-Free Standardization (Mean = 0, Std = 1)',
      icon: Scale,
      badge: 'Preventing Data Leakage',
      summary: 'Fits StandardScaler strictly on X_train, then transforms X_train and X_test independently.',
      whyItMatters: 'Fitting the scaler on the entire dataset leaks test-set distribution information into the training phase. In real lending, future loan applicants do not exist yet.',
      codeSnippet: `scaler = StandardScaler()

# Fit strictly on train fold
scaler.fit(X_train)

# Transform both folds using training statistics
X_train_scaled = pd.DataFrame(scaler.transform(X_train), columns=FINAL_FEATURES, index=X_train.index)
X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=FINAL_FEATURES, index=X_test.index)`,
      rubricLink: 'StandardScaler, avoiding look-ahead leakage, pandas alignment'
    },
    {
      num: 6,
      title: 'Multiple Logistic Regression',
      subtitle: 'Fitting Logit with Balanced Class Weights',
      icon: BrainCircuit,
      badge: 'Core ML Methodology',
      summary: 'Fits Multiple Logistic Regression using class_weight="balanced" to penalize minority default misclassifications.',
      whyItMatters: 'Because defaults make up only ~20% of loans, standard unweighted logistic regression would maximize accuracy by predicting no one defaults. Balanced weighting forces the algorithm to prioritize default recall.',
      codeSnippet: `# Scikit-Learn balanced logistic regression
clf = LogisticRegression(
    class_weight="balanced",
    random_state=42,
    max_iter=1000,
    solver="lbfgs"
)
clf.fit(X_train_scaled, y_train)

# Inspect model coefficients
beta_dict = dict(zip(FINAL_FEATURES, clf.coef_[0]))
intercept = clf.intercept_[0]`,
      rubricLink: 'Econometric regression, Statsmodels Logit, Scikit-learn solver'
    },
    {
      num: 7,
      title: 'Probability Generation (PD)',
      subtitle: 'Generating Calibrated Probabilities & ROC-AUC',
      icon: Percent,
      badge: 'Predictive Inference',
      summary: 'Executes predict_proba on the holdout test set to estimate PD = P(Default = 1) and calculates ROC-AUC score.',
      whyItMatters: 'Lenders do not just need binary yes/no flags; they need precise continuous default probabilities to set interest rates, reserve capital, and define underwriting cutoffs.',
      codeSnippet: `# Generate predicted Probability of Default (PD)
y_pred_proba = clf.predict_proba(X_test_scaled)[:, 1]

# Calculate ROC-AUC score
auc_score = roc_auc_score(y_test, y_pred_proba)
print(f"Test Set ROC-AUC Score: {auc_score:.4f}")`,
      rubricLink: 'NumPy array slicing, probability metrics, ROC-AUC scoring'
    },
    {
      num: 8,
      title: 'Business Logic: Credit Grading',
      subtitle: 'Calibrated Tiers (A–F) & Risk-Based Pricing (APR)',
      icon: Tags,
      badge: 'Commercial Underwriting',
      summary: 'Maps continuous PD to Credit Grades A through F using calibrated conditional logic, then sets risk-based APR using a pricing lookup table.',
      whyItMatters: 'Converts abstract mathematics into commercial loan decisioning. Calibrating cutoffs accounts for the probability shift caused by balanced class weighting, guaranteeing monotonic risk pricing.',
      codeSnippet: `GRADE_CUTOFFS = {"A": 0.32, "B": 0.44, "C": 0.54, "D": 0.64, "E": 0.74}
INTEREST_RATES = {"A": 0.0725, "B": 0.0975, "C": 0.1250, "D": 0.1625, "E": 0.2075, "F": 0.2599}

def assign_grade(pd_val: float) -> str:
    if pd_val < GRADE_CUTOFFS["A"]: return "A"
    elif pd_val < GRADE_CUTOFFS["B"]: return "B"
    elif pd_val < GRADE_CUTOFFS["C"]: return "C"
    elif pd_val < GRADE_CUTOFFS["D"]: return "D"
    elif pd_val < GRADE_CUTOFFS["E"]: return "E"
    else: return "F"`,
      rubricLink: 'if-elif-else control flow, dictionary lookup, risk-based pricing'
    }
  ];

  const currentStep = steps.find(s => s.num === activeStep) || steps[0];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
            <span>Flowchart & Pipeline Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
            End-to-End Pipeline Walkthrough
          </h1>
          <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
            Explore the chronological stages of the Python credit risk engine. Each step enforces institutional 
            risk governance, preventing statistical flaws like Look-Ahead Bias and Data Leakage.
          </p>
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {steps.map((s) => {
          const Icon = s.icon;
          const isSelected = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0C2340] border-[#0C2340] text-white shadow-sm'
                  : 'bg-[#FFFFFF] border-[#EAE3D2] text-[#1C1B18] hover:bg-[#F7F4EB]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-[#1A303A] text-white' : 'bg-[#F7F4EB] text-[#706E66] border border-[#EAE3D2]'
                }`}>
                  0{s.num}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#B27D18]' : 'text-[#706E66]'}`} />
              </div>
              <span className={`text-xs font-semibold line-clamp-2 ${
                isSelected ? 'text-white' : 'text-[#1C1B18]'
              }`}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive Card */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#0C2340] flex items-center justify-center text-white shadow-sm">
                <StepIcon className="w-6 h-6 stroke-[2] text-[#B27D18]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#0C2340]">STEP 0{currentStep.num}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] font-medium">
                    {currentStep.badge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B18] tracking-tight">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-[#706E66] font-medium">{currentStep.subtitle}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-[#1C1B18] text-sm leading-relaxed">
              {currentStep.summary}
            </div>

            {/* Why It Matters Callout */}
            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-xs text-[#1C1B18] space-y-1.5">
              <div className="font-semibold text-[#0C2340] flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#0B6623]" />
                <span>Institutional Risk Governance Rationale:</span>
              </div>
              <p className="text-[#1C1B18] leading-relaxed pl-5">
                {currentStep.whyItMatters}
              </p>
            </div>

            {/* Rubric Link */}
            <div className="flex items-center space-x-2 text-xs text-[#706E66]">
              <span className="font-semibold text-[#1C1B18]">Methodological Standard:</span>
              <span className="font-mono text-[#0C2340] bg-[#FFFFFF] px-2 py-1 rounded border border-[#EAE3D2]">
                {currentStep.rubricLink}
              </span>
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
              >
                ← Previous Step
              </button>
              <button
                disabled={activeStep === 8}
                onClick={() => setActiveStep(prev => Math.min(8, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0C2340] hover:bg-[#1A303A] text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Code Snippet (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#706E66] px-1">
              <span className="font-mono flex items-center space-x-1 text-[#1C1B18]">
                <Code2 className="w-3.5 h-3.5 text-[#0C2340]" />
                <span>credit_risk.py · Step 0{currentStep.num}</span>
              </span>
              <span className="text-[11px] font-mono text-[#0B6623]">Python 3</span>
            </div>

            <div className="bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#0C2340] overflow-x-auto shadow-inner leading-relaxed">
              <pre className="whitespace-pre">
                {currentStep.codeSnippet}
              </pre>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
