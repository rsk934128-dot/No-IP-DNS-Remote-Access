import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Key,
  Globe,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  FileJson,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldAlert,
  ArrowRight,
  Code
} from 'lucide-react';

export interface ApiResponseState {
  status: number;
  statusText: string;
  isSuccess: boolean;
  data: Record<string, unknown>;
  headers: Record<string, string>;
  latencyMs: number;
  timestamp: string;
}

/**
 * Mock validation and API simulation function
 * Validates domain, credentials, and record value, returning realistic HTTP status and JSON responses
 */
export const validateAndSimulateApi = (
  inputDomain: string,
  inputCreds: string,
  inputValue: string,
  inputType: 'A' | 'AAAA' | 'CNAME' | 'TXT',
  inputTtl: string
): ApiResponseState => {
  const timestamp = new Date().toISOString();
  const latencyMs = Math.floor(Math.random() * 45) + 38; // 38-83ms realistic Anycast response
  const requestId = `req_${Math.random().toString(36).substring(2, 11)}`;
  const edgeNode = `anycast-edge-${['iad', 'fra', 'nrt', 'syd', 'lhr', 'sin'][Math.floor(Math.random() * 6)]}-01`;

  const trimmedCreds = inputCreds.trim();
  const trimmedDomain = inputDomain.trim().toLowerCase();
  const trimmedValue = inputValue.trim();

  // Standard API response headers
  const baseHeaders: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'x-request-id': requestId,
    'x-noip-edge-pop': edgeNode,
    'x-response-time': `${latencyMs}ms`,
    'x-ratelimit-limit': '1000',
    'x-ratelimit-remaining': '994',
    'x-ratelimit-reset': '1710000000',
  };

  // 1. Simulated Rate Limit check -> 429 Too Many Requests
  if (trimmedDomain.includes('rate-limit') || trimmedCreds.includes('rate-limit')) {
    return {
      status: 429,
      statusText: 'Too Many Requests',
      isSuccess: false,
      latencyMs: 18,
      timestamp,
      headers: {
        ...baseHeaders,
        'retry-after': '30',
        'x-ratelimit-remaining': '0',
      },
      data: {
        status: 429,
        statusText: 'Too Many Requests',
        error: 'ERR_RATE_LIMIT_EXCEEDED',
        message: 'Too many API requests sent in a short window. Quota exceeded.',
        requestId,
        timestamp,
        details: {
          limitPerMinute: 60,
          retryAfterSeconds: 30,
          hint: 'Implement exponential backoff or upgrade your partner tier for higher rate limits.'
        }
      }
    };
  }

  // 2. Validate Credentials -> 401 Unauthorized
  // Triggers if credentials are empty, too short, or contain invalid/expired tokens
  const isMissingCreds = !trimmedCreds;
  const isInvalidCreds =
    isMissingCreds ||
    trimmedCreds.toLowerCase().includes('invalid') ||
    trimmedCreds.toLowerCase().includes('expired') ||
    trimmedCreds.toLowerCase().includes('wrong') ||
    trimmedCreds.toLowerCase().includes('unauthorized') ||
    trimmedCreds.toLowerCase().includes('revoked') ||
    trimmedCreds.length < 8;

  if (isInvalidCreds) {
    return {
      status: 401,
      statusText: 'Unauthorized',
      isSuccess: false,
      latencyMs,
      timestamp,
      headers: {
        ...baseHeaders,
        'www-authenticate': 'Bearer realm="No-IP Partner API", error="invalid_token"',
      },
      data: {
        status: 401,
        statusText: 'Unauthorized',
        error: isMissingCreds ? 'ERR_MISSING_CREDENTIALS' : 'ERR_INVALID_CREDENTIALS',
        message: isMissingCreds
          ? 'Authentication failed: No credentials or Bearer token provided in request header.'
          : 'Authentication failed: The provided API key or credentials are invalid, revoked, or expired.',
        requestId,
        timestamp,
        details: {
          authScheme: trimmedCreds.startsWith('Bearer ') ? 'Bearer' : 'API-Key',
          hint: 'Verify your API token in the No-IP Partner Portal or generate a scoped DDNS Key.',
          docsUrl: 'https://www.noip.com/integrate/api#authentication'
        }
      }
    };
  }

  // 3. Validate Domain -> 400 Bad Request
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  const isMissingDomain = !trimmedDomain;
  const isMalformedDomain =
    isMissingDomain ||
    !domainRegex.test(trimmedDomain) ||
    trimmedDomain.includes('invalid') ||
    trimmedDomain.includes('malformed') ||
    trimmedDomain.endsWith('.') ||
    !trimmedDomain.includes('.');

  if (isMalformedDomain) {
    return {
      status: 400,
      statusText: 'Bad Request',
      isSuccess: false,
      latencyMs,
      timestamp,
      headers: baseHeaders,
      data: {
        status: 400,
        statusText: 'Bad Request',
        error: isMissingDomain ? 'ERR_MISSING_DOMAIN' : 'ERR_INVALID_DOMAIN_FORMAT',
        message: isMissingDomain
          ? 'Domain parameter is required.'
          : `The domain name '${trimmedDomain}' is malformed or not an active delegated zone.`,
        requestId,
        timestamp,
        details: {
          field: 'domain',
          provided: trimmedDomain || '(empty)',
          expected: 'Valid Fully Qualified Domain Name (e.g. office.ddns.net or api.partnercorp.net)'
        }
      }
    };
  }

  // 4. Validate Record Value based on Record Type -> 422 Unprocessable Entity
  const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

  if (!trimmedValue) {
    return {
      status: 422,
      statusText: 'Unprocessable Entity',
      isSuccess: false,
      latencyMs,
      timestamp,
      headers: baseHeaders,
      data: {
        status: 422,
        statusText: 'Unprocessable Entity',
        error: 'ERR_EMPTY_RECORD_VALUE',
        message: 'The record value field cannot be empty.',
        requestId,
        timestamp,
        details: { field: 'recordValue' }
      }
    };
  }

  if (inputType === 'A' && !ipv4Regex.test(trimmedValue)) {
    return {
      status: 422,
      statusText: 'Unprocessable Entity',
      isSuccess: false,
      latencyMs,
      timestamp,
      headers: baseHeaders,
      data: {
        status: 422,
        statusText: 'Unprocessable Entity',
        error: 'ERR_INVALID_IPV4_ADDRESS',
        message: `Record value '${trimmedValue}' is not a valid 32-bit IPv4 address for type 'A'.`,
        requestId,
        timestamp,
        details: {
          recordType: 'A',
          providedValue: trimmedValue,
          expected: 'Standard 4-octet IPv4 (e.g. 198.51.100.42)'
        }
      }
    };
  }

  if (inputType === 'AAAA' && !ipv6Regex.test(trimmedValue)) {
    return {
      status: 422,
      statusText: 'Unprocessable Entity',
      isSuccess: false,
      latencyMs,
      timestamp,
      headers: baseHeaders,
      data: {
        status: 422,
        statusText: 'Unprocessable Entity',
        error: 'ERR_INVALID_IPV6_ADDRESS',
        message: `Record value '${trimmedValue}' is not a valid 128-bit IPv6 address for type 'AAAA'.`,
        requestId,
        timestamp,
        details: {
          recordType: 'AAAA',
          providedValue: trimmedValue,
          expected: 'Standard IPv6 format (e.g. 2001:0db8:85a3::8a2e:0370:7334)'
        }
      }
    };
  }

  if (inputType === 'CNAME') {
    if (ipv4Regex.test(trimmedValue) || ipv6Regex.test(trimmedValue)) {
      return {
        status: 422,
        statusText: 'Unprocessable Entity',
        isSuccess: false,
        latencyMs,
        timestamp,
        headers: baseHeaders,
        data: {
          status: 422,
          statusText: 'Unprocessable Entity',
          error: 'ERR_CNAME_POINTS_TO_IP',
          message: 'CNAME records must point to a fully qualified canonical domain name, not an IP address.',
          requestId,
          timestamp,
          details: {
            recordType: 'CNAME',
            providedValue: trimmedValue,
            expected: 'Canonical target domain name (e.g. origin.partnercorp.net)'
          }
        }
      };
    }
  }

  // 5. Successful Validation -> 200 OK
  const parts = trimmedDomain.split('.');
  const zoneName = parts.length > 2 ? parts.slice(-2).join('.') : trimmedDomain;

  return {
    status: 200,
    statusText: 'OK',
    isSuccess: true,
    latencyMs,
    timestamp,
    headers: baseHeaders,
    data: {
      status: 200,
      statusText: 'OK',
      success: true,
      requestId,
      timestamp,
      record: {
        id: `rec_${Math.random().toString(36).substring(2, 10)}`,
        domain: trimmedDomain,
        type: inputType,
        value: trimmedValue,
        ttl: parseInt(inputTtl, 10) || 60,
        status: 'active',
        zone: zoneName,
        updatedAt: timestamp
      },
      propagation: {
        anycastNodesSynced: 158,
        globalCoverage: '100%',
        propagationLatencyMs: Math.max(12, latencyMs - 16),
        anycastMesh: 'Tier-1 BGP Anycast Mesh'
      },
      message: `DNS record for '${trimmedDomain}' updated successfully. Synchronized across 158 Anycast edge PoPs.`
    }
  };
};

export const ApiSimulator: React.FC = () => {
  // Simulator Input Fields
  const [domain, setDomain] = useState('api.partnercorp.net');
  const [credentials, setCredentials] = useState('noip_live_sec_99187a4c9b882e');
  const [recordType, setRecordType] = useState<'A' | 'AAAA' | 'CNAME' | 'TXT'>('A');
  const [recordValue, setRecordValue] = useState('198.51.100.42');
  const [ttl, setTtl] = useState('60');
  const [showCredentials, setShowCredentials] = useState(false);

  // Execution & Response State
  const [isLoading, setIsLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'headers' | 'curl'>('json');

  // Initial Mock Response (200 OK)
  const [response, setResponse] = useState<ApiResponseState>(() =>
    validateAndSimulateApi(
      'api.partnercorp.net',
      'noip_live_sec_99187a4c9b882e',
      '198.51.100.42',
      'A',
      '60'
    )
  );

  const executeSimulation = (
    targetDomain = domain,
    targetCreds = credentials,
    targetVal = recordValue,
    targetType = recordType,
    targetTtl = ttl
  ) => {
    setIsLoading(true);
    setTimeout(() => {
      const result = validateAndSimulateApi(
        targetDomain,
        targetCreds,
        targetVal,
        targetType,
        targetTtl
      );
      setResponse(result);
      setIsLoading(false);
    }, 320);
  };

  const handleSimulateCall = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeSimulation();
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: 'success' | 'unauthorized' | 'invalid_domain' | 'bad_ip' | 'rate_limit') => {
    let nextDomain = domain;
    let nextCreds = credentials;
    let nextVal = recordValue;
    let nextType = recordType;

    if (preset === 'success') {
      nextDomain = 'api.partnercorp.net';
      nextCreds = 'noip_live_sec_99187a4c9b882e';
      nextType = 'A';
      nextVal = '198.51.100.42';
    } else if (preset === 'unauthorized') {
      nextCreds = 'invalid_revoked_key_998';
    } else if (preset === 'invalid_domain') {
      nextDomain = 'malformed_domain_syntax';
    } else if (preset === 'bad_ip') {
      nextType = 'A';
      nextVal = '999.888.777.666'; // Invalid IPv4
    } else if (preset === 'rate_limit') {
      nextDomain = 'rate-limit-check.ddns.net';
    }

    setDomain(nextDomain);
    setCredentials(nextCreds);
    setRecordValue(nextVal);
    setRecordType(nextType);

    // Automatically execute simulation for instantaneous interactive feedback
    executeSimulation(nextDomain, nextCreds, nextVal, nextType, ttl);
  };

  const handleResetDefaults = () => {
    const defaultDomain = 'api.partnercorp.net';
    const defaultCreds = 'noip_live_sec_99187a4c9b882e';
    const defaultVal = '198.51.100.42';
    const defaultType: 'A' = 'A';
    const defaultTtl = '60';

    setDomain(defaultDomain);
    setCredentials(defaultCreds);
    setRecordValue(defaultVal);
    setRecordType(defaultType);
    setTtl(defaultTtl);
    executeSimulation(defaultDomain, defaultCreds, defaultVal, defaultType, defaultTtl);
  };

  const handleCopyJson = () => {
    if (!response) return;
    navigator.clipboard?.writeText(JSON.stringify(response.data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Status visual configurations
  const getStatusBadgeStyle = (status: number) => {
    if (status >= 200 && status < 300) {
      return {
        bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80',
        dot: 'bg-emerald-400',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        label: '200 OK'
      };
    }
    if (status === 401) {
      return {
        bg: 'bg-rose-950/90 text-rose-300 border-rose-700/80',
        dot: 'bg-rose-400',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
        label: '401 Unauthorized'
      };
    }
    if (status === 400) {
      return {
        bg: 'bg-amber-950/90 text-amber-300 border-amber-700/80',
        dot: 'bg-amber-400',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        label: '400 Bad Request'
      };
    }
    if (status === 422) {
      return {
        bg: 'bg-purple-950/90 text-purple-300 border-purple-700/80',
        dot: 'bg-purple-400',
        icon: <AlertCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
        label: '422 Unprocessable'
      };
    }
    return {
      bg: 'bg-sky-950/90 text-sky-300 border-sky-700/80',
      dot: 'bg-sky-400',
      icon: <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
      label: `${status} Response`
    };
  };

  const statusStyle = getStatusBadgeStyle(response.status);

  // Formatted cURL command string
  const curlSnippet = `curl -X PUT "https://api.noip.com/v2/dns/records" \\
  -H "Authorization: Bearer ${credentials || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "${domain || 'domain.ddns.net'}",
    "type": "${recordType}",
    "value": "${recordValue || '198.51.100.42'}",
    "ttl": ${parseInt(ttl, 10) || 60}
  }'`;

  // Syntax highlighting renderer for JSON string
  const renderHighlightedJson = (obj: Record<string, unknown>) => {
    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');

    return (
      <div className="font-mono text-[11px] sm:text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const keyMatch = line.match(/^(\s*)(".*?"):(.*)$/);
          if (keyMatch) {
            const indent = keyMatch[1];
            const key = keyMatch[2];
            const rest = keyMatch[3];

            let valueElem = <span className="text-slate-300">{rest}</span>;
            const trimmedRest = rest.trim();

            if (trimmedRest.startsWith('"')) {
              const isError =
                trimmedRest.includes('ERR_') ||
                trimmedRest.toLowerCase().includes('failed') ||
                trimmedRest.toLowerCase().includes('invalid');
              valueElem = (
                <span>
                  {' '}
                  <span className={isError ? 'text-rose-400 font-semibold' : 'text-emerald-300'}>
                    {trimmedRest}
                  </span>
                </span>
              );
            } else if (/^-?\d+(\.\d+)?(,?)$/.test(trimmedRest)) {
              valueElem = (
                <span>
                  {' '}
                  <span className="text-amber-300 font-semibold">{trimmedRest}</span>
                </span>
              );
            } else if (/^(true|false)(,?)$/.test(trimmedRest)) {
              const isTrue = trimmedRest.startsWith('true');
              valueElem = (
                <span>
                  {' '}
                  <span
                    className={
                      isTrue ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                    }
                  >
                    {trimmedRest}
                  </span>
                </span>
              );
            } else if (/^null(,?)$/.test(trimmedRest)) {
              valueElem = (
                <span>
                  {' '}
                  <span className="text-slate-500 italic">{trimmedRest}</span>
                </span>
              );
            }

            return (
              <div key={idx} className="hover:bg-slate-800/50 px-1 rounded-xs transition-colors flex">
                <span className="text-slate-600 select-none inline-block w-6 text-right mr-3 text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="whitespace-pre">{indent}</span>
                <span className="text-sky-300 font-medium">{key}</span>:
                {valueElem}
              </div>
            );
          }

          return (
            <div key={idx} className="hover:bg-slate-800/50 px-1 rounded-xs transition-colors flex">
              <span className="text-slate-600 select-none inline-block w-6 text-right mr-3 text-[10px] shrink-0">
                {idx + 1}
              </span>
              <span className="text-slate-400 whitespace-pre">{line}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="api-simulator-widget"
      className="bg-slate-950 rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden font-sans"
    >
      {/* Widget Header & Scenario Shortcuts */}
      <div className="bg-slate-900/95 px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Terminal className="w-5 h-5 text-[#ff6600]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">
                Interactive API Simulator
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                PUT /v2/dns/records
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live input validation &amp; instant JSON feedback simulation
            </p>
          </div>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Test Presets:</span>
          <button
            id="api-simulator-preset-200"
            type="button"
            onClick={() => handleApplyPreset('success')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 border border-emerald-800/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            title="Set valid credentials & domain to verify 200 OK"
          >
            200 OK
          </button>
          <button
            id="api-simulator-preset-401"
            type="button"
            onClick={() => handleApplyPreset('unauthorized')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-rose-800/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            title="Set invalid/expired credentials to trigger 401 Unauthorized"
          >
            401 Unauthorized
          </button>
          <button
            id="api-simulator-preset-400"
            type="button"
            onClick={() => handleApplyPreset('invalid_domain')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950/80 text-amber-300 hover:text-amber-200 border border-amber-800/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            title="Set malformed domain to trigger 400 Bad Request"
          >
            400 Bad Request
          </button>
          <button
            id="api-simulator-preset-422"
            type="button"
            onClick={() => handleApplyPreset('bad_ip')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-purple-950/80 text-purple-300 hover:text-purple-200 border border-purple-800/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            title="Set invalid IP address to trigger 422 Unprocessable Entity"
          >
            422 Bad Record
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ml-1 cursor-pointer"
            title="Reset Simulator to Default Values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body: Two-Column Form & JSON Response Pane */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs */}
        <form onSubmit={handleSimulateCall} className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              API Parameters
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Content-Type: application/json
            </span>
          </div>

          {/* 1. Domain Input Field */}
          <div>
            <label
              htmlFor="api-simulator-domain-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#ff6600]" /> Domain Name
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">string (FQDN)</span>
            </label>
            <input
              id="api-simulator-domain-input"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. api.partnercorp.net or office.ddns.net"
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-hidden transition-all placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Must be a valid delegated domain. Enter an invalid name or leave blank to trigger 400 Bad Request.
            </p>
          </div>

          {/* 2. Credentials Input Field */}
          <div>
            <label
              htmlFor="api-simulator-credentials-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Credentials / API Key
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">Authorization header</span>
            </label>
            <div className="relative">
              <input
                id="api-simulator-credentials-input"
                type={showCredentials ? 'text' : 'password'}
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                placeholder="e.g. noip_live_sec_99187a4c9b882e"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-hidden transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showCredentials ? 'Hide credentials' : 'Show credentials'}
              >
                {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Type <code className="text-rose-400 font-mono">invalid</code>, <code className="text-rose-400 font-mono">expired</code>, or empty string to trigger <strong>401 Unauthorized</strong>.
            </p>
          </div>

          {/* 3. Record Type & Record Value Input Fields */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4 sm:col-span-3">
              <label
                htmlFor="api-simulator-record-type-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Type
              </label>
              <select
                id="api-simulator-record-type-select"
                value={recordType}
                onChange={(e) =>
                  setRecordType(e.target.value as 'A' | 'AAAA' | 'CNAME' | 'TXT')
                }
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-semibold text-white focus:border-[#ff6600] outline-hidden cursor-pointer"
              >
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME</option>
                <option value="TXT">TXT</option>
              </select>
            </div>

            <div className="col-span-8 sm:col-span-6">
              <label
                htmlFor="api-simulator-record-value-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between"
              >
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-sky-400" /> Record Value
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Target IP/Host</span>
              </label>
              <input
                id="api-simulator-record-value-input"
                type="text"
                value={recordValue}
                onChange={(e) => setRecordValue(e.target.value)}
                placeholder={
                  recordType === 'A'
                    ? '198.51.100.42'
                    : recordType === 'AAAA'
                    ? '2001:0db8::8a2e'
                    : 'target.domain.com'
                }
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white font-mono focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-hidden transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="col-span-12 sm:col-span-3">
              <label
                htmlFor="api-simulator-ttl-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                TTL (Sec)
              </label>
              <select
                id="api-simulator-ttl-select"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono font-semibold text-white focus:border-[#ff6600] outline-hidden cursor-pointer"
              >
                <option value="60">60s (Live)</option>
                <option value="300">300s (5m)</option>
                <option value="1800">1800s (30m)</option>
                <option value="86400">86400s (1d)</option>
              </select>
            </div>
          </div>

          {/* Submit Simulation Action Button */}
          <button
            id="api-simulator-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-linear-to-r from-[#ff6600] to-orange-600 hover:from-[#e65c00] hover:to-orange-500 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Validating &amp; Simulating API Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Execute Mock API Request</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Right Column: Live Simulated JSON Response Feedback */}
        <div className="lg:col-span-6 flex flex-col h-full">
          {/* Header Bar with Response Tabs & Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                JSON Body
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('headers')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'headers'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Headers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'curl'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Prominent HTTP Status Pill */}
            <div
              id="api-simulator-status-badge"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${statusStyle.bg}`}
            >
              {statusStyle.icon}
              <span>{statusStyle.label}</span>
              <span className="text-[10px] opacity-75 font-normal">
                • {response.latencyMs}ms
              </span>
            </div>
          </div>

          {/* JSON Inspector Viewport */}
          <div className="flex-1 bg-slate-900/95 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-inner min-h-[310px]">
            {/* Action Sub-header */}
            <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">
                  {activeTab === 'json'
                    ? 'HTTP Response Payload (JSON)'
                    : activeTab === 'headers'
                    ? 'Response Headers'
                    : 'Equivalent cURL Request'}
                </span>
              </div>

              <button
                id="api-simulator-copy-json-btn"
                type="button"
                onClick={handleCopyJson}
                className="hover:text-white flex items-center gap-1.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Copy response to clipboard"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Active Content Area */}
            <div className="p-3 sm:p-4 flex-1 overflow-x-auto overflow-y-auto max-h-[380px] scrollbar-thin">
              {activeTab === 'json' && renderHighlightedJson(response.data)}

              {activeTab === 'headers' && (
                <div className="font-mono text-xs text-slate-300 space-y-1.5">
                  <div className="text-emerald-400 font-bold pb-1 border-b border-slate-800">
                    HTTP/1.1 {response.status} {response.statusText}
                  </div>
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="text-sky-300 w-44 shrink-0">{k}:</span>
                      <span className="text-slate-300 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'curl' && (
                <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre overflow-x-auto">
                  <code>{curlSnippet}</code>
                </pre>
              )}
            </div>

            {/* Response Footer Bar */}
            <div
              className={`px-4 py-2 border-t border-slate-800 text-xs flex items-center justify-between ${
                response.isSuccess
                  ? 'bg-emerald-950/30 text-emerald-300'
                  : 'bg-rose-950/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold">
                  {response.isSuccess ? 'Resolution:' : 'Failure Reason:'}
                </span>
                <span className="truncate text-slate-200">
                  {response.isSuccess
                    ? `Synchronized to 158 Anycast Nodes in ${response.latencyMs}ms.`
                    : (response.data.message as string) || 'Authentication / Syntax validation failure.'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-3">
                Status: {response.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

