import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Globe,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  RotateCw,
  ExternalLink,
  Server,
  Code,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  queryDnsRecord,
  queryAllDnsRecords,
  DnsLookupResponse,
  DnsRecordAnswer,
  sanitizeDomainInput,
} from '../utils/dnsLookup';

interface DnsLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
  onTestPortOnIp?: (ip: string) => void;
}

export const DnsLookupModal: React.FC<DnsLookupModalProps> = ({
  isOpen,
  onClose,
  initialDomain = '',
  onTestPortOnIp,
}) => {
  const [domain, setDomain] = useState(initialDomain || 'google.com');
  const [recordType, setRecordType] = useState<string>('ALL');
  const [resolver, setResolver] = useState<'google' | 'cloudflare'>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DnsLookupResponse | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Quick domain presets
  const presets = ['google.com', 'github.com', 'cloudflare.com', 'wikipedia.org', 'noip.com'];

  const recordTypes = [
    { id: 'ALL', label: 'ALL Records' },
    { id: 'A', label: 'A (IPv4)' },
    { id: 'AAAA', label: 'AAAA (IPv6)' },
    { id: 'MX', label: 'MX (Mail)' },
    { id: 'TXT', label: 'TXT (SPF/DKIM)' },
    { id: 'NS', label: 'NS (Name Servers)' },
    { id: 'CNAME', label: 'CNAME' },
    { id: 'CAA', label: 'CAA' },
  ];

  const handlePerformLookup = async (targetDomain?: string, targetType?: string) => {
    const domainToQuery = targetDomain || domain;
    const typeToQuery = targetType || recordType;

    if (!domainToQuery.trim()) return;

    setIsLoading(true);
    try {
      let resp: DnsLookupResponse;
      if (typeToQuery === 'ALL') {
        resp = await queryAllDnsRecords(domainToQuery, resolver);
      } else {
        resp = await queryDnsRecord(domainToQuery, typeToQuery, resolver);
      }
      setResult(resp);
    } catch (err: any) {
      console.error('DNS Lookup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial lookup on open
  useEffect(() => {
    if (isOpen) {
      const activeDomain = initialDomain || domain || 'google.com';
      setDomain(activeDomain);
      handlePerformLookup(activeDomain, recordType);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'A':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'AAAA':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'MX':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'TXT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'NS':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'CNAME':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-[#0a2540] to-slate-950 p-5 sm:p-6 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>REAL-TIME PUBLIC DNS OVER HTTPS (DoH)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Live Public DNS Record Lookup</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/40">
              Live Anycast
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Query live authoritative DNS records directly from Google Public DNS (8.8.8.8) or Cloudflare (1.1.1.1)
            for any internet domain with latency and DNSSEC verification.
          </p>
        </div>

        {/* Input Bar & Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Domain input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePerformLookup()}
                placeholder="Enter domain (e.g. google.com, github.com)..."
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] transition-all font-mono"
              />
            </div>

            {/* Resolver Toggle */}
            <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setResolver('google')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  resolver === 'google'
                    ? 'bg-white dark:bg-slate-700 text-[#0a2540] dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Google DNS (8.8.8.8)
              </button>
              <button
                type="button"
                onClick={() => setResolver('cloudflare')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  resolver === 'cloudflare'
                    ? 'bg-white dark:bg-slate-700 text-[#0a2540] dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cloudflare (1.1.1.1)
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handlePerformLookup()}
              disabled={isLoading || !domain.trim()}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-[#ff6600] to-orange-600 hover:from-[#e65c00] hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Querying...' : 'Lookup DNS'}</span>
            </button>
          </div>

          {/* Record Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-1 shrink-0">
              Type:
            </span>
            {recordTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setRecordType(t.id);
                  handlePerformLookup(domain, t.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  recordType === t.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Preset Domains */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Try domain:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setDomain(p);
                    handlePerformLookup(p, recordType);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 text-slate-700 dark:text-slate-300 hover:text-[#ff6600] dark:hover:text-[#ff914d] text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-slate-300 border-t-[#ff6600] rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Dispatching DNS query to {resolver === 'google' ? 'Google 8.8.8.8' : 'Cloudflare 1.1.1.1'} Anycast DoH...
              </p>
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-4">
              {/* Telemetry Header Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                        {result.domain}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {result.statusName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Resolved via {result.resolver === 'google' ? 'Google Public DNS (8.8.8.8)' : 'Cloudflare (1.1.1.1)'} • {result.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round-Trip Latency</span>
                    <span className="text-sm font-extrabold text-[#ff6600]">{result.latencyMs} ms</span>
                  </div>

                  {result.isDnssecValidated ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> DNSSEC Validated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                      Standard DNS
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff6600] cursor-pointer"
                    title="Toggle Raw JSON view"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Raw JSON View if toggled */}
              {showRawJson && (
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}

              {/* Answers Table */}
              {result.answers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">No {result.recordType} records returned</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    The requested domain did not return any records for query type "{result.recordType}". Try selecting "ALL" or checking the spelling.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                  <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Resolved DNS Records ({result.answers.length})</span>
                    <span className="font-normal text-[11px] text-slate-500">TTL is in seconds</span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">TTL</th>
                        <th className="py-2.5 px-4">Value / Target IP</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {result.answers.map((ans, idx) => (
                        <tr
                          key={`${ans.type}-${idx}-${ans.data}`}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border font-mono ${getTypeBadgeColor(
                                ans.typeName
                              )}`}
                            >
                              {ans.typeName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                            {ans.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                            {ans.TTL}s
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-100 break-all max-w-[320px]">
                            {ans.priority !== undefined && (
                              <span className="text-[#ff6600] mr-1.5 font-sans font-semibold text-[11px]">
                                [Priority: {ans.priority}]
                              </span>
                            )}
                            {ans.data}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Test Port button if IPv4 A record */}
                              {ans.typeName === 'A' && onTestPortOnIp && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onTestPortOnIp(ans.data);
                                  }}
                                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-600 dark:text-slate-300 hover:text-[#ff6600] text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                                  title="Check open ports on this IP"
                                >
                                  Test Port
                                </button>
                              )}

                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => handleCopy(ans.data)}
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="Copy record value"
                              >
                                {copiedText === ans.data ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Real Internet DNS
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Zero caching client queries</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
