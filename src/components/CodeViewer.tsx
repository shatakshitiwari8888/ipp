import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  BookOpen, 
  Terminal, 
  FileText 
} from 'lucide-react';
import { 
  CREDIT_RISK_PY_CODE, 
  STREAMLIT_PROJECT_PY_CODE,
  README_MD_TEXT,
  REQUIREMENTS_TXT, 
  RUBRIC_CHECKLIST,
  downloadFile,
  downloadProjectZip
} from '../utils/projectFiles';
import { Globe, GitBranch } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'streamlit' | 'py' | 'req' | 'readme' | 'rubric' | 'github'>('streamlit');
  const [copied, setCopied] = useState(false);
  const [streamlitCode] = useState<string>(STREAMLIT_PROJECT_PY_CODE);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#706E66] uppercase tracking-wider mb-2">
              <FileCode className="w-4 h-4 text-[#0C2340]" />
              <span>Source Artifacts & Streamlit Application</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1B18] tracking-tight">
              Streamlit Dashboard & Python Codebase
            </h1>
            <p className="text-[#706E66] text-sm sm:text-base mt-2 leading-relaxed">
              Inspect the enterprise Streamlit application (<code className="text-[#0C2340] font-mono bg-[#F7F4EB] px-1 py-0.5 rounded border border-[#EAE3D2]">project.py</code>), 
              the pipeline source script, requirements manifest, and architectural specification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadFile('project.py', streamlitCode)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F7F4EB] text-[#1C1B18] border border-[#EAE3D2] transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#0C2340]" />
              <span>project.py</span>
            </button>

            <button
              onClick={downloadProjectZip}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0C2340] hover:bg-[#1A303A] text-white border border-[#0C2340] shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download Project (.zip)</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex space-x-2 border-b border-[#EAE3D2] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveFile('streamlit')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'streamlit'
              ? 'bg-[#0C2340] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#706E66] border border-[#EAE3D2] hover:text-[#1C1B18] hover:bg-[#F7F4EB]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>project.py (Streamlit)</span>
        </button>

        <button
          onClick={() => setActiveFile('py')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'py'
              ? 'bg-[#0C2340] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#706E66] border border-[#EAE3D2] hover:text-[#1C1B18] hover:bg-[#F7F4EB]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>credit_risk.py</span>
        </button>

        <button
          onClick={() => setActiveFile('rubric')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'rubric'
              ? 'bg-[#0C2340] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#706E66] border border-[#EAE3D2] hover:text-[#1C1B18] hover:bg-[#F7F4EB]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Methodology Checklist</span>
        </button>

        <button
          onClick={() => setActiveFile('req')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'req'
              ? 'bg-[#0C2340] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#706E66] border border-[#EAE3D2] hover:text-[#1C1B18] hover:bg-[#F7F4EB]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>requirements.txt</span>
        </button>

        <button
          onClick={() => setActiveFile('readme')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'readme'
              ? 'bg-[#0C2340] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#706E66] border border-[#EAE3D2] hover:text-[#1C1B18] hover:bg-[#F7F4EB]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>README.md</span>
        </button>

        <button
          onClick={() => setActiveFile('github')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeFile === 'github'
              ? 'bg-[#0B6623] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#0B6623] border border-[#0B6623]/30 hover:bg-[#F7F4EB]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>GitHub Pages Guide</span>
        </button>
      </div>

      {/* Tab Content: Streamlit project.py */}
      {activeFile === 'streamlit' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#B27D18] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B6623] inline-block" />
              <span className="text-xs font-mono text-[#706E66] ml-2">Credit_Risk_Project/project.py (Streamlit Application)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(streamlitCode)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#F7F4EB] hover:bg-[#EAE3D2] text-[#1C1B18] border border-[#EAE3D2] transition font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0B6623]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => downloadFile('project.py', streamlitCode)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#0C2340] hover:bg-[#1A303A] text-white font-medium transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download project.py</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#0C2340] overflow-x-auto max-h-[600px] leading-relaxed select-text shadow-inner">
            <pre className="whitespace-pre">
              {streamlitCode || '# Loading project.py source code...'}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Content 1: credit_risk.py */}
      {activeFile === 'py' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#B27D18] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B6623] inline-block" />
              <span className="text-xs font-mono text-[#706E66] ml-2">credit_risk.py (Standalone Engine)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(CREDIT_RISK_PY_CODE)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#F7F4EB] hover:bg-[#EAE3D2] text-[#1C1B18] border border-[#EAE3D2] transition font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0B6623]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => downloadFile('credit_risk.py', CREDIT_RISK_PY_CODE)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#0C2340] hover:bg-[#1A303A] text-white font-medium transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#0C2340] overflow-x-auto max-h-[600px] leading-relaxed select-text shadow-inner">
            <pre className="whitespace-pre">
              {CREDIT_RISK_PY_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Content 2: Technical & Methodological Matrix */}
      {activeFile === 'rubric' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D2]">
            <div>
              <h2 className="text-lg font-bold text-[#1C1B18] flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#0B6623]" />
                <span>Technical & Methodological Verification Matrix</span>
              </h2>
              <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
                Every programmatic concept and econometric standard is explicitly implemented, 
                verified, and documented across the codebase.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#F7F4EB] text-[#0B6623] border border-[#EAE3D2] tabular-nums">
              11 / 11 Standards Verified (100%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RUBRIC_CHECKLIST.map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1C1B18] flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#0B6623] inline-block" />
                    <span>{item.title}</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFFFFF] text-[#0B6623] border border-[#EAE3D2]">
                    {item.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#706E66]">
                  Location: <span className="text-[#1C1B18] font-medium">{item.codeLocation}</span>
                </div>
                <p className="text-xs text-[#1C1B18] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: requirements.txt */}
      {activeFile === 'req' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <span className="text-xs font-mono text-[#706E66]">requirements.txt</span>
            <button
              onClick={() => downloadFile('requirements.txt', REQUIREMENTS_TXT)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#0C2340] hover:bg-[#1A303A] text-white font-medium transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download requirements.txt</span>
            </button>
          </div>

          <div className="bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#0C2340] leading-relaxed shadow-inner">
            <pre className="whitespace-pre">{REQUIREMENTS_TXT}</pre>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] text-xs text-[#1C1B18]">
            <strong className="text-[#0C2340]">Terminal Command to install:</strong>
            <code className="block mt-1 font-mono text-[#0C2340] bg-[#FFFFFF] p-2 rounded border border-[#EAE3D2]">
              pip install -r requirements.txt
            </code>
          </div>
        </div>
      )}

      {/* Tab Content 4: README.md */}
      {activeFile === 'readme' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2]">
            <span className="text-xs font-mono text-[#706E66]">Credit_Risk_Project/README.md</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(README_MD_TEXT)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#F7F4EB] hover:bg-[#EAE3D2] text-[#1C1B18] border border-[#EAE3D2] transition font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0B6623]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
              <button
                onClick={() => downloadFile('README.md', README_MD_TEXT)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#0C2340] hover:bg-[#1A303A] text-white font-medium transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download README.md</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F7F4EB] border border-[#EAE3D2] rounded-xl p-4 font-mono text-xs text-[#0C2340] overflow-x-auto max-h-[600px] leading-relaxed select-text shadow-inner">
            <pre className="whitespace-pre">
              {README_MD_TEXT}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Content 5: GitHub Pages Deployment Guide */}
      {activeFile === 'github' && (
        <div className="bg-[#FFFFFF] border border-[#EAE3D2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D2]">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0B6623] uppercase tracking-wider mb-1">
                <Globe className="w-4 h-4" />
                <span>Zero-Configuration Static Hosting</span>
              </div>
              <h2 className="text-xl font-bold text-[#1C1B18] tracking-tight">
                Deploying to GitHub Pages
              </h2>
              <p className="text-xs text-[#706E66] mt-1 leading-relaxed">
                This project is built with 100% client-side React + Vite and configured with <code className="text-[#0C2340] font-mono bg-[#F7F4EB] px-1 py-0.5 rounded border border-[#EAE3D2]">base: './'</code> for direct, flawless GitHub Pages hosting under any repository name.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#E6F4EA] text-[#0B6623] border border-[#CEEAD6] tabular-nums">
              GitHub Pages Ready ✓
            </span>
          </div>

          {/* Option A: GitHub Actions (Recommended) */}
          <div className="p-5 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0C2340] flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-[#0B6623]" />
                <span>Method 1: Automatic Deployment via GitHub Actions (Zero Configuration)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B6623] text-white">Recommended</span>
            </div>
            <p className="text-xs text-[#706E66] leading-relaxed">
              The repository includes <code className="text-[#0C2340] font-mono bg-white px-1 py-0.5 rounded border border-[#EAE3D2]">.github/workflows/deploy.yml</code>. Whenever you push to <code className="font-mono text-[#0C2340]">main</code>, GitHub automatically runs <code className="font-mono text-[#0C2340]">npm run build</code> and deploys the generated static files.
            </p>
            <div className="bg-white p-3.5 rounded-lg border border-[#EAE3D2] space-y-2 text-xs text-[#1C1B18]">
              <div className="font-semibold text-[#0C2340]">3 Simple Steps:</div>
              <ol className="list-decimal list-inside space-y-1 text-[#706E66] font-mono">
                <li>Create a new repository on GitHub and push this project.</li>
                <li>Go to repository <strong>Settings → Pages</strong>.</li>
                <li>Under <strong>Build and deployment → Source</strong>, select <strong>GitHub Actions</strong>.</li>
              </ol>
              <div className="text-[11px] text-[#0B6623] font-medium pt-1">
                That's it! Your site will be live at <code className="bg-[#F7F4EB] px-1 py-0.5 rounded">https://&lt;your-username&gt;.github.io/&lt;repo-name&gt;/</code> within 60 seconds.
              </div>
            </div>
          </div>

          {/* Option B: Manual gh-pages */}
          <div className="p-5 rounded-xl bg-[#F7F4EB] border border-[#EAE3D2] space-y-3">
            <h3 className="text-sm font-bold text-[#0C2340] flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#0C2340]" />
              <span>Method 2: Deploying via `gh-pages` Branch or CLI</span>
            </h3>
            <p className="text-xs text-[#706E66] leading-relaxed">
              If you prefer deploying built files directly from your terminal:
            </p>
            <div className="bg-[#1C1B18] text-[#F9F6F0] p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1 select-text">
              <p className="text-[#706E66]"># 1. Install dependencies & build</p>
              <p className="text-white">npm install</p>
              <p className="text-white">npm run build</p>
              <br />
              <p className="text-[#706E66]"># 2. Deploy dist folder to gh-pages branch</p>
              <p className="text-white">npx gh-pages -d dist</p>
            </div>
          </div>

          {/* Key Compatibility Guarantees */}
          <div className="p-4 rounded-xl bg-white border border-[#EAE3D2] space-y-2 text-xs text-[#706E66]">
            <strong className="text-[#0C2340]">Built-in GitHub Pages Compatibility Guarantees:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-[#1C1B18]">Relative Asset Paths:</strong> Configured with <code className="font-mono text-[#0C2340]">base: './'</code> so assets load without 404s under any repository subpath.</li>
              <li><strong className="text-[#1C1B18]">Pure Client-Side Architecture:</strong> Zero Node.js or Express runtime required in production.</li>
              <li><strong className="text-[#1C1B18]">Zero Secret Dependencies:</strong> Runs 100% out-of-the-box with no required environment variables or third-party database connections.</li>
              <li><strong className="text-[#1C1B18]">Bundled Static Assets:</strong> Python script and README downloads generate entirely in the browser using client-side JSZip.</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
