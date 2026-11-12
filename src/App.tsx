import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PortfolioOverview } from './components/PortfolioOverview';
import { ChartGallery } from './components/ChartGallery';
import { EconometricsDashboard } from './components/EconometricsDashboard';
import { ApplicantScorer } from './components/ApplicantScorer';
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
        {activeTab === 'underwriting' && <ApplicantScorer />}
        {activeTab === 'risk' && <ChartGallery />}
        {activeTab === 'performance' && <EconometricsDashboard />}
      </main>

      {/* High-Trust Institutional Footer */}
      <footer className="border-t border-[#EAE3D2] bg-[#FFFFFF] text-[#706E66] py-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-[#0C2340] flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm text-[#1C1B18] tracking-tight">
                Credit Risk Analytics & Underwriting Platform
              </span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {['Multiple Logistic Regression', 'Balanced Class Weighting', 'Standardized Scaler', 'Basel II Standards'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-[#F7F4EB] border border-[#EAE3D2] text-[11px] font-mono text-[#1C1B18]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="text-center sm:text-right text-[#706E66] text-xs">
              <span className="font-medium text-[#1C1B18]">Target:</span> Probability of Default (PD) · 
              <span className="font-medium text-[#1C1B18] ml-1">Split:</span> 80/20 Stratified
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
