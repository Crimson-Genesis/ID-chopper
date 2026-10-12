import React, { useState } from 'react';
import { CARD_PRESETS, CUSTOM_CARD_PRESET } from '../constants/cardPresets';
import { CardPreset, CardCategory } from '../types/card';
import { ExternalLink, Check, Search, CreditCard, ChevronDown, SlidersHorizontal, Edit3 } from 'lucide-react';

interface CardSelectorProps {
  selectedPreset: CardPreset;
  onSelectPreset: (preset: CardPreset) => void;
  onUpdateCustomPreset?: (updated: CardPreset) => void;
}

const CATEGORIES: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All IDs', value: 'all' },
  { label: 'Custom', value: 'custom' },
  { label: 'Identity', value: 'identity' },
  { label: 'Tax & Fin', value: 'tax' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Welfare', value: 'welfare' },
  { label: 'Transport', value: 'transport' },
];

export const CardSelector: React.FC<CardSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  onUpdateCustomPreset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CardCategory | 'all'>('all');
  const [isEditingCustomName, setIsEditingCustomName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(selectedPreset.name);

  const filtered = CARD_PRESETS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.authority.toLowerCase().includes(search.toLowerCase()) ||
      p.shortName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveCustomName = () => {
    if (onUpdateCustomPreset && customNameInput.trim()) {
      onUpdateCustomPreset({
        ...selectedPreset,
        name: customNameInput.trim(),
        shortName: customNameInput.trim(),
      });
    }
    setIsEditingCustomName(false);
  };

  return (
    <div className="relative w-full">
      {/* Trigger Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              selectedPreset.isCustom
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
            }`}
          >
            {selectedPreset.isCustom ? (
              <SlidersHorizontal className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                ID Preset:
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedPreset.isCustom
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedPreset.isCustom ? 'Custom Mode' : selectedPreset.category}
              </span>
            </div>

            {/* Title / Name Editor */}
            {isEditingCustomName ? (
              <div className="flex items-center space-x-1.5 mt-0.5">
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomName()}
                  className="bg-slate-950 border border-teal-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveCustomName}
                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-semibold text-white">
                  {selectedPreset.name}
                </h3>
                {selectedPreset.isCustom && (
                  <button
                    onClick={() => {
                      setCustomNameInput(selectedPreset.name);
                      setIsEditingCustomName(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Rename custom card"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400 line-clamp-1">
              {selectedPreset.authority}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick Custom Card Toggle Button */}
          {!selectedPreset.isCustom && (
            <button
              onClick={() => onSelectPreset(CUSTOM_CARD_PRESET)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
              title="Switch to Custom Card mode"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Custom Card</span>
            </button>
          )}

          {selectedPreset.portalUrl && (
            <a
              href={selectedPreset.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              title="Open official portal"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-900/30 transition-all"
          >
            <span>Change Preset</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dropdown Selector Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 max-h-[520px] overflow-hidden flex flex-col">
            {/* Search and Category Filter */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID name or authority (e.g. Custom, Aadhaar, PAN)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  autoFocus
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeCategory === cat.value
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of presets */}
            <div className="overflow-y-auto py-2 space-y-1.5 flex-1 pr-1">
              {filtered.map((preset) => {
                const isSelected = preset.id === selectedPreset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/50 shadow-sm'
                        : preset.isCustom
                        ? 'bg-amber-950/20 border-amber-500/30 hover:bg-amber-950/40'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-white">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            preset.isCustom
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {preset.authority}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-teal-500 text-white shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No matching ID preset found.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
