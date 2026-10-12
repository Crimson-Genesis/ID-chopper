import React from 'react';
import { ShieldCheck, Cpu, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfo }) => {
  return (
    <header className="border-b border-zinc-800 bg-black/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-lg">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">
                CardPrint Studio
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                100% Client-Side
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Indian ID Card Cropper and Print-Ready Generator
            </p>
          </div>
        </div>

        {/* Security & Supported IDs Pill */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>100% Private (No Server Upload)</span>
          </div>

          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
              title="Official Portals & ID Specifications"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Supported IDs</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
