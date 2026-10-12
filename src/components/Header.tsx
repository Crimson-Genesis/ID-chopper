import React from 'react';
import { ShieldCheck, Cpu, Sparkles, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfo }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">
                CardPrint Studio
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Indian ID Card Cropper and Print-Ready PDF Generator
            </p>
          </div>
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Zero Server Uploads | 100% Offline Private</span>
          </div>

          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
              title="Official Portals & ID Specifications"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Supported IDs</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 border-l border-slate-800 pl-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">ISO CR80 Standard</span>
          </div>
        </div>
      </div>
    </header>
  );
};
