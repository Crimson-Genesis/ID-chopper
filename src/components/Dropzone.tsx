import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Loader2, ArrowRight, Files } from 'lucide-react';
import { CARD_PRESETS } from '../constants/cardPresets';
import { CardPreset } from '../types/card';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSpecimen: (specimenFileName: string, preset: CardPreset) => void;
  isLoading: boolean;
  loadingProgress?: number;
  loadingMessage?: string;
  selectedPreset: CardPreset;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onLoadSpecimen,
  isLoading,
  loadingProgress,
  loadingMessage,
  selectedPreset,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/10 scale-[1.005]'
            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {loadingMessage || 'Processing Document Client-Side...'}
              </p>
              <p className="text-xs text-slate-400">
                Rendering vector pages to high-resolution canvas in browser
              </p>
            </div>
            {typeof loadingProgress === 'number' && (
              <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-sky-500/20 text-teal-400 border border-teal-500/30">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Drop your official {selectedPreset.shortName} files here
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Supports multi-page A4 PDFs, single documents, or multiple separate photos (e.g. Front and Back card photos).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>Multi-Page PDF</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                <Files className="w-3.5 h-3.5 text-blue-400" />
                <span>Multiple Images (Front + Back)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs border border-teal-500/20 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Auto-detect Bounding Box</span>
              </span>
            </div>

            <button
              type="button"
              className="mt-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-900/30 transition-all inline-flex items-center space-x-2"
            >
              <span>Browse Device Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Test with Synthetic Specimen Cards */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instant Testing: Load Official Specimen Sheets
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Fictional dummy test data (zero PII)
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Click any preset below to immediately load a full-sheet A4 specimen document and test the crop and print pipeline:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {CARD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadSpecimen(preset.sampleFileName, preset)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <span className="text-xs font-medium text-slate-300 group-hover:text-teal-300 line-clamp-1">
                {preset.shortName}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                Load Demo
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
