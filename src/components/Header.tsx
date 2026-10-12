import React from 'react';
import { Cpu, FileText } from 'lucide-react';

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
            </div>
            <p className="text-[11px] text-zinc-400">
              Indian ID Card Cropper and Print-Ready Generator
            </p>
          </div>
        </div>

        {/* Supported IDs Pill */}
        <div className="flex items-center space-x-3">
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
