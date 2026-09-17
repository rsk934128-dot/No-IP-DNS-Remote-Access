import React from 'react';
import { ShieldCheck, ArrowRight, Wifi, Lock, Zap } from 'lucide-react';

interface UncomplicatedConnectivityProps {
  onGetStarted: () => void;
}

export const UncomplicatedConnectivity: React.FC<UncomplicatedConnectivityProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a2540] via-[#0e3157] to-[#0a2540] text-white relative overflow-hidden text-center">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[#ff6600]/20 text-[#ff6600] flex items-center justify-center mx-auto mb-6 border border-[#ff6600]/30 shadow-lg">
          <Wifi className="w-7 h-7" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Welcome to Uncomplicated Connectivity
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Whether you need to browse safely at home, or access work devices from anywhere, trust the 25-year experts at No-IP to keep you connected.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            id="uncomplicated-get-started-btn"
            onClick={onGetStarted}
            className="py-3.5 px-8 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
          >
            Create Your Free Hostname
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#stats-section"
            className="py-3.5 px-6 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all"
          >
            Explore 150+ Anycast PoPs
          </a>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>SSL & Privacy Included</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff6600]" />
            <span>Under 60s Setup</span>
          </div>
        </div>
      </div>
    </section>
  );
};
