import React, { useState, useMemo } from 'react';
import { 
  BorrowerProfile, 
  ScoringResult 
} from '../types/creditRisk';
import { 
  scoreApplicant, 
  PRESET_APPLICANTS,
  sigmoid
} from '../utils/creditModel';
import { 
  DollarSign, 
  Percent, 
  Gauge, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FileCheck2,
  RefreshCw,
  Binary
} from 'lucide-react';

export const ApplicantScorer: React.FC = () => {
  const [profile, setProfile] = useState<BorrowerProfile>({
    annual_inc: 75000,
    dti: 16.5,
    fico_range_low: 710,
    loan_amnt: 15000
  });

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const result: ScoringResult = useMemo(() => {
    return scoreApplicant(profile);
  }, [profile]);

  const handlePresetSelect = (preset: typeof PRESET_APPLICANTS[0]) => {
    setProfile(preset.profile);
    setSelectedPreset(preset.name);
  };

  const handleInputChange = (field: keyof BorrowerProfile, value: number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSelectedPreset(null);
  };

  // Grade color themes aligned with high-trust banking palette
  const gradeColors: Record<string, { badge: string; text: string; bg: string }> = {
    A: { badge: 'bg-[#0B6623] text-white', text: 'text-[#0B6623]', bg: 'bg-[#0B6623]/5' },
    B: { badge: 'bg-[#1A7B72] text-white', text: 'text-[#1A7B72]', bg: 'bg-[#1A7B72]/5' },
    C: { badge: 'bg-[#B27D18] text-white', text: 'text-[#B27D18]', bg: 'bg-[#B27D18]/5' },
    D: { badge: 'bg-[#C26D1A] text-white', text: 'text-[#C26D1A]', bg: 'bg-[#C26D1A]/5' },
    E: { badge: 'bg-[#9E2A2B] text-white', text: 'text-[#9E2A2B]', bg: 'bg-[#9E2A2B]/5' },
    F: { badge: 'bg-[#9E2A2B] text-white', text: 'text-[#9E2A2B]', bg: 'bg-[#9E2A2B]/5' }
  };

  const currentTheme = gradeColors[result.grade] || gradeColors.C;

  // Generate coordinates for SVG Sigmoid plot
  const svgWidth = 460;
  const svgHeight = 180;
  const padding = 35;
  const zMin = -3.5;
  const zMax = 3.5;

  const points = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const z = zMin + (i / 100) * (zMax - zMin);
      const pdVal = sigmoid(z);
      const x = padding + ((z - zMin) / (zMax - zMin)) * (svgWidth - 2 * padding);
      const y = (svgHeight - padding) - pdVal * (svgHeight - 2 * padding);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  // Applicant marker on curve
  const clampedLogOdds = Math.max(zMin, Math.min(zMax, result.totalLogOdds));
  const markerX = padding + ((clampedLogOdds - zMin) / (zMax - zMin)) * (svgWidth - 2 * padding);
  const markerY = (svgHeight - padding) - result.pd * (svgHeight - 2 * padding);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Hero Banner / Lab Intro */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
              <Binary className="w-4 h-4 text-[#0C2340]" />
              <span>Section D · Underwriting Decision Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
              Retail Loan Applicant Risk Scorer
            </h1>
            <p className="text-[#706E66] text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Adjust applicant financial attributes in real-time to observe feature standardization, 
              log-odds computation, non-linear sigmoid S-curve mapping, and automated Grade A–F credit decisioning.
            </p>
          </div>

          {/* Quick-Preset Profiles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs text-[#706E66] font-medium sm:mr-1">Sample Profiles:</span>
            {PRESET_APPLICANTS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  selectedPreset === preset.name
                    ? 'bg-[#0C2340] text-white border-[#0C2340] shadow-sm'
                    : 'bg-[#F7F4EB] text-[#1C1B18] border-[#EAE3D2] hover:bg-[#FFFFFF]'
                }`}
              >
                {preset.tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Applicant Inputs & Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D2] mb-6">
              <h2 className="text-base font-bold text-[#1C1B18] flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-[#0C2340]" />
                <span>Applicant Underwriting Variables</span>
              </h2>
              <button
                onClick={() => setProfile({ annual_inc: 75000, dti: 16.5, fico_range_low: 710, loan_amnt: 15000 })}
                className="text-xs text-[#706E66] hover:text-[#0C2340] flex items-center space-x-1 transition font-medium"
                title="Reset to population median"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Annual Income */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#1C1B18] flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#0C2340]" />
                    <span>Annual Income</span>
                  </label>
                  <span className="font-mono text-[#0C2340] font-bold text-sm tabular-nums">
                    ${profile.annual_inc.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={250000}
                  step={2500}
                  value={profile.annual_inc}
                  onChange={(e) => handleInputChange('annual_inc', Number(e.target.value))}
                  className="w-full accent-[#0C2340] h-2 bg-[#EAE3D2] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#706E66] font-mono tabular-nums">
                  <span>Min: $15,000</span>
                  <span>Mean: $72,500</span>
                  <span>Max: $250,000</span>
                </div>
              </div>

              {/* Debt-to-Income (DTI) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#1C1B18] flex items-center space-x-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#B27D18]" />
                    <span>Debt-to-Income (DTI Ratio)</span>
                  </label>
                  <span className="font-mono text-[#B27D18] font-bold text-sm tabular-nums">
                    {profile.dti.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={45.0}
                  step={0.5}
                  value={profile.dti}
                  onChange={(e) => handleInputChange('dti', Number(e.target.value))}
                  className="w-full accent-[#B27D18] h-2 bg-[#EAE3D2] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#706E66] font-mono tabular-nums">
                  <span>Prime: &lt;15%</span>
                  <span>Mean: 18.2%</span>
                  <span>Capped: 45.0%</span>
                </div>
              </div>

              {/* FICO Score Low */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#1C1B18] flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0C2340]" />
                    <span>FICO Credit Score (Lower Bound)</span>
                  </label>
                  <span className="font-mono text-[#0C2340] font-bold text-sm tabular-nums">
                    {profile.fico_range_low}
                  </span>
                </div>
                <input
                  type="range"
                  min={600}
                  max={830}
                  step={5}
                  value={profile.fico_range_low}
                  onChange={(e) => handleInputChange('fico_range_low', Number(e.target.value))}
                  className="w-full accent-[#0C2340] h-2 bg-[#EAE3D2] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#706E66] font-mono tabular-nums">
                  <span>Subprime: 600</span>
                  <span>Mean: 698</span>
                  <span>Super Prime: 830</span>
                </div>
              </div>

              {/* Loan Amount Requested */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#1C1B18] flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#0C2340]" />
                    <span>Requested Loan Amount</span>
                  </label>
                  <span className="font-mono text-[#0C2340] font-bold text-sm tabular-nums">
                    ${profile.loan_amnt.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={40000}
                  step={500}
                  value={profile.loan_amnt}
                  onChange={(e) => handleInputChange('loan_amnt', Number(e.target.value))}
                  className="w-full accent-[#0C2340] h-2 bg-[#EAE3D2] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#706E66] font-mono tabular-nums">
                  <span>Min: $1,000</span>
                  <span>Mean: $15,100</span>
                  <span>Max: $40,000</span>
                </div>
              </div>

            </div>

            {/* Derived Feature: Loan-to-Income (LTI) */}
            <div className="mt-6 pt-5 border-t border-[#EAE3D2] bg-[#F7F4EB] -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1C1B18] flex items-center space-x-1">
                    <span>Engineered Feature: LTI</span>
                    <span className="text-[10px] text-[#706E66] font-mono tabular-nums">(loan_amnt / annual_inc)</span>
                  </span>
                  <p className="text-[11px] text-[#706E66] mt-0.5">
                    Measures relative debt burden against gross annual income.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-base font-bold tabular-nums ${
                    result.lti > 0.40 ? 'text-[#9E2A2B]' : 'text-[#0B6623]'
                  }`}>
                    {result.lti.toFixed(3)}
                  </span>
                  <div className="text-[10px] text-[#706E66] font-mono">
                    {result.lti > 0.40 ? '⚠️ High Leverage' : '✓ Standard Leverage'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Underwriting Decision & Math Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Decision Banner Card */}
          <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              
              {/* Credit Grade Display */}
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl ${currentTheme.badge} flex items-center justify-center font-bold text-3xl shadow-sm`}>
                  {result.grade}
                </div>
                <div>
                  <span className="text-xs text-[#706E66] uppercase tracking-wider font-semibold">Assigned Grade</span>
                  <h3 className={`text-xl font-bold ${currentTheme.text}`}>
                    Grade {result.grade}
                  </h3>
                  <span className="text-xs text-[#706E66]">
                    {result.grade === 'A' ? 'Prime Risk' : result.grade === 'B' ? 'Near-Prime' : result.grade === 'C' ? 'Moderate' : result.grade === 'D' ? 'Elevated' : 'High Risk'}
                  </span>
                </div>
              </div>

              {/* Predicted Probability of Default (PD) */}
              <div className="border-t sm:border-t-0 sm:border-l border-[#EAE3D2] sm:pl-6">
                <span className="text-xs text-[#706E66] uppercase tracking-wider font-semibold">Probability of Default</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-[#1C1B18] font-mono tabular-nums">
                    {(result.pd * 100).toFixed(2)}%
                  </span>
                </div>
                <span className="text-[11px] text-[#706E66]">
                  Balanced Logit Output
                </span>
              </div>

              {/* Offered Interest Rate (APR) */}
              <div className="border-t sm:border-t-0 sm:border-l border-[#EAE3D2] sm:pl-6">
                <span className="text-xs text-[#706E66] uppercase tracking-wider font-semibold">Offered APR</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-[#0B6623] font-mono tabular-nums">
                    {(result.apr * 100).toFixed(2)}%
                  </span>
                </div>
                <span className="text-[11px] text-[#706E66] tabular-nums">
                  ${result.monthlyPayment.toFixed(0)}/mo (36 mos)
                </span>
              </div>

            </div>

            {/* Recommendation Footnote */}
            <div className="pt-4 border-t border-[#EAE3D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                {result.grade in { A: 1, B: 1, C: 1, D: 1 } ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0B6623]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#B27D18]" />
                )}
                <span className="font-semibold text-[#1C1B18]">
                  Recommendation: <span className={currentTheme.text}>{result.decision}</span>
                </span>
              </div>
              <span className="text-[#706E66] font-mono tabular-nums">
                Est. Total 3-Yr Interest: ${result.totalInterest3Yr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* S-Curve Sigmoid Visualization */}
          <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#1C1B18]">Sigmoid S-Curve Position</h3>
                <span className="text-xs text-[#706E66] font-mono hidden sm:inline">
                  P(Y=1) = 1 / (1 + e^-z)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#0C2340] tabular-nums">
                z = {result.totalLogOdds.toFixed(3)}
              </span>
            </div>
            <p className="text-xs text-[#706E66] mb-4">
              The crimson marker indicates where this borrower lands along the cumulative logistic activation curve.
            </p>

            {/* SVG Plot */}
            <div className="relative bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 flex justify-center">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full max-w-xl h-auto overflow-visible"
              >
                {/* Soft Reference Lines */}
                <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#ECE6D9" strokeDasharray="3 3" />
                <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#ECE6D9" strokeDasharray="4 4" />
                <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#EAE3D2" strokeWidth="1.5" />

                {/* Vertical z=0 axis */}
                <line x1={svgWidth / 2} y1={padding} x2={svgWidth / 2} y2={svgHeight - padding} stroke="#ECE6D9" strokeDasharray="3 3" />

                {/* Y-axis labels */}
                <text x={padding - 6} y={padding + 4} fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">1.0</text>
                <text x={padding - 6} y={svgHeight / 2 + 3} fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.5</text>
                <text x={padding - 6} y={svgHeight - padding + 3} fill="#706E66" fontSize="10" textAnchor="end" fontFamily="monospace">0.0</text>

                {/* X-axis labels */}
                <text x={padding} y={svgHeight - padding + 16} fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">-3.5 (Safe)</text>
                <text x={svgWidth / 2} y={svgHeight - padding + 16} fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">z = 0</text>
                <text x={svgWidth - padding} y={svgHeight - padding + 16} fill="#706E66" fontSize="10" textAnchor="middle" fontFamily="monospace">+3.5 (Default)</text>

                {/* Sigmoid Curve */}
                <polyline
                  fill="none"
                  stroke="#0C2340"
                  strokeWidth="3"
                  points={points}
                />

                {/* Applicant Dot */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="7"
                  className="fill-[#9E2A2B] stroke-white stroke-2 drop-shadow"
                />

                {/* Tooltip callout above dot */}
                <text
                  x={markerX}
                  y={Math.max(16, markerY - 12)}
                  fill="#9E2A2B"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {(result.pd * 100).toFixed(1)}% PD
                </text>
              </svg>
            </div>
          </div>

          {/* Feature Log-Odds Decomposition Table */}
          <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1C1B18] mb-1 flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-[#0C2340]" />
              <span>Econometric Decomposition: Standardized Inputs to Log-Odds</span>
            </h3>
            <p className="text-xs text-[#706E66] mb-4">
              Shows how each attribute is standardized: <code className="text-[#0C2340] font-mono font-medium">z_i = (X - μ) / σ</code>, 
              then multiplied by Beta <code className="text-[#0C2340] font-mono font-medium">β_i</code> to compute log-odds contribution.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#EAE3D2] text-[#706E66] font-medium">
                    <th className="py-2.5 pr-2 font-medium">Feature</th>
                    <th className="py-2.5 px-2 text-right font-medium">Raw Value</th>
                    <th className="py-2.5 px-2 text-right font-medium">Z-Score</th>
                    <th className="py-2.5 px-2 text-right font-medium">Beta (β)</th>
                    <th className="py-2.5 pl-2 text-right font-medium">Log-Odds Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D2] font-mono">
                  {/* Intercept row */}
                  <tr className="text-[#706E66]">
                    <td className="py-2 pr-2 font-sans font-medium text-[#1C1B18]">(Intercept)</td>
                    <td className="py-2 px-2 text-right text-[#706E66]">-</td>
                    <td className="py-2 px-2 text-right text-[#706E66] tabular-nums">1.000</td>
                    <td className="py-2 px-2 text-right text-[#706E66] tabular-nums">{result.intercept.toFixed(3)}</td>
                    <td className="py-2 pl-2 text-right text-[#1C1B18] font-bold tabular-nums">{result.intercept.toFixed(3)}</td>
                  </tr>

                  {result.features.map((feat) => {
                    const isPositive = feat.logOddsContribution >= 0;
                    return (
                      <tr key={feat.name} className="hover:bg-[#F7F4EB]/60 transition-colors">
                        <td className="py-2.5 pr-2 font-sans font-semibold text-[#1C1B18]">
                          {feat.label}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#1C1B18] tabular-nums">
                          {feat.name === 'annual_inc' || feat.name === 'loan_amnt' 
                            ? `$${feat.raw.toLocaleString()}`
                            : feat.name === 'dti'
                            ? `${feat.raw.toFixed(1)}%`
                            : feat.name === 'LTI'
                            ? feat.raw.toFixed(3)
                            : feat.raw.toFixed(0)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#706E66] tabular-nums">
                          {feat.zScore > 0 ? `+${feat.zScore.toFixed(2)}` : feat.zScore.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#706E66] tabular-nums">
                          {feat.beta > 0 ? `+${feat.beta.toFixed(3)}` : feat.beta.toFixed(3)}
                        </td>
                        <td className={`py-2.5 pl-2 text-right font-bold tabular-nums ${
                          isPositive ? 'text-[#9E2A2B]' : 'text-[#0B6623]'
                        }`}>
                          {isPositive ? `+${feat.logOddsContribution.toFixed(3)}` : feat.logOddsContribution.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total sum row */}
                  <tr className="bg-[#F7F4EB] font-bold border-t border-[#EAE3D2]">
                    <td className="py-2.5 pr-2 font-sans text-[#1C1B18]">Total Log-Odds (z)</td>
                    <td colSpan={3} className="py-2.5 px-2 text-right font-sans text-[11px] text-[#706E66] font-normal">
                      Sum of Intercept + (β_i × z_i)
                    </td>
                    <td className="py-2.5 pl-2 text-right text-[#0C2340] text-sm tabular-nums font-bold">
                      {result.totalLogOdds > 0 ? `+${result.totalLogOdds.toFixed(3)}` : result.totalLogOdds.toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-[#F7F4EB] rounded-xl border border-[#EAE3D2] text-[11px] text-[#1C1B18] flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-[#0C2340] shrink-0 mt-0.5" />
              <span>
                <strong>Underwriting Note:</strong> Notice how FICO score has the largest negative coefficient (<code className="text-[#0B6623] font-mono font-bold">-0.448</code>). 
                When a borrower has a 780+ FICO, its large positive z-score pulls the log-odds down significantly, lowering the Probability of Default.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
