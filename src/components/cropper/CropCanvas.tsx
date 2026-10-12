import React, { useRef, useState, useEffect } from 'react';
import { AppFile, CropBox, CardPreset } from '../../types/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  PlusCircle, 
  CheckCircle2
} from 'lucide-react';

interface CropCanvasProps {
  activeFile: AppFile;
  activePageNum: number;
  onSelectPage: (pageNum: number) => void;
  frontBox: CropBox | null;
  backBox: CropBox | null;
  hasBackSide: boolean;
  onCropBoxResize?: (
    target: 'front' | 'back',
    newBox: CropBox,
    oppositeBox: CropBox | null
  ) => void;
  onFrontBoxChange: (box: CropBox) => void;
  onBackBoxChange: (box: CropBox) => void;
  onSelectFront: () => void;
  onSelectBack: () => void;
  onClearCrops: () => void;
  selectedPreset: CardPreset;
  lockRatio: boolean;
  hasAnyCrops: boolean;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'move' | null;

export const CropCanvas: React.FC<CropCanvasProps> = ({
  activeFile,
  activePageNum,
  onSelectPage,
  frontBox,
  backBox,
  hasBackSide,
  onCropBoxResize,
  onFrontBoxChange,
  onBackBoxChange,
  onSelectFront,
  onSelectBack,
  onClearCrops,
  selectedPreset,
  lockRatio,
  hasAnyCrops,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag interaction state
  const [dragState, setDragState] = useState<{
    target: 'front' | 'back';
    handle: HandleType;
    startX: number;
    startY: number;
    origBox: CropBox;
    origOppositeBox: CropBox | null;
  } | null>(null);

  const isFrontOnCurrentPage = 
    frontBox !== null && 
    frontBox.fileId === activeFile.id && 
    frontBox.pageNumber === activePageNum;

  const isBackOnCurrentPage = 
    backBox !== null && 
    hasBackSide &&
    backBox.fileId === activeFile.id && 
    backBox.pageNumber === activePageNum;

  const activePage = activeFile.pages.find((p) => p.pageNumber === activePageNum) || activeFile.pages[0];

  // Draw current page on the canvas
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

  // PDF Single-Scroll Gravity Lock: Exactly 1 scroll event changes 1 page
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || activeFile.type !== 'pdf' || activeFile.numPages <= 1) return;

    let isScrollLocked = false;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollLocked) return;

      if (e.deltaY > 15) {
        if (activePageNum < activeFile.numPages) {
          isScrollLocked = true;
          onSelectPage(activePageNum + 1);
          setTimeout(() => {
            isScrollLocked = false;
          }, 350);
        }
      } else if (e.deltaY < -15) {
        if (activePageNum > 1) {
          isScrollLocked = true;
          onSelectPage(activePageNum - 1);
          setTimeout(() => {
            isScrollLocked = false;
          }, 350);
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [activeFile, activePageNum, onSelectPage]);

  // Pointer Down Handler
  const handlePointerDown = (
    e: React.PointerEvent,
    target: 'front' | 'back',
    handle: HandleType
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const box = target === 'front' ? frontBox : backBox;
    const oppositeBox = target === 'front' ? backBox : frontBox;
    if (!box) return;

    setDragState({
      target,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origBox: { ...box },
      origOppositeBox: oppositeBox ? { ...oppositeBox } : null,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragState.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragState.startY) / rect.height) * 100;

      const { target, handle, origBox, origOppositeBox } = dragState;
      const minSize = 3; // minimum 3% width and height

      const origLeft = origBox.x;
      const origTop = origBox.y;
      const origRight = origBox.x + origBox.width;
      const origBottom = origBox.y + origBox.height;

      let newBox: CropBox = { ...origBox };
      let newOppositeBox: CropBox | null = null;

      if (handle === 'move') {
        const newX = Math.max(0, Math.min(100 - origBox.width, origLeft + dx));
        const newY = Math.max(0, Math.min(100 - origBox.height, origTop + dy));
        newBox = {
          ...origBox,
          x: newX,
          y: newY,
        };
      } else if (handle) {
        if (!lockRatio) {
          // Freeform Resizing: Direct 1:1 exact pointer tracking for all 8 handles
          let newLeft = origLeft;
          let newTop = origTop;
          let newRight = origRight;
          let newBottom = origBottom;

          if (handle.includes('e')) {
            newRight = Math.max(origLeft + minSize, Math.min(100, origRight + dx));
          }
          if (handle.includes('w')) {
            newLeft = Math.max(0, Math.min(origRight - minSize, origLeft + dx));
          }
          if (handle.includes('s')) {
            newBottom = Math.max(origTop + minSize, Math.min(100, origBottom + dy));
          }
          if (handle.includes('n')) {
            newTop = Math.max(0, Math.min(origBottom - minSize, origTop + dy));
          }

          newBox = {
            ...origBox,
            x: newLeft,
            y: newTop,
            width: newRight - newLeft,
            height: newBottom - newTop,
          };
        } else {
          // Ratio Locked Resizing
          const targetRatio = origBox.width / origBox.height;

          if (handle === 'e') {
            const newW = Math.max(minSize, Math.min(100 - origLeft, origBox.width + dx));
            let newH = newW / targetRatio;
            if (origTop + newH > 100) {
              newH = 100 - origTop;
            }
            newBox = { ...origBox, x: origLeft, y: origTop, width: newH * targetRatio, height: newH };
          } else if (handle === 'w') {
            const newW = Math.max(minSize, Math.min(origRight, origBox.width - dx));
            let newH = newW / targetRatio;
            if (origTop + newH > 100) {
              newH = 100 - origTop;
            }
            newBox = { ...origBox, x: origRight - newH * targetRatio, y: origTop, width: newH * targetRatio, height: newH };
          } else if (handle === 's') {
            const newH = Math.max(minSize, Math.min(100 - origTop, origBox.height + dy));
            let newW = newH * targetRatio;
            if (origLeft + newW > 100) {
              newW = 100 - origLeft;
            }
            newBox = { ...origBox, x: origLeft, y: origTop, width: newW, height: newW / targetRatio };
          } else if (handle === 'n') {
            const newH = Math.max(minSize, Math.min(origBottom, origBox.height - dy));
            let newW = newH * targetRatio;
            if (origLeft + newW > 100) {
              newW = 100 - origLeft;
            }
            newBox = { ...origBox, x: origLeft, y: origBottom - newW / targetRatio, width: newW, height: newW / targetRatio };
          } else if (handle === 'se') {
            const diagDelta = (dx + dy * targetRatio) / 2;
            let newW = Math.max(minSize, Math.min(100 - origLeft, origBox.width + diagDelta));
            let newH = newW / targetRatio;
            if (origTop + newH > 100) {
              newH = 100 - origTop;
              newW = newH * targetRatio;
            }
            newBox = { ...origBox, x: origLeft, y: origTop, width: newW, height: newH };
          } else if (handle === 'sw') {
            const diagDelta = (-dx + dy * targetRatio) / 2;
            let newW = Math.max(minSize, Math.min(origRight, origBox.width + diagDelta));
            let newH = newW / targetRatio;
            if (origTop + newH > 100) {
              newH = 100 - origTop;
              newW = newH * targetRatio;
            }
            newBox = { ...origBox, x: origRight - newW, y: origTop, width: newW, height: newH };
          } else if (handle === 'ne') {
            const diagDelta = (dx - dy * targetRatio) / 2;
            let newW = Math.max(minSize, Math.min(100 - origLeft, origBox.width + diagDelta));
            let newH = newW / targetRatio;
            if (origBottom - newH < 0) {
              newH = origBottom;
              newW = newH * targetRatio;
            }
            newBox = { ...origBox, x: origLeft, y: origBottom - newH, width: newW, height: newH };
          } else if (handle === 'nw') {
            const diagDelta = (-dx - dy * targetRatio) / 2;
            let newW = Math.max(minSize, Math.min(origRight, origBox.width + diagDelta));
            let newH = newW / targetRatio;
            if (origBottom - newH < 0) {
              newH = origBottom;
              newW = newH * targetRatio;
            }
            newBox = { ...origBox, x: origRight - newW, y: origBottom - newH, width: newW, height: newH };
          }
        }

        // Shared Proportion Sync: The opposite box adopts the exact size and proportion!
        if (origOppositeBox) {
          const newOppW = newBox.width;
          const newOppH = newBox.height;
          const newOppX = Math.max(0, Math.min(100 - newOppW, origOppositeBox.x));
          const newOppY = Math.max(0, Math.min(100 - newOppH, origOppositeBox.y));
          newOppositeBox = {
            ...origOppositeBox,
            x: newOppX,
            y: newOppY,
            width: newOppW,
            height: newOppH,
          };
        }
      }

      if (onCropBoxResize) {
        onCropBoxResize(target, newBox, newOppositeBox);
      } else {
        if (target === 'front') {
          onFrontBoxChange(newBox);
          if (newOppositeBox) onBackBoxChange(newOppositeBox);
        } else {
          onBackBoxChange(newBox);
          if (newOppositeBox) onFrontBoxChange(newOppositeBox);
        }
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
  }, [dragState, lockRatio, onCropBoxResize, onFrontBoxChange, onBackBoxChange]);

  const renderCropBoxOverlay = (
    box: CropBox,
    target: 'front' | 'back',
    isFront: boolean
  ) => {
    return (
      <div
        key={target}
        style={{
          left: `${box.x}%`,
          top: `${box.y}%`,
          width: `${box.width}%`,
          height: `${box.height}%`,
        }}
        className={`absolute z-10 transition-shadow select-none ${
          isFront
            ? 'border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
            : 'border-2 border-dashed border-zinc-400 shadow-[0_0_15px_rgba(150,150,150,0.3)]'
        }`}
      >
        {/* Transparent movable area */}
        <div
          className="w-full h-full cursor-move bg-white/5 hover:bg-white/10 transition-colors"
          onPointerDown={(e) => handlePointerDown(e, target, 'move')}
        />

        {/* Top-left identification tag */}
        <div
          className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
            isFront ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
          }`}
        >
          <span>{isFront ? 'Front Card' : 'Back Card'}</span>
          <span className="text-[9px] opacity-75">({selectedPreset.shortName})</span>
        </div>

        {/* Dimension indicator on bottom */}
        {(() => {
          const cropRatio = (box.width * activePage.width) / Math.max(1, box.height * activePage.height);
          const currentHeightMm = (selectedPreset.dimensions.widthMm / cropRatio).toFixed(1);
          return (
            <div className="absolute -bottom-6 right-0 px-1.5 py-0.5 rounded bg-black text-white text-[10px] font-mono border border-zinc-700 select-none pointer-events-none whitespace-nowrap">
              {selectedPreset.dimensions.widthMm} x {currentHeightMm} mm
            </div>
          );
        })()}

        {/* 8 Resize Handles in crisp monochrome */}
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
              className={`absolute w-3.5 h-3.5 rounded-full border border-black bg-white ${posClass} ${cursorClass} shadow-md z-20 hover:scale-125 transition-transform touch-none`}
              onPointerDown={(e) => handlePointerDown(e, target, handle)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Viewport Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
        {/* Left: Active File Info & Page Navigator (with gravity scroll note) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-white font-semibold">
            {activeFile.type === 'pdf' ? (
              <FileText className="w-4 h-4 text-white" />
            ) : (
              <ImageIcon className="w-4 h-4 text-white" />
            )}
            <span className="truncate max-w-[220px]">{activeFile.name}</span>
          </div>

          {activeFile.type === 'pdf' && activeFile.numPages > 1 ? (
            <div className="flex items-center space-x-1.5 pl-2 border-l border-zinc-800">
              <button
                onClick={() => onSelectPage(Math.max(1, activePageNum - 1))}
                disabled={activePageNum === 1}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors"
                title="Previous Page (or scroll up)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-white font-bold px-1.5">
                Page {activePageNum} of {activeFile.numPages}
              </span>
              <button
                onClick={() => onSelectPage(Math.min(activeFile.numPages, activePageNum + 1))}
                disabled={activePageNum === activeFile.numPages}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 transition-colors"
                title="Next Page (or scroll down)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="hidden sm:inline-block text-[10px] text-zinc-500 pl-1 font-mono">
                [1 scroll = 1 page]
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono pl-2 border-l border-zinc-800">
              {activeFile.type === 'pdf' ? 'Single Page PDF' : 'Image File'}
            </span>
          )}
        </div>

        {/* Right: Crop Selection Controls (Clear, Select Front, Select Back) */}
        <div className="flex items-center space-x-2">
          {/* Clear Button */}
          <button
            onClick={onClearCrops}
            disabled={!hasAnyCrops}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 border border-zinc-800 text-xs font-medium transition-colors"
            title="Remove all crop boxes and clear cache"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {/* Select Front Button */}
          <button
            onClick={onSelectFront}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isFrontOnCurrentPage
                ? 'bg-white text-black border-white shadow-sm ring-1 ring-white/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
            }`}
            title="Position or override Front crop box on this page"
          >
            {isFrontOnCurrentPage ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            ) : (
              <PlusCircle className="w-3.5 h-3.5" />
            )}
            <span>{isFrontOnCurrentPage ? 'Front Selected' : 'Select Front'}</span>
          </button>

          {hasBackSide && (
            <button
              onClick={onSelectBack}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isBackOnCurrentPage
                  ? 'bg-zinc-300 text-black border-zinc-300 shadow-sm'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
              }`}
              title="Position or override Back crop box on this page"
            >
              {isBackOnCurrentPage ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              <span>{isBackOnCurrentPage ? 'Back Selected' : 'Select Back'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Viewport (with gravity wheel scroll) */}
      <div 
        ref={viewportRef}
        className="relative w-full rounded-2xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center p-3 sm:p-5 min-h-[460px] max-h-[62vh]"
      >
        <div
          ref={containerRef}
          className="relative max-w-full max-h-[60vh] shadow-2xl select-none"
        >
          {/* Background rendered document canvas */}
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-[60vh] h-auto w-auto rounded-lg border border-zinc-800"
          />

          {/* Overlays: Front & Back crop boxes */}
          {isFrontOnCurrentPage && frontBox && (
            renderCropBoxOverlay(frontBox, 'front', true)
          )}

          {isBackOnCurrentPage && backBox && (
            renderCropBoxOverlay(backBox, 'back', false)
          )}
        </div>
      </div>
    </div>
  );
};
