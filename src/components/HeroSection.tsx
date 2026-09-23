import React, { useState } from 'react';
import { 
  Radio, 
  Server, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Wifi, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink,
  Search
} from 'lucide-react';
import { HostnameRecord } from '../types';

interface HeroSectionProps {
  currentIp: string;
  onAddHostname: (newRecord: HostnameRecord) => void;
  onOpenPortChecker: (prefillPort?: number, prefillHost?: string) => void;
  onOpenDomainSearch: () => void;
  onOpenDnsLookup?: (domain?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentIp,
  onAddHostname,
  onOpenPortChecker,
  onOpenDomainSearch,
  onOpenDnsLookup,
}) => {
  const [hostnameInput, setHostnameInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('.freedynamicdns.net');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedFqdn, setCopiedFqdn] = useState(false);
  const [lastCreatedFqdn, setLastCreatedFqdn] = useState<string | null>(null);
  const [customIp, setCustomIp] = useState(currentIp);
  const [showIpOverride, setShowIpOverride] = useState(false);

  const availableDomains = [
    '.freedynamicdns.net',
    '.ddns.net',
    '.zapto.org',
    '.hopto.org',
    '.bounceme.net',
    '.myvnc.com',
    '.servegame.com',
  ];

  const handleCreateHostname = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = hostnameInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!cleanName) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    // Simulate instant DNS registration to No-IP Anycast infrastructure
    setTimeout(() => {
      const fullHostname = `${cleanName}${selectedDomain}`;
      const newRecord: HostnameRecord = {
        id: `host_${Date.now()}`,
        name: cleanName,
        domain: selectedDomain,
        fullHostname,
        targetIp: customIp || currentIp,
        recordType: 'A',
        lastUpdated: 'Just now',
        status: 'Active',
        port: 80,
      };

      onAddHostname(newRecord);
      setLastCreatedFqdn(fullHostname);
      setSuccessMessage(`Hostname created successfully! Configured to point to ${customIp || currentIp}`);
      setIsSubmitting(false);
      setHostnameInput('');
    }, 450);
  };

  const handleCopyFqdn = () => {
    if (!lastCreatedFqdn) return;
    navigator.clipboard?.writeText(lastCreatedFqdn);
    setCopiedFqdn(true);
    setTimeout(() => setCopiedFqdn(false), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0b213f] to-[#0a2540] text-white pt-10 sm:pt-16 pb-16 lg:pb-24">
      {/* Decorative Network Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Subtle glowing ambient circles */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#ff6600]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-[#ff914d] font-semibold backdrop-blur">
              <Shield className="w-3.5 h-3.5" /> 25 Years of Trusted High-Reliability DNS
            </div>
            {onOpenDnsLookup && (
              <button
                type="button"
                onClick={() => onOpenDnsLookup()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs text-emerald-300 font-bold backdrop-blur transition-all cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Public DNS Lookup (DoH)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Connect Your Home with Confidence
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-[#ff6600] mt-3">
            Smarter DNS Starts Here
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            No-IP empowers the world to connect, share, and name things online. Both Home and Business users turn to our internet connectivity solutions, built on DNS, to maximize reliability and remove complexity.
          </p>
        </div>

        {/* Hostname Creator Card */}
        <div 
          id="hostname-creator-form"
          className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0a2540] dark:text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-[#ff6600]" />
                Create Your Free Hostname Now
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                No credit card required. Free Dynamic DNS with instant worldwide propagation.
              </p>
            </div>

            {/* Current IP display pill */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs border border-slate-200/50 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Your Public IP:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentIp}</span>
              <button
                type="button"
                onClick={() => setShowIpOverride(!showIpOverride)}
                className="text-xs text-[#ff6600] dark:text-[#ff914d] hover:underline ml-1 cursor-pointer"
                title="Change or customize target IP"
              >
                {showIpOverride ? 'Hide' : 'Edit'}
              </button>
            </div>
          </div>

          {showIpOverride && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
              <label htmlFor="custom-ip-input" className="font-medium text-slate-700 dark:text-slate-300">
                Custom Target IP (Optional for VPN / VPS / Server):
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-ip-input"
                  type="text"
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  placeholder="e.g. 198.51.100.42"
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setCustomIp(currentIp)}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                >
                  Reset to Detected
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateHostname} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Hostname Name Input */}
              <div className="md:col-span-6 space-y-1.5">
                <label htmlFor="hero-hostname-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Hostname
                </label>
                <div className="relative">
                  <input
                    id="hero-hostname-input"
                    type="text"
                    required
                    value={hostnameInput}
                    onChange={(e) => setHostnameInput(e.target.value)}
                    placeholder="e.g. myhomecam, mc-server"
                    className="w-full px-3.5 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 rounded-xl text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* Domain Dropdown */}
              <div className="md:col-span-6 space-y-1.5">
                <label htmlFor="hero-domain-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Select a Domain
                </label>
                <select
                  id="hero-domain-select"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3.5 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/20 rounded-xl text-sm font-semibold bg-white text-slate-800 transition-all outline-none cursor-pointer"
                >
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain} className="dark:bg-slate-800 dark:text-white">
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Banner */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Full DNS Address:</span>
                <span className="font-mono font-bold text-[#0a2540] dark:text-[#ff914d]">
                  {hostnameInput.trim() ? `${hostnameInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')}${selectedDomain}` : `yourname${selectedDomain}`}
                </span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Free Hostname
              </span>
            </div>

            {/* CTA Button */}
            <button
              id="hero-create-hostname-btn"
              type="submit"
              disabled={isSubmitting || !hostnameInput.trim()}
              className="w-full py-3.5 px-6 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 disabled:opacity-50 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Registering with Anycast Network...
                </>
              ) : (
                <>
                  Create Your Free Hostname Now
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Success Card Feedback */}
          {successMessage && lastCreatedFqdn && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">Success! Your DDNS Hostname is Live.</p>
                    <p className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {lastCreatedFqdn} → {customIp || currentIp}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Traffic to {lastCreatedFqdn} will now automatically route to your IP address.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {onOpenDnsLookup && (
                    <button
                      onClick={() => onOpenDnsLookup(lastCreatedFqdn)}
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Lookup DNS
                    </button>
                  )}

                  <button
                    onClick={handleCopyFqdn}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedFqdn ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFqdn ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={() => onOpenPortChecker(80, lastCreatedFqdn)}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 dark:bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-500 transition-colors shadow-xs"
                  >
                    Test Port 80
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Showcase Banner: Global Anycast & DDNS Mesh */}
        <div className="mt-10 max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl relative group bg-slate-900/60 backdrop-blur">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-950">
            <img
              src="/src/assets/images/hero_network_mesh_1789920025314.jpg"
              alt="Global Dynamic DNS Network and Smart Home Mesh"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Overlay Live Telemetry Badges */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Anycast Global Mesh • 150+ PoPs Active
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-300 text-xs font-medium">
                Sub-Millisecond DNS Propagation
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
              <div>
                <h4 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-[#ff6600]" />
                  Continuous Dynamic IP Synchronization
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Automated heartbeat monitors and Dynamic Update Clients synchronize changing ISP IP addresses to your memorable hostname in real time.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('how-customers-use-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Use Cases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Solution Cards (Dynamic DNS, Managed DNS, Domain Registration) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {/* Card 1: Dynamic DNS */}
          <div 
            id="hero-ddns-card"
            className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-[#ff6600]/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#ff6600]/20 flex items-center justify-center text-[#ff6600] mb-4 group-hover:bg-[#ff6600] group-hover:text-white transition-colors">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dynamic DNS</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Remotely access cameras, servers, and devices-even with a Dynamic IP. Trusted by millions, integrated with billions of devices.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-700/50">
              <button
                id="get-remote-access-btn"
                onClick={() => {
                  const el = document.getElementById('ddns-explainer-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-[#ff6600] hover:text-white text-slate-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-[#ff6600]"
              >
                Get Remote Access
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Managed DNS */}
          <div 
            id="hero-managed-dns-card"
            className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-blue-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Managed DNS</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Leverage No-IP’s Anycast Network for fast, reliable DNS with 100% uptime and 150+ points of presence, plus API integration for control.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-700/50">
              <button
                id="empower-network-btn"
                onClick={() => {
                  const el = document.getElementById('managed-dns-explainer-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-blue-600 hover:text-white text-slate-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600"
              >
                Empower Your Network
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Domain Registration */}
          <div 
            id="hero-domain-card"
            className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Domain Registration</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Reserve your domain and build your online presence with No-IP’s easy domain registration. Find the perfect name and get started today.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-700/50">
              <button
                id="find-your-domain-btn"
                onClick={onOpenDomainSearch}
                className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-emerald-600 hover:text-white text-slate-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-emerald-600"
              >
                Find Your Domain
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
