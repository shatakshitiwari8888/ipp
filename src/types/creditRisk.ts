export interface BorrowerProfile {
  annual_inc: number;
  dti: number;
  fico_range_low: number;
  loan_amnt: number;
}

export interface FeatureZScore {
  name: string;
  label: string;
  raw: number;
  mean: number;
  std: number;
  zScore: number;
  beta: number;
  logOddsContribution: number;
  oddsRatio: number;
  interpretation: string;
}

export interface ScoringResult {
  profile: BorrowerProfile;
  lti: number;
  features: FeatureZScore[];
  intercept: number;
  totalLogOdds: number;
  pd: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  apr: number;
  decision: 'Approved' | 'Conditional / Elevated Risk' | 'Declined / High Risk';
  monthlyPayment: number;
  totalInterest3Yr: number;
}

export interface CoefficientMetric {
  feature: string;
  name: string;
  beta: number;
  oddsRatio: number;
  stdError: number;
  zScore: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  interpretation: string;
}

export interface GradeCalibrationRow {
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  cutoffText: string;
  portfolioShare: number;
  applicantCount: number;
  avgModelPD: number;
  actualDefaultRate: number;
  apr: number;
  description: string;
  riskCategory: string;
}

export interface ConfusionMatrixMetrics {
  threshold: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  accuracy: number;
  sensitivity: number; // Recall
  specificity: number;
  precision: number;
  f1: number;
}
