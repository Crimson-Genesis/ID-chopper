import React, { useRef, useState, useEffect } from 'react';
import { RenderedPage, CropBox, CardPreset } from '../../types/card';
import { 
  ArrowLeftRight, 
  RotateCcw, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight,
  Sliders,
  Move
} from 'lucide-react';

interface CropCanvasProps {
  pages: RenderedPage[];
  activePageNum: number;
  onSelectPage: (pageNum: number) => void;
  frontBox: CropBox;
  backBox: CropBox;
  hasBackSide: boolean;
  onFrontBoxChange: (box: CropBox) => void;
  onBackBoxChange: (box: CropBox) => void;
  onHasBackSideChange: (hasBack: boolean) => void;
  selectedPreset: CardPreset;
  onResetToPreset: () => void;
  onUpdatePresetDimensions?: (widthMm: number, heightMm: number) => void;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'move' | null;

const ASPECT_PRESETS = [
  { label: 'CR80 ID (85.6 x 54 mm)', ratio: 85.6 / 53.98, wMm: 85.6, hMm: 53.98 },
  { label: 'Visiting Card (90 x 50 mm)', ratio: 90 / 50, wMm: 90, hMm: 50 },
  { label: 'Square Pass (60 x 60 mm)', ratio: 1.0, wMm: 60, hMm: 60 },
  { label: 'Doc Slip (100 x 70 mm)', ratio: 100 / 70, wMm: 100, hMm: 70 },
];

export const CropCanvas: React.FC<CropCanvasProps> = ({
  pages,
  activePageNum,
  onSelectPage,
  frontBox,
  backBox,
  hasBackSide,
  onFrontBoxChange,
  onBackBoxChange,
  onHasBackSideChange,
  selectedPreset,
  onResetToPreset,
  onUpdatePresetDimensions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [activeAspectPreset, setActiveAspectPreset] = useState<number>(0);

  // Drag interaction state
  const [dragState, setDragState] = useState<{
    target: 'front' | 'back';
    handle: HandleType;
    startX: number;
    startY: number;
    origBox: CropBox;
  } | null>(null);

  const activePage = pages.find((p) => p.pageNumber === activePageNum) || pages[0];

  // Draw the current page on the background canvas
  useEffect(() => {
    if (!canvasRef.current || !activePage) return;
    const canvas = canvasRef.current;
    canvas.width = activePage.width;
    canvas.height = activePage.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(activePage.canvas, 0, 0);
    }
  }, [activePage]);

  // Handle swapping front and back boxes
  const handleSwapBoxes = () => {
    const temp = { ...frontBox };
    onFrontBoxChange({ ...backBox });
    onBackBoxChange({ ...temp });
  };

  // Change Aspect Ratio Preset
  const handleApplyAspectPreset = (idx: number) => {
    setActiveAspectPreset(idx);
    setLockRatio(true);
    const preset = ASPECT_PRESETS[idx];
    if (onUpdatePresetDimensions) {
      onUpdatePresetDimensions(preset.wMm, preset.hMm);
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const containerRatio = rect.width / rect.height;
      const targetPercentRatio = preset.ratio / containerRatio;

      if (activeSide === 'front') {
        const newH = Math.min(100 - frontBox.y, frontBox.width / targetPercentRatio);
        onFrontBoxChange({ ...frontBox, height: newH });
      } else {
        const newH = Math.min(100 - backBox.y, backBox.width / targetPercentRatio);
        onBackBoxChange({ ...backBox, height: newH });
      }
    }
  };

  // Pointer Down Handler
  const handlePointerDown = (
    e: React.PointerEvent,
    target: 'front' | 'back',
    handle: HandleType
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveSide(target);

    const box = target === 'front' ? frontBox : backBox;
    setDragState({
      target,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origBox: { ...box },
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragState.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragState.startY) / rect.height) * 100;

      const { target, handle, origBox } = dragState;
      let newBox = { ...origBox };

      const activeRatio = ASPECT_PRESETS[activeAspectPreset]?.ratio || (85.6 / 53.98);
      const containerRatio = rect.width / rect.height;
      const targetPercentRatio = activeRatio / containerRatio;

      if (handle === 'move') {
        newBox.x = Math.max(0, Math.min(100 - newBox.width, origBox.x + dx));
        newBox.y = Math.max(0, Math.min(100 - newBox.height, origBox.y + dy));
      } else if (handle) {
        let newW = origBox.width;
        let newH = origBox.height;
        let newX = origBox.x;
        let newY = origBox.y;

        if (handle.includes('e')) {
          newW = Math.max(5, origBox.width + dx);
          if (lockRatio) {
            newH = newW / targetPercentRatio;
          }
        }
        if (handle.includes('w')) {
          const maxLeft = origBox.x + origBox.width - 5;
          newX = Math.min(maxLeft, Math.max(0, origBox.x + dx));
          newW = origBox.width - (newX - origBox.x);
          if (lockRatio) {
            newH = newW / targetPercentRatio;
          }
        }
        if (handle.includes('s') && !lockRatio) {
          newH = Math.max(5, origBox.height + dy);
        }
        if (handle.includes('n') && !lockRatio) {
          const maxTop = origBox.y + origBox.height - 5;
          newY = Math.min(maxTop, Math.max(0, origBox.y + dy));
          newH = origBox.height - (newY - origBox.y);
        }

        // Clamp boundaries
        newW = Math.min(100 - newX, newW);
        newH = Math.min(100 - newY, newH);

        newBox = {
          ...origBox,
          x: newX,
          y: newY,
          width: newW,
          height: newH,
        };
      }

      if (target === 'front') {
        onFrontBoxChange(newBox);
      } else {
        onBackBoxChange(newBox);
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, lockRatio, activeAspectPreset, onFrontBoxChange, onBackBoxChange]);

  const renderCropBoxOverlay = (
    box: CropBox,
    target: 'front' | 'back',
    isShownOnThisPage: boolean
  ) => {
    if (!isShownOnThisPage) return null;

    const isFront = target === 'front';
    const isSelected = activeSide === target;
    const borderColor = isFront ? 'border-sky-500' : 'border-emerald-500';
    const bgBadge = isFront ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white';
    const handleColor = isFront ? 'bg-sky-400' : 'bg-emerald-400';

    return (
      <div
        key={target}
        style={{
          left: `${box.x}%`,
          top: `${box.y}%`,
          width: `${box.width}%`,
          height: `${box.height}%`,
        }}
        className={`absolute border-2 ${borderColor} shadow-2xl cursor-move transition-shadow ${
          isSelected ? 'ring-2 ring-white/50 shadow-cyan-500/30' : 'opacity-90'
        }`}
        onPointerDown={(e) => handlePointerDown(e, target, 'move')}
      >
        {/* Label Badge */}
        <div
          className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center space-x-1 ${bgBadge}`}
        >
          <span>{isFront ? 'Front Card' : 'Back Card'}</span>
          <span className="text-[9px] opacity-80">
            {lockRatio ? `(${ASPECT_PRESETS[activeAspectPreset]?.label.split(' ')[0]})` : '(Freeform)'}
          </span>
        </div>

        {/* Dimension indicator on bottom */}
        <div className="absolute -bottom-6 right-0 px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 text-[10px] font-mono border border-slate-700">
          {selectedPreset.dimensions.widthMm} x {selectedPreset.dimensions.heightMm} mm
        </div>

        {/* 8 Resize Handles */}
        {(['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'] as HandleType[]).map((handle) => {
          let posClass = '';
          let cursorClass = '';

          switch (handle) {
            case 'nw':
              posClass = '-top-2 -left-2';
              cursorClass = 'cursor-nwse-resize';
              break;
            case 'ne':
              posClass = '-top-2 -right-2';
              cursorClass = 'cursor-nesw-resize';
              break;
            case 'se':
              posClass = '-bottom-2 -right-2';
              cursorClass = 'cursor-nwse-resize';
              break;
            case 'sw':
              posClass = '-bottom-2 -left-2';
              cursorClass = 'cursor-nesw-resize';
              break;
            case 'n':
              posClass = '-top-2 left-1/2 -translate-x-1/2';
              cursorClass = 'cursor-ns-resize';
              break;
            case 's':
              posClass = '-bottom-2 left-1/2 -translate-x-1/2';
              cursorClass = 'cursor-ns-resize';
              break;
            case 'w':
              posClass = 'top-1/2 -left-2 -translate-y-1/2';
              cursorClass = 'cursor-ew-resize';
              break;
            case 'e':
              posClass = 'top-1/2 -right-2 -translate-y-1/2';
              cursorClass = 'cursor-ew-resize';
              break;
          }

          return (
            <div
              key={handle}
              className={`absolute w-3.5 h-3.5 rounded-full border border-white ${handleColor} ${posClass} ${cursorClass} shadow-md z-20`}
              onPointerDown={(e) => handlePointerDown(e, target, handle)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Multi-page navigation */}
        {pages.length > 1 ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Viewing Page:</span>
            <button
              onClick={() => onSelectPage(Math.max(1, activePageNum - 1))}
              disabled={activePageNum === 1}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2">
              {activePageNum} of {pages.length}
            </span>
            <button
              onClick={() => onSelectPage(Math.min(pages.length, activePageNum + 1))}
              disabled={activePageNum === pages.length}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Move className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Crop Canvas</span>
          </div>
        )}

        {/* Ratio Preset Picker */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {ASPECT_PRESETS.map((ap, idx) => (
            <button
              key={ap.label}
              onClick={() => handleApplyAspectPreset(idx)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                lockRatio && activeAspectPreset === idx
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-300'
              }`}
            >
              {ap.label.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={() => setLockRatio(!lockRatio)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              !lockRatio
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Freeform unlocked mode"
          >
            {lockRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>Freeform</span>
          </button>
        </div>

        {/* Controls: Swap, Dual-Side Toggle, Reset */}
        <div className="flex items-center space-x-2">
          {hasBackSide && (
            <button
              onClick={handleSwapBoxes}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
              title="Swap Front and Back crop areas"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap Sides</span>
            </button>
          )}

          <button
            onClick={() => onHasBackSideChange(!hasBackSide)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hasBackSide
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>{hasBackSide ? 'Dual Sides' : 'Front Only'}</span>
          </button>

          <button
            onClick={onResetToPreset}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            title="Reset crop boxes to preset coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Crop Viewport */}
      <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2 sm:p-4 min-h-[480px]">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[75vh] shadow-2xl select-none"
        >
          {/* Background rendered document canvas */}
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-[75vh] h-auto w-auto rounded-lg border border-slate-800"
          />

          {/* Overlays: Front & Back crop boxes */}
          {renderCropBoxOverlay(
            frontBox,
            'front',
            frontBox.pageNumber === activePageNum
          )}

          {hasBackSide &&
            renderCropBoxOverlay(
              backBox,
              'back',
              backBox.pageNumber === activePageNum
            )}
        </div>
      </div>

      {/* Guide Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 px-2 gap-2">
        <div className="flex items-center space-x-2">
          {frontBox.pageNumber === activePageNum && (
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span>Front Box (Page {frontBox.pageNumber})</span>
            </span>
          )}
          {hasBackSide && backBox.pageNumber === activePageNum && (
            <span className="flex items-center space-x-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Back Box (Page {backBox.pageNumber})</span>
            </span>
          )}
          {frontBox.pageNumber !== activePageNum && (!hasBackSide || backBox.pageNumber !== activePageNum) && (
            <span className="text-amber-400 text-[11px]">
              No crop box currently assigned to Page {activePageNum}. Use the page buttons below to assign Front or Back to this page.
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 flex items-center space-x-1">
          <Sliders className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {selectedPreset.isCustom
              ? 'Custom Mode: Move and resize the boxes freely to capture any card size.'
              : 'Move boxes or drag handles to adjust. Click Freeform for custom dimensions.'}
          </span>
        </p>
      </div>
    </div>
  );
};
