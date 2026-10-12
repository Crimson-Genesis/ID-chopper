import React from 'react';
import { CardPreset, CachedCropItem } from '../../types/card';
import { Download, CreditCard, Sparkles, FileText } from 'lucide-react';

interface SideBySideCropPreviewProps {
  frontCrop: CachedCropItem | null;
  backCrop: CachedCropItem | null;
  hasBackSide: boolean;
  selectedPreset: CardPreset;
  onDownloadPng: (target: 'front' | 'back') => void;
}

export const SideBySideCropPreview: React.FC<SideBySideCropPreviewProps> = ({
  frontCrop,
  backCrop,
  hasBackSide,
  selectedPreset,
  onDownloadPng,
}) => {
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
          <span>{selectedPreset.dimensions.widthMm} x {selectedPreset.dimensions.heightMm} mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Front Card Preview */}
        <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span>Front Card</span>
            </span>
            {frontCrop && (
              <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1 truncate max-w-[200px]">
                <FileText className="w-3 h-3 text-zinc-500" />
                <span className="truncate">{frontCrop.fileName} (P{frontCrop.pageNumber})</span>
              </span>
            )}
          </div>

          <div className="w-full aspect-[85.6/53.98] rounded-xl overflow-hidden shadow-xl border border-zinc-700 bg-zinc-950 flex items-center justify-center p-1">
            {frontCrop ? (
              <img
                src={frontCrop.dataUrl}
                alt="Front Card Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-xs text-zinc-600 font-medium text-center p-4">
                No Front Crop selected.<br />
                <span className="text-[11px] text-zinc-500">Open a file and click "Select Front"</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onDownloadPng('front')}
            disabled={!frontCrop}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 text-xs font-medium border border-zinc-800 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Front PNG</span>
          </button>
        </div>

        {/* Back Card Preview */}
        {hasBackSide ? (
          <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                <span>Back Card</span>
              </span>
              {backCrop && (
                <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1 truncate max-w-[200px]">
                  <FileText className="w-3 h-3 text-zinc-500" />
                  <span className="truncate">{backCrop.fileName} (P{backCrop.pageNumber})</span>
                </span>
              )}
            </div>

            <div className="w-full aspect-[85.6/53.98] rounded-xl overflow-hidden shadow-xl border border-zinc-700 bg-zinc-950 flex items-center justify-center p-1">
              {backCrop ? (
                <img
                  src={backCrop.dataUrl}
                  alt="Back Card Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-zinc-600 font-medium text-center p-4">
                  No Back Crop selected.<br />
                  <span className="text-[11px] text-zinc-500">Open a file and click "Select Back"</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onDownloadPng('back')}
              disabled={!backCrop}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 text-xs font-medium border border-zinc-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Back PNG</span>
            </button>
          </div>
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
