import React from 'react';
import { 
  ShieldCheck, 
  Binary, 
  TrendingUp, 
  FileCode, 
  HelpCircle, 
  Download, 
  BarChart3,
  Layers
} from 'lucide-react';
import { downloadProjectZip } from '../utils/projectFiles';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip();
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'A. Portfolio Overview', icon: Layers },
    { id: 'risk', label: 'B. Risk Analysis', icon: BarChart3 },
    { id: 'performance', label: 'C. Model Performance', icon: TrendingUp },
    { id: 'underwriting', label: 'D. Borrower Assessment', icon: Binary },
    { id: 'insights', label: 'E. Project Insights', icon: ShieldCheck },
    { id: 'code', label: 'Code & Streamlit App', icon: FileCode },
    { id: 'defense', label: 'Methodology FAQ', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0C2340] text-white shadow-md border-b border-[#1A303A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1A303A] border border-[#EAE3D2]/20 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-[#B27D18] stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Credit Risk Engine
                </span>
                <span className="text-[11px] text-[#ECE6D9] font-medium hidden sm:inline-block">
                  · Multiple Logistic Regression
                </span>
              </div>
              <p className="text-xs text-[#ECE6D9]/70 font-mono tracking-wide">
                LendingClub Historical Retail Loans (2007–2018 Q4)
              </p>
            </div>
          </div>

          {/* Download Entire Project ZIP CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#FFFFFF] hover:bg-[#F7F4EB] text-[#0C2340] border border-[#EAE3D2] shadow-sm transition active:scale-95 disabled:opacity-50"
              title="Download Python script, Jupyter notebook, requirements.txt, sample CSV, and README as a ZIP"
            >
              <Download className="w-3.5 h-3.5 text-[#0C2340]" />
              <span>{downloading ? 'Bundling...' : 'Download Project (.zip)'}</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 border-t border-[#1A303A] scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#0C2340] font-semibold shadow-sm'
                    : 'text-[#ECE6D9] hover:text-white hover:bg-[#1A303A]/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0C2340]' : 'text-[#ECE6D9]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
