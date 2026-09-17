import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronRight, X } from 'lucide-react';

interface PromoBannerProps {
  onUpgradeClick?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onUpgradeClick }) => {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('SEP25OFF');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside 
      id="promo-top-banner"
      aria-label="Special Offer Banner"
      className="bg-gradient-to-r from-[#0b213f] via-[#102d57] to-[#0a2540] text-white border-b border-slate-700/60 relative z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-[#ff6600]/90 text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" /> 25% Off
          </span>
          <p className="text-slate-200">
            <span className="font-semibold text-white">Public Tunnels</span> is included with Enhanced, now 25% off. Always-on remote access, no port forwarding.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700/80 text-xs">
            <span className="text-slate-400">Code:</span>
            <button
              id="copy-promo-code-btn"
              onClick={handleCopyCode}
              type="button"
              className="font-mono font-bold text-[#ff914d] hover:text-[#ffa770] flex items-center gap-1 transition-colors"
              title="Click to copy promo code"
            >
              SEP25OFF
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-80" />}
            </button>
            {copied && <span className="text-[10px] text-emerald-400 font-semibold animate-fade-in">Copied!</span>}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            id="promo-save-now-btn"
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 text-white px-3.5 py-1 rounded font-semibold text-xs transition-all shadow-sm"
          >
            Save Now!
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            *Ends September 30, 2026.
          </span>
          <button
            id="dismiss-promo-banner-btn"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-slate-400 hover:text-white p-1 transition-colors rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
