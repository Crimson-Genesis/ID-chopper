import React, { useState } from 'react';
import { CARD_PRESETS } from '../constants/cardPresets';
import { X, ExternalLink, ShieldCheck, Search, BookOpen } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = CARD_PRESETS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authority.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white text-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Official Directory of Indian Identity Cards
              </h3>
              <p className="text-xs text-zinc-400">
                Official issuing authorities, portal links, and card format details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by ID name, authority, or category..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Body Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {card.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium capitalize border border-zinc-700">
                      {card.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {card.authority}
                  </p>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    CR80 (85.6 x 54 mm)
                  </span>
                  <a
                    href={card.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-white hover:underline font-medium"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Note */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex items-start space-x-3 text-xs text-zinc-300">
            <ShieldCheck className="w-5 h-5 shrink-0 text-white mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                Privacy Guaranteed
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                All document processing, rendering, crop box extraction, and PDF generation execute locally in your web browser. No Aadhaar, PAN, voter details, or images are ever transmitted to any external server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
