import { useState } from 'react';
import { Header } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { CropCanvas } from './components/cropper/CropCanvas';
import { SideBySideCropPreview } from './components/cropper/SideBySideCropPreview';
import { PasswordModal } from './components/PasswordModal';
import { InfoModal } from './components/InfoModal';
import { CARD_PRESETS } from './constants/cardPresets';
import { 
  AppFile, 
  CardPreset, 
  CropBox, 
  FilterSettings, 
  PrintLayoutFormat, 
  CachedCropItem
} from './types/card';
import { loadSingleAppFile, loadAppFiles } from './services/pdfService';
import { extractCanvasCropAsync } from './services/imageFilterService';
import { generatePrintPdf, promptAndSavePdf } from './services/printLayoutService';
import { FileUp } from 'lucide-react';

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  sharpness: 0,
  mode: 'color',
};

export function App() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [selectedPreset, setSelectedPreset] = useState<CardPreset>(CARD_PRESETS[1]); // Aadhaar default

  // Active Crop Box coordinates for currently loaded document (real-time movement, 60 FPS, no lag)
  const [frontBox, setFrontBox] = useState<CropBox | null>(null);
  const [backBox, setBackBox] = useState<CropBox | null>(null);

  // Cached Crop Items (preserved across file switching, extracted only on file switch or print/export)
  const [cachedFront, setCachedFront] = useState<CachedCropItem | null>(null);
  const [cachedBack, setCachedBack] = useState<CachedCropItem | null>(null);

  // Individual async saving states for smooth non-blocking loading animations
  const [isSavingFront, setIsSavingFront] = useState<boolean>(false);
  const [isSavingBack, setIsSavingBack] = useState<boolean>(false);

  const [hasBackSide, setHasBackSide] = useState<boolean>(true);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [selectedFormat, setSelectedFormat] = useState<PrintLayoutFormat>('lamination_pouch');

  // Loading & Modals
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [passwordFile, setPasswordFile] = useState<File | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  // File Operations
  const handleAddFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    try {
      setIsLoadingFile(true);
      const loaded = await loadAppFiles(newFiles);
      setFiles((prev) => [...prev, ...loaded]);

      // If no file was active, activate the first new one
      if (!activeFileId && loaded.length > 0) {
        setActiveFileId(loaded[0].id);
        setActivePageNum(1);
      }
    } catch (err: any) {
      if (err?.isPasswordRequired) {
        setPasswordFile(newFiles[0]);
        setIsPasswordModalOpen(true);
        setPasswordError(undefined);
      } else {
        alert('Failed to load file: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Switch File: Switch immediately in UI, save outgoing crops asynchronously in background
  const handleSelectFile = (newFileId: string) => {
    if (newFileId === activeFileId) return;

    // 1. Snapshot outgoing file and active crop boxes
    const outgoingFile = activeFile;
    const outgoingFrontBox = frontBox && outgoingFile && frontBox.fileId === outgoingFile.id ? { ...frontBox } : null;
    const outgoingBackBox = backBox && outgoingFile && backBox.fileId === outgoingFile.id ? { ...backBox } : null;

    // 2. Switch to new active file IMMEDIATELY (zero UI freeze)
    setActiveFileId(newFileId);
    setActivePageNum(1);

    // 3. Restore crop boxes for incoming file if it previously had crops
    if (cachedFront && cachedFront.fileId === newFileId) {
      setFrontBox(cachedFront.box);
      setActivePageNum(cachedFront.pageNumber);
    } else {
      setFrontBox(null);
    }

    if (cachedBack && cachedBack.fileId === newFileId) {
      setBackBox(cachedBack.box);
    } else {
      setBackBox(null);
    }

    // 4. Asynchronously extract outgoing crops in parallel background tasks with loading spinner
    if (outgoingFile && outgoingFrontBox) {
      setIsSavingFront(true);
      (async () => {
        try {
          const page = outgoingFile.pages.find((p) => p.pageNumber === outgoingFrontBox.pageNumber) || outgoingFile.pages[0];
          const { canvas, dataUrl } = await extractCanvasCropAsync(
            page.canvas,
            page.width,
            page.height,
            outgoingFrontBox,
            filters
          );
          setCachedFront({
            fileId: outgoingFile.id,
            fileName: outgoingFile.name,
            pageNumber: outgoingFrontBox.pageNumber,
            box: outgoingFrontBox,
            canvas,
            dataUrl,
          });
        } catch (err) {
          console.error('Failed to async save front crop:', err);
        } finally {
          setIsSavingFront(false);
        }
      })();
    }

    if (outgoingFile && outgoingBackBox) {
      setIsSavingBack(true);
      (async () => {
        try {
          const page = outgoingFile.pages.find((p) => p.pageNumber === outgoingBackBox.pageNumber) || outgoingFile.pages[0];
          const { canvas, dataUrl } = await extractCanvasCropAsync(
            page.canvas,
            page.width,
            page.height,
            outgoingBackBox,
            filters
          );
          setCachedBack({
            fileId: outgoingFile.id,
            fileName: outgoingFile.name,
            pageNumber: outgoingBackBox.pageNumber,
            box: outgoingBackBox,
            canvas,
            dataUrl,
          });
        } catch (err) {
          console.error('Failed to async save back crop:', err);
        } finally {
          setIsSavingBack(false);
        }
      })();
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        const nextId = filtered.length > 0 ? filtered[0].id : null;
        setActiveFileId(nextId);
        setActivePageNum(1);

        if (cachedFront && cachedFront.fileId === nextId) {
          setFrontBox(cachedFront.box);
        } else {
          setFrontBox(null);
        }

        if (cachedBack && cachedBack.fileId === nextId) {
          setBackBox(cachedBack.box);
        } else {
          setBackBox(null);
        }
      }
      return filtered;
    });

    if (frontBox?.fileId === fileId) setFrontBox(null);
    if (cachedFront?.fileId === fileId) setCachedFront(null);
    if (backBox?.fileId === fileId) setBackBox(null);
    if (cachedBack?.fileId === fileId) setCachedBack(null);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!passwordFile) return;
    try {
      setIsLoadingFile(true);
      const item = await loadSingleAppFile(passwordFile, passwordFile.name, password);
      setFiles((prev) => [...prev, item]);
      setActiveFileId(item.id);
      setActivePageNum(1);
      setIsPasswordModalOpen(false);
      setPasswordFile(null);
    } catch (err: any) {
      if (err?.isPasswordRequired) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setPasswordError(err.message || 'Decryption failed');
      }
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Real-Time Crop Box Actions (only updates coordinates in state, 0ms latency)
  const handleSelectFront = () => {
    if (!activeFile) return;
    const box: CropBox = {
      ...selectedPreset.defaultFrontBox,
      pageNumber: activePageNum,
      fileId: activeFile.id,
    };
    setFrontBox(box);
  };

  const handleSelectBack = () => {
    if (!activeFile) return;
    const box: CropBox = {
      ...selectedPreset.defaultBackBox,
      pageNumber: activePageNum,
      fileId: activeFile.id,
    };
    setBackBox(box);
  };

  const handleFrontBoxChange = (newBox: CropBox) => {
    setFrontBox(newBox);
  };

  const handleBackBoxChange = (newBox: CropBox) => {
    setBackBox(newBox);
  };

  const handleClearCrops = () => {
    setFrontBox(null);
    setBackBox(null);
    setCachedFront(null);
    setCachedBack(null);
  };

  // On-demand async extraction helper for Export PDF and Print
  const ensureFreshCropsAsync = async () => {
    let finalFrontCanvas: HTMLCanvasElement | null = cachedFront?.canvas || null;
    let finalBackCanvas: HTMLCanvasElement | null = cachedBack?.canvas || null;

    const tasks: Promise<void>[] = [];

    if (frontBox && activeFile && frontBox.fileId === activeFile.id) {
      setIsSavingFront(true);
      tasks.push(
        (async () => {
          try {
            const page = activeFile.pages.find((p) => p.pageNumber === frontBox.pageNumber) || activeFile.pages[0];
            const { canvas, dataUrl } = await extractCanvasCropAsync(
              page.canvas,
              page.width,
              page.height,
              frontBox,
              filters
            );
            finalFrontCanvas = canvas;
            setCachedFront({
              fileId: activeFile.id,
              fileName: activeFile.name,
              pageNumber: frontBox.pageNumber,
              box: frontBox,
              canvas,
              dataUrl,
            });
          } finally {
            setIsSavingFront(false);
          }
        })()
      );
    }

    if (hasBackSide && backBox && activeFile && backBox.fileId === activeFile.id) {
      setIsSavingBack(true);
      tasks.push(
        (async () => {
          try {
            const page = activeFile.pages.find((p) => p.pageNumber === backBox.pageNumber) || activeFile.pages[0];
            const { canvas, dataUrl } = await extractCanvasCropAsync(
              page.canvas,
              page.width,
              page.height,
              backBox,
              filters
            );
            finalBackCanvas = canvas;
            setCachedBack({
              fileId: activeFile.id,
              fileName: activeFile.name,
              pageNumber: backBox.pageNumber,
              box: backBox,
              canvas,
              dataUrl,
            });
          } finally {
            setIsSavingBack(false);
          }
        })()
      );
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    return { finalFrontCanvas, finalBackCanvas };
  };

  // Export PDF with Location Picker Prompt
  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const { finalFrontCanvas, finalBackCanvas } = await ensureFreshCropsAsync();

      if (!finalFrontCanvas) {
        alert('Please select at least a Front crop box before exporting.');
        return;
      }

      const cleanTitle = selectedPreset.shortName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const defaultFilename = `${cleanTitle}_print_ready_${selectedFormat}.pdf`;

      await promptAndSavePdf(
        () =>
          generatePrintPdf(
            finalFrontCanvas!,
            hasBackSide && finalBackCanvas ? finalBackCanvas : null,
            selectedFormat,
            selectedPreset.shortName,
            selectedPreset.dimensions
          ),
        defaultFilename
      );
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDF generation error: ' + (err as Error).message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Browser Print Directly
  const handleBrowserPrint = async () => {
    try {
      setIsGeneratingPdf(true);
      const { finalFrontCanvas, finalBackCanvas } = await ensureFreshCropsAsync();
      if (!finalFrontCanvas) return;

      const doc = await generatePrintPdf(
        finalFrontCanvas,
        hasBackSide && finalBackCanvas ? finalBackCanvas : null,
        selectedFormat,
        selectedPreset.shortName,
        selectedPreset.dimensions
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
      setIsGeneratingPdf(false);
    }
  };

  // Download Individual PNGs
  const handleDownloadPng = async (target: 'front' | 'back') => {
    if (target === 'front') {
      if (frontBox && activeFile && frontBox.fileId === activeFile.id) {
        setIsSavingFront(true);
        try {
          const page = activeFile.pages.find((p) => p.pageNumber === frontBox.pageNumber) || activeFile.pages[0];
          const { canvas, dataUrl } = await extractCanvasCropAsync(
            page.canvas,
            page.width,
            page.height,
            frontBox,
            filters
          );
          setCachedFront({
            fileId: activeFile.id,
            fileName: activeFile.name,
            pageNumber: frontBox.pageNumber,
            box: frontBox,
            canvas,
            dataUrl,
          });
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${selectedPreset.shortName}_Front_Card_300DPI.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Download error:', err);
        } finally {
          setIsSavingFront(false);
        }
      } else if (cachedFront) {
        const link = document.createElement('a');
        link.href = cachedFront.dataUrl;
        link.download = `${selectedPreset.shortName}_Front_Card_300DPI.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    if (target === 'back') {
      if (backBox && activeFile && backBox.fileId === activeFile.id) {
        setIsSavingBack(true);
        try {
          const page = activeFile.pages.find((p) => p.pageNumber === backBox.pageNumber) || activeFile.pages[0];
          const { canvas, dataUrl } = await extractCanvasCropAsync(
            page.canvas,
            page.width,
            page.height,
            backBox,
            filters
          );
          setCachedBack({
            fileId: activeFile.id,
            fileName: activeFile.name,
            pageNumber: backBox.pageNumber,
            box: backBox,
            canvas,
            dataUrl,
          });
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `${selectedPreset.shortName}_Back_Card_300DPI.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Download error:', err);
        } finally {
          setIsSavingBack(false);
        }
      } else if (cachedBack) {
        const link = document.createElement('a');
        link.href = cachedBack.dataUrl;
        link.download = `${selectedPreset.shortName}_Back_Card_300DPI.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />

      {/* Main 2-Way Left and Right Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1700px] mx-auto overflow-hidden">
        {/* LEFT SIDEBAR: Unified Files Section + Controls */}
        <SidebarControls
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onRemoveFile={handleRemoveFile}
          onAddFiles={handleAddFiles}
          isLoadingFile={isLoadingFile}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          onUpdateCustomPreset={setSelectedPreset}
          hasBackSide={hasBackSide}
          onHasBackSideChange={setHasBackSide}
          lockRatio={lockRatio}
          onToggleLockRatio={() => setLockRatio(!lockRatio)}
          filters={filters}
          onFiltersChange={setFilters}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onExportPdf={handleExportPdf}
          onBrowserPrint={handleBrowserPrint}
          isGeneratingPdf={isGeneratingPdf || isSavingFront || isSavingBack}
          frontCropFileId={frontBox?.fileId || cachedFront?.fileId}
          backCropFileId={backBox?.fileId || cachedBack?.fileId}
          hasFrontCrop={Boolean(frontBox || cachedFront)}
          hasBackCrop={Boolean(backBox || cachedBack)}
        />

        {/* RIGHT MAIN WORKSPACE: Viewport with Gravity Single-Scroll + Live Side-by-Side Crop Previews */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto bg-black flex flex-col">
          {!activeFile ? (
            /* Empty State */
            <div className="flex-1 rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-4 min-h-[480px]">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
                <FileUp className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  No Document Selected
                </h3>
                <p className="text-xs text-zinc-400">
                  Click "Add Files" in the left sidebar to upload an official Indian ID card PDF document or scan images.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TOP SECTION: Document Viewport with Single-Scroll Gravity Lock */}
              <div className="space-y-2">
                <CropCanvas
                  activeFile={activeFile}
                  activePageNum={activePageNum}
                  onSelectPage={setActivePageNum}
                  frontBox={frontBox}
                  backBox={backBox}
                  hasBackSide={hasBackSide}
                  onFrontBoxChange={handleFrontBoxChange}
                  onBackBoxChange={handleBackBoxChange}
                  onSelectFront={handleSelectFront}
                  onSelectBack={handleSelectBack}
                  onClearCrops={handleClearCrops}
                  selectedPreset={selectedPreset}
                  lockRatio={lockRatio}
                  hasAnyCrops={Boolean(frontBox || backBox || cachedFront || cachedBack)}
                />
              </div>

              {/* BOTTOM SECTION: Live Side-by-Side Front and Back Crop Preview */}
              <div className="pt-2">
                <SideBySideCropPreview
                  activeFile={activeFile}
                  frontBox={frontBox}
                  backBox={backBox}
                  cachedFront={cachedFront}
                  cachedBack={cachedBack}
                  filters={filters}
                  hasBackSide={hasBackSide}
                  selectedPreset={selectedPreset}
                  onDownloadPng={handleDownloadPng}
                  isSavingFront={isSavingFront}
                  isSavingBack={isSavingBack}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Password Modal for e-Aadhaar Encrypted PDFs */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordFile(null);
        }}
        onSubmit={handlePasswordSubmit}
        errorMessage={passwordError}
      />

      {/* Supported IDs Directory Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-600 bg-black">
        CardPrint Studio - Indian Identity Document Cropper & Print Sheet Studio.
      </footer>
    </div>
  );
}

export default App;
