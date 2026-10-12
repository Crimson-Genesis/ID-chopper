import React, { useRef, useEffect } from 'react';
import { AppFile, CropBox, CardPreset, CachedCropItem, FilterSettings } from '../../types/card';
import { Download, CreditCard, Sparkles, FileText, Loader2 } from 'lucide-react';

interface SideBySideCropPreviewProps {
  activeFile: AppFile | null;
  frontBox: CropBox | null;
  backBox: CropBox | null;
  cachedFront: CachedCropItem | null;
  cachedBack: CachedCropItem | null;
  filters: FilterSettings;
  hasBackSide: boolean;
  selectedPreset: CardPreset;
  onDownloadPng: (target: 'front' | 'back') => void;
  isSavingFront: boolean;
  isSavingBack: boolean;
  cardAspectRatio?: number;
}

interface PreviewCardProps {
  title: string;
  dotColor: string;
  isFront: boolean;
  activeFile: AppFile | null;
  activeBox: CropBox | null;
  cachedCrop: CachedCropItem | null;
  filters: FilterSettings;
  selectedPreset: CardPreset;
  onDownload: () => void;
  isSaving: boolean;
  cardAspectRatio?: number;
}

const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  dotColor,
  isFront,
  activeFile,
  activeBox,
  cachedCrop,
  filters,
  selectedPreset,
  onDownload,
  isSaving,
  cardAspectRatio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if there is an active crop box on the current file
  const isLive = Boolean(activeBox && activeFile && activeBox.fileId === activeFile.id);
  const sourcePage = isLive && activeFile && activeBox
    ? activeFile.pages.find((p) => p.pageNumber === activeBox.pageNumber) || activeFile.pages[0]
    : null;

  // Real-time canvas render directly from page coordinates (GPU-accelerated, zero lag)
  useEffect(() => {
    if (!isLive || !sourcePage || !activeBox || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const sx = (activeBox.x / 100) * sourcePage.width;
    const sy = (activeBox.y / 100) * sourcePage.height;
    const sw = Math.max(1, (activeBox.width / 100) * sourcePage.width);
    const sh = Math.max(1, (activeBox.height / 100) * sourcePage.height);

    if (canvas.width !== Math.round(sw) || canvas.height !== Math.round(sh)) {
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sourcePage.canvas, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    }
  }, [
    isLive, 
    sourcePage, 
    activeBox?.x, 
    activeBox?.y, 
    activeBox?.width, 
    activeBox?.height
  ]);

  const hasCrop = isLive || cachedCrop !== null;

  const filterStyle: React.CSSProperties = {
    filter: `brightness(${100 + filters.brightness}%) contrast(${100 + filters.contrast}%) ${
      filters.mode === 'grayscale' ? 'grayscale(100%)' : ''
    }`,
  };

  const effectiveRatio = cardAspectRatio 
    ? cardAspectRatio 
    : isLive && sourcePage && activeBox
    ? (activeBox.width * sourcePage.width) / Math.max(1, activeBox.height * sourcePage.height)
    : cachedCrop?.canvas
    ? cachedCrop.canvas.width / cachedCrop.canvas.height
    : selectedPreset.dimensions.widthMm / selectedPreset.dimensions.heightMm;

  return (
    <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 flex flex-col items-center space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${dotColor} inline-block`} />
          <span>{title}</span>
        </span>

        {isSaving ? (
          <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1.5 truncate max-w-[220px]">
            <FileText className="w-3 h-3 text-zinc-500 flex-shrink-0" />
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-sans uppercase font-bold tracking-wider animate-pulse flex items-center">
              <Loader2 className="w-2.5 h-2.5 animate-spin mr-1 text-white" />
              Saving
            </span>
          </span>
        ) : isLive && activeFile && activeBox ? (
          <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1.5 truncate max-w-[220px]">
            <FileText className="w-3 h-3 text-zinc-500 flex-shrink-0" />
            <span className="truncate">{activeFile.name} (P{activeBox.pageNumber})</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 font-sans uppercase font-bold tracking-wider">
              Live
            </span>
          </span>
        ) : cachedCrop ? (
          <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1.5 truncate max-w-[220px]">
            <FileText className="w-3 h-3 text-zinc-500 flex-shrink-0" />
            <span className="truncate">{cachedCrop.fileName} (P{cachedCrop.pageNumber})</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans uppercase font-bold tracking-wider">
              Cached
            </span>
          </span>
        ) : null}
      </div>

      {/* Card Aspect Container */}
      <div 
        style={{ aspectRatio: `${effectiveRatio}` }}
        className="relative w-full rounded-xl overflow-hidden shadow-xl border border-zinc-700 bg-zinc-950 flex items-center justify-center p-1"
      >
        {isLive ? (
          <canvas
            ref={canvasRef}
            style={filterStyle}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : cachedCrop ? (
          <img
            src={cachedCrop.dataUrl}
            style={filterStyle}
            alt={`${title} Preview`}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-xs text-zinc-600 font-medium text-center p-4">
            No {title} selected.<br />
            <span className="text-[11px] text-zinc-500">
              Position crop box and click "Select {isFront ? 'Front' : 'Back'}"
            </span>
          </div>
        )}

        {/* Smooth Non-blocking Saving Animation Overlay */}
        {isSaving && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-2 p-3 transition-all duration-200">
            <div className="p-2 rounded-full bg-zinc-900 border border-zinc-750 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold text-white tracking-wide block">
                Saving to Cache
              </span>
              <span className="text-[10px] text-zinc-400 font-mono block">
                Background processing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Download Action */}
      <button
        onClick={onDownload}
        disabled={!hasCrop || isSaving}
        className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 text-xs font-medium border border-zinc-800 transition-colors flex items-center justify-center space-x-1.5"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download {isFront ? 'Front' : 'Back'} PNG</span>
          </>
        )}
      </button>
    </div>
  );
};

export const SideBySideCropPreview: React.FC<SideBySideCropPreviewProps> = ({
  activeFile,
  frontBox,
  backBox,
  cachedFront,
  cachedBack,
  filters,
  hasBackSide,
  selectedPreset,
  onDownloadPng,
  isSavingFront,
  isSavingBack,
  cardAspectRatio,
}) => {
  const dynamicHeightMm = cardAspectRatio
    ? (selectedPreset.dimensions.widthMm / cardAspectRatio).toFixed(1)
    : selectedPreset.dimensions.heightMm;

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-white" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Live Crop Preview (Side by Side)
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
          <Sparkles className="w-3 h-3 text-white" />
          <span>{selectedPreset.dimensions.widthMm} x {dynamicHeightMm} mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Front Card Preview */}
        <PreviewCard
          title="Front Card"
          dotColor="bg-white"
          isFront={true}
          activeFile={activeFile}
          activeBox={frontBox}
          cachedCrop={cachedFront}
          filters={filters}
          selectedPreset={selectedPreset}
          onDownload={() => onDownloadPng('front')}
          isSaving={isSavingFront}
          cardAspectRatio={cardAspectRatio}
        />

        {/* Back Card Preview */}
        {hasBackSide ? (
          <PreviewCard
            title="Back Card"
            dotColor="bg-zinc-400"
            isFront={false}
            activeFile={activeFile}
            activeBox={backBox}
            cachedCrop={cachedBack}
            filters={filters}
            selectedPreset={selectedPreset}
            onDownload={() => onDownloadPng('back')}
            isSaving={isSavingBack}
            cardAspectRatio={cardAspectRatio}
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-black/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-6 text-xs text-zinc-500 space-y-2">
            <CreditCard className="w-6 h-6 text-zinc-700" />
            <p>Single side mode active.</p>
            <p className="text-[11px] text-zinc-600">
              Enable Dual Sides in sidebar to crop both Front & Back.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
