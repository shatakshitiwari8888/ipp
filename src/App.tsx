import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PortfolioOverview } from './components/PortfolioOverview';
import { ChartGallery } from './components/ChartGallery';
import { EconometricsDashboard } from './components/EconometricsDashboard';
import { ApplicantScorer } from './components/ApplicantScorer';
import { ProjectInsights } from './components/ProjectInsights';
import { CodeViewer } from './components/CodeViewer';
import { DefenseQnA } from './components/DefenseQnA';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#1C1B18] flex flex-col selection:bg-[#0C2340] selection:text-white font-sans antialiased">
      
      {/* Top Banking Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {activeTab === 'overview' && <PortfolioOverview />}
        {activeTab === 'risk' && <ChartGallery />}
        {activeTab === 'performance' && <EconometricsDashboard />}
        {activeTab === 'underwriting' && <ApplicantScorer />}
        {activeTab === 'insights' && <ProjectInsights />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'defense' && <DefenseQnA />}
      </main>

      {/* High-Trust Institutional Footer */}
      <footer className="border-t border-[#EAE3D2] bg-[#FFFFFF] text-[#706E66] py-10 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-[#0C2340] flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="font-bold text-sm text-[#1C1B18] tracking-tight">
                  Credit Risk & Loan Default Prediction
                </span>
              </div>
              <p className="text-[#706E66] text-xs max-w-sm leading-relaxed">
                Supervisory credit risk analytics engine powered by Multiple Logistic Regression on LendingClub retail debt.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-start md:justify-center">
              {['Python 3.10', 'Streamlit', 'Pandas', 'Scikit-Learn', 'Plotly', 'Matplotlib', 'Basel II Standards'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-[#F7F4EB] border border-[#EAE3D2] text-[11px] font-mono text-[#1C1B18]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="text-left md:text-right space-y-1">
              <p className="font-semibold text-[#1C1B18]">Target: Probability of Default (PD)</p>
              <p className="text-[#706E66] font-mono text-[11px] tabular-nums">
                Engineered Metric: LTI = loan_amnt / annual_inc
              </p>
              <p className="text-[#0B6623] font-mono text-[11px] font-medium">
                Stratified 80/20 Split · class_weight='balanced'
              </p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
