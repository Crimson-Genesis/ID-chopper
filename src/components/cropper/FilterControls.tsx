import React from 'react';
import { FilterSettings } from '../../types/card';
import { Sliders, Sun, Contrast, Zap, Palette, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterSettings;
  onChange: (filters: FilterSettings) => void;
  onReset: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Image Clarity & Enhancements
          </h4>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
          title="Reset image adjustments"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Color Mode Selection */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <span>Color Processing Mode</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChange({ ...filters, mode: 'color' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              filters.mode === 'color'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            Natural Color
          </button>
          <button
            onClick={() => onChange({ ...filters, mode: 'clean-scan' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              filters.mode === 'clean-scan'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            Clean White Scan
          </button>
          <button
            onClick={() => onChange({ ...filters, mode: 'grayscale' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              filters.mode === 'grayscale'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            B&W Grayscale
          </button>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-slate-300">{filters.brightness}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.brightness}
            onChange={(e) =>
              onChange({ ...filters, brightness: parseInt(e.target.value, 10) })
            }
            className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <Contrast className="w-3.5 h-3.5 text-blue-400" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-slate-300">{filters.contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.contrast}
            onChange={(e) =>
              onChange({ ...filters, contrast: parseInt(e.target.value, 10) })
            }
            className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Sharpening */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Text & QR Sharpen</span>
            </span>
            <span className="font-mono text-slate-300">{filters.sharpness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sharpness}
            onChange={(e) =>
              onChange({ ...filters, sharpness: parseInt(e.target.value, 10) })
            }
            className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
