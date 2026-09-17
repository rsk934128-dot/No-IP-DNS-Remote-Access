import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Code2, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  Code,
  BookOpen,
  ArrowDown
} from 'lucide-react';
import { IntegrateViaApi } from './IntegrateViaApi';
import { ApiSimulator } from './ApiSimulator';
import { IntegrateViaApiSection } from './IntegrateViaApiSection';

export const PartnersResellers: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleScrollToResources = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const resourcesEl = document.getElementById('resources-section');
    if (resourcesEl) {
      resourcesEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open('https://www.noip.com/integrate/api', '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenDocsNewTab = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.open('https://www.noip.com/integrate/api', '_blank', 'noopener,noreferrer');
  };

  const benefits = [
    'Expand offerings',
    'Fast & scalable',
    'Branded & bundled',
    'Reduce support needs',
    'Grow account revenue',
    'Backed by No-IP guarantee',
    'Fully customizable with No-IP API',
  ];

  const hardwarePartners = [
    { name: 'TP-Link', type: 'Routers & Gateways' },
    { name: 'Netgear', type: 'Orbi & Nighthawk' },
    { name: 'ASUS', type: 'AiMesh Routers' },
    { name: 'Hikvision', type: 'CCTV & NVR Systems' },
    { name: 'Dahua', type: 'Surveillance Hardware' },
    { name: 'Synology', type: 'DiskStation DSM' },
    { name: 'Cisco', type: 'RV Series VPN Gateways' },
    { name: 'Ubiquiti', type: 'UniFi OS / EdgeRouter' },
  ];

  const apiSampleCode = `curl -u "username:password" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=office.ddns.net&myip=198.51.100.42"

# Response:
# nochg 198.51.100.42 (IP address is up to date)`;

  const handleCopyApi = () => {
    navigator.clipboard?.writeText(apiSampleCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section id="partners-resellers-section" className="py-16 sm:py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hardware & Ecosystem Integration Badges */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ff6600]">
            Ecosystem Interoperability
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Seamlessly Integrated with Your Favorite Tools
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Pre-built directly into the firmware of billions of networking devices, IP cameras, and storage systems worldwide.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {hardwarePartners.map((hw) => (
              <div
                key={hw.name}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-2 hover:border-[#ff6600]/60 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-[#ff6600]" />
                <span>{hw.name}</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">({hw.type})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partners & Resellers Main Box */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/90 rounded-3xl border border-slate-700/80 p-8 sm:p-10 shadow-2xl mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-[#ff914d] border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> Growth & Channel
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
              Partners & Resellers
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              As a Security Alarm Integrator, MSP, or OEM, offer your customers a high-grade, white-labeled DDNS remote access solution that boosts their device security as well as your subscription revenue. With the added benefit of our No-IP API, you can easily integrate our solution into your existing infrastructure for even more seamless management and automation.
            </p>

            {/* Reseller Benefits Checklist */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Reseller Benefits:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-200">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff6600] flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: View Full API Documentation & Quick Links */}
            <div className="mt-7 pt-5 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
              <button
                id="btn-view-full-api-documentation"
                type="button"
                onClick={handleScrollToResources}
                className="inline-flex items-center gap-2 bg-[#ff6600] hover:bg-[#e65c00] active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                title="Scroll smoothly to the Resources and Knowledge section"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Full API Documentation</span>
                <ArrowDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                id="btn-open-official-api-docs-tab"
                type="button"
                onClick={handleOpenDocsNewTab}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                title="Open official No-IP API documentation in a new tab"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#ff914d]" />
              </button>
            </div>
          </div>

          {/* Interactive API Terminal / Reseller Integration Snippet */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-700/80 p-5 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[11px] font-semibold text-slate-300">No-IP REST API</span>
              </div>

              <button
                onClick={handleCopyApi}
                className="hover:text-white flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded transition-colors"
                title="Copy API call"
              >
                {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="mt-3 text-slate-300 text-[11px] sm:text-xs overflow-x-auto leading-relaxed whitespace-pre font-mono">
              <code>{apiSampleCode}</code>
            </pre>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">HTTP Basic / OAuth 2.0 Auth</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleScrollToResources}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-sans cursor-pointer"
                  title="View Full API Documentation in Resources"
                >
                  <BookOpen className="w-3 h-3 text-[#ff6600]" />
                  <span>Full API Docs</span>
                </button>
                <span className="text-slate-700">|</span>
                <a
                  href="#integrate-via-api"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('integrate-via-api')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#ff914d] hover:underline flex items-center gap-1 font-sans font-semibold"
                >
                  Integrate via API
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-700">|</span>
                <a
                  href="#api-simulator-widget"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('api-simulator-widget')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-sans"
                >
                  Simulator
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Integrate via API Section with Copyable Code Snippets */}
        <IntegrateViaApiSection />

        {/* Interactive API Simulator Widget */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-[#ff914d] border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Code2 className="w-3.5 h-3.5 text-[#ff6600]" />
                Interactive Developer Sandbox
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                API Simulator: Programmatic DNS Record Update
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Test and validate simulated DNS updates with live credential validation, domain checks, and instant JSON response statuses.
              </p>
            </div>
          </div>

          <ApiSimulator />
        </div>

        {/* Interactive API Playground & Edge Propagation */}
        <IntegrateViaApi />
      </div>
    </section>
  );
};
