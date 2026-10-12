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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-white text-black">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Password-Protected PDF
            </h3>
            <p className="text-xs text-zinc-400">
              Enter password to unlock document
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-750 text-white text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-medium">
              Document Password:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. RAHU1992"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                autoFocus
              />
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900 p-3 text-[11px] text-zinc-400 space-y-1 border border-zinc-800">
            <p className="font-semibold text-white">
              Aadhaar Password Format Hint:
            </p>
            <p>
              First 4 letters of your name in CAPITAL + 4-digit Year of Birth (e.g., if name is RAHUL and birth year is 1992, password is <strong className="text-white font-mono">RAHU1992</strong>).
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-black text-xs font-bold shadow-lg transition-colors"
            >
              Unlock Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
