import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  errorMessage?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  errorMessage,
}) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Password-Protected PDF
            </h3>
            <p className="text-xs text-slate-400">
              Enter password to decrypt document client-side
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">
              Document Password:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. RAHU1992"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                autoFocus
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1 border border-slate-800">
            <p className="font-semibold text-slate-300">
              Aadhaar Password Format Hint:
            </p>
            <p>
              First 4 letters of your name in CAPITAL + 4-digit Year of Birth (e.g., if name is RAHUL and birth year is 1992, password is <strong className="text-teal-400">RAHU1992</strong>).
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-teal-900/30"
            >
              Unlock Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
