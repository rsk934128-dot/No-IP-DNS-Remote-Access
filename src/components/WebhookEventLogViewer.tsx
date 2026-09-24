import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Radio,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Code,
  ShieldCheck,
  Clock,
  Terminal,
  Layers,
  Send,
  Table,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  FileJson,
  Eye
} from 'lucide-react';
import { HttpEventLog, HttpDirection } from '../types/ledgerEvents';

interface WebhookEventLogViewerProps {
  logs: HttpEventLog[];
  onClearLogs: () => void;
  onResetLogs: () => void;
  onSimulateInboundPost: () => void;
  onSimulateOutboundWebhook: () => void;
  onSimulateRetryFailover: () => void;
  onRetrySingleEvent: (event: HttpEventLog) => void;
  webhookUrl: string;
  webhookSecret: string;
  onUpdateWebhookUrl: (url: string) => void;
  onUpdateWebhookSecret: (secret: string) => void;
  searchFilter?: string;
  onSearchFilterChange?: (query: string) => void;
}

export const WebhookEventLogViewer: React.FC<WebhookEventLogViewerProps> = ({
  logs,
  onClearLogs,
  onResetLogs,
  onSimulateInboundPost,
  onSimulateOutboundWebhook,
  onSimulateRetryFailover,
  onRetrySingleEvent,
  webhookUrl,
  webhookSecret,
  onUpdateWebhookUrl,
  onUpdateWebhookSecret,
  searchFilter,
  onSearchFilterChange,
}) => {
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = searchFilter !== undefined ? searchFilter : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    if (onSearchFilterChange) {
      onSearchFilterChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<HttpEventLog | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'headers' | 'payload' | 'response' | 'curl'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAllRows = () => {
    setExpandedRowIds(new Set(logs.map((l) => l.id)));
  };

  const collapseAllRows = () => {
    setExpandedRowIds(new Set());
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterDirection !== 'ALL' && log.direction !== filterDirection) return false;
      if (statusFilter === 'SUCCESS' && log.status >= 400) return false;
      if (statusFilter === 'ERROR' && log.status < 400) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesUrl = log.url.toLowerCase().includes(query);
        const matchesType = log.eventType.toLowerCase().includes(query);
        const matchesSource = log.source.toLowerCase().includes(query);
        const matchesDest = log.destination.toLowerCase().includes(query);
        const matchesPayload = JSON.stringify(log.payload).toLowerCase().includes(query);
        const matchesRef = log.txReference?.toLowerCase().includes(query) || false;
        if (!matchesUrl && !matchesType && !matchesSource && !matchesDest && !matchesPayload && !matchesRef) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterDirection, statusFilter, searchQuery]);

  // Statistics
  const incomingCount = useMemo(() => logs.filter((l) => l.direction === 'INCOMING').length, [logs]);
  const outgoingCount = useMemo(() => logs.filter((l) => l.direction === 'OUTGOING').length, [logs]);
  const avgLatency = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, curr) => acc + curr.latencyMs, 0);
    return Math.round(sum / logs.length);
  }, [logs]);
  const successRate = useMemo(() => {
    if (logs.length === 0) return 100;
    const successes = logs.filter((l) => l.status < 400).length;
    return Math.round((successes / logs.length) * 100);
  }, [logs]);

  // Generate cURL command for an event
  const generateCurl = (event: HttpEventLog) => {
    const headersStr = Object.entries(event.headers)
      .map(([k, v]) => `  -H "${k}: ${v}"`)
      .join(' \\\n');
    const bodyStr = JSON.stringify(event.payload, null, 2);
    return `curl -X POST "${event.url}" \\\n${headersStr} \\\n  -d '${bodyStr}'`;
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration & Simulation Banner */}
      <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2.5">
              <Radio className={`w-4 h-4 ${isLiveStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>Real-Time Webhook & HTTP Event Log Monitor</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Live bi-directional telemetry: Capturing client API calls (inbound POST) and cryptographic webhook callbacks (outbound POST) with HMAC-SHA256 signatures.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isLiveStreaming
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreaming ? 'Streaming Live' : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={onResetLogs}
              title="Reset to default mock stream"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onClearLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 cursor-pointer border border-rose-800/50"
            >
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Endpoint & Secret Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>Outgoing Webhook Target URL</span>
              <span className="text-[10px] text-emerald-400 font-mono">POST listener</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => onUpdateWebhookUrl(e.target.value)}
              placeholder="https://merchant-app.local/api/webhooks/bank-listener"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>HMAC-SHA256 Webhook Signing Secret</span>
              <span className="text-[10px] text-amber-400 font-mono">X-Bank-Signature</span>
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => onUpdateWebhookSecret(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Simulation Triggers Toolbar */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulate Traffic:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSimulateInboundPost}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold cursor-pointer transition-all"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulate Inbound POST</span>
            </button>

            <button
              type="button"
              onClick={onSimulateOutboundWebhook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold cursor-pointer transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dispatch Outbound Webhook</span>
            </button>

            <button
              type="button"
              onClick={onSimulateRetryFailover}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate 503 Retry Handshake</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total HTTP POSTs</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-extrabold text-white">{logs.length}</span>
            <span className="text-[10px] text-slate-500">logged</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1 mb-1">
            <ArrowDownLeft className="w-3 h-3" />
            <span>Inbound Requests</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-extrabold text-sky-400">{incomingCount}</span>
            <span className="text-[10px] text-slate-500">POST calls</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Outbound Webhooks</span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-extrabold text-emerald-400">{outgoingCount}</span>
            <span className="text-[10px] text-slate-500">dispatches</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Avg Latency & Health</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-extrabold text-amber-400">{avgLatency}ms</span>
            <span className="text-[10px] text-emerald-400 font-bold">{successRate}% OK</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        {/* Direction Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterDirection('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterDirection === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Traffic ({logs.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterDirection('INCOMING')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterDirection === 'INCOMING'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Incoming POST ({incomingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterDirection('OUTGOING')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterDirection === 'OUTGOING'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Outgoing Webhook ({outgoingCount})</span>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="ml-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">200 OK Only</option>
            <option value="ERROR">Errors / 503 Retries</option>
          </select>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoint, event, tx..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-7 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle: Table View vs Card Feed */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Table View (Columns: Direction, Timestamp, Endpoint, Event, Payload, Status)"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Card Feed View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Subtitle & Actions Bar */}
      {viewMode === 'table' && filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">HTTP POST Event Log Table</span>
            <span className="text-[11px] text-slate-500">• Showing real-time incoming & outgoing requests with payloads</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={expandAllRows}
              className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer font-medium"
            >
              Expand All Payloads
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={collapseAllRows}
              className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>
      )}

      {/* Main Events Display */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-950/60 rounded-3xl border border-slate-800/80 space-y-3">
          <Radio className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No Webhook or HTTP POST Events Match Filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Initiate a payment in the sandbox simulator or click "Simulate Inbound POST" / "Dispatch Outbound Webhook" above.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onResetLogs}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Reset Default Event Stream
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* VISUAL TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold select-none">
                <th className="py-3 px-4 whitespace-nowrap">Direction & Method</th>
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 min-w-[200px]">Endpoint / Destination</th>
                <th className="py-3 px-4 whitespace-nowrap">Event Type</th>
                <th className="py-3 px-4 min-w-[260px]">Request Payload</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Latency</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredLogs.map((log) => {
                const isIncoming = log.direction === 'INCOMING';
                const isOk = log.status < 400;
                const isExpanded = expandedRowIds.has(log.id);
                const payloadStr = JSON.stringify(log.payload);
                const payloadPreview = payloadStr.length > 50 ? payloadStr.slice(0, 50) + '...' : payloadStr;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`transition-colors cursor-pointer group ${
                        isExpanded
                          ? 'bg-slate-900/70 border-b border-slate-800/80'
                          : isIncoming
                          ? 'hover:bg-sky-950/20'
                          : 'hover:bg-emerald-950/20'
                      }`}
                      onClick={() => toggleRowExpand(log.id)}
                    >
                      {/* Direction & Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isIncoming
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {isIncoming ? (
                              <>
                                <ArrowDownLeft className="w-3 h-3 text-sky-400" />
                                <span>INCOMING</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-purple-300" />
                                <span>OUTGOING</span>
                              </>
                            )}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-emerald-400">
                            POST
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-sans text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]" title={log.timestamp}>
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Endpoint / Route */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[220px]">
                          <span className="font-bold text-white text-[11px] block truncate" title={log.url}>
                            {log.url}
                          </span>
                          <span className="text-[10px] font-sans text-slate-400 block truncate" title={`${log.source} ➔ ${log.destination}`}>
                            {log.source.split(' ')[0]} ➔ {log.destination.split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/90 text-slate-200 border border-slate-700">
                          {log.eventType}
                        </span>
                        {log.txReference && (
                          <span className="block text-[9px] text-amber-400/90 mt-0.5 truncate max-w-[120px]" title={log.txReference}>
                            Ref: {log.txReference}
                          </span>
                        )}
                      </td>

                      {/* Request Payload */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <div
                            onClick={() => toggleRowExpand(log.id)}
                            className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-mono truncate flex-1 cursor-pointer transition-all flex items-center justify-between"
                            title="Click to view formatted JSON payload"
                          >
                            <span className="truncate">{payloadPreview}</span>
                            <ChevronDown className={`w-3 h-3 ml-1 text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-orange-400' : ''}`} />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `table-pay-${log.id}`)}
                            title="Copy payload JSON"
                            className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 shrink-0 cursor-pointer"
                          >
                            {copiedKey === `table-pay-${log.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status Code */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOk
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          <span>{log.status} {log.statusText}</span>
                        </span>
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {log.latencyMs}ms
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEvent(log);
                              setInspectorTab('overview');
                            }}
                            className="px-2 py-1 rounded-lg bg-[#ff6600] hover:bg-[#e05a00] text-white text-[10px] font-bold cursor-pointer transition-all shadow-xs"
                            title="Inspect full request, headers, and responses"
                          >
                            Inspect
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(generateCurl(log), `table-curl-${log.id}`)}
                            className="px-1.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700 cursor-pointer"
                            title="Copy cURL command"
                          >
                            {copiedKey === `table-curl-${log.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Terminal className="w-3 h-3" />
                            )}
                          </button>

                          {!isIncoming && (
                            <button
                              type="button"
                              onClick={() => onRetrySingleEvent(log)}
                              className="px-1.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700 cursor-pointer"
                              title="Re-deliver webhook"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE INLINE PAYLOAD & DETAILS ROW */}
                    {isExpanded && (
                      <tr className="bg-slate-900/90 border-b border-slate-800">
                        <td colSpan={8} className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                            {/* Left: Formatted Request Payload Body */}
                            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                              <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5 font-sans">
                                  <FileJson className="w-3.5 h-3.5" />
                                  <span>HTTP POST Request Payload Body</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `inline-pay-${log.id}`)}
                                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white cursor-pointer font-sans"
                                >
                                  {copiedKey === `inline-pay-${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>Copy Payload</span>
                                </button>
                              </div>
                              <pre className="p-3.5 text-[11px] text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>

                            {/* Right: Headers & Server Response */}
                            <div className="space-y-3 font-mono">
                              {/* Headers */}
                              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-400 font-sans">
                                    HTTP Headers ({Object.keys(log.headers).length})
                                  </span>
                                </div>
                                <div className="p-3 text-[10px] space-y-1 max-h-24 overflow-y-auto">
                                  {Object.entries(log.headers).map(([k, v]) => (
                                    <div key={k} className="flex items-baseline justify-between gap-2 border-b border-slate-900 pb-0.5">
                                      <span className="text-slate-400 truncate">{k}:</span>
                                      <span className="text-slate-200 truncate max-w-[220px]" title={v}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Response */}
                              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-300 font-sans">
                                    Server Response ({log.status} {log.statusText})
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-sans">{log.latencyMs}ms latency</span>
                                </div>
                                <pre className="p-3 text-[10px] text-sky-300 overflow-x-auto max-h-24">
                                  {JSON.stringify(log.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS STREAM VIEW */
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isIncoming = log.direction === 'INCOMING';
            const isOk = log.status < 400;

            return (
              <div
                key={log.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                  isIncoming
                    ? 'bg-slate-950/90 border-sky-900/40 hover:border-sky-700/60'
                    : 'bg-slate-950/90 border-emerald-900/40 hover:border-emerald-700/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Flow Direction & Identification */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Direction Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider ${
                          isIncoming
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {isIncoming ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-sky-400" />
                            <span>INCOMING POST</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-purple-300" />
                            <span>OUTGOING WEBHOOK</span>
                          </>
                        )}
                      </span>

                      {/* Event Type Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {log.eventType}
                      </span>

                      {/* Event ID */}
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {log.id}
                      </span>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    {/* URL / Endpoint */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-slate-800 text-emerald-400">
                        POST
                      </span>
                      <span className="font-mono text-xs font-bold text-white truncate max-w-xl" title={log.url}>
                        {log.url}
                      </span>
                    </div>

                    {/* Route topology: Source -> Destination */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                      <span className="text-slate-300 font-medium">{log.source}</span>
                      <span className="text-slate-600">➔</span>
                      <span className="text-slate-300 font-medium">{log.destination}</span>
                      {log.txReference && (
                        <span className="ml-2 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Ref: {log.txReference}
                        </span>
                      )}
                    </div>

                    {/* Request Payload Preview */}
                    <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 truncate max-w-md">
                        <span className="text-sky-400 font-bold">Payload:</span> {JSON.stringify(log.payload)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(log.payload, null, 2), `card-pay-${log.id}`)}
                        className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
                        title="Copy JSON Payload"
                      >
                        {copiedKey === `card-pay-${log.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Status & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                    {/* Latency */}
                    <span className="text-xs font-mono text-slate-400">
                      {log.latencyMs}ms
                    </span>

                    {/* HTTP Status Code */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        isOk
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{log.status} {log.statusText}</span>
                    </span>

                    {/* Retry button for outgoing */}
                    {!isIncoming && (
                      <button
                        type="button"
                        onClick={() => onRetrySingleEvent(log)}
                        title="Re-deliver webhook"
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>Re-send</span>
                      </button>
                    )}

                    {/* Copy cURL */}
                    <button
                      type="button"
                      onClick={() => handleCopy(generateCurl(log), `curl-${log.id}`)}
                      title="Copy cURL command"
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === `curl-${log.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Terminal className="w-3 h-3 text-slate-400" />
                      )}
                      <span>cURL</span>
                    </button>

                    {/* Inspect Payload & Headers */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(log);
                        setInspectorTab('overview');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ff6600] hover:bg-[#e05a00] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HTTP Event Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedEvent.direction === 'INCOMING'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {selectedEvent.direction} HTTP POST
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{selectedEvent.id}</span>
                  <span className="text-xs font-mono text-emerald-400">[{selectedEvent.eventType}]</span>
                </div>
                <h3 className="text-sm font-mono font-bold text-slate-200 truncate max-w-xl">
                  {selectedEvent.url}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 bg-slate-950 border-b border-slate-800 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setInspectorTab('overview')}
                className={`px-3 py-2 border-b-2 cursor-pointer transition-all ${
                  inspectorTab === 'overview'
                    ? 'border-[#ff6600] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('headers')}
                className={`px-3 py-2 border-b-2 cursor-pointer transition-all ${
                  inspectorTab === 'headers'
                    ? 'border-[#ff6600] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                HTTP Headers ({Object.keys(selectedEvent.headers).length})
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('payload')}
                className={`px-3 py-2 border-b-2 cursor-pointer transition-all ${
                  inspectorTab === 'payload'
                    ? 'border-[#ff6600] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Request Body (JSON)
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('response')}
                className={`px-3 py-2 border-b-2 cursor-pointer transition-all ${
                  inspectorTab === 'response'
                    ? 'border-[#ff6600] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Response Body
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('curl')}
                className={`px-3 py-2 border-b-2 cursor-pointer transition-all ${
                  inspectorTab === 'curl'
                    ? 'border-[#ff6600] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                cURL Snippet
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4">
              {inspectorTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Direction</span>
                      <span className="text-white font-bold">{selectedEvent.direction}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Status</span>
                      <span className="text-emerald-400 font-bold">{selectedEvent.status} {selectedEvent.statusText}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Round-trip Latency</span>
                      <span className="text-amber-400 font-bold">{selectedEvent.latencyMs} ms</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-sans">Cryptographic HMAC-SHA256 Signature Header:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedEvent.signature || '', 'modal-sig')}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'modal-sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-emerald-400 break-all text-[11px]">
                      {selectedEvent.signature || selectedEvent.headers['X-Bank-Signature'] || 'N/A (Standard Mutual TLS Handshake)'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-sans text-xs">
                    <span className="text-[10px] text-slate-400 block">Routing Path</span>
                    <div className="text-slate-200">
                      <strong>Source:</strong> {selectedEvent.source}
                    </div>
                    <div className="text-slate-200">
                      <strong>Destination:</strong> {selectedEvent.destination}
                    </div>
                    <div className="text-slate-400 text-[11px] pt-1">
                      <strong>Timestamp:</strong> {selectedEvent.timestamp}
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === 'headers' && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                        <th className="py-2.5 px-3">Header Name</th>
                        <th className="py-2.5 px-3">Header Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-[11px]">
                      {Object.entries(selectedEvent.headers).map(([key, val]) => (
                        <tr key={key} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-300 whitespace-nowrap">{key}</td>
                          <td className="py-2.5 px-3 text-emerald-400 break-all">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inspectorTab === 'payload' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
                    <span>HTTP Request Body JSON</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(selectedEvent.payload, null, 2), 'modal-payload')}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {copiedKey === 'modal-payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              )}

              {inspectorTab === 'response' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
                    <span>HTTP Response Body ({selectedEvent.status} {selectedEvent.statusText})</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(selectedEvent.response, null, 2), 'modal-response')}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {copiedKey === 'modal-response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Response</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(selectedEvent.response, null, 2)}
                  </pre>
                </div>
              )}

              {inspectorTab === 'curl' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
                    <span>Terminal Executable cURL Command</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(generateCurl(selectedEvent), 'modal-curl')}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {copiedKey === 'modal-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto leading-relaxed">
                    {generateCurl(selectedEvent)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-sans">
                Recorded via Core Banking Real-time Telemetry Dispatcher
              </span>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
