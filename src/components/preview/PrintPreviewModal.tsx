import React, { useState } from 'react';
import { PrintLayoutFormat, CardPreset } from '../../types/card';
import { generatePrintPdf } from '../../services/printLayoutService';
import { 
  X, 
  Download, 
  Printer, 
  FileCheck, 
  Layers, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement | null;
  selectedPreset: CardPreset;
}

const LAYOUTS: {
  id: PrintLayoutFormat;
  title: string;
  description: string;
  badge: string;
}[] = [
  {
    id: 'lamination_pouch',
    title: 'Lamination Pouch (Side-by-Side)',
    description: 'Front & Back side-by-side on A4 with cut and fold guidelines. Perfect for pouch laminators.',
    badge: 'Popular',
  },
  {
    id: 'photo_4x6',
    title: '4x6 Inch Photo Paper',
    description: 'Formatted for 4x6" (10x15cm) glossy photo paper on Epson / Canon photo studio printers.',
    badge: 'Studio',
  },
  {
    id: 'a4_5card',
    title: 'A4 Cyber Cafe Batch Sheet',
    description: 'Arranges up to 5 card pairs on a single A4 page with registration scissor cut guides.',
    badge: 'CSC Centers',
  },
  {
    id: 'pvc_cr80',
    title: 'PVC Card (Direct CR80)',
    description: '85.6 x 53.98 mm borderless 2-page PDF for direct thermal PVC ID card printers (Zebra/Evolis).',
    badge: 'PVC Printer',
  },
];

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  frontCanvas,
  backCanvas,
  selectedPreset,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<PrintLayoutFormat>('lamination_pouch');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const frontDataUrl = frontCanvas.toDataURL('image/png');
  const backDataUrl = backCanvas ? backCanvas.toDataURL('image/png') : null;

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const doc = await generatePrintPdf(
        frontCanvas,
        backCanvas,
        selectedFormat,
        selectedPreset.shortName
      );
      const link = document.createElement('a');
      link.href = doc.blobUrl;
      link.download = doc.filename;
      link.click();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = (target: 'front' | 'back' | 'both') => {
    if (target === 'front' || target === 'both') {
      const link = document.createElement('a');
      link.href = frontDataUrl;
      link.download = `${selectedPreset.shortName}_Front_Card_300DPI.png`;
      link.click();
    }
    if ((target === 'back' || target === 'both') && backDataUrl) {
      const link = document.createElement('a');
      link.href = backDataUrl;
      link.download = `${selectedPreset.shortName}_Back_Card_300DPI.png`;
      link.click();
    }
  };

  const handleBrowserPrint = async () => {
    try {
      setIsGenerating(true);
      const doc = await generatePrintPdf(
        frontCanvas,
        backCanvas,
        selectedFormat,
        selectedPreset.shortName
      );
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = doc.blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (err) {
      console.error('Failed to print document:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Print Sheet Studio: {selectedPreset.name}
              </h3>
              <p className="text-xs text-slate-400">
                Exact physical dimensions: 85.60 mm x 53.98 mm (ISO CR80 Standard)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Card Extracted Previews */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Extracted Card Faces (Ready for Output)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-sky-400">
                    Front Side
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {frontCanvas.width} x {frontCanvas.height} px
                  </span>
                </div>
                <div className="w-full aspect-[85.6/53.98] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img
                    src={frontDataUrl}
                    alt="Front Card"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => handleDownloadPng('front')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Download Front PNG</span>
                </button>
              </div>

              {/* Back Card (if available) */}
              {backDataUrl ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-emerald-400">
                      Back Side
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {backCanvas ? `${backCanvas.width} x ${backCanvas.height} px` : ''}
                    </span>
                  </div>
                  <div className="w-full aspect-[85.6/53.98] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex items-center justify-center">
                    <img
                      src={backDataUrl}
                      alt="Back Card"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={() => handleDownloadPng('back')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Download Back PNG</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                  <p>Single-sided card selected (no back face).</p>
                </div>
              )}
            </div>
          </div>

          {/* Select Output Sheet Layout */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Print Layout Format
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LAYOUTS.map((layout) => {
                const isSelected = selectedFormat === layout.id;
                return (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedFormat(layout.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/70 shadow-lg shadow-teal-950/30 ring-1 ring-teal-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {layout.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-teal-500/20 font-medium">
                          {layout.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {layout.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {layout.id === 'pvc_cr80' ? '85.6 x 54 mm' : layout.id === 'photo_4x6' ? '4 x 6 Inch' : 'A4 Sheet'}
                      </span>
                      {isSelected && (
                        <div className="flex items-center space-x-1 text-teal-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Ready to generate 300 DPI vector-accurate PDF</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleBrowserPrint}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Directly</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-900/30 transition-all flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>Download Print PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
