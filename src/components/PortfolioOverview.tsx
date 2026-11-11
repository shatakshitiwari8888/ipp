import React from 'react';
import { 
  ShieldCheck, 
  Download
} from 'lucide-react';
import { downloadFile } from '../utils/projectFiles';

export const PortfolioOverview: React.FC = () => {
  const totalLoans = 4466;
  const totalVolume = 82285000;
  const fullyPaid = 2706;
  const chargedOff = 1760;
  const defaultRate = (chargedOff / totalLoans) * 100;
  const avgLoan = 18425;
  const medianIncome = 66700;

  const handleExportSummary = () => {
    const csvContent = `Metric,Value,Unit
Total Loans Analysed,${totalLoans},Contracts
Total Disbursed Volume,$${(totalVolume / 1e6).toFixed(2)}M,USD
Fully Paid Loans,${fullyPaid},Contracts (${(fullyPaid / totalLoans * 100).toFixed(1)}%)
Charged-Off Default Loans,${chargedOff},Contracts (${defaultRate.toFixed(1)}%)
Observed Default Rate,${defaultRate.toFixed(2)},%
Average Approved Loan,$${avgLoan.toLocaleString()},USD
Median Borrower Income,$${medianIncome.toLocaleString()},USD
Dataset Period,2007-2018 Q4,Historical Resolved
`;
    downloadFile('portfolio_summary.csv', csvContent, 'text/csv');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Executive Hero Card */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#0C2340]" />
              <span>Section A · Executive Portfolio Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
              Portfolio Overview & Debt Resolution Analysis
            </h1>
            <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
              Supervisory overview of resolved retail loan contracts from the historical LendingClub portfolio (2007–2018 Q4). 
              Excludes right-censored active loans to establish an authentic, empirical default benchmark.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0C2340] hover:bg-[#1A303A] text-white border border-[#0C2340] transition shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export KPI Summary (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-medium text-[#706E66] uppercase tracking-wider block">
            Total Loans Analysed
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#1C1B18] font-mono tabular-nums mt-1">
            {totalLoans.toLocaleString()}
          </div>
          <span className="text-xs text-[#706E66] mt-1 block">
            Genuinely Resolved
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-medium text-[#706E66] uppercase tracking-wider block">
            Total Disbursed Volume
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0C2340] font-mono tabular-nums mt-1">
            ${(totalVolume / 1e6).toFixed(1)}M
          </div>
          <span className="text-xs text-[#706E66] mt-1 block">
            USD Principal Disbursed
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-medium text-[#706E66] uppercase tracking-wider block">
            Fully Paid Settlement
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B6623] font-mono tabular-nums mt-1">
            {fullyPaid.toLocaleString()}
          </div>
          <span className="text-xs text-[#0B6623] font-medium mt-1 block tabular-nums">
            {(fullyPaid / totalLoans * 100).toFixed(1)}% Settlement Rate
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-medium text-[#706E66] uppercase tracking-wider block">
            Charged-Off Loans
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#9E2A2B] font-mono tabular-nums mt-1">
            {chargedOff.toLocaleString()}
          </div>
          <span className="text-xs text-[#9E2A2B] font-medium mt-1 block">
            Credit Loss Events
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-xl p-4 sm:p-5 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-[#706E66] uppercase tracking-wider block">
            Observed Default Rate
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#B27D18] font-mono tabular-nums mt-1">
            {defaultRate.toFixed(1)}%
          </div>
          <span className="text-xs text-[#B27D18] font-medium mt-1 block">
            Empirical Base Rate
          </span>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Outcome Breakdown Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <div>
              <h3 className="text-base font-bold text-[#1C1B18]">Terminal Outcome Breakdown</h3>
              <span className="text-xs text-[#706E66]">Proportion of Safe Settlement vs Credit Loss</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] font-mono font-medium">
              Binary Target
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <div className="w-full max-w-sm space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1C1B18] mb-1.5">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#0B6623] inline-block" />
                    <span>Fully Paid (Target = 0)</span>
                  </span>
                  <span className="font-mono text-[#0B6623] tabular-nums font-bold">
                    {fullyPaid.toLocaleString()} ({(fullyPaid / totalLoans * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#F7F4EB] border border-[#EAE3D2] rounded-full h-3.5 overflow-hidden p-0.5">
                  <div 
                    style={{ width: `${fullyPaid / totalLoans * 100}%` }}
                    className="h-full bg-[#0B6623] rounded-full transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1C1B18] mb-1.5">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#9E2A2B] inline-block" />
                    <span>Charged Off / Default (Target = 1)</span>
                  </span>
                  <span className="font-mono text-[#9E2A2B] tabular-nums font-bold">
                    {chargedOff.toLocaleString()} ({defaultRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#F7F4EB] border border-[#EAE3D2] rounded-full h-3.5 overflow-hidden p-0.5">
                  <div 
                    style={{ width: `${defaultRate}%` }}
                    className="h-full bg-[#9E2A2B] rounded-full transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE3D2] text-xs text-[#706E66] space-y-1.5">
                <div className="flex justify-between">
                  <span>Class Imbalance Ratio:</span>
                  <span className="font-mono text-[#1C1B18] font-bold tabular-nums">1.54 : 1 (Safe to Default)</span>
                </div>
                <div className="flex justify-between">
                  <span>Excluded Active/Censored Contracts:</span>
                  <span className="font-mono text-[#1C1B18] font-bold tabular-nums">1,534 loans (Current & Grace)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Size & Income Profile (6 cols) */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <div>
              <h3 className="text-base font-bold text-[#1C1B18]">Borrower Financial Baseline</h3>
              <span className="text-xs text-[#706E66]">Central Tendencies & Capital Allocation</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] font-mono font-medium">
              USD Statistics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            
            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-1">
              <span className="text-xs text-[#706E66] font-medium">Mean Loan Size</span>
              <div className="text-xl font-bold text-[#1C1B18] font-mono tabular-nums">
                ${avgLoan.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#706E66]">Min $1,000 | Max $35,500</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-1">
              <span className="text-xs text-[#706E66] font-medium">Median Borrower Income</span>
              <div className="text-xl font-bold text-[#1C1B18] font-mono tabular-nums">
                ${medianIncome.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#706E66]">Mean $76,030 | Capped $260k</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-1">
              <span className="text-xs text-[#706E66] font-medium">Median DTI Ratio</span>
              <div className="text-xl font-bold text-[#B27D18] font-mono tabular-nums">
                18.53%
              </div>
              <p className="text-[11px] text-[#706E66]">Interquartile: 13.9% - 23.4%</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-1">
              <span className="text-xs text-[#706E66] font-medium">Median FICO Score</span>
              <div className="text-xl font-bold text-[#0C2340] font-mono tabular-nums">
                695
              </div>
              <p className="text-[11px] text-[#706E66]">Prime Range: 600 - 835</p>
            </div>

          </div>

          <div className="p-3 bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl text-xs text-[#1C1B18] leading-relaxed">
            <strong className="text-[#0C2340]">Look-Ahead Bias Protection:</strong> Underwriting analytics reflect terminal performance only. 
            Active contracts still in repayment cannot be scored as safe without severely contaminating credit loss models.
          </div>
        </div>

      </div>

    </div>
  );
};
