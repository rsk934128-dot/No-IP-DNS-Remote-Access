import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  X,
  Code2,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Server,
  Wifi,
  Key,
  Terminal,
  Search,
  RotateCcw,
  Check,
  ChevronRight,
  Layers,
  Zap,
} from 'lucide-react';
import { NewsItem } from '../types';

interface NewsKnowledgeProps {
  onOpenDnsLookup?: (domain?: string) => void;
  onOpenPortChecker?: (port?: number, host?: string) => void;
}

export const NewsKnowledge: React.FC<NewsKnowledgeProps> = ({
  onOpenDnsLookup,
  onOpenPortChecker,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Security Simulation State
  const [simMode, setSimMode] = useState<'vulnerable' | 'protected'>('protected');

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    dnssec: true,
    doh: true,
    router_pass: true,
    wan_disabled: true,
    ddns_keys: false,
    iot_vlan: false,
    egress_filter: false,
  });

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems = [
    {
      id: 'dnssec',
      title: 'Enforce DNSSEC Validation on Upstream Resolvers',
      desc: 'Ensure your router or local DNS resolver (e.g. 1.1.1.1, 8.8.8.8, 9.9.9.9) validates cryptographic signatures (RRSIG).',
      severity: 'Critical',
      actionPrompt: 'Verify with DoH Lookup',
      action: () => onOpenDnsLookup?.('cloudflare.com'),
    },
    {
      id: 'doh',
      title: 'Enable Encrypted DNS (DoH on Port 443 / DoT on Port 853)',
      desc: 'Prevents ISP and local LAN eavesdroppers from viewing or forging plaintext port 53 UDP traffic.',
      severity: 'High',
      actionPrompt: 'Open DoH Tool',
      action: () => onOpenDnsLookup?.(),
    },
    {
      id: 'router_pass',
      title: 'Change Default Router Admin Credentials & Update Firmware',
      desc: 'Patch critical buffer overflow vulnerabilities in embedded router forwarders (like dnsmasq) and lock admin access.',
      severity: 'Critical',
      actionPrompt: 'Scan Ports',
      action: () => onOpenPortChecker?.(80),
    },
    {
      id: 'wan_disabled',
      title: 'Disable Remote WAN Management & UPnP on Gateway',
      desc: 'Stops external attackers on the internet from modifying your router DNS server assignments remotely.',
      severity: 'Critical',
      actionPrompt: 'Check Ports',
      action: () => onOpenPortChecker?.(8080),
    },
    {
      id: 'ddns_keys',
      title: 'Use Scoped DDNS Keys Instead of Master Account Passwords',
      desc: 'Never store your primary No-IP account credentials in router firmware. Issue isolated DDNS Key pairs.',
      severity: 'High',
      actionPrompt: null,
      action: null,
    },
    {
      id: 'iot_vlan',
      title: 'Segment Smart IoT Gadgets & CCTV into an Isolated VLAN',
      desc: 'Keeps compromised smart bulbs or unpatched cameras from launching internal ARP spoofing or rogue DNS replies.',
      severity: 'Medium',
      actionPrompt: null,
      action: null,
    },
    {
      id: 'egress_filter',
      title: 'Block or Redirect Outbound Port 53 UDP/TCP on Firewall',
      desc: 'Force all network endpoints to query your trusted DNS servers and prevent malware from hardcoding rogue public resolvers.',
      severity: 'Medium',
      actionPrompt: null,
      action: null,
    },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const healthPercent = Math.round((checkedCount / totalCount) * 100);

  const articles: NewsItem[] = [
    {
      id: 'art-dns-security-poisoning',
      title: 'DNS Cache Poisoning & Home Network Defense: Complete Security Blueprint',
      category: 'Cybersecurity',
      date: 'Updated 2026',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      excerpt: 'How attackers exploit legacy UDP port 53 to spoof domain resolutions, how the Kaminsky flaw forged responses, and why DNSSEC and encrypted DoH/DoT make poisoning mathematically impossible.',
    },
    {
      id: 'art-api-developer-docs',
      title: 'Full API Documentation: Dynamic DNS Update Specifications & DDNS Keys',
      category: 'Developer API',
      date: 'Updated 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Official specification for programmatic DNS updates via HTTP GET, RFC 7617 Basic Authentication, custom User-Agent policies, and return code reference matrices.',
    },
    {
      id: 'art-router-setup',
      title: 'How to Configure DDNS on Netgear, TP-Link, and ASUS Routers',
      category: 'Router Guides',
      date: 'September 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      excerpt: 'Most modern wireless routers have No-IP DDNS built right into the admin firmware. Follow this step-by-step walkthrough to configure automated IP synchronization in under 3 minutes.',
    },
    {
      id: 'art-port-forwarding-vs-tunnels',
      title: 'Port Forwarding vs. Public Tunnels: Which is Right for You?',
      category: 'Remote Access',
      date: 'August 2026',
      readTime: '6 min read',
      image: '/src/assets/images/port_forwarding_tools_1789671685947.jpg',
      excerpt: 'Learn the difference between traditional NAT port forwarding and encrypted Public Tunnels. Understand how Public Tunnels solves CGNAT barriers without opening inbound firewall ports.',
    },
    {
      id: 'art-anycast-uptime',
      title: 'Why Anycast Architecture is Crucial for 100% DNS Uptime',
      category: 'Engineering & Infrastructure',
      date: 'July 2026',
      readTime: '5 min read',
      image: '/src/assets/images/anycast_datacenter_1789920040526.jpg',
      excerpt: 'A deep dive into how 150+ Points of Presence use BGP Anycast routing to automatically route customer queries to the nearest, fastest, and most resilient data center.',
    },
  ];

  return (
    <section id="resources-section" className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* ======================================================== */}
        {/* NEW SECTION: DNS SECURITY BEST PRACTICES                 */}
        {/* ======================================================== */}
        <div id="dns-security-best-practices" className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cybersecurity & Threat Mitigation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0a2540] dark:text-white tracking-tight">
                DNS Security Best Practices
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
                Actionable blueprints to fortify your home network, secure remote access endpoints, and prevent dangerous DNS cache poisoning (DNS spoofing) attacks.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenDnsLookup && (
                <button
                  type="button"
                  onClick={() => onOpenDnsLookup()}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5 text-[#ff6600]" />
                  <span>Test DNSSEC Live</span>
                </button>
              )}
              {onOpenPortChecker && (
                <button
                  type="button"
                  onClick={() => onOpenPortChecker()}
                  className="px-4 py-2 rounded-xl bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Scan Gateway Ports</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Explainer: What is DNS Poisoning & How to Stop It */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Interactive Attack Architecture
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0a2540] dark:text-white mt-1">
                  How DNS Cache Poisoning Works vs. Multi-Layer Defense
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  In a cache poisoning attack, an adversary floods a recursive resolver with forged UDP responses matching the 16-bit Transaction ID (TxID). If accepted, legitimate traffic is hijacked to an attacker-controlled server.
                </p>
              </div>

              {/* Toggle Protection Mode */}
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setSimMode('vulnerable')}
                  className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    simMode === 'vulnerable'
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unprotected Network</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSimMode('protected')}
                  className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    simMode === 'protected'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Hardened with DNSSEC & DoH</span>
                </button>
              </div>
            </div>

            {/* Visual Flow Diagram */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              simMode === 'vulnerable'
                ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Node 1: Client */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    <Wifi className="w-4 h-4 text-[#ff6600]" />
                    <span>Home Device / IoT</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Queries <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 rounded">myhome.ddns.net</code>
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-slate-400">Step 1: Standard Query</div>
                </div>

                {/* Node 2: Local Gateway Resolver */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                    <Server className="w-4 h-4 text-sky-500" />
                    <span>Router / Resolver</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {simMode === 'vulnerable'
                      ? 'Plaintext UDP port 53. Predictable port & TxID allocation.'
                      : 'DoH/DoT over TLS on 443/853. Source port randomized.'}
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-slate-400">Step 2: Recursive Forwarding</div>
                </div>

                {/* Node 3: Attacker Injection */}
                <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
                  simMode === 'vulnerable'
                    ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                    {simMode === 'vulnerable' ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Poison Injection: Success</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Poison Attempt: Dropped</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {simMode === 'vulnerable'
                      ? 'Attacker sends forged reply with spoofed IP. Cache is poisoned!'
                      : 'Attacker cannot forge RRSIG cryptographic key. Resolver drops forged packets.'}
                  </p>
                  <div className="mt-3 text-[10px] font-bold opacity-75">Step 3: Signature Validation</div>
                </div>

                {/* Node 4: Final Outcome */}
                <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
                  simMode === 'vulnerable'
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-emerald-600 text-white border-emerald-700'
                }`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>{simMode === 'vulnerable' ? 'Vulnerable: Hijacked' : 'Secure: Authenticated'}</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {simMode === 'vulnerable'
                      ? 'User is silently redirected to a phishing clone or intercepted by an adversary.'
                      : 'User securely reaches their authentic home server or camera via verified DNS record.'}
                  </p>
                  <div className="mt-3 text-[10px] font-bold opacity-80">
                    {simMode === 'vulnerable' ? 'Result: Credential Theft' : 'Result: 100% Cryptographic Trust'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {simMode === 'vulnerable'
                    ? '⚠️ Warning: Unencrypted DNS and routers without DNSSEC validation remain susceptible to Kaminsky-style cache poisoning attacks.'
                    : '🔒 Protected: DNSSEC guarantees non-forgeable record authenticity from the root zone down to your domain.'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(articles[0])}
                  className="font-bold text-[#ff6600] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Read Technical Blueprint <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 6 Actionable Best Practice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. DNSSEC */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2">
                  DEFENSE #1 • CRYPTOGRAPHIC TRUST
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Enforce DNSSEC Validation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  DNSSEC signs resource records with asymmetric keys (RRSIG). Resolvers verify the digital signature against the parent zone's DS record, mathematically stopping forged responses from entering the cache.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Recommended Upstream Resolvers:</span>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">1.1.1.1 (Cloudflare)</div>
                  <div className="text-sky-600 dark:text-sky-400 font-bold">8.8.8.8 (Google Public DNS)</div>
                  <div className="text-purple-600 dark:text-purple-400 font-bold">9.9.9.9 (Quad9 Filtered)</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Mitigates Cache Spoofing</span>
                {onOpenDnsLookup && (
                  <button
                    onClick={() => onOpenDnsLookup('cloudflare.com')}
                    className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1 cursor-pointer"
                  >
                    Check DNSSEC <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Encrypted DNS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 mb-2">
                  DEFENSE #2 • PRIVACY & INTEGRITY
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Adopt DNS-over-HTTPS (DoH) / DoT
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Standard DNS sends queries in cleartext over UDP port 53. Encrypt queries using DoH (port 443) or DoT (port 853) to eliminate ISP snooping, coffee-shop Wi-Fi manipulation, and on-path MitM alteration.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Quick OS Activation:</span>
                  <div className="text-slate-800 dark:text-slate-200">Windows 11: Settings &gt; Network &gt; DNS over HTTPS</div>
                  <div className="text-slate-800 dark:text-slate-200">macOS / iOS: Encrypted DNS Profile</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Prevents Traffic Snooping</span>
                {onOpenDnsLookup && (
                  <button
                    onClick={() => onOpenDnsLookup()}
                    className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1 cursor-pointer"
                  >
                    Open DoH Tool <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Router Gateway Hardening */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                  <Server className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 mb-2">
                  DEFENSE #3 • PERIMETER HYGIENE
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Harden Router Gateway Firmware
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Attackers scan residential IP ranges to exploit default admin logins and vulnerable embedded DNS forwarders (e.g. older dnsmasq flaws). Always change default credentials and disable remote WAN management.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Disable WAN Admin (Remote Management)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Disable Universal Plug and Play (UPnP)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Enable Auto-Firmware Updates</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Protects LAN Forwarder</span>
                {onOpenPortChecker && (
                  <button
                    onClick={() => onOpenPortChecker(8080)}
                    className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1 cursor-pointer"
                  >
                    Check Open Ports <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Scoped DDNS Keys */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 mb-2">
                  DEFENSE #4 • PRINCIPLE OF LEAST PRIVILEGE
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Deploy Dedicated DDNS Keys
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Never put your master No-IP password into router configuration fields or Docker environment files. Generate scoped DDNS Keys with access locked strictly to designated hostnames.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">RFC 7617 Authorization:</span>
                  <div className="text-purple-600 dark:text-purple-400">Username: key_usr_98a72b</div>
                  <div className="text-slate-500">Scope: Restricted to single FQDN</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Limits Blast Radius</span>
                <a
                  href="#active-hostnames-section"
                  className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1 cursor-pointer"
                >
                  Manage Hostnames <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 5. Network Segmentation & IoT VLANs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 mb-2">
                  DEFENSE #5 • LOCAL LATERAL ISOLATION
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Segment IoT & IP Cameras on VLANs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Smart home devices (CCTV cameras, smart TVs, IoT bulbs) are frequent targets for Mirai-style botnets. Isolate them onto a dedicated Guest or IoT VLAN to prevent rogue ARP poisoning or DHCP/DNS spoofing across your home network.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Create "IoT VLAN" (e.g. Subnet 192.168.20.0/24)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Block IoT traffic from accessing Private LAN</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Stops Internal Lateral Attacks</span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Zero Trust LAN</span>
              </div>
            </div>

            {/* 6. Port 53 Egress Filtering */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-2">
                  DEFENSE #6 • FIREWALL POLICY
                </div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white mb-2">
                  Restrict Outbound Port 53 Egress
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Malware often attempts to bypass your secure local resolver by directly sending queries to hardcoded external IP addresses. Set up router firewall rules to block or redirect all outbound UDP/TCP 53 traffic.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">iptables NAT Redirection:</span>
                  <code>iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-ports 53</code>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Enforces DNS Compliance</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Strict Egress</span>
              </div>
            </div>
          </div>

          {/* Interactive Home Network Security Audit Checklist */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Self-Audit Assessment</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0a2540] dark:text-white">
                  Home Network Hardening Checklist
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Audit your home network setup below. Check off each item as you apply the defense configuration.
                </p>
              </div>

              {/* Score Meter */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hardening Score</span>
                  <span className="text-base font-extrabold text-[#0a2540] dark:text-white">
                    {checkedCount} / {totalCount} Controls ({healthPercent}%)
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% ${healthPercent}%, 0 ${healthPercent}%)`,
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 z-10">{healthPercent}%</span>
                </div>
              </div>
            </div>

            {/* Checklist items list */}
            <div className="space-y-3">
              {checklistItems.map((item) => {
                const isDone = !!checklist[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isDone ? 'text-emerald-950 dark:text-emerald-200' : 'text-[#0a2540] dark:text-white'}`}>
                            {item.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              item.severity === 'Critical'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : item.severity === 'High'
                                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {item.action && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action?.();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#ff6600] dark:hover:text-[#ff914d] text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>{item.actionPrompt}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Assessment Feedback Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {healthPercent === 100 ? '🛡️ Perfect: Your network adheres to modern zero-trust DNS standards.' : `${totalCount - checkedCount} recommended defense controls remain unverified.`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const allTrue: Record<string, boolean> = {};
                    checklistItems.forEach((i) => (allTrue[i.id] = true));
                    setChecklist(allTrue);
                  }}
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 text-xs font-semibold cursor-pointer"
                >
                  Mark All Compliant
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const allFalse: Record<string, boolean> = {};
                    checklistItems.forEach((i) => (allFalse[i.id] = false));
                    setChecklist(allFalse);
                  }}
                  className="text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                >
                  Reset Checklist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXISTING KNOWLEDGE ARTICLES & GUIDES                     */}
        {/* ======================================================== */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" /> Technical Documentation & Tutorials
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] dark:text-white tracking-tight">
                No-IP News & Knowledge Base
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Step-by-step router walkthroughs, developer API guides, and infrastructure blueprints.
              </p>
            </div>

            <a
              href="#knowledge-base"
              onClick={(e) => {
                e.preventDefault();
                setSelectedArticle(articles[0]);
              }}
              className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1.5 cursor-pointer"
            >
              Explore Featured Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between hover:border-[#ff6600]/40 group"
              >
                <div>
                  {/* Article Thumbnail Image */}
                  {item.image && (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-slate-900/85 backdrop-blur text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-white/20">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                      {!item.image && (
                        <span className="bg-orange-50 dark:bg-orange-950/50 text-[#ff6600] dark:text-[#ff914d] px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-orange-200/50 dark:border-orange-800/40">
                          {item.category}
                        </span>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#0a2540] dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] transition-colors mb-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => setSelectedArticle(item)}
                    className="text-xs font-bold text-[#0a2540] dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Read Technical Guide
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            {/* Modal Header Image Banner */}
            {selectedArticle.image ? (
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />
                
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 p-1.5 rounded-full backdrop-blur transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-5 right-5">
                  <span className="text-[10px] font-bold text-[#ff914d] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    {selectedArticle.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug drop-shadow-sm">
                    {selectedArticle.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span>Published {selectedArticle.date}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-[#ff6600] uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#0a2540] dark:text-white mt-1">
                    {selectedArticle.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Published {selectedArticle.date}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="p-6 pt-4 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-h-[55vh] overflow-y-auto leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedArticle.excerpt}
              </p>

              {selectedArticle.id === 'art-dns-security-poisoning' ? (
                <>
                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">
                    1. The Anatomy of DNS Cache Poisoning (DNS Spoofing)
                  </h4>
                  <p>
                    DNS was originally designed in the 1980s without built-in authentication. Queries and replies travel over UDP port 53. Because UDP is connectionless, source IP addresses can be easily forged. An attacker sending thousands of forged DNS response packets to a recursive resolver can match the 16-bit Transaction ID (TxID) before the authentic nameserver can reply.
                  </p>
                  <p>
                    Once the resolver accepts the poisoned entry, it stores the malicious IP address in its local cache. For the entire duration of the TTL (Time To Live), every single computer, phone, or IoT gadget on your network that asks for that domain is directed to the attacker's server.
                  </p>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">
                    2. Why DNSSEC Is the Absolute Gold Standard
                  </h4>
                  <p>
                    Domain Name System Security Extensions (DNSSEC) completely eliminates transaction ID guessing attacks. With DNSSEC, each DNS zone publishes cryptographic keys (DNSKEY) and signs each set of resource records with a digital signature (RRSIG). Resolvers verify the digital signature using a chain of trust that extends all the way up to the IANA root keys. Even if an attacker floods your resolver with 10,000 forged responses, the resolver rejects every one of them because the attacker cannot forge the zone's private cryptographic key.
                  </p>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">
                    3. Action Steps for Home & Small Office Networks
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="text-slate-800 dark:text-white">Configure DNSSEC-validating resolvers:</strong> Set your router WAN DNS to 1.1.1.1 (Cloudflare), 8.8.8.8 (Google), or 9.9.9.9 (Quad9).</li>
                    <li><strong className="text-slate-800 dark:text-white">Enable Encrypted DNS:</strong> Activate DNS-over-HTTPS (DoH) in Windows 11, macOS, or your router to prevent local on-path snooping.</li>
                    <li><strong className="text-slate-800 dark:text-white">Audit open ports:</strong> Regularly verify that your router's administration interface is not exposed to the public internet on port 80, 443, or 8080.</li>
                    <li><strong className="text-slate-800 dark:text-white">Use DDNS Keys:</strong> Never put your primary No-IP account credentials into router firmware. Generate dedicated, isolated DDNS Keys.</li>
                  </ul>
                </>
              ) : selectedArticle.id === 'art-api-developer-docs' ? (
                <>
                  <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">Standard Update Endpoint:</div>
                    <code className="text-[#ff914d] font-bold">GET https://dynupdate.no-ip.com/nic/update</code>
                  </div>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Authentication Requirements (RFC 7617)</h4>
                  <p>
                    All API update requests require standard HTTP Basic Authentication over TLS 1.2 or 1.3. For enhanced security and zero-trust isolation, generate dedicated DDNS Keys in your No-IP portal instead of using your master account password.
                  </p>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Query Parameters</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-slate-800 dark:text-white">hostname</strong> (Required): The fully qualified domain name (FQDN) or comma-separated list of hostnames to update.</li>
                    <li><strong className="text-slate-800 dark:text-white">myip</strong> (Optional): The IPv4 or IPv6 address to assign. If omitted, the No-IP Anycast edge automatically resolves to the client's public egress IP address.</li>
                  </ul>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Standard Return Codes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs pt-1">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300">
                      <strong>good &lt;IP&gt;</strong>: Success, record updated.
                    </div>
                    <div className="p-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-sky-900 dark:text-sky-300">
                      <strong>nochg &lt;IP&gt;</strong>: Record already matches IP.
                    </div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-900 dark:text-rose-300">
                      <strong>badauth</strong>: Invalid credentials or key.
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300">
                      <strong>abuse</strong>: Rate limited / excessive polling.
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="https://www.noip.com/integrate/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#ff6600] hover:underline"
                    >
                      Open Official No-IP API Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Step 1: Locate Dynamic DNS in your Router Admin</h4>
                  <p>
                    Log in to your router gateway (typically 192.168.1.1 or routerlogin.net). Navigate to Advanced &gt; Dynamic DNS or WAN Settings. Look for the "DDNS" service provider dropdown menu.
                  </p>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Step 2: Choose No-IP as the Service Provider</h4>
                  <p>
                    From the provider list, select "No-IP" or "No-IP.com". Enter your registered email address or DDNS key credentials, along with your chosen hostname (e.g., yourname.ddns.net).
                  </p>

                  <h4 className="font-bold text-[#0a2540] dark:text-white text-sm pt-2">Step 3: Save & Verify Handshake</h4>
                  <p>
                    Click "Apply" or "Save". Your router will immediately send a verification packet to No-IP’s Anycast update server. Within 30 seconds, your hostname status will display "Success" or "Normal".
                  </p>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl text-orange-950 dark:text-orange-200 text-xs">
                    <strong>Pro Tip:</strong> If your ISP places you behind Carrier-Grade NAT (CGNAT), use No-IP Public Tunnels to bypass port forwarding completely.
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
