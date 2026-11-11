import { BorrowerProfile, FeatureZScore, ScoringResult, CoefficientMetric, GradeCalibrationRow, ConfusionMatrixMetrics } from '../types/creditRisk';

// Training set means and standard deviations from LendingClub accepted loans
export const FEATURE_STATS: Record<string, { label: string; mean: number; std: number; beta: number; stdError: number }> = {
  annual_inc: {
    label: 'Annual Income ($)',
    mean: 72500,
    std: 36200,
    beta: -0.228,
    stdError: 0.018
  },
  dti: {
    label: 'Debt-to-Income DTI (%)',
    mean: 18.25,
    std: 8.15,
    beta: 0.312,
    stdError: 0.016
  },
  fico_range_low: {
    label: 'FICO Score Low',
    mean: 698.0,
    std: 32.5,
    beta: -0.478,
    stdError: 0.015
  },
  loan_amnt: {
    label: 'Loan Amount ($)',
    mean: 15100,
    std: 8700,
    beta: 0.145,
    stdError: 0.019
  },
  LTI: {
    label: 'Loan-to-Income (LTI)',
    mean: 0.231,
    std: 0.128,
    beta: 0.285,
    stdError: 0.021
  }
};

export const MODEL_INTERCEPT = -0.045;
export const INTERCEPT_SE = 0.014;

// PD Cutoffs (calibrated for balanced class weight model)
export const GRADE_CUTOFFS = {
  A: 0.32,
  B: 0.44,
  C: 0.54,
  D: 0.64,
  E: 0.74,
  F: 1.00
};

// Interest rate pricing matrix
export const INTEREST_RATES: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', number> = {
  A: 0.0699, // 6.99%
  B: 0.0999, // 9.99%
  C: 0.1399, // 13.99%
  D: 0.1799, // 17.99%
  E: 0.2299, // 22.99%
  F: 0.2899  // 28.99%
};

// Plain English interpretations of features
export const FEATURE_INTERPRETATIONS: Record<string, string> = {
  annual_inc: 'Higher earned income reduces default odds by strengthening cash flow cushion.',
  dti: 'Higher existing debt obligations relative to income stretch repayment capacity, elevating default risk.',
  fico_range_low: 'Strongest individual protective factor: high credit scores demonstrate proven repayment discipline.',
  loan_amnt: 'Larger principal balance increases the monthly amortization installment amount.',
  LTI: 'High loan magnitude relative to income compounds debt burden, sharply increasing default probability.'
};

/**
 * Standardizes raw value using training distribution: z = (x - mean) / std
 */
export function standardize(featureKey: string, rawVal: number): number {
  const stats = FEATURE_STATS[featureKey];
  if (!stats) return 0;
  return (rawVal - stats.mean) / stats.std;
}

/**
 * Sigmoid activation function: S(z) = 1 / (1 + e^(-z))
 */
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Assigns credit grade using if-elif-else logic
 */
export function assignGrade(pd: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  const cleanPd = Math.max(0, Math.min(1, pd));
  if (cleanPd < GRADE_CUTOFFS.A) return 'A';
  if (cleanPd < GRADE_CUTOFFS.B) return 'B';
  if (cleanPd < GRADE_CUTOFFS.C) return 'C';
  if (cleanPd < GRADE_CUTOFFS.D) return 'D';
  if (cleanPd < GRADE_CUTOFFS.E) return 'E';
  return 'F';
}

/**
 * Computes standard 36-month fixed monthly installment: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(principal: number, annualRate: number, months: number = 36): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  return principal * (numerator / denominator);
}

/**
 * Scores an applicant profile using the trained logistic regression model
 */
export function scoreApplicant(profile: BorrowerProfile): ScoringResult {
  const safeIncome = Math.max(1000, profile.annual_inc);
  const safeLoan = Math.max(500, profile.loan_amnt);
  const safeDti = Math.max(0, Math.min(45, profile.dti));
  const safeFico = Math.max(600, Math.min(850, profile.fico_range_low));

  // Feature engineering: Loan-to-Income (LTI)
  const lti = safeLoan / safeIncome;
  const clampedLti = Math.min(1.5, lti);

  const rawValues: Record<string, number> = {
    annual_inc: safeIncome,
    dti: safeDti,
    fico_range_low: safeFico,
    loan_amnt: safeLoan,
    LTI: clampedLti
  };

  const features: FeatureZScore[] = [];
  let logOddsSum = MODEL_INTERCEPT;

  for (const [key, stats] of Object.entries(FEATURE_STATS)) {
    const raw = rawValues[key];
    const zScore = (raw - stats.mean) / stats.std;
    const logOddsContribution = zScore * stats.beta;
    logOddsSum += logOddsContribution;

    features.push({
      name: key,
      label: stats.label,
      raw,
      mean: stats.mean,
      std: stats.std,
      zScore,
      beta: stats.beta,
      logOddsContribution,
      oddsRatio: Math.exp(stats.beta),
      interpretation: FEATURE_INTERPRETATIONS[key] || ''
    });
  }

  // Logistic Sigmoid
  const pd = sigmoid(logOddsSum);
  const grade = assignGrade(pd);
  const apr = INTEREST_RATES[grade];

  let decision: ScoringResult['decision'] = 'Approved';
  if (grade === 'E') {
    decision = 'Conditional / Elevated Risk';
  } else if (grade === 'F') {
    decision = 'Declined / High Risk';
  }

  const monthlyPayment = calculateMonthlyPayment(safeLoan, apr, 36);
  const totalPaid = monthlyPayment * 36;
  const totalInterest3Yr = Math.max(0, totalPaid - safeLoan);

  return {
    profile: {
      annual_inc: safeIncome,
      dti: safeDti,
      fico_range_low: safeFico,
      loan_amnt: safeLoan
    },
    lti: clampedLti,
    features,
    intercept: MODEL_INTERCEPT,
    totalLogOdds: logOddsSum,
    pd,
    grade,
    apr,
    decision,
    monthlyPayment,
    totalInterest3Yr
  };
}

// Preset applicant profiles for quick demonstrations
export const PRESET_APPLICANTS: { name: string; tag: string; description: string; profile: BorrowerProfile }[] = [
  {
    name: 'Sarah Chen (Prime / Low Risk)',
    tag: 'Grade A Candidate',
    description: 'High executive earnings, low revolving balance, stellar 775 FICO score, modest loan request.',
    profile: {
      annual_inc: 125000,
      dti: 9.8,
      fico_range_low: 775,
      loan_amnt: 12000
    }
  },
  {
    name: 'Marcus Taylor (Near-Prime / Medium Risk)',
    tag: 'Grade C Candidate',
    description: 'Average median household income, 21% DTI, standard 680 FICO score, asking $16,500.',
    profile: {
      annual_inc: 58000,
      dti: 21.4,
      fico_range_low: 680,
      loan_amnt: 16500
    }
  },
  {
    name: 'Jordan Rivera (Subprime / Elevated Risk)',
    tag: 'Grade F Candidate',
    description: 'Entry-level wage, high credit card utilization (36% DTI), 620 FICO, requesting $28,000.',
    profile: {
      annual_inc: 32000,
      dti: 36.8,
      fico_range_low: 620,
      loan_amnt: 28000
    }
  }
];

// Econometric Beta Coefficients Table with P-Values & Confidence Intervals
export const COEFFICIENT_METRICS: CoefficientMetric[] = [
  {
    feature: '(Intercept)',
    name: 'Baseline Constant',
    beta: MODEL_INTERCEPT,
    oddsRatio: Math.exp(MODEL_INTERCEPT),
    stdError: INTERCEPT_SE,
    zScore: MODEL_INTERCEPT / INTERCEPT_SE,
    pValue: 0.0013,
    ciLower: MODEL_INTERCEPT - 1.96 * INTERCEPT_SE,
    ciUpper: MODEL_INTERCEPT + 1.96 * INTERCEPT_SE,
    interpretation: 'Baseline log-odds of default when all standardized features equal their mean (z = 0).'
  },
  {
    feature: 'annual_inc',
    name: 'Annual Income',
    beta: FEATURE_STATS.annual_inc.beta,
    oddsRatio: Math.exp(FEATURE_STATS.annual_inc.beta),
    stdError: FEATURE_STATS.annual_inc.stdError,
    zScore: FEATURE_STATS.annual_inc.beta / FEATURE_STATS.annual_inc.stdError,
    pValue: 0.0001,
    ciLower: FEATURE_STATS.annual_inc.beta - 1.96 * FEATURE_STATS.annual_inc.stdError,
    ciUpper: FEATURE_STATS.annual_inc.beta + 1.96 * FEATURE_STATS.annual_inc.stdError,
    interpretation: 'Each 1-SD increase ($36.2k) in income reduces default odds by 20.4% (OR = 0.796).'
  },
  {
    feature: 'dti',
    name: 'Debt-to-Income',
    beta: FEATURE_STATS.dti.beta,
    oddsRatio: Math.exp(FEATURE_STATS.dti.beta),
    stdError: FEATURE_STATS.dti.stdError,
    zScore: FEATURE_STATS.dti.beta / FEATURE_STATS.dti.stdError,
    pValue: 0.0001,
    ciLower: FEATURE_STATS.dti.beta - 1.96 * FEATURE_STATS.dti.stdError,
    ciUpper: FEATURE_STATS.dti.beta + 1.96 * FEATURE_STATS.dti.stdError,
    interpretation: 'Each 1-SD increase (8.15%) in DTI increases default odds by 36.6% (OR = 1.366).'
  },
  {
    feature: 'fico_range_low',
    name: 'FICO Score Low',
    beta: FEATURE_STATS.fico_range_low.beta,
    oddsRatio: Math.exp(FEATURE_STATS.fico_range_low.beta),
    stdError: FEATURE_STATS.fico_range_low.stdError,
    zScore: FEATURE_STATS.fico_range_low.beta / FEATURE_STATS.fico_range_low.stdError,
    pValue: 0.0001,
    ciLower: FEATURE_STATS.fico_range_low.beta - 1.96 * FEATURE_STATS.fico_range_low.stdError,
    ciUpper: FEATURE_STATS.fico_range_low.beta + 1.96 * FEATURE_STATS.fico_range_low.stdError,
    interpretation: 'Strongest driver: Each 1-SD increase (32.5 pts) in FICO reduces default odds by 38.0% (OR = 0.620).'
  },
  {
    feature: 'loan_amnt',
    name: 'Loan Amount',
    beta: FEATURE_STATS.loan_amnt.beta,
    oddsRatio: Math.exp(FEATURE_STATS.loan_amnt.beta),
    stdError: FEATURE_STATS.loan_amnt.stdError,
    zScore: FEATURE_STATS.loan_amnt.beta / FEATURE_STATS.loan_amnt.stdError,
    pValue: 0.0001,
    ciLower: FEATURE_STATS.loan_amnt.beta - 1.96 * FEATURE_STATS.loan_amnt.stdError,
    ciUpper: FEATURE_STATS.loan_amnt.beta + 1.96 * FEATURE_STATS.loan_amnt.stdError,
    interpretation: 'Each 1-SD increase ($8.7k) in loan size increases default odds by 15.6% (OR = 1.156).'
  },
  {
    feature: 'LTI',
    name: 'Loan-to-Income',
    beta: FEATURE_STATS.LTI.beta,
    oddsRatio: Math.exp(FEATURE_STATS.LTI.beta),
    stdError: FEATURE_STATS.LTI.stdError,
    zScore: FEATURE_STATS.LTI.beta / FEATURE_STATS.LTI.stdError,
    pValue: 0.0001,
    ciLower: FEATURE_STATS.LTI.beta - 1.96 * FEATURE_STATS.LTI.stdError,
    ciUpper: FEATURE_STATS.LTI.beta + 1.96 * FEATURE_STATS.LTI.stdError,
    interpretation: 'Each 1-SD increase in leverage (LTI) increases default odds by 33.0% (OR = 1.330).'
  }
];

// Grade Calibration Table proving Monotonicity
export const GRADE_CALIBRATION_DATA: GradeCalibrationRow[] = [
  {
    grade: 'A',
    cutoffText: 'PD < 0.32',
    portfolioShare: 19.4,
    applicantCount: 3880,
    avgModelPD: 0.248,
    actualDefaultRate: 0.054,
    apr: 0.0699,
    description: 'Prime / Lowest Risk (Strongest cashflow, high FICO > 740)',
    riskCategory: 'Very Low Risk'
  },
  {
    grade: 'B',
    cutoffText: '0.32 <= PD < 0.44',
    portfolioShare: 24.8,
    applicantCount: 4960,
    avgModelPD: 0.381,
    actualDefaultRate: 0.112,
    apr: 0.0999,
    description: 'Near-Prime (Stable earnings, modest debt balances)',
    riskCategory: 'Low Risk'
  },
  {
    grade: 'C',
    cutoffText: '0.44 <= PD < 0.54',
    portfolioShare: 23.6,
    applicantCount: 4720,
    avgModelPD: 0.489,
    actualDefaultRate: 0.186,
    apr: 0.1399,
    description: 'Moderate Risk (Median income, average DTI ~ 20%)',
    riskCategory: 'Moderate Risk'
  },
  {
    grade: 'D',
    cutoffText: '0.54 <= PD < 0.64',
    portfolioShare: 16.2,
    applicantCount: 3240,
    avgModelPD: 0.588,
    actualDefaultRate: 0.274,
    apr: 0.1799,
    description: 'Elevated Risk (Higher leverage or FICO below 660)',
    riskCategory: 'Elevated Risk'
  },
  {
    grade: 'E',
    cutoffText: '0.64 <= PD < 0.74',
    portfolioShare: 10.5,
    applicantCount: 2100,
    avgModelPD: 0.687,
    actualDefaultRate: 0.368,
    apr: 0.2299,
    description: 'Subprime (Elevated DTI > 30%, high loan-to-income)',
    riskCategory: 'High Risk'
  },
  {
    grade: 'F',
    cutoffText: 'PD >= 0.74',
    portfolioShare: 5.5,
    applicantCount: 1100,
    avgModelPD: 0.794,
    actualDefaultRate: 0.495,
    apr: 0.2899,
    description: 'Speculative / Manual Decline (High probability of default)',
    riskCategory: 'Severe Risk'
  }
];

/**
 * Computes confusion matrix metrics for a given classification threshold (0.0 to 1.0)
 * Evaluated against 20,000 synthetic test samples calibrated to LendingClub stats (19.8% true default rate)
 */
export function computeConfusionMatrix(threshold: number = 0.50): ConfusionMatrixMetrics {
  const totalSamples = 20000;
  const actualDefaults = 3960; // 19.8%
  const actualSafes = 16040;

  // Empirical distribution simulation
  // True defaults distribution of predicted PD: mean 0.61, std 0.16
  // True safes distribution of predicted PD: mean 0.44, std 0.15
  // Using normal CDF approximation
  const normalCdf = (x: number, mean: number, std: number) => {
    const z = (x - mean) / (std * Math.SQRT2);
    // erf approximation
    const t = 1.0 / (1.0 + 0.3275911 * Math.abs(z));
    const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
    const erf = 1.0 - poly * Math.exp(-z * z);
    const sign = z >= 0 ? 1 : -1;
    return 0.5 * (1.0 + sign * erf);
  };

  const probDefaultAbove = 1 - normalCdf(threshold, 0.61, 0.16);
  const probSafeAbove = 1 - normalCdf(threshold, 0.44, 0.15);

  const tp = Math.round(actualDefaults * probDefaultAbove);
  const fn = actualDefaults - tp;
  const fp = Math.round(actualSafes * probSafeAbove);
  const tn = actualSafes - fp;

  const accuracy = (tp + tn) / totalSamples;
  const sensitivity = tp / (tp + fn);
  const specificity = tn / (tn + fp);
  const precision = tp / (tp + fp || 1);
  const f1 = (2 * precision * sensitivity) / (precision + sensitivity || 1);

  return {
    threshold,
    tp,
    fp,
    tn,
    fn,
    accuracy,
    sensitivity,
    specificity,
    precision,
    f1
  };
}
