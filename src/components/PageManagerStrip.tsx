import React, { useRef } from 'react';
import { RenderedPage, CropBox } from '../types/card';
import { 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  RefreshCw 
} from 'lucide-react';

interface PageManagerStripProps {
  pages: RenderedPage[];
  activePageNum: number;
  onSelectPage: (pageNum: number) => void;
  frontBox: CropBox;
  backBox: CropBox;
  hasBackSide: boolean;
  onSetFrontPage: (pageNum: number) => void;
  onSetBackPage: (pageNum: number) => void;
  onReplacePageImage: (pageNumber: number, file: File) => void;
  onAddPage: (file: File) => void;
  onDeletePage: (pageNumber: number) => void;
}

export const PageManagerStrip: React.FC<PageManagerStripProps> = ({
  pages,
  activePageNum,
  onSelectPage,
  frontBox,
  backBox,
  hasBackSide,
  onSetFrontPage,
  onSetBackPage,
  onReplacePageImage,
  onAddPage,
  onDeletePage,
}) => {
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPage(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Document Pages & Image Manager ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'})
          </h4>
        </div>
        <div className="text-xs text-slate-400 flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            <span className="text-[11px]">Front: Page {frontBox.pageNumber}</span>
          </span>
          {hasBackSide && (
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-[11px]">Back: Page {backBox.pageNumber}</span>
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Page Cards Scroll */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1">
        {pages.map((page) => {
          const isSelected = page.pageNumber === activePageNum;
          const isFront = frontBox.pageNumber === page.pageNumber;
          const isBack = hasBackSide && backBox.pageNumber === page.pageNumber;
          const replaceInputId = `replace-page-input-${page.pageNumber}`;

          return (
            <div
              key={page.pageNumber}
              onClick={() => onSelectPage(page.pageNumber)}
              className={`relative flex-shrink-0 w-44 rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950 border-teal-500 shadow-md shadow-teal-950/40 ring-1 ring-teal-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center space-x-1">
                  <span>Page {page.pageNumber}</span>
                  {isSelected && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-medium">
                      Active
                    </span>
                  )}
                </span>

                <div className="flex items-center space-x-1">
                  {/* Hidden input for replacing image */}
                  <input
                    id={replaceInputId}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        onReplacePageImage(page.pageNumber, e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                  <label
                    htmlFor={replaceInputId}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 cursor-pointer"
                    title="Update / replace image for this page"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </label>

                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.pageNumber);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete this page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Page Thumbnail Preview */}
              <div className="relative w-full aspect-[1/1.3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 mb-2 flex items-center justify-center">
                {page.dataUrl ? (
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="text-[10px] text-slate-600">No Preview</div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {isFront && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-600 text-white shadow-sm flex items-center space-x-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Front</span>
                    </span>
                  )}
                  {isBack && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shadow-sm flex items-center space-x-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Back</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment Quick Buttons */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetFrontPage(page.pageNumber);
                    }}
                    className={`py-1 px-1 rounded font-semibold transition-colors ${
                      isFront
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-sky-300 hover:bg-slate-700'
                    }`}
                  >
                    Set Front
                  </button>
                  {hasBackSide && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetBackPage(page.pageNumber);
                      }}
                      className={`py-1 px-1 rounded font-semibold transition-colors ${
                        isBack
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-700'
                      }`}
                    >
                      Set Back
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Another Page / Image Card */}
        <div
          onClick={() => addFileInputRef.current?.click()}
          className="flex-shrink-0 w-36 rounded-xl border-2 border-dashed border-slate-800 hover:border-teal-500/50 bg-slate-950/40 hover:bg-slate-900/60 p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <input
            ref={addFileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleAddFileChange}
          />
          <div className="p-3 rounded-full bg-slate-800 group-hover:bg-teal-500/20 text-slate-400 group-hover:text-teal-300 transition-colors mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-300 group-hover:text-teal-300">
            Add Page
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Image or PDF
          </span>
        </div>
      </div>
    </div>
  );
};
