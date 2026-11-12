import React from 'react';
import { 
  ShieldCheck, 
  Binary, 
  TrendingUp, 
  BarChart3,
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: Layers },
    { id: 'underwriting', label: 'Borrower Underwriting', icon: Binary },
    { id: 'risk', label: 'Risk Visual Analytics', icon: BarChart3 },
    { id: 'performance', label: 'Model Performance', icon: TrendingUp },
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
                  Credit Risk Analytics
                </span>
                <span className="text-[11px] text-[#ECE6D9] font-medium hidden sm:inline-block">
                  · Institutional Decision Dashboard
                </span>
              </div>
              <p className="text-xs text-[#ECE6D9]/70 font-mono tracking-wide">
                LendingClub Historical Retail Loans (2007–2018 Q4)
              </p>
            </div>
          </div>

          {/* Operational Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1A303A] text-[#ECE6D9] border border-[#EAE3D2]/20">
              <span className="w-2 h-2 rounded-full bg-[#0B6623] mr-2 inline-block"></span>
              Live Model Ready
            </span>
          </div>

        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-[#1A303A] scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
