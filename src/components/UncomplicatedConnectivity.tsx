import React from 'react';
import { ShieldCheck, ArrowRight, Wifi, Lock, Zap, CheckCircle2, Server, Tv, Gamepad2, Cctv } from 'lucide-react';

interface UncomplicatedConnectivityProps {
  onGetStarted: () => void;
}

export const UncomplicatedConnectivity: React.FC<UncomplicatedConnectivityProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0a2540] via-[#0d2e53] to-[#0a2540] text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-1/2 -left-24 w-96 h-96 bg-[#ff6600]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff6600]/20 text-[#ff914d] text-xs font-bold border border-[#ff6600]/30 shadow-sm">
              <Wifi className="w-3.5 h-3.5 text-[#ff6600]" />
              <span>Uncomplicated Remote Access & Smart Home DNS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Welcome to Uncomplicated Connectivity
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Whether you need to monitor smart home security cameras, host gaming servers with friends, access private NAS storage, or manage work machines from anywhere—trust the 25-year pioneers at No-IP to keep you seamlessly connected.
            </p>

            {/* Feature highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Continuous Dynamic Sync</span>
                  <span className="text-[11px] text-slate-400">Never lose access when your ISP rotates your dynamic IP.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">CGNAT Bypass (Public Tunnels)</span>
                  <span className="text-[11px] text-slate-400">Remote connectivity without complex router port forwarding.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">150+ Anycast PoPs</span>
                  <span className="text-[11px] text-slate-400">100% DNS availability backed by redundant global PoPs.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Under 60-Second Setup</span>
                  <span className="text-[11px] text-slate-400">Instant registration, zero credit card required.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
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

            {/* Trust Micro-badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>SSL & Privacy Guard</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#ff6600]" />
                <span>Instant DNS Propagation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Picture with Telemetry Overlay */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl group bg-slate-950/80 backdrop-blur">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src="/src/assets/images/uncomplicated_home_connect_1790353854230.jpg"
                  alt="Connected Smart Home and Remote Access Mesh"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20" />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Remote Mesh • Connected
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-mono text-[#ff914d] border border-white/10 font-bold">
                    12ms Latency
                  </span>
                </div>

                {/* Bottom Interactive Telemetry Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold text-white font-mono">myhome-gateway.ddns.net</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      IPv4 / AAAA Synced
                    </span>
                  </div>

                  {/* Connected Devices Pills */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col items-center gap-1">
                      <Cctv className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 font-medium">CCTV NVR</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-300 font-medium">IoT Hub</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-slate-300 font-medium">Game Server</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-slate-300 font-medium">NAS Cloud</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
