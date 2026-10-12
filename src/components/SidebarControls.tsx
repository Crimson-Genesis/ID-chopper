import React, { useRef } from 'react';
import { 
  AppFile, 
  CardPreset, 
  FilterSettings, 
  PrintLayoutFormat 
} from '../types/card';
import { CARD_PRESETS, CUSTOM_CARD_PRESET } from '../constants/cardPresets';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Printer, 
  Lock, 
  Unlock, 
  Sliders, 
  ChevronDown, 
  Layers, 
  Trash2, 
  Loader2,
  FolderOpen,
  Plus
} from 'lucide-react';

interface SidebarControlsProps {
  files: AppFile[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onAddFiles: (files: File[]) => void;
  isLoadingFile: boolean;
  selectedPreset: CardPreset;
  onSelectPreset: (preset: CardPreset) => void;
  onUpdateCustomPreset: (preset: CardPreset) => void;
  hasBackSide: boolean;
  onHasBackSideChange: (hasBack: boolean) => void;
  lockRatio: boolean;
  onToggleLockRatio: () => void;
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
  selectedFormat: PrintLayoutFormat;
  onFormatChange: (format: PrintLayoutFormat) => void;
  onExportPdf: () => void;
  onBrowserPrint: () => void;
  isGeneratingPdf: boolean;
  frontCropFileId?: string;
  backCropFileId?: string;
  hasFrontCrop: boolean;
  hasBackCrop: boolean;
}

const PRINT_FORMATS: { id: PrintLayoutFormat; title: string; desc: string }[] = [
  { id: 'lamination_pouch', title: 'Lamination Pouch', desc: 'Front & Back side-by-side on A4' },
  { id: 'photo_4x6', title: '4x6" Photo Paper', desc: 'Glossy photo paper studio format' },
  { id: 'a4_5card', title: 'A4 5-Card Sheet', desc: 'Cyber cafe bulk batch grid' },
  { id: 'pvc_cr80', title: 'PVC Direct (CR80)', desc: '85.6 x 54 mm direct card printer' },
];

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onRemoveFile,
  onAddFiles,
  isLoadingFile,
  selectedPreset,
  onSelectPreset,
  onUpdateCustomPreset,
  hasBackSide,
  onHasBackSideChange,
  lockRatio,
  onToggleLockRatio,
  filters,
  onFiltersChange,
  selectedFormat,
  onFormatChange,
  onExportPdf,
  onBrowserPrint,
  isGeneratingPdf,
  frontCropFileId,
  backCropFileId,
  hasFrontCrop,
  hasBackCrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const hasCrops = hasFrontCrop || (hasBackSide && hasBackCrop);

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-black border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-5 overflow-y-auto max-h-none md:max-h-[calc(100vh-4rem)] flex-shrink-0 font-sans">
      {/* 1. Files & Documents Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-white" />
            <span>Files & Documents</span>
          </label>
          <span className="text-[10px] font-mono text-zinc-500">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload / Add Files Drop Button */}
        <div
          onClick={() => !isLoadingFile && fileInputRef.current?.click()}
          className="p-3.5 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/80 hover:bg-zinc-900/50 text-center cursor-pointer transition-all flex items-center justify-center space-x-2 group"
        >
          {isLoadingFile ? (
            <div className="flex items-center space-x-2 text-zinc-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Loading File(s)...</span>
            </div>
          ) : (
            <>
              <div className="p-1.5 rounded-lg bg-zinc-900 text-white border border-zinc-800 group-hover:scale-105 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Add Files (PDF or Images)</p>
                <p className="text-[10px] text-zinc-500">Select any PDF or scan images</p>
              </div>
            </>
          )}
        </div>

        {/* Loaded Files List (Half-page height) */}
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-[48vh] min-h-[220px] overflow-y-auto pr-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-2">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              const hasFront = frontCropFileId === file.id;
              const hasBack = backCropFileId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/10'
                      : 'bg-zinc-950/90 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}>
                      {file.type === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-[150px]">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-mono">
                        <span>{file.type === 'pdf' ? `${file.numPages} pgs` : 'Image'}</span>
                        {hasFront && (
                          <span className="px-1 rounded bg-white text-black font-sans font-bold text-[9px]">
                            Front
                          </span>
                        )}
                        {hasBack && (
                          <span className="px-1 rounded bg-zinc-700 text-zinc-200 font-sans font-bold text-[9px]">
                            Back
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="p-1 rounded text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Card Presets & Dimensions */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Card Preset & Dimensions
        </label>
        
        <div className="relative">
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const preset = CARD_PRESETS.find((p) => p.id === e.target.value) || CUSTOM_CARD_PRESET;
              onSelectPreset(preset);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-white"
          >
            <option value="custom_card">Custom / Other Card Format</option>
            <optgroup label="Official Indian ID Cards">
              {CARD_PRESETS.filter((p) => !p.isCustom).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Custom Card Controls if Custom Mode */}
        {selectedPreset.isCustom && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 block font-medium">Custom Card Name:</span>
              <input
                type="text"
                value={selectedPreset.name}
                onChange={(e) =>
                  onUpdateCustomPreset({
                    ...selectedPreset,
                    name: e.target.value,
                    shortName: e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500">Width (mm):</span>
                <input
                  type="number"
                  value={selectedPreset.dimensions.widthMm}
                  onChange={(e) =>
                    onUpdateCustomPreset({
                      ...selectedPreset,
                      dimensions: {
                        ...selectedPreset.dimensions,
                        widthMm: parseFloat(e.target.value) || 85.6,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500">Height (mm):</span>
                <input
                  type="number"
                  value={selectedPreset.dimensions.heightMm}
                  onChange={(e) =>
                    onUpdateCustomPreset({
                      ...selectedPreset,
                      dimensions: {
                        ...selectedPreset.dimensions,
                        heightMm: parseFloat(e.target.value) || 53.98,
                      },
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Crop Settings: Dual Side Toggle & Aspect Lock */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Crop Options
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onHasBackSideChange(!hasBackSide)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
              hasBackSide
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            {hasBackSide ? 'Dual Sides (F+B)' : 'Front Only'}
          </button>

          <button
            onClick={onToggleLockRatio}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1 transition-colors ${
              lockRatio
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            {lockRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{lockRatio ? 'Ratio Locked' : 'Freeform'}</span>
          </button>
        </div>
      </div>

      {/* 4. Image Enhancements (Monochrome Sliders) */}
      <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>Image Enhancements</span>
          </label>
          <button
            onClick={() => onFiltersChange({ brightness: 0, contrast: 0, sharpness: 0, mode: 'color' })}
            className="text-[10px] text-zinc-500 hover:text-white"
          >
            Reset
          </button>
        </div>

        {/* Color Mode Tabs */}
        <div className="grid grid-cols-3 gap-1">
          {(['color', 'clean-scan', 'grayscale'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onFiltersChange({ ...filters, mode })}
              className={`py-1 rounded text-[10px] font-medium border transition-colors ${
                filters.mode === mode
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {mode === 'color' ? 'Normal' : mode === 'clean-scan' ? 'Clean Scan' : 'B&W'}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="space-y-2 pt-1">
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Brightness</span>
              <span className="font-mono text-white">{filters.brightness}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={filters.brightness}
              onChange={(e) => onFiltersChange({ ...filters, brightness: parseInt(e.target.value, 10) })}
              className="w-full accent-white bg-zinc-900 h-1 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Contrast</span>
              <span className="font-mono text-white">{filters.contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={filters.contrast}
              onChange={(e) => onFiltersChange({ ...filters, contrast: parseInt(e.target.value, 10) })}
              className="w-full accent-white bg-zinc-900 h-1 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Sharpen Text & QR</span>
              <span className="font-mono text-white">{filters.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.sharpness}
              onChange={(e) => onFiltersChange({ ...filters, sharpness: parseInt(e.target.value, 10) })}
              className="w-full accent-white bg-zinc-900 h-1 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Print Format Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-white" />
          <span>Print Layout Format</span>
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {PRINT_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => onFormatChange(fmt.id)}
              className={`p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                selectedFormat === fmt.id
                  ? 'bg-zinc-900 text-white border-white shadow-sm ring-1 ring-white/20'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-xs font-semibold block text-white">{fmt.title}</span>
                <span className="text-[10px] text-zinc-500">{fmt.desc}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                {fmt.id === 'pvc_cr80' ? 'CR80' : fmt.id === 'photo_4x6' ? '4x6"' : 'A4'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Export Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <button
          onClick={onExportPdf}
          disabled={!hasCrops || isGeneratingPdf}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Download className="w-4 h-4 text-black" />
          )}
          <span>Save PDF</span>
        </button>

        <button
          onClick={onBrowserPrint}
          disabled={!hasCrops || isGeneratingPdf}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs border border-zinc-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
        >
          <Printer className="w-4 h-4 text-zinc-400" />
          <span>Print Directly</span>
        </button>
      </div>
    </aside>
  );
};
