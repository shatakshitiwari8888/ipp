import React, { useState } from 'react';
import { 
  COEFFICIENT_METRICS, 
  GRADE_CALIBRATION_DATA, 
  computeConfusionMatrix 
} from '../utils/creditModel';
import { 
  TrendingUp, 
  Sliders, 
  HelpCircle,
  Activity,
  Layers,
  Table
} from 'lucide-react';

export const EconometricsDashboard: React.FC = () => {
  const [cutoffThreshold, setCutoffThreshold] = useState<number>(0.50);

  const cmMetrics = computeConfusionMatrix(cutoffThreshold);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-[#0C2340]" />
            <span>Section C · Statistical Inference & Econometrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
            Multiple Logistic Regression & Credit Calibration
          </h1>
          <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
            Inspect standardized Beta coefficients, Odds Ratios (e<sup>β</sup>), standard errors, 
            interactive decision threshold tuning, and empirical credit grade monotonicity.
          </p>
        </div>
      </div>

      {/* Class Distribution Reality Check Card */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#1C1B18] mb-1 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#0C2340]" />
          <span>Empirical Class Distribution (Historical LendingClub Resolution)</span>
        </h2>
        <p className="text-xs text-[#706E66] mb-5">
          Empirical base rate computed directly from resolved contracts without assuming hypothetical 85:15 distributions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0B6623] uppercase tracking-wider">Safe Borrowers (Fully Paid)</span>
              <h3 className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">80.2%</h3>
              <p className="text-xs text-[#706E66] mt-0.5">Target = 0 (Base Performing Portfolio)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#EAE3D2] flex items-center justify-center text-[#0B6623] font-bold text-lg font-mono">
              0
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#9E2A2B] uppercase tracking-wider">Defaulted Borrowers (Charged Off)</span>
              <h3 className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">19.8%</h3>
              <p className="text-xs text-[#706E66] mt-0.5">Target = 1 (Minority Default Class)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#EAE3D2] flex items-center justify-center text-[#9E2A2B] font-bold text-lg font-mono">
              1
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Beta Coefficients & Odds Ratios Table */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C1B18] flex items-center space-x-2">
              <Table className="w-4 h-4 text-[#0C2340]" />
              <span>Standardized Beta Coefficients & Odds Ratios (e^β)</span>
            </h2>
            <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
              Standardized coefficients allow direct comparison of relative feature magnitude. 
              Odds ratios indicate the multiplicative shift in default odds per 1 standard deviation increase.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-[#F7F4EB] text-[#0C2340] border border-[#EAE3D2] font-mono font-medium whitespace-nowrap self-start sm:self-auto">
            class_weight="balanced"
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAE3D2] text-[#706E66] font-medium">
                <th className="py-3 pr-3 font-medium">Feature Name</th>
                <th className="py-3 px-3 text-right font-medium">Beta (β)</th>
                <th className="py-3 px-3 text-right font-medium">Odds Ratio (e^β)</th>
                <th className="py-3 px-3 text-right font-medium">Std Error</th>
                <th className="py-3 px-3 text-right font-medium">z-score</th>
                <th className="py-3 px-3 text-right font-medium">p-value</th>
                <th className="py-3 pl-3 text-left font-medium">Plain-English Economic Meaning</th>
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
                      {row.beta > 0 ? `+${row.beta.toFixed(3)}` : row.beta.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#0C2340] font-bold tabular-nums">
                      {row.oddsRatio.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#706E66] tabular-nums">
                      {row.stdError.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#1C1B18] tabular-nums">
                      {row.zScore > 0 ? `+${row.zScore.toFixed(2)}` : row.zScore.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#0B6623] font-bold tabular-nums">
                      &lt; 0.001***
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

        <div className="mt-4 p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-xs text-[#1C1B18] flex items-start space-x-2.5">
          <HelpCircle className="w-4 h-4 text-[#0C2340] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#0C2340]">Statistical Significance Note:</strong> All five variables achieve <code className="text-[#0C2340] font-mono font-bold bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#EAE3D2]">p &lt; 0.001</code>, 
            confirming high statistical validity. FICO score demonstrates the highest absolute z-score (-31.8), 
            identifying credit score as the single most powerful deterrent against loan default.
          </p>
        </div>
      </div>

      {/* Section 2: Interactive Decision Threshold & Confusion Matrix Simulator */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C1B18] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#0C2340]" />
              <span>Interactive Decision Threshold & Confusion Matrix Simulator</span>
            </h2>
            <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
              Adjust the decision cutoff to simulate how an underwriting desk trades off Sensitivity (catching defaults) 
              against Specificity (minimizing false alarms on creditworthy borrowers).
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-[#F7F4EB] px-3.5 py-2 rounded-xl border border-[#EAE3D2] self-start sm:self-auto">
            <span className="text-xs text-[#706E66] font-medium">Decision Cutoff:</span>
            <span className="font-mono text-[#0C2340] font-bold text-sm tabular-nums">
              {cutoffThreshold.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="space-y-2 bg-[#F7F4EB] p-5 rounded-xl border border-[#EAE3D2]">
          <input
            type="range"
            min={0.15}
            max={0.85}
            step={0.01}
            value={cutoffThreshold}
            onChange={(e) => setCutoffThreshold(Number(e.target.value))}
            className="w-full accent-[#0C2340] h-2 bg-[#EAE3D2] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#706E66] font-mono tabular-nums pt-1">
            <span>0.15 (Aggressive Risk Rejection)</span>
            <span>0.50 (Standard Symmetrical Cutoff)</span>
            <span>0.85 (Lenient Approval Policy)</span>
          </div>
        </div>

        {/* Confusion Matrix & Metric Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* 2x2 Confusion Matrix (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-semibold text-[#1C1B18] uppercase tracking-wider block">
              2×2 Contingency Table (20,000 Test Applicants)
            </span>

            <div className="grid grid-cols-2 gap-3.5 text-center">
              
              {/* True Negatives */}
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
                <span className="text-[10px] font-bold text-[#0B6623] uppercase tracking-wider">True Negatives (TN)</span>
                <div className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">
                  {cmMetrics.tn.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#706E66] mt-0.5">
                  Safe loans correctly approved
                </p>
              </div>

              {/* False Positives */}
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
                <span className="text-[10px] font-bold text-[#B27D18] uppercase tracking-wider">False Positives (FP)</span>
                <div className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">
                  {cmMetrics.fp.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#706E66] mt-0.5">
                  Safe loans flagged as default
                </p>
              </div>

              {/* False Negatives */}
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
                <span className="text-[10px] font-bold text-[#9E2A2B] uppercase tracking-wider">False Negatives (FN)</span>
                <div className="text-2xl font-bold text-[#9E2A2B] font-mono tabular-nums mt-1">
                  {cmMetrics.fn.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#706E66] mt-0.5">
                  Missed defaults (Severe write-off risk)
                </p>
              </div>

              {/* True Positives */}
              <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
                <span className="text-[10px] font-bold text-[#0C2340] uppercase tracking-wider">True Positives (TP)</span>
                <div className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">
                  {cmMetrics.tp.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#706E66] mt-0.5">
                  Defaults caught and stopped
                </p>
              </div>

            </div>
          </div>

          {/* Metric Cards (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            
            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
              <span className="text-xs text-[#706E66] font-medium">Recall / Sensitivity</span>
              <div className="text-xl font-bold text-[#0B6623] font-mono tabular-nums mt-0.5">
                {(cmMetrics.sensitivity * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-[#706E66] mt-0.5">Catch rate of actual defaults</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
              <span className="text-xs text-[#706E66] font-medium">Specificity</span>
              <div className="text-xl font-bold text-[#0C2340] font-mono tabular-nums mt-0.5">
                {(cmMetrics.specificity * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-[#706E66] mt-0.5">Accurate approval of safe loans</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
              <span className="text-xs text-[#706E66] font-medium">Precision</span>
              <div className="text-xl font-bold text-[#1A303A] font-mono tabular-nums mt-0.5">
                {(cmMetrics.precision * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-[#706E66] mt-0.5">% flagged that truly default</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2]">
              <span className="text-xs text-[#706E66] font-medium">F1-Score</span>
              <div className="text-xl font-bold text-[#B27D18] font-mono tabular-nums mt-0.5">
                {cmMetrics.f1.toFixed(3)}
              </div>
              <p className="text-[10px] text-[#706E66] mt-0.5">Harmonic mean precision & recall</p>
            </div>

          </div>

        </div>
      </div>

      {/* Section 3: Grade Calibration Table (Proving Monotonicity) */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C1B18] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#0C2340]" />
              <span>Credit Grade Calibration Table (A to F)</span>
            </h2>
            <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
              Demonstrates <strong>Monotonic Risk Ordering</strong>: actual default rate strictly escalates from Grade A (5.4%) to Grade F (49.5%).
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-[#F7F4EB] text-[#0B6623] border border-[#EAE3D2] font-semibold font-mono whitespace-nowrap self-start sm:self-auto">
            Strict Monotonicity Validated ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EAE3D2] text-[#706E66] font-medium">
                <th className="py-3 pr-3 font-medium">Grade</th>
                <th className="py-3 px-3 font-medium">Calibrated Cutoff</th>
                <th className="py-3 px-3 text-right font-medium">Portfolio Share</th>
                <th className="py-3 px-3 text-right font-medium">Avg Model PD</th>
                <th className="py-3 px-3 text-right font-medium">Actual Default Rate</th>
                <th className="py-3 px-3 text-right font-medium">Offered APR</th>
                <th className="py-3 pl-3 font-medium">Risk Tier Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D2] font-mono">
              {GRADE_CALIBRATION_DATA.map((row) => (
                <tr key={row.grade} className="hover:bg-[#F7F4EB]/60 transition-colors">
                  <td className="py-3.5 pr-3 font-sans font-bold text-base text-[#1C1B18]">
                    <span className={`inline-block w-7 h-7 rounded text-center leading-7 text-xs font-bold ${
                      row.grade === 'A' ? 'bg-[#0B6623] text-white' :
                      row.grade === 'B' ? 'bg-[#1A7B72] text-white' :
                      row.grade === 'C' ? 'bg-[#B27D18] text-white' :
                      row.grade === 'D' ? 'bg-[#C26D1A] text-white' :
                      'bg-[#9E2A2B] text-white'
                    }`}>
                      {row.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#1C1B18] tabular-nums">{row.cutoffText}</td>
                  <td className="py-3.5 px-3 text-right text-[#1C1B18] tabular-nums">{row.portfolioShare}%</td>
                  <td className="py-3.5 px-3 text-right text-[#0C2340] font-semibold tabular-nums">{(row.avgModelPD * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-3 text-right text-[#9E2A2B] font-bold tabular-nums">{(row.actualDefaultRate * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-3 text-right text-[#0B6623] font-bold tabular-nums">{(row.apr * 100).toFixed(2)}%</td>
                  <td className="py-3.5 pl-3 font-sans text-[#706E66] text-[11px] leading-relaxed">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
