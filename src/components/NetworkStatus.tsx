import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  POINTS_OF_PRESENCE,
  PointOfPresence,
} from '../data/popsData';
import {
  Activity,
  Zap,
  Server,
  Globe2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  BarChart3,
  TrendingDown,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  Clock,
  Radio,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';

type RegionFilter =
  | 'All'
  | 'North America'
  | 'Europe'
  | 'Asia Pacific'
  | 'Latin America'
  | 'Middle East & Africa';

type SortOption = 'latency-asc' | 'latency-desc' | 'uptime-desc' | 'city-asc';
type ChartViewMode = 'all-pops' | 'regional-benchmark' | 'health-sla';

export const NetworkStatus: React.FC = () => {
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latency-asc');
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('all-pops');
  const [displayLimit, setDisplayLimit] = useState<number>(20);
  const [isLiveJitterActive, setIsLiveJitterActive] = useState<boolean>(true);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeProgress, setProbeProgress] = useState<number>(100);
  const [selectedPoP, setSelectedPoP] = useState<PointOfPresence | null>(null);
  const [hoveredPoP, setHoveredPoP] = useState<PointOfPresence | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [csvDownloaded, setCsvDownloaded] = useState<boolean>(false);
  const [csvDropdownOpen, setCsvDropdownOpen] = useState<boolean>(false);
  const [lastExportSummary, setLastExportSummary] = useState<string>('');
  const [pingConsoleLogs, setPingConsoleLogs] = useState<string[]>([]);
  const [isPingingSelected, setIsPingingSelected] = useState<boolean>(false);

  const csvDropdownRef = useRef<HTMLDivElement>(null);

  // Close CSV dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (csvDropdownRef.current && !csvDropdownRef.current.contains(e.target as Node)) {
        setCsvDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic live latency map (PoP ID -> current live ms)
  const [liveLatencies, setLiveLatencies] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    POINTS_OF_PRESENCE.forEach((p) => {
      map[p.id] = p.latencyMs;
    });
    return map;
  });

  // --------------------------------------------------------------------------
  // LIVE NETWORK JITTER & PROBING
  // --------------------------------------------------------------------------
  // Periodic realistic micro-jitter (every 3 seconds when enabled)
  useEffect(() => {
    if (!isLiveJitterActive) return;

    const interval = setInterval(() => {
      setLiveLatencies((prev) => {
        const next = { ...prev };
        // Jitter a random subset of 15 PoPs slightly (±0.4 to 1.8 ms)
        const sampleCount = 15;
        for (let i = 0; i < sampleCount; i++) {
          const randomIndex = Math.floor(Math.random() * POINTS_OF_PRESENCE.length);
          const pop = POINTS_OF_PRESENCE[randomIndex];
          if (!pop) continue;
          const base = pop.latencyMs;
          const jitter = (Math.random() - 0.48) * 1.6;
          const val = Math.max(1.8, Number((base + jitter).toFixed(1)));
          next[pop.id] = val;
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveJitterActive]);

  // Manual Network Probe handler
  const handleRunFullProbe = useCallback(() => {
    if (isProbing) return;
    setIsProbing(true);
    setProbeProgress(0);

    const stepInterval = setInterval(() => {
      setProbeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(stepInterval);
          setIsProbing(false);
          // Apply fresh randomized probe values near base
          setLiveLatencies((current) => {
            const next = { ...current };
            POINTS_OF_PRESENCE.forEach((p) => {
              const delta = (Math.random() - 0.5) * 1.4;
              next[p.id] = Math.max(2, Number((p.latencyMs + delta).toFixed(1)));
            });
            return next;
          });
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  }, [isProbing]);

  // Ping Console simulator for Selected PoP
  const handlePingPoP = useCallback((pop: PointOfPresence) => {
    setIsPingingSelected(true);
    setPingConsoleLogs([
      `Initiating Anycast ICMP latency probe to ${pop.city} [${pop.ipRange.split('/')[0]}]...`,
    ]);

    const targetLatency = liveLatencies[pop.id] || pop.latencyMs;

    setTimeout(() => {
      setPingConsoleLogs((prev) => [
        ...prev,
        `64 bytes from ${pop.ipRange.split('/')[0]}: icmp_seq=1 ttl=58 time=${targetLatency.toFixed(1)} ms`,
      ]);
    }, 250);

    setTimeout(() => {
      const j1 = (targetLatency + (Math.random() - 0.5) * 0.8).toFixed(1);
      setPingConsoleLogs((prev) => [
        ...prev,
        `64 bytes from ${pop.ipRange.split('/')[0]}: icmp_seq=2 ttl=58 time=${j1} ms`,
      ]);
    }, 550);

    setTimeout(() => {
      const j2 = (targetLatency + (Math.random() - 0.5) * 0.9).toFixed(1);
      setPingConsoleLogs((prev) => [
        ...prev,
        `64 bytes from ${pop.ipRange.split('/')[0]}: icmp_seq=3 ttl=58 time=${j2} ms`,
      ]);
    }, 850);

    setTimeout(() => {
      setPingConsoleLogs((prev) => [
        ...prev,
        `--- ${pop.city} Anycast Node ping statistics ---`,
        `3 packets transmitted, 3 received, 0% packet loss, SLA verified.`,
      ]);
      setIsPingingSelected(false);
    }, 1200);
  }, [liveLatencies]);

  useEffect(() => {
    if (selectedPoP) {
      handlePingPoP(selectedPoP);
    }
  }, [selectedPoP, handlePingPoP]);

  // --------------------------------------------------------------------------
  // FILTERING, SORTING & AGGREGATIONS
  // --------------------------------------------------------------------------
  const filteredAndSortedPoPs = useMemo(() => {
    let result = POINTS_OF_PRESENCE.filter((pop) => {
      const matchesRegion = selectedRegion === 'All' || pop.region === selectedRegion;
      const matchesSearch =
        searchQuery === '' ||
        pop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pop.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pop.transitProviders.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pop.ipRange.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });

    result.sort((a, b) => {
      const latA = liveLatencies[a.id] || a.latencyMs;
      const latB = liveLatencies[b.id] || b.latencyMs;

      if (sortBy === 'latency-asc') return latA - latB;
      if (sortBy === 'latency-desc') return latB - latA;
      if (sortBy === 'uptime-desc') return b.uptimePct - a.uptimePct || latA - latB;
      if (sortBy === 'city-asc') return a.city.localeCompare(b.city);
      return 0;
    });

    return result;
  }, [selectedRegion, searchQuery, sortBy, liveLatencies]);

  const displayedPoPs = useMemo(() => {
    if (displayLimit >= filteredAndSortedPoPs.length) return filteredAndSortedPoPs;
    return filteredAndSortedPoPs.slice(0, displayLimit);
  }, [filteredAndSortedPoPs, displayLimit]);

  // Overall Network KPI calculations
  const networkMetrics = useMemo(() => {
    const latencies = POINTS_OF_PRESENCE.map((p) => liveLatencies[p.id] || p.latencyMs);
    const total = latencies.reduce((acc, curr) => acc + curr, 0);
    const avg = total / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const sub20 = latencies.filter((l) => l <= 20).length;
    const sub20Pct = ((sub20 / latencies.length) * 100).toFixed(1);

    const activeNodes = POINTS_OF_PRESENCE.filter((p) => p.status === 'active').length;

    return {
      avgLatency: avg.toFixed(1),
      minLatency: min.toFixed(1),
      maxLatency: max.toFixed(1),
      sub20Pct,
      activeNodes,
      totalNodes: POINTS_OF_PRESENCE.length,
      globalUptime: 99.999,
    };
  }, [liveLatencies]);

  // Regional Aggregates for Benchmark Bar Chart View
  const regionalBenchmarks = useMemo(() => {
    const regions: RegionFilter[] = [
      'North America',
      'Europe',
      'Asia Pacific',
      'Latin America',
      'Middle East & Africa',
    ];

    return regions.map((region) => {
      const regionPoPs = POINTS_OF_PRESENCE.filter((p) => p.region === region);
      const lats = regionPoPs.map((p) => liveLatencies[p.id] || p.latencyMs);
      const avg = lats.reduce((a, b) => a + b, 0) / lats.length;
      const min = Math.min(...lats);
      const max = Math.max(...lats);
      const primaryCount = regionPoPs.filter((p) => p.isPrimaryHub).length;

      return {
        region,
        count: regionPoPs.length,
        avgLatency: Number(avg.toFixed(1)),
        minLatency: Number(min.toFixed(1)),
        maxLatency: Number(max.toFixed(1)),
        primaryHubs: primaryCount,
        uptime: 99.999,
      };
    });
  }, [liveLatencies]);

  // Max Latency across current display scope for proportional bar math
  const maxDisplayLatency = useMemo(() => {
    if (displayedPoPs.length === 0) return 60;
    const max = Math.max(...displayedPoPs.map((p) => liveLatencies[p.id] || p.latencyMs));
    return Math.max(max, 50); // Ensure minimum scale of 50ms
  }, [displayedPoPs, liveLatencies]);

  // Color helper based on latency threshold
  const getLatencyColor = (latency: number) => {
    if (latency <= 15) {
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        gradient: 'from-emerald-500 to-teal-500',
      };
    }
    if (latency <= 32) {
      return {
        bar: 'bg-sky-500',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        gradient: 'from-sky-500 to-cyan-500',
      };
    }
    if (latency <= 55) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        gradient: 'from-amber-500 to-orange-500',
      };
    }
    return {
      bar: 'bg-orange-500',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      gradient: 'from-orange-500 to-rose-500',
    };
  };

  // Copy diagnostic report
  const handleCopyReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      service: 'No-IP Global Anycast DNS & Edge Network',
      metrics: networkMetrics,
      regionalBenchmarks,
      activeRegion: selectedRegion,
      topPoPs: displayedPoPs.slice(0, 10).map((p) => ({
        city: p.city,
        country: p.country,
        latencyMs: liveLatencies[p.id] || p.latencyMs,
        uptime: p.uptimePct,
        transit: p.transitProviders,
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Generate RFC-compliant CSV string from PoP data
  const generateCsvString = useCallback(
    (targetPoPs: PointOfPresence[]): string => {
      const headers = [
        'PoP ID',
        'City',
        'Country',
        'Region',
        'Current Latency (ms)',
        'Base Latency (ms)',
        'Latency Tier',
        'Connectivity Health',
        'Uptime SLA (%)',
        'Core Hub',
        'CIDR Subnet',
        'Latitude',
        'Longitude',
        'Transit & IXP Peering',
        'Export Timestamp',
      ];

      const escapeCell = (val: string | number | boolean | null | undefined): string => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const nowIso = new Date().toISOString();

      const dataRows = targetPoPs.map((pop) => {
        const liveLat = liveLatencies[pop.id] ?? pop.latencyMs;
        let tier = 'Extended (>55ms)';
        if (liveLat <= 15) tier = 'Ultra Fast (<15ms)';
        else if (liveLat <= 32) tier = 'Edge Nominal (15-32ms)';
        else if (liveLat <= 55) tier = 'Nominal (33-55ms)';

        return [
          escapeCell(pop.id),
          escapeCell(pop.city),
          escapeCell(pop.country),
          escapeCell(pop.region),
          escapeCell(liveLat.toFixed(1)),
          escapeCell(pop.latencyMs.toFixed(1)),
          escapeCell(tier),
          escapeCell('Operational (100%)'),
          escapeCell(`${pop.uptimePct.toFixed(3)}%`),
          escapeCell(pop.isPrimaryHub ? 'Yes' : 'No'),
          escapeCell(pop.ipRange),
          escapeCell(pop.coordinates[1]), // Latitude
          escapeCell(pop.coordinates[0]), // Longitude
          escapeCell(pop.transitProviders),
          escapeCell(nowIso),
        ].join(',');
      });

      return [headers.join(','), ...dataRows].join('\r\n');
    },
    [liveLatencies]
  );

  // Trigger browser download of CSV file
  const handleExportCsv = useCallback(
    (scope: 'filtered' | 'all' | 'single', singlePoP?: PointOfPresence) => {
      let targetList: PointOfPresence[] = [];
      let filenameScope = 'all';

      if (scope === 'single' && singlePoP) {
        targetList = [singlePoP];
        filenameScope = singlePoP.city.toLowerCase().replace(/[^a-z0-9]/g, '-');
      } else if (scope === 'filtered') {
        targetList = filteredAndSortedPoPs;
        const regionSlug = selectedRegion.toLowerCase().replace(/[^a-z0-9]/g, '-');
        filenameScope = `filtered-${regionSlug}`;
      } else {
        targetList = POINTS_OF_PRESENCE;
        filenameScope = 'all-150-pops';
      }

      const csvData = generateCsvString(targetList);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      link.setAttribute('href', url);
      link.setAttribute('download', `noip-network-health-${filenameScope}-${dateStr}-${timeStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastExportSummary(
        scope === 'single' && singlePoP
          ? `${singlePoP.city} data exported`
          : `${targetList.length} PoPs exported to CSV`
      );
      setCsvDownloaded(true);
      setTimeout(() => setCsvDownloaded(false), 3000);
    },
    [filteredAndSortedPoPs, generateCsvString, selectedRegion]
  );

  const regionTabs: { key: RegionFilter; label: string; count: number }[] = [
    { key: 'All', label: 'All Regions', count: POINTS_OF_PRESENCE.length },
    { key: 'North America', label: 'North America', count: 50 },
    { key: 'Europe', label: 'Europe', count: 40 },
    { key: 'Asia Pacific', label: 'Asia Pacific', count: 35 },
    { key: 'Latin America', label: 'Latin America', count: 15 },
    { key: 'Middle East & Africa', label: 'Middle East & Africa', count: 10 },
  ];

  return (
    <section
      id="network-status-section"
      className="py-16 bg-slate-950 text-slate-100 border-t border-slate-800 relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Edge Mesh Telemetry
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs font-mono">BGP Anycast AS-15169</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Network Status & Anycast Latency Spectrum
            </h2>

            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Real-time latency distribution, connectivity health, and BGP routing SLA across all 150 Points of Presence (PoPs) worldwide. Powered by redundant Tier-1 transit backbones.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunFullProbe}
              disabled={isProbing}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isProbing
                  ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600/90 hover:bg-emerald-600 border-emerald-500 text-white hover:shadow-emerald-950/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? `Probing Nodes (${probeProgress}%)` : 'Run Live Ping Probe'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLiveJitterActive(!isLiveJitterActive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isLiveJitterActive
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Simulates realistic live sub-millisecond network jitter"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Jitter: {isLiveJitterActive ? 'ON' : 'PAUSED'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export JSON</span>
                </>
              )}
            </button>

            {/* Export CSV Dropdown */}
            <div className="relative" ref={csvDropdownRef}>
              <button
                type="button"
                id="network-export-csv-btn"
                onClick={() => setCsvDropdownOpen(!csvDropdownOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  csvDownloaded
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
                title="Download current connection health and PoP latency data as CSV"
              >
                {csvDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">
                      {lastExportSummary || 'CSV Exported!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#ff6600]" />
                    <span>Export CSV</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </>
                )}
              </button>

              {csvDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Export Health Metrics (.csv)</span>
                    <FileSpreadsheet className="w-3 h-3 text-[#ff6600]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv('filtered');
                      setCsvDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ff6600]" />
                      <span>Filtered View</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                      {filteredAndSortedPoPs.length} PoPs
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportCsv('all');
                      setCsvDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>All Global PoPs</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                      150 Nodes
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-500 px-2 py-0.5">
                    Includes live latencies, SLA, coordinates, CIDR & transit providers.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP KPI METRICS BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Global Avg Latency */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Global Avg Latency</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {networkMetrics.avgLatency}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">ms</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sub-15ms edge routing SLA
            </p>
          </div>

          {/* Card 2: Fastest Edge Node */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Fastest Core Hub</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {networkMetrics.minLatency}
              </span>
              <span className="text-xs font-bold text-yellow-400 font-mono">ms</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ashburn, VA / Frankfurt IXP
            </p>
          </div>

          {/* Card 3: Node Connectivity */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Active PoPs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {networkMetrics.activeNodes}/{networkMetrics.totalNodes}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">100%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Zero degraded clusters
            </p>
          </div>

          {/* Card 4: Sub-20ms Reach */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Sub-20ms Reach</span>
              <Globe2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {networkMetrics.sub20Pct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Of global user population
            </p>
          </div>

          {/* Card 5: SLA Uptime */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Anycast SLA Target</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                99.999%
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Five 9s</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Automated BGP failover
            </p>
          </div>
        </div>

        {/* VIEW MODE TABS & CONTROL STRIP */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          {/* View Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setChartViewMode('all-pops')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all-pops'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>PoP Latency Spectrum</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('regional-benchmark')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'regional-benchmark'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Regional Benchmarks</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('health-sla')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'health-sla'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Node SLA Index</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by city, country, or IP..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#ff6600]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            {viewMode === 'all-pops' && (
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#ff6600] cursor-pointer"
                >
                  <option value="latency-asc">Fastest First (Lowest Latency)</option>
                  <option value="latency-desc">Highest Latency First</option>
                  <option value="uptime-desc">Highest Uptime (SLA)</option>
                  <option value="city-asc">City Name (A-Z)</option>
                </select>
              </div>
            )}

            {/* Display limit */}
            {viewMode === 'all-pops' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 hidden sm:inline">Show:</span>
                <select
                  value={displayLimit}
                  onChange={(e) => setDisplayLimit(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#ff6600] cursor-pointer"
                >
                  <option value={15}>Top 15</option>
                  <option value={30}>Top 30</option>
                  <option value={50}>Top 50</option>
                  <option value={150}>All 150 PoPs</option>
                </select>
              </div>
            )}

            {/* Quick Export CSV Button */}
            <button
              type="button"
              onClick={() => handleExportCsv('filtered')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Download CSV of current list (${filteredAndSortedPoPs.length} PoPs)`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#ff6600]" />
              <span className="hidden sm:inline">Export List (.csv)</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* REGIONAL FILTER TABS (for all-pops and health-sla mode) */}
        {viewMode !== 'regional-benchmark' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {regionTabs.map((tab) => {
              const isSelected = selectedRegion === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedRegion(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-800 border-slate-600 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-[#ff6600] text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* MAIN VISUALIZATION CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT / MAIN COLUMN: BAR CHART */}
          <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
            {/* Legend & Threshold Reference Guide */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-300">Latency Spectrum:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>&lt;15ms (Ultra)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                  <span>15-32ms (Edge)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span>33-55ms (Nominal)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                  <span>&gt;55ms (Hop)</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Showing {displayedPoPs.length} of {filteredAndSortedPoPs.length} matching nodes
              </div>
            </div>

            {/* VIEW 1: ALL POPS BAR CHART */}
            {viewMode === 'all-pops' && (
              <div className="space-y-2.5">
                {displayedPoPs.map((pop) => {
                  const latency = liveLatencies[pop.id] || pop.latencyMs;
                  const colorConfig = getLatencyColor(latency);
                  // Calculate bar width percentage relative to max displayed latency
                  const pct = Math.min(100, Math.max(6, (latency / maxDisplayLatency) * 100));
                  const isSelected = selectedPoP?.id === pop.id;

                  return (
                    <div
                      key={pop.id}
                      onClick={() => setSelectedPoP(pop)}
                      onMouseEnter={() => setHoveredPoP(pop)}
                      onMouseLeave={() => setHoveredPoP(null)}
                      className={`group p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-[#ff6600] ring-1 ring-[#ff6600]/40'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                        {/* City, Country & Badges */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                            {pop.city}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate">
                            {pop.country}
                          </span>
                          {pop.isPrimaryHub && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                              Core Hub
                            </span>
                          )}
                        </div>

                        {/* Latency & SLA Metrics */}
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className={`font-bold ${colorConfig.text}`}>
                            {latency.toFixed(1)} ms
                          </span>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            {pop.uptimePct.toFixed(3)}% SLA
                          </span>
                        </div>
                      </div>

                      {/* The Horizontal Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                        {/* Reference SLA line at 20ms and 40ms */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-slate-700/60 z-10"
                          style={{ left: `${(20 / maxDisplayLatency) * 100}%` }}
                          title="20ms Target SLA"
                        />
                        <div
                          className="absolute top-0 bottom-0 w-px bg-slate-700/40 z-10"
                          style={{ left: `${(40 / maxDisplayLatency) * 100}%` }}
                          title="40ms Upper Benchmark"
                        />

                        {/* Animated Filled Bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out bg-linear-to-r ${colorConfig.gradient}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Show more button if limited */}
                {displayLimit < filteredAndSortedPoPs.length && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((prev) => Math.min(prev + 30, filteredAndSortedPoPs.length))}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Load More PoP Nodes ({filteredAndSortedPoPs.length - displayLimit} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: REGIONAL BENCHMARK GROUPED COMPARISON */}
            {viewMode === 'regional-benchmark' && (
              <div className="space-y-6 pt-2">
                <p className="text-xs text-slate-400">
                  Macro-region Anycast performance indices comparing average, lowest, and peak edge latencies with global SLA thresholds.
                </p>

                <div className="space-y-5">
                  {regionalBenchmarks.map((reg) => {
                    const avgPct = Math.min(100, (reg.avgLatency / 40) * 100);
                    const minPct = Math.min(100, (reg.minLatency / 40) * 100);
                    const maxPct = Math.min(100, (reg.maxLatency / 40) * 100);

                    return (
                      <div
                        key={reg.region}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {reg.region}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {reg.count} Anycast PoPs • {reg.primaryHubs} Core Internet Exchange Hubs
                            </span>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-xs">
                            <span className="text-emerald-400">
                              Min: <strong>{reg.minLatency} ms</strong>
                            </span>
                            <span className="text-sky-400">
                              Avg: <strong>{reg.avgLatency} ms</strong>
                            </span>
                            <span className="text-slate-500">
                              Max: {reg.maxLatency} ms
                            </span>
                          </div>
                        </div>

                        {/* Composite Visual Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-4 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative flex">
                            {/* Min Latency indicator */}
                            <div
                              className="h-full bg-emerald-500/80 transition-all duration-300"
                              style={{ width: `${minPct}%` }}
                              title={`Min Latency: ${reg.minLatency}ms`}
                            />
                            {/* Avg Latency delta */}
                            <div
                              className="h-full bg-sky-500/80 transition-all duration-300"
                              style={{ width: `${Math.max(2, avgPct - minPct)}%` }}
                              title={`Avg Latency: ${reg.avgLatency}ms`}
                            />
                            {/* Max Latency delta */}
                            <div
                              className="h-full bg-amber-500/40 transition-all duration-300"
                              style={{ width: `${Math.max(2, maxPct - avgPct)}%` }}
                              title={`Peak Latency: ${reg.maxLatency}ms`}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0 ms</span>
                            <span>10 ms</span>
                            <span>20 ms (SLA Target)</span>
                            <span>30 ms</span>
                            <span>40+ ms</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: NODE SLA INDEX */}
            {viewMode === 'health-sla' && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-400">
                  Individual node connectivity health, packet transmission verification, and SLA compliance score.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayedPoPs.map((pop) => (
                    <div
                      key={pop.id}
                      onClick={() => setSelectedPoP(pop)}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{pop.city}</span>
                        <span className="font-mono text-emerald-400 font-bold">100% HEALTH</span>
                      </div>

                      {/* Uptime Bar (Full 100%) */}
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-full" />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Transit: {pop.transitProviders.split('/')[0]}</span>
                        <span className="font-mono text-slate-300">{pop.latencyMs} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: NODE DIAGNOSTICS & PING INSPECTOR */}
          <div className="lg:col-span-4 space-y-4">
            {/* Selected PoP Inspector Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 sticky top-20 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#ff6600]" />
                  <h3 className="font-bold text-sm text-white">
                    Node Diagnostic Inspector
                  </h3>
                </div>

                {selectedPoP ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Session
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    Select any PoP
                  </span>
                )}
              </div>

              {selectedPoP ? (
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                      <span>{selectedPoP.city}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({selectedPoP.country})
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Region: <strong className="text-slate-300">{selectedPoP.region}</strong>
                    </span>
                  </div>

                  {/* Core Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Current Latency</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {(liveLatencies[selectedPoP.id] || selectedPoP.latencyMs).toFixed(1)} ms
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">SLA Availability</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {selectedPoP.uptimePct.toFixed(3)}%
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Anycast CIDR Subnet</span>
                      <span className="font-mono text-xs text-slate-300">
                        {selectedPoP.ipRange}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Primary Transit IXP</span>
                      <span className="text-xs text-slate-300">
                        {selectedPoP.transitProviders}
                      </span>
                    </div>
                  </div>

                  {/* Live Ping Terminal Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span>ICMP Ping Console</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePingPoP(selectedPoP)}
                        disabled={isPingingSelected}
                        className="text-[11px] text-[#ff6600] hover:underline font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {isPingingSelected ? 'Pinging...' : 'Retest Ping'}
                      </button>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                      {pingConsoleLogs.map((log, i) => (
                        <p
                          key={i}
                          className={
                            log.includes('0% packet loss')
                              ? 'text-emerald-400 font-bold'
                              : log.includes('Initiating')
                              ? 'text-slate-400'
                              : 'text-slate-200'
                          }
                        >
                          {log}
                        </p>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportCsv('single', selectedPoP)}
                      className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                      title={`Export full connection telemetry for ${selectedPoP.city} as CSV`}
                    >
                      <Download className="w-3.5 h-3.5 text-[#ff6600]" />
                      <span>Export {selectedPoP.city} Telemetry (.csv)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <Globe2 className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">
                    Click any PoP bar in the chart to inspect its IP subnet, transit peering routes, and run live ping telemetry.
                  </p>
                </div>
              )}

              {/* BGP Autonomous System Badge */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  All 150 PoPs announce matching BGP prefixes under Anycast AS-15169 with BCP38 anti-spoofing and DDoS scrubbing layers.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
