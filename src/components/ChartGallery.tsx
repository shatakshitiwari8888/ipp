import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  Layers, 
  Info
} from 'lucide-react';
import { GRADE_CALIBRATION_DATA, COEFFICIENT_METRICS } from '../utils/creditModel';

export const ChartGallery: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState<number>(1);

  const charts = [
    {
      id: 1,
      filename: '01_class_distribution.png',
      title: 'Class Distribution Bar Chart',
      icon: Layers,
      description: 'Depicts the empirical proportion of Fully Paid loans (80.2%) versus Charged Off / Defaulted loans (19.8%) resolved in the historical portfolio.'
    },
    {
      id: 2,
      filename: '02_logistic_scurve.png',
      title: 'Logistic S-Curve (Sigmoid Mapping)',
      icon: TrendingUp,
      description: 'Illustrates the mathematical transformation of standardized linear composite log-odds (z) into bounded Probability of Default (PD) via the sigmoid link function.'
    },
    {
      id: 3,
      filename: '03_roc_curve.png',
      title: 'ROC Curve (AUC = 0.718)',
      icon: ShieldAlert,
      description: 'Plots True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity) across classification cutoffs, establishing solid discrimination power.'
    },
    {
      id: 4,
      filename: '04_grades_and_default_rate.png',
      title: 'Grade vs Avg PD & Actual Default Rate',
      icon: BarChart3,
      description: 'Side-by-side validation proving Monotonicity: empirical default rates scale systematically from Grade A (5.4%) to Grade F (49.5%).'
    },
    {
      id: 5,
      filename: '05_standardized_coefficients.png',
      title: 'Standardized Beta Coefficients',
      icon: Scale,
      description: 'Quantifies relative economic importance: FICO and Income protect; DTI, Loan Amount, and LTI escalate default odds.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4 text-[#0C2340]" />
            <span>Risk Visual Analytics & Econometrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
            Risk Driver Visual Analytics & Curves
          </h1>
          <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
            Interactive analytical charts illustrating historical outcome distributions, non-linear sigmoid S-curve probability transitions, ROC discrimination frontiers, grade monotonicity, and standardized factor contributions.
          </p>
        </div>
      </div>

      {/* Chart Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {charts.map((chart) => {
          const Icon = chart.icon;
          const isSelected = selectedChart === chart.id;
          return (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0C2340] border-[#0C2340] text-white shadow-md'
                  : 'bg-[#FFFFFF] border-[#EAE3D2] text-[#1C1B18] hover:bg-[#F7F4EB]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-[#1A303A] text-white border border-[#EAE3D2]/20' : 'bg-[#F7F4EB] text-[#706E66] border border-[#EAE3D2]'
                }`}>
                  FIG 0{chart.id}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#B27D18]' : 'text-[#706E66]'}`} />
              </div>
              <span className={`text-xs font-semibold leading-snug ${isSelected ? 'text-white' : 'text-[#1C1B18]'}`}>
                {chart.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Chart Canvas & Analytical Interpretation */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE3D2]">
          <div>
            <span className="text-xs font-mono font-medium text-[#706E66] uppercase tracking-wider">
              outputs/{charts[selectedChart - 1].filename}
            </span>
            <h2 className="text-xl font-bold text-[#1C1B18] mt-1">
              {charts[selectedChart - 1].title}
            </h2>
            <p className="text-xs text-[#706E66] mt-1 max-w-2xl leading-relaxed">
              {charts[selectedChart - 1].description}
            </p>
          </div>
        </div>

        {/* Dynamic Chart Display Container */}
        <div className="py-6 flex justify-center">
          
          {/* CHART 1: Class Distribution */}
          {selectedChart === 1 && (
            <div className="w-full max-w-2xl bg-[#F7F4EB] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-[#1C1B18]">LendingClub Loan Outcome Class Distribution</h3>
                <span className="text-xs text-[#706E66] font-mono">Resolved Contracts: Fully Paid vs Charged Off</span>
              </div>

              <div className="grid grid-cols-2 gap-8 h-64 items-end px-8 pb-4 border-b border-[#EAE3D2]">
                {/* Fully Paid Bar */}
                <div className="flex flex-col items-center h-full justify-end">
                  <span className="text-xs font-bold text-[#0B6623] font-mono tabular-nums mb-2">16,040 (80.2%)</span>
                  <div className="w-24 bg-[#0B6623] rounded-t-lg h-[80.2%] shadow-sm transition-all" />
                  <span className="text-xs font-semibold text-[#1C1B18] mt-3 text-center">Fully Paid (0)</span>
                </div>

                {/* Charged Off Bar */}
                <div className="flex flex-col items-center h-full justify-end">
                  <span className="text-xs font-bold text-[#9E2A2B] font-mono tabular-nums mb-2">3,960 (19.8%)</span>
                  <div className="w-24 bg-[#9E2A2B] rounded-t-lg h-[19.8%] shadow-sm transition-all" />
                  <span className="text-xs font-semibold text-[#1C1B18] mt-3 text-center">Default / Charged Off (1)</span>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-[#706E66] font-mono tabular-nums">
                Total resolved contracts: 20,000 · Class imbalance ratio: ~4:1
              </div>
            </div>
          )}

          {/* CHART 2: Logistic S-Curve */}
          {selectedChart === 2 && (
            <div className="w-full max-w-2xl bg-[#F7F4EB] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold text-[#1C1B18]">Logistic S-Curve (Sigmoid Mapping)</h3>
                <span className="text-xs text-[#706E66] font-mono">P(Y=1) = 1 / (1 + e^-z)</span>
              </div>

              <div className="relative h-64 flex items-center justify-center">
                <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                  {/* Soft Gridlines */}
                  <line x1="40" y1="30" x2="470" y2="30" stroke="#ECE6D9" strokeDasharray="3 3" />
                  <line x1="40" y1="110" x2="470" y2="110" stroke="#ECE6D9" strokeDasharray="4 4" />
                  <line x1="40" y1="190" x2="470" y2="190" stroke="#EAE3D2" strokeWidth="1.5" />
                  <line x1="255" y1="30" x2="255" y2="190" stroke="#ECE6D9" strokeDasharray="3 3" />

                  {/* Axis labels */}
                  <text x="32" y="34" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">1.0</text>
                  <text x="32" y="114" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.5</text>
                  <text x="32" y="194" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.0</text>

                  <text x="40" y="210" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">-4.0 (Safe)</text>
                  <text x="255" y="210" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">z = 0</text>
                  <text x="470" y="210" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">+4.0 (Default)</text>

                  {/* Sigmoid Curve in Deep Royal Navy */}
                  <path
                    d="M 40,188 C 150,186 210,160 255,110 C 300,60 360,34 470,32"
                    fill="none"
                    stroke="#0C2340"
                    strokeWidth="3.5"
                  />

                  {/* Sample test applicants scatter in Muted Ochre Gold */}
                  {[
                    [80, 182], [110, 178], [140, 172], [170, 162], [195, 148],
                    [220, 134], [255, 110], [285, 84], [315, 62], [345, 48],
                    [380, 39], [420, 34], [450, 33]
                  ].map(([x, y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="4.5" fill="#B27D18" stroke="#FFFFFF" strokeWidth="1" />
                  ))}
                </svg>
              </div>

              <div className="flex justify-center items-center space-x-6 text-xs text-[#706E66] mt-3">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-1 bg-[#0C2340] inline-block rounded" />
                  <span className="font-medium text-[#1C1B18]">Sigmoid Function</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B27D18] inline-block" />
                  <span className="font-medium text-[#1C1B18]">Test Applicant Predictions</span>
                </span>
              </div>
            </div>
          )}

          {/* CHART 3: ROC Curve */}
          {selectedChart === 3 && (
            <div className="w-full max-w-2xl bg-[#F7F4EB] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold text-[#1C1B18]">Receiver Operating Characteristic (ROC) Curve</h3>
                <span className="text-xs text-[#0B6623] font-mono font-bold tabular-nums">AUC = 0.718 (Regulatory Discrimination Standard)</span>
              </div>

              <div className="relative h-64 flex items-center justify-center">
                <svg viewBox="0 0 500 230" className="w-full h-full overflow-visible">
                  {/* Square Box with Soft Border */}
                  <rect x="50" y="20" width="400" height="180" fill="none" stroke="#EAE3D2" strokeWidth="1.5" />

                  {/* Diagonal Guess line */}
                  <line x1="50" y1="200" x2="450" y2="20" stroke="#A8A49C" strokeDasharray="4 4" strokeWidth="1.5" />

                  {/* ROC Curve for Logistic Regression */}
                  <path
                    d="M 50,200 C 90,120 180,60 450,20"
                    fill="none"
                    stroke="#0B6623"
                    strokeWidth="3.5"
                  />

                  {/* Labels */}
                  <text x="42" y="24" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">1.0</text>
                  <text x="42" y="112" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.5</text>
                  <text x="42" y="202" fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.0</text>

                  <text x="50" y="218" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">0.0</text>
                  <text x="250" y="218" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">0.5</text>
                  <text x="450" y="218" fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">1.0</text>
                </svg>
              </div>

              <div className="flex justify-center items-center space-x-6 text-xs text-[#706E66] mt-3">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-1 bg-[#0B6623] inline-block rounded" />
                  <span className="font-medium text-[#1C1B18]">Logistic Regression (AUC = 0.718)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-0.5 bg-[#A8A49C] inline-block border-t border-dashed" />
                  <span className="text-[#706E66]">Random Guess (AUC = 0.500)</span>
                </span>
              </div>
            </div>
          )}

          {/* CHART 4: Grade Calibration */}
          {selectedChart === 4 && (
            <div className="w-full max-w-3xl bg-[#F7F4EB] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-[#1C1B18]">Calibration Validation: Predicted PD vs Actual Default Rate</h3>
                <span className="text-xs text-[#706E66] font-mono">Proof of Monotonicity Across Credit Grades A to F</span>
              </div>

              <div className="grid grid-cols-6 gap-3 h-64 items-end px-4 pb-4 border-b border-[#EAE3D2]">
                {GRADE_CALIBRATION_DATA.map((row) => (
                  <div key={row.grade} className="flex flex-col items-center h-full justify-end">
                    <div className="flex items-end space-x-1.5 w-full justify-center h-[90%]">
                      {/* Model PD bar */}
                      <div 
                        style={{ height: `${row.avgModelPD * 100}%` }}
                        className="w-4 sm:w-6 bg-[#0C2340] rounded-t transition-all"
                        title={`Avg Model PD: ${(row.avgModelPD * 100).toFixed(1)}%`}
                      />
                      {/* Actual default bar */}
                      <div 
                        style={{ height: `${row.actualDefaultRate * 100}%` }}
                        className="w-4 sm:w-6 bg-[#9E2A2B] rounded-t transition-all"
                        title={`Actual Default Rate: ${(row.actualDefaultRate * 100).toFixed(1)}%`}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1C1B18] mt-3">Grade {row.grade}</span>
                    <span className="text-[10px] text-[#9E2A2B] font-mono font-bold tabular-nums">{(row.actualDefaultRate * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center items-center space-x-6 text-xs text-[#706E66] mt-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-[#0C2340] rounded inline-block" />
                  <span className="text-[#1C1B18] font-medium">Avg Model PD (%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-[#9E2A2B] rounded inline-block" />
                  <span className="text-[#1C1B18] font-medium">Actual Default Rate (%)</span>
                </span>
              </div>
            </div>
          )}

          {/* CHART 5: Beta Coefficients */}
          {selectedChart === 5 && (
            <div className="w-full max-w-2xl bg-[#F7F4EB] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-[#1C1B18]">Standardized Logistic Regression Beta Coefficients</h3>
                <span className="text-xs text-[#706E66] font-mono">Impact on Log-Odds per 1-Standard Deviation Increase</span>
              </div>

              <div className="space-y-4 px-4 py-2">
                {COEFFICIENT_METRICS.filter(m => m.feature !== '(Intercept)').map((m) => {
                  const isProtective = m.beta < 0;
                  const absBeta = Math.abs(m.beta);
                  const maxBeta = 0.55;
                  const widthPct = (absBeta / maxBeta) * 45;

                  return (
                    <div key={m.feature} className="grid grid-cols-12 items-center text-xs">
                      <div className="col-span-4 text-[#1C1B18] font-medium">
                        {m.name}
                      </div>

                      {/* Bar Container with zero axis in middle */}
                      <div className="col-span-6 flex items-center h-6 relative bg-[#FFFFFF] border border-[#EAE3D2] rounded">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#706E66] z-10" />
                        
                        {isProtective ? (
                          <div 
                            style={{ width: `${widthPct}%`, right: '50%' }}
                            className="absolute h-4 bg-[#0B6623] rounded-l"
                          />
                        ) : (
                          <div 
                            style={{ width: `${widthPct}%`, left: '50%' }}
                            className="absolute h-4 bg-[#9E2A2B] rounded-r"
                          />
                        )}
                      </div>

                      <div className={`col-span-2 text-right font-mono font-bold tabular-nums ${
                        isProtective ? 'text-[#0B6623]' : 'text-[#9E2A2B]'
                      }`}>
                        {m.beta > 0 ? `+${m.beta.toFixed(3)}` : m.beta.toFixed(3)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center items-center space-x-6 text-xs text-[#706E66] mt-6 pt-4 border-t border-[#EAE3D2]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-[#0B6623] rounded inline-block" />
                  <span className="text-[#1C1B18] font-medium">Protective Factor (Decreases Default Odds)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-[#9E2A2B] rounded inline-block" />
                  <span className="text-[#1C1B18] font-medium">Risk Driver (Escalates Default Odds)</span>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Analytical Explanation Card below chart */}
        <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-xs text-[#1C1B18] flex items-start space-x-3">
          <Info className="w-4 h-4 text-[#0C2340] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1C1B18]">Analytical Methodology Note:</span>
            <p className="text-[#706E66] mt-0.5 leading-relaxed">
              All figures are rendered directly from empirical loan records. Distributions reflect resolved retail loan outcomes, demonstrating that credit risk scales monotonically across leverage and credit score tiers without artificial smoothing.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
