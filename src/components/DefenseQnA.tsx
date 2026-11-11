import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  ShieldCheck
} from 'lucide-react';

export const DefenseQnA: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const questions = [
    {
      q: 'Why did you use class_weight="balanced" in your Logistic Regression model?',
      category: 'Machine Learning & Class Imbalance',
      answer: `In retail personal lending, loan default is an asymmetric minority event: approximately 60–80% of applicants fully repay, while the remainder default or charge off. 

If standard unweighted Logistic Regression were trained, the optimization algorithm would maximize overall accuracy by predicting that all borrowers are safe. While this could yield an superficially high accuracy on paper, it would be commercially unacceptable for a lending institution because defaulted loans generate substantial write-offs.

Setting class_weight="balanced" automatically calculates weights inversely proportional to class frequencies:
W_class = N_samples / (2 * N_class_samples)

This forces the optimizer to heavily penalize False Negatives (missed defaults), training the model to detect critical risk signals in DTI, FICO, and leverage.`,
      takeaway: 'Accuracy is an uninformative metric for asymmetric credit default data; balanced loss penalizes missed defaults to prioritize recall.'
    },
    {
      q: 'Why are your PD grade cutoffs set between 0.32 and 0.74 instead of 0.05 and 0.15?',
      category: 'Model Calibration & Business Logic',
      answer: `This is a direct mathematical consequence of using class_weight="balanced". 

When the model applies equal total weight to both classes, it shifts the baseline intercept upward, recalibrating the average predicted Probability of Default from the base rate up toward ~50%.

If uncalibrated cutoffs like 0.05 were applied, almost every borrower in the portfolio would be assigned to Grade F. 
Our calibrated dictionary of cutoffs:
- Grade A: PD < 0.32
- Grade B: 0.32 <= PD < 0.44
- Grade C: 0.44 <= PD < 0.54
- Grade D: 0.54 <= PD < 0.64
- Grade E: 0.64 <= PD < 0.74
- Grade F: PD >= 0.74

This produces a balanced credit distribution across all 6 tiers while strictly preserving monotonic risk ranking.`,
      takeaway: 'Balanced class weighting shifts raw model probabilities toward 0.50, requiring cutoffs to be calibrated to the shifted scale.'
    },
    {
      q: 'What is Look-Ahead Bias, and why must we drop "Current" and "Late" loans?',
      category: 'Data Hygiene & Regulatory Ethics',
      answer: `Look-ahead bias occurs when information that would not have been available at the decision timestamp is incorporated into the training data.

In LendingClub data, loans with status "Current", "In Grace Period", or "Late (31-120 days)" are ongoing contracts that have not reached terminal maturity. A borrower who is "Current" today may encounter financial stress and default in subsequent quarters.

Coding "Current" as 0 (Safe) would inject severe label noise and false negatives into the training set. In regulatory credit risk (Basel Accords), default models must be trained strictly on resolved contracts:
- "Fully Paid" -> 0 (Legitimate Safe Loan)
- "Charged Off" or "Default" -> 1 (Legitimate Defaulted Loan)`,
      takeaway: 'Default models must be trained strictly on resolved terminal loan states to prevent premature label contamination.'
    },
    {
      q: 'Why must StandardScaler be fitted on the training fold only?',
      category: 'Statistical Rigor & Data Leakage',
      answer: `Fitting the StandardScaler on the entire dataset (or on the test set) causes Data Leakage.

Data Leakage occurs when information from outside the training dataset is used to parameterize the model. In production lending, future loan applicants do not yet exist; their empirical income mean or standard deviation of DTI cannot be known in advance.

By executing:
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)

we guarantee that the model is evaluated on truly unseen data, accurately reflecting out-of-sample deployment.`,
      takeaway: 'Fitting preprocessing strictly on training data and transforming test partitions ensures an authentic out-of-sample evaluation.'
    },
    {
      q: 'How do you interpret an Odds Ratio of 0.639 on the FICO score variable?',
      category: 'Econometrics & Odds Ratios',
      answer: `The Odds Ratio is calculated as e^Beta. For our standardized FICO score, Beta = -0.448, which yields:
OR = exp(-0.448) = 0.639

Economic Interpretation:
Because features were standardized to mean 0 and standard deviation 1, an Odds Ratio of 0.639 indicates that:
"Holding all other variables constant, every 1-standard-deviation increase in a borrower's FICO score (~34 points) multiplies their odds of default by 0.639."

Expressed as a percentage reduction:
(1 - 0.639) * 100 = 36.1%

Each 34-point boost in FICO reduces default odds by 36.1%, confirming it as the single strongest protective factor in the credit model.`,
      takeaway: 'Odds Ratios below 1.0 denote protective factors; Odds Ratios above 1.0 indicate elevated default odds.'
    },
    {
      q: 'Why Multiple Logistic Regression instead of Ordinary Least Squares (Linear Regression)?',
      category: 'Model Selection & Mathematics',
      answer: `Linear regression (OLS) is mathematically inappropriate for binary classification for three key reasons:

1. Non-bounded Predictions: OLS can predict probabilities below 0 or above 1 (e.g. PD = -0.15 or 1.35), violating basic probability axioms.
2. Heteroskedasticity: For a binary outcome Y in {0, 1}, the error variance is p(1-p), which varies with X, violating the Gauss-Markov homoskedasticity assumption.
3. Non-linear S-curve Reality: Default risk changes non-linearly. Moving from 600 to 620 FICO generates a steeper risk reduction than moving from 780 to 800. The logistic sigmoid function S(z) = 1 / (1 + e^-z) naturally constrains PD to [0, 1] with realistic tapering.`,
      takeaway: 'Logistic regression employs Maximum Likelihood Estimation (MLE) with a bounded sigmoid link rather than unconstrained ordinary least squares.'
    },
    {
      q: 'What is the difference between Probability and Odds?',
      category: 'Core Mathematical Foundations',
      answer: `Probability (p) is the ratio of favorable outcomes to all possible outcomes:
p = Defaults / Total Applicants (Bounded between 0 and 1)

Odds is the ratio of favorable outcomes to unfavorable outcomes:
Odds = p / (1 - p) (Bounded between 0 and positive infinity)

For example, if the Probability of Default is 0.20 (20%):
Odds = 0.20 / (1 - 0.20) = 0.20 / 0.80 = 0.25 (or 1 to 4 odds).

Logistic regression models the Natural Logarithm of Odds (Log-Odds or Logit), which is unbounded [-inf, +inf], allowing linear modeling on the right-hand side.`,
      takeaway: 'Probability is bounded [0, 1] whereas Odds is [0, inf]; Log-Odds spans [-inf, +inf], facilitating linear modeling.'
    },
    {
      q: 'How does this PD model connect to the Basel II Expected Loss formula in commercial banking?',
      category: 'Banking Regulation & FinTech',
      answer: `Under the Basel II and III Internal Ratings-Based (IRB) framework, financial institutions must compute regulatory capital reserves using the Expected Loss (EL) equation:

Expected Loss (EL) = PD * LGD * EAD

Where:
- PD (Probability of Default): The likelihood that the borrower will fail to repay within the horizon (the output of our Multiple Logistic Regression model).
- LGD (Loss Given Default): The percentage of the loan balance lost after debt recovery and collections (typically ~45% for unsecured retail debt).
- EAD (Exposure at Default): The total outstanding dollar balance owed at the moment of default (loan_amnt).

This pipeline provides the analytical engine for the primary component: estimating PD.`,
      takeaway: 'Probability of Default (PD) forms the foundational parameter in regulatory Expected Loss (EL = PD * LGD * EAD) calculations.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#0C2340]" />
            <span>Technical Methodology & Model Governance FAQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
            Methodology & Risk Governance Reference
          </h1>
          <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
            Detailed technical and econometric rationale addressing class weighting, look-ahead bias mitigation, 
            data leakage prevention, odds ratio interpretation, and Basel capital frameworks.
          </p>
        </div>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-4">
        {questions.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`border rounded-2xl transition-all overflow-hidden ${
                isOpen 
                  ? 'bg-[#FFFFFF] border-[#0C2340] shadow-md' 
                  : 'bg-[#FFFFFF] border-[#EAE3D2] hover:border-[#1A303A]/40'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F7F4EB] text-[#0C2340] border border-[#EAE3D2]">
                      REF 0{idx + 1}
                    </span>
                    <span className="text-xs text-[#706E66] font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1C1B18] leading-snug">
                    {item.q}
                  </h3>
                </div>

                <div className="p-2 rounded-lg bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] shrink-0 mt-1">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 pt-3 border-t border-[#EAE3D2] space-y-4">
                  <div className="text-sm text-[#1C1B18] leading-relaxed whitespace-pre-line font-sans">
                    {item.answer}
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-xs text-[#1C1B18] flex items-start space-x-2.5">
                    <Lightbulb className="w-4 h-4 text-[#0C2340] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0C2340]">Key Analytical Takeaway:</strong>
                      <p className="text-[#706E66] mt-0.5 leading-relaxed">{item.takeaway}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
