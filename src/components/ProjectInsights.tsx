import React from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Table, 
  ShieldAlert, 
  BookOpen, 
  Download,
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { COEFFICIENT_METRICS } from '../utils/creditModel';
import { downloadFile } from '../utils/projectFiles';

export const ProjectInsights: React.FC = () => {
  const handleExportCoefficients = () => {
    let csv = "Feature,Beta,Odds_Ratio,Interpretation\n";
    COEFFICIENT_METRICS.forEach(m => {
      csv += `"${m.name}",${m.beta.toFixed(4)},${m.oddsRatio.toFixed(4)},"${m.interpretation}"\n`;
    });
    downloadFile("model_coefficients.csv", csv, "text/csv");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-[#0C2340]" />
              <span>Section E · Econometric Synthesis & Findings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
              Project Insights, Model Coefficients & Governance
            </h1>
            <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
              Supervisory econometric evaluation of standardized logistic regression coefficients, odds ratios (e<sup>β</sup>), 
              delinquency drivers, model governance limitations, and institutional extensions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCoefficients}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0C2340] hover:bg-[#1A303A] text-white border border-[#0C2340] transition shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export Betas (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] flex items-center justify-center text-[#0C2340]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1C1B18]">1. FICO Score is the Anchor</h3>
          <p className="text-xs text-[#1C1B18] leading-relaxed">
            With a standardized Beta of <strong>-0.448</strong> (Odds Ratio = <strong>0.639</strong>), FICO score is the single strongest protective credit attribute. Each 1-SD increase in credit score cuts default odds by <strong>36.1%</strong>, holding all other financial variables constant.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] flex items-center justify-center text-[#B27D18]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1C1B18]">2. Leverage Compounds Delinquency</h3>
          <p className="text-xs text-[#1C1B18] leading-relaxed">
            Both Debt-to-Income (DTI, Beta = <strong>+0.342</strong>) and Loan-to-Income (LTI, Beta = <strong>+0.357</strong>) independently drive default probability. High loan amounts relative to salary create fragile monthly cash flows that cannot withstand unexpected financial shocks.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] flex items-center justify-center text-[#0B6623]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1C1B18]">3. Monotonic Risk Calibration</h3>
          <p className="text-xs text-[#1C1B18] leading-relaxed">
            Observed historical default rates scale continuously across calibrated tiers—from <strong>5.4%</strong> in Grade A to <strong>49.5%</strong> in Grade F—confirming that the logistic regression scorecard exhibits strict monotonicity and accurately rank-orders risk.
          </p>
        </div>

      </div>

      {/* Econometric Coefficients Table */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D2]">
          <div>
            <h2 className="text-lg font-bold text-[#1C1B18] flex items-center space-x-2">
              <Table className="w-4 h-4 text-[#0C2340]" />
              <span>Standardized Logistic Regression Parameters</span>
            </h2>
            <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
              Coefficients computed on normalized predictors (mean = 0, std = 1) enabling direct economic magnitude comparison.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-[#F7F4EB] text-[#0C2340] border border-[#EAE3D2] font-mono font-medium self-start sm:self-auto">
            class_weight='balanced'
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAE3D2] text-[#706E66] font-medium">
                <th className="py-3 pr-3 font-medium">Feature Name</th>
                <th className="py-3 px-3 text-right font-medium">Beta (β)</th>
                <th className="py-3 px-3 text-right font-medium">Odds Ratio (e^β)</th>
                <th className="py-3 px-3 text-right font-medium">Direction</th>
                <th className="py-3 pl-3 font-medium">Economic Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2] font-mono">
              {COEFFICIENT_METRICS.map((row) => {
                const isProtective = row.beta < 0;
                return (
                  <tr key={row.feature} className="hover:bg-[#F7F4EB]/60 transition-colors">
                    <td className="py-3.5 pr-3 font-sans font-semibold text-[#1C1B18]">
                      <div>{row.name}</div>
                      <div className="text-[10px] text-[#706E66] font-mono font-normal">{row.feature}</div>
                    </td>
                    <td className={`py-3.5 px-3 text-right font-bold tabular-nums ${
                      isProtective ? 'text-[#0B6623]' : 'text-[#9E2A2B]'
                    }`}>
                      {row.beta > 0 ? `+${row.beta.toFixed(4)}` : row.beta.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#0C2340] font-bold tabular-nums">
                      {row.oddsRatio.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans text-[11px]">
                      {row.feature === '(Intercept)' ? (
                        <span className="text-[#706E66]">Baseline</span>
                      ) : isProtective ? (
                        <span className="text-[#0B6623] font-bold">Protective</span>
                      ) : (
                        <span className="text-[#9E2A2B] font-bold">Risk Driver</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-3 font-sans text-[#1C1B18] text-[11px] leading-relaxed">
                      {row.interpretation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Limitations & Institutional Extensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Limitations */}
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-[#9E2A2B]">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#1C1B18]">Identified Model Governance Limitations</h3>
          </div>
          <div className="text-xs text-[#1C1B18] space-y-3 leading-relaxed">
            <p>
              • <strong>Survivorship Truncation:</strong> Excluding ongoing `Current` loans prevents Look-Ahead Bias but restricts model training to contracts originated earlier in the vintage window.
            </p>
            <p>
              • <strong>Absence of Macroeconomic Dynamic Variables:</strong> The model assumes stationary credit risk and does not incorporate inflation indexes, benchmark Federal Funds Rate shifts, or local state-level unemployment dynamics.
            </p>
            <p>
              • <strong>Linearity in Log-Odds:</strong> Multiple Logistic Regression assumes additive log-odds; non-linear compound credit risks (e.g., severe DTI combined with low liquidity) are modeled additively rather than through high-dimensional interaction terms.
            </p>
          </div>
        </div>

        {/* Extensions */}
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-[#0B6623]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#1C1B18]">Recommended Institutional Extensions</h3>
          </div>
          <div className="text-xs text-[#1C1B18] space-y-3 leading-relaxed">
            <p>
              • <strong>Basel II Expected Loss Integration:</strong> Couple Probability of Default (PD) with Loss Given Default (LGD) and Exposure at Default (EAD):
              <br /><code className="text-[#0B6623] font-mono bg-[#F7F4EB] px-1 py-0.5 rounded border border-[#EAE3D2]">Expected Loss (EL) = PD × LGD × EAD</code>.
            </p>
            <p>
              • <strong>Isotonic Probability Recalibration:</strong> Implement post-hoc isotonic calibration to map balanced logistic output probabilities back to raw portfolio base rates for balance sheet provisioning.
            </p>
            <p>
              • <strong>Alternative Bureau Data Ingestion:</strong> Augment credit bureau FICO scores with real-time bank account cash-flow volatility, verified payroll direct deposit stability, and utility payment records.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
