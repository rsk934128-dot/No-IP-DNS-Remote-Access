import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Key, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  History,
  Send,
  Server,
  Activity,
  RotateCcw,
  Zap,
  Lock,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';

type LanguageTab = 'curl' | 'python' | 'nodejs' | 'go' | 'powershell';
type InspectorTab = 'body' | 'exchange' | 'headers' | 'propagation';

interface CallHistoryItem {
  id: string;
  timestamp: string;
  domain: string;
  ip: string;
  statusText: string;
  httpStatus: number;
  isSuccess: boolean;
  latencyMs: number;
}

export const IntegrateViaApi: React.FC = () => {
  // Playground Inputs State
  const [authType, setAuthType] = useState<'ddns_key' | 'account'>('ddns_key');
  const [username, setUsername] = useState('ddns_key_user_8721');
  const [password, setPassword] = useState('k3y_sec_99187a4c9b');
  const [showPassword, setShowPassword] = useState(false);
  const [domain, setDomain] = useState('office.ddns.net');
  const [targetIp, setTargetIp] = useState('198.51.100.42');
  const [autoDetectIp, setAutoDetectIp] = useState(false);
  const [userAgent, setUserAgent] = useState('PartnerGateway/3.2 developer@partner.com');
  const [presetScenario, setPresetScenario] = useState<string>('custom');

  // Currently resolved IP in simulated DNS table
  const [currentDnsIp, setCurrentDnsIp] = useState('198.51.100.42');

  // Interactive Live Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    headers: Record<string, string>;
    timestamp: string;
    latencyMs: number;
    meaning: string;
    actionAdvice: string;
    isSuccess: boolean;
    appliedIp: string;
  } | null>({
    status: 200,
    statusText: 'OK',
    body: 'nochg 198.51.100.42',
    headers: {
      'server': 'no-ip-anycast-edge/4.1.2',
      'date': new Date().toUTCString(),
      'content-type': 'text/plain; charset=UTF-8',
      'content-length': '18',
      'x-noip-edge': 'sfo-edge-02',
      'x-ratelimit-remaining': '98',
    },
    timestamp: 'Initial Ready State',
    latencyMs: 142,
    meaning: "NO CHANGE: 'office.ddns.net' is already synced to 198.51.100.42 in Anycast DNS.",
    actionAdvice: 'No DNS rewrite needed. Device should enter sleep loop until next IP change event.',
    isSuccess: true,
    appliedIp: '198.51.100.42',
  });

  // Inspector & Code Tabs
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('body');
  const [activeCodeTab, setActiveCodeTab] = useState<LanguageTab>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Call History
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      domain: 'office.ddns.net',
      ip: '198.51.100.42',
      statusText: 'nochg 198.51.100.42',
      httpStatus: 200,
      isSuccess: true,
      latencyMs: 142,
    },
  ]);

  // Handle Preset Scenarios
  const handleSelectPreset = (preset: string) => {
    setPresetScenario(preset);
    if (preset === 'good') {
      setUsername('ddns_key_user_8721');
      setPassword('k3y_sec_99187a4c9b');
      setDomain('office.ddns.net');
      setTargetIp('203.0.113.88');
      setAutoDetectIp(false);
      setUserAgent('PartnerGateway/3.2 developer@partner.com');
    } else if (preset === 'nochg') {
      setUsername('ddns_key_user_8721');
      setPassword('k3y_sec_99187a4c9b');
      setDomain('office.ddns.net');
      setTargetIp(currentDnsIp);
      setAutoDetectIp(false);
      setUserAgent('PartnerGateway/3.2 developer@partner.com');
    } else if (preset === 'badauth') {
      setUsername('invalid_user_99');
      setPassword('wrong_password_xyz');
      setDomain('office.ddns.net');
      setTargetIp('198.51.100.42');
      setUserAgent('PartnerGateway/3.2 developer@partner.com');
    } else if (preset === 'nohost') {
      setUsername('ddns_key_user_8721');
      setPassword('k3y_sec_99187a4c9b');
      setDomain('unregistered-server-404.ddns.net');
      setTargetIp('198.51.100.42');
      setUserAgent('PartnerGateway/3.2 developer@partner.com');
    } else if (preset === 'badagent') {
      setUsername('ddns_key_user_8721');
      setPassword('k3y_sec_99187a4c9b');
      setDomain('office.ddns.net');
      setTargetIp('198.51.100.42');
      setUserAgent('');
    } else if (preset === 'abuse') {
      setUsername('rate_limited_bot');
      setPassword('k3y_sec_99187a4c9b');
      setDomain('office.ddns.net');
      setTargetIp('198.51.100.42');
      setUserAgent('MalformedRapidPoller/0.1');
    }
  };

  // Generate Random Public IP for testing
  const handleGenerateRandomIp = () => {
    const octet1 = 203;
    const octet2 = Math.floor(Math.random() * 200) + 10;
    const octet3 = Math.floor(Math.random() * 250) + 1;
    const octet4 = Math.floor(Math.random() * 250) + 1;
    const newIp = `${octet1}.${octet2}.${octet3}.${octet4}`;
    setTargetIp(newIp);
    setAutoDetectIp(false);
    setPresetScenario('custom');
  };

  // Execute Simulated API Request
  const handleExecuteApiCall = () => {
    setIsSimulating(true);
    setSimulatedResponse(null);

    const startTime = performance.now();
    const simulatedLatency = Math.floor(Math.random() * 80) + 140; // 140ms - 220ms

    setTimeout(() => {
      setIsSimulating(false);
      const elapsed = Math.round(performance.now() - startTime);

      let httpStatus = 200;
      let statusText = 'OK';
      let returnBody = '';
      let meaning = '';
      let actionAdvice = '';
      let isSuccess = false;
      const effectiveIp = autoDetectIp ? '198.51.100.42' : targetIp.trim();

      // Determine outcome based on inputs or preset
      if (!userAgent.trim() || userAgent.toLowerCase().includes('banned') || userAgent === '') {
        returnBody = 'badagent';
        httpStatus = 200;
        meaning = 'ERROR: The client User-Agent header is missing or blocked by No-IP API filters.';
        actionAdvice = 'Ensure your firmware/client sets a descriptive User-Agent header (e.g., DeviceFirmware/1.0 contact@domain.com).';
      } else if (!username.trim() || !password.trim() || password.includes('wrong') || username.includes('invalid')) {
        returnBody = 'badauth';
        httpStatus = 200; // No-IP returns HTTP 200 with text 'badauth' for standard DDNS update protocol
        meaning = 'ERROR: Invalid username, password, or revoked DDNS Key credentials.';
        actionAdvice = 'Check account credentials or generate a new scoped DDNS Key in the No-IP management console.';
      } else if (!domain.trim() || domain.includes('unregistered') || domain.includes('404') || !domain.includes('.')) {
        returnBody = 'nohost';
        httpStatus = 200;
        meaning = `ERROR: The hostname '${domain}' was not found in this No-IP account.`;
        actionAdvice = 'Confirm the hostname spelling or verify the domain is assigned to the DDNS Key in your dashboard.';
      } else if (username.includes('rate_limited') || presetScenario === 'abuse') {
        returnBody = 'abuse';
        httpStatus = 200;
        meaning = 'ERROR: Account blocked due to repeated update requests (< 30s) without an IP change.';
        actionAdvice = 'Implement an exponential backoff strategy and verify external IP locally before sending HTTP requests.';
      } else if (effectiveIp === currentDnsIp && !autoDetectIp) {
        returnBody = `nochg ${effectiveIp}`;
        httpStatus = 200;
        meaning = `NO CHANGE: '${domain}' is already pointing to ${effectiveIp}. No DNS records were modified.`;
        actionAdvice = 'DNS record verified. Suppress subsequent update calls until interface address change is detected.';
        isSuccess = true;
      } else {
        // Successful IP update
        returnBody = `good ${effectiveIp}`;
        httpStatus = 200;
        meaning = `SUCCESS: Dynamic DNS record for '${domain}' successfully updated to ${effectiveIp} across all Anycast PoPs.`;
        actionAdvice = 'Update complete! Firmware should cache this IP and only re-transmit upon link state changes.';
        isSuccess = true;
        setCurrentDnsIp(effectiveIp);
      }

      const responseObj = {
        status: httpStatus,
        statusText,
        body: returnBody,
        headers: {
          'server': 'no-ip-anycast-edge/4.1.2',
          'date': new Date().toUTCString(),
          'content-type': 'text/plain; charset=UTF-8',
          'content-length': returnBody.length.toString(),
          'x-noip-edge': 'sfo-edge-02',
          'x-ratelimit-remaining': isSuccess ? '98' : '42',
        },
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: simulatedLatency,
        meaning,
        actionAdvice,
        isSuccess,
        appliedIp: effectiveIp,
      };

      setSimulatedResponse(responseObj);

      // Add to history
      setCallHistory((prev) => [
        {
          id: `call-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          domain: domain || 'unknown',
          ip: effectiveIp,
          statusText: returnBody,
          httpStatus,
          isSuccess,
          latencyMs: simulatedLatency,
        },
        ...prev.slice(0, 7),
      ]);
    }, simulatedLatency);
  };

  // Base64 authorization header representation
  const getAuthHeaderValue = () => {
    const raw = `${username}:${password}`;
    try {
      return btoa(raw);
    } catch {
      return 'ZGRuc191c2VyOnNlY3JldA==';
    }
  };

  // Code Snippet Generator
  const getCodeSnippet = (lang: LanguageTab): string => {
    const ipParam = autoDetectIp ? '' : `&myip=${targetIp}`;
    const ipQueryParam = autoDetectIp ? '' : `params["myip"] = "${targetIp}"\n    `;
    const ipGoParam = autoDetectIp ? '' : `\n\tquery.Set("myip", "${targetIp}")`;
    const ipPsParam = autoDetectIp ? '' : `&myip=${targetIp}`;

    switch (lang) {
      case 'curl':
        return `# 1. Programmatic Dynamic DNS update via cURL
# Endpoint: https://dynupdate.no-ip.com/nic/update
# Auth: HTTP Basic (${authType === 'ddns_key' ? 'DDNS Key' : 'Account Credentials'})

curl -X GET \\
  -u "${username}:${password}" \\
  -H "User-Agent: ${userAgent || 'DeviceGateway/1.0 admin@example.com'}" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=${domain}${ipParam}"

# Standard Expected Responses:
# good ${targetIp}   -> DNS record updated successfully!
# nochg ${targetIp}  -> IP is already identical; no write needed.
# badauth            -> Invalid username or DDNS Key password.
# nohost             -> Hostname does not exist in account.`;

      case 'python':
        return `import requests
from requests.auth import HTTPBasicAuth

def update_noip_dns(hostname: str, ip: str = None):
    """
    Programmatic DNS update for No-IP Dynamic & Managed DNS.
    Compatible with Python 3.8+ and requests library.
    """
    url = "https://dynupdate.no-ip.com/nic/update"
    params = {"hostname": hostname}
    ${autoDetectIp ? '# myip omitted: No-IP automatically detects public client IP' : ipQueryParam}
    headers = {
        "User-Agent": "${userAgent || 'DeviceGateway/1.0 admin@example.com'}"
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            auth=HTTPBasicAuth("${username}", "${password}"),
            timeout=10
        )
        status_text = response.text.strip()
        print(f"No-IP API Response: {status_text}")

        if status_text.startswith("good"):
            print("Successfully updated DNS A record!")
        elif status_text.startswith("nochg"):
            print("IP address has not changed. Sleep until next link event.")
        elif status_text == "nohost":
            print("Error: Hostname does not exist in account.")
        elif status_text == "badauth":
            print("Error: Invalid username or DDNS Key password.")
        
        return status_text
    except requests.RequestException as err:
        print(f"Network error during DNS sync: {err}")
        return None

# Trigger programmatic update:
update_noip_dns("${domain}"${autoDetectIp ? '' : `, ip="${targetIp}"`})`;

      case 'nodejs':
        return `/**
 * Programmatic DNS update function for Node.js / TypeScript microservices.
 * Supports Edge functions, AWS Lambda, Cloudflare Workers, or server daemons.
 */
async function syncDynamicDns() {
  const url = new URL('https://dynupdate.no-ip.com/nic/update');
  url.searchParams.set('hostname', '${domain}');
  ${autoDetectIp ? '// myip omitted to auto-detect client IP' : `url.searchParams.set('myip', '${targetIp}');`}

  const credentials = Buffer.from('${username}:${password}').toString('base64');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'User-Agent': '${userAgent || 'DeviceGateway/1.0 admin@example.com'}'
    }
  });

  const responseBody = (await response.text()).trim();
  console.log('[No-IP Sync Result]:', responseBody);
  return responseBody;
}

syncDynamicDns();`;

      case 'go':
        return `package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// SyncDynamicDNS sends a programmatic DNS update to No-IP Anycast API
func SyncDynamicDNS(hostname, user, pass string) (string, error) {
	endpoint, err := url.Parse("https://dynupdate.no-ip.com/nic/update")
	if err != nil {
		return "", err
	}

	query := endpoint.Query()
	query.Set("hostname", hostname)${ipGoParam}
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequest("GET", endpoint.String(), nil)
	if err != nil {
		return "", err
	}

	req.SetBasicAuth(user, pass)
	req.Header.Set("User-Agent", "${userAgent || 'HardwareController/2.0'}")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	return string(body), err
}

func main() {
	res, err := SyncDynamicDNS("${domain}", "${username}", "${password}")
	if err != nil {
		fmt.Printf("DNS update failed: %v\\n", err)
		return
	}
	fmt.Printf("No-IP Response: %s\\n", res)
}`;

      case 'powershell':
        return `# PowerShell Automated Script for Windows Server / Scheduled Tasks
$Hostname = "${domain}"
$DdnsUser = "${username}"
$DdnsPass = "${password}"

# Encode HTTP Basic Auth credentials
$Pair = "\$($DdnsUser):\$($DdnsPass)"
$Bytes = [System.Text.Encoding]::ASCII.GetBytes($Pair)
$EncodedAuth = [System.Convert]::ToBase64String($Bytes)

$Headers = @{
    Authorization = "Basic \$EncodedAuth"
    "User-Agent"  = "${userAgent || 'WinServerDnsWorker/1.2'}"
}

# Construct API endpoint URL
$Uri = "https://dynupdate.no-ip.com/nic/update?hostname=\$Hostname${ipPsParam}"

try {
    $Response = Invoke-RestMethod -Uri $Uri -Method Get -Headers $Headers
    Write-Host "No-IP API Response: \$Response" -ForegroundColor Green
} catch {
    Write-Error "Failed to update dynamic DNS: \$_\`"
}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(getCodeSnippet(activeCodeTab));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const returnCodes = [
    { code: 'good <IP>', meaning: 'DNS update successful. Hostname now resolves to the new IP.', type: 'success' },
    { code: 'nochg <IP>', meaning: 'IP is identical to existing record. No DNS change was necessary.', type: 'info' },
    { code: 'nohost', meaning: 'The specified hostname does not exist under this user/key.', type: 'error' },
    { code: 'badauth', meaning: 'Invalid username, password, or revoked DDNS Key credentials.', type: 'error' },
    { code: 'badagent', meaning: 'Client User-Agent header is missing, malformed, or banned.', type: 'warning' },
    { code: '!donator', meaning: 'Requested advanced feature requires an upgraded tier.', type: 'warning' },
    { code: 'abuse', meaning: 'Username blocked due to rapid polling (< 30s) without IP changes.', type: 'error' },
  ];

  return (
    <div id="integrate-via-api" className="mt-16 pt-12 border-t border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-[#ff914d] border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5 text-[#ff6600]" />
            Developer & Partner Integration
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive API Playground
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Simulate a Dynamic DNS record update in real time. Enter your credentials, domain, and target IP to test live request dispatch, Anycast propagation, and firmware return codes.
          </p>
        </div>

        {/* Quick Current Status Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Current Anycast IP:</span>
            <span className="font-mono font-bold text-slate-200">{currentDnsIp}</span>
          </div>
        </div>
      </div>

      {/* Preset Scenario Quick Select Bar */}
      <div className="mb-6 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Zap className="w-4 h-4 text-[#ff6600]" />
          <span className="font-bold text-slate-300">Quick Test Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'good', label: 'IP Change (good)', desc: 'Valid credentials with newly updated IP' },
            { id: 'nochg', label: 'Unchanged (nochg)', desc: 'IP matches current DNS state' },
            { id: 'badauth', label: 'Invalid Auth (badauth)', desc: 'Wrong username or password' },
            { id: 'nohost', label: 'Hostname 404 (nohost)', desc: 'Unregistered domain' },
            { id: 'badagent', label: 'Bad Agent (badagent)', desc: 'Empty user-agent header' },
            { id: 'abuse', label: 'Rate Abuse (abuse)', desc: 'Rapid polling violation' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectPreset(sc.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                presetScenario === sc.id
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
              title={sc.desc}
            >
              {sc.label}
            </button>
          ))}
          <button
            onClick={() => {
              setPresetScenario('custom');
              handleGenerateRandomIp();
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Randomize IP
          </button>
        </div>
      </div>

      {/* Playground Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Playground Request Builder & Credentials Form */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ff6600]" />
              API Request Builder
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              <span>GET</span>
              <span className="text-slate-400">/nic/update</span>
            </div>
          </div>

          {/* Authentication Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              1. Credentials & Auth Method
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setAuthType('ddns_key');
                  setUsername('ddns_key_user_8721');
                  setPassword('k3y_sec_99187a4c9b');
                  setPresetScenario('custom');
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  authType === 'ddns_key'
                    ? 'bg-orange-500/15 border-[#ff6600] text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Key className="w-3.5 h-3.5 text-[#ff6600]" />
                  <span>DDNS Key</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Scoped Device Key</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthType('account');
                  setUsername('kh…@gmail.com');
                  setPassword('MyAccountPass!99');
                  setPresetScenario('custom');
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  authType === 'account'
                    ? 'bg-orange-500/15 border-[#ff6600] text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Account Login</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Direct Username/Email</span>
              </button>
            </div>

            {/* Username input */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setPresetScenario('custom');
                  }}
                  placeholder={authType === 'ddns_key' ? 'DDNS Key Username (e.g. key_usr_8721)' : 'Account Email / Username'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-[#ff6600] outline-none"
                />
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPresetScenario('custom');
                  }}
                  placeholder="Password or DDNS Key Secret"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-[#ff6600] outline-none"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Domain / Hostname Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Target Domain / Hostname
              </label>
              <span className="text-[10px] text-slate-500">Parameter: hostname</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value.toLowerCase());
                  setPresetScenario('custom');
                }}
                placeholder="e.g. office.ddns.net"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-[#ff6600] outline-none"
              />
              <Globe className="w-3.5 h-3.5 text-[#ff6600] absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {['office.ddns.net', 'cam-yard.freedynamicdns.net', 'nas-backup.zapto.org'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDomain(d);
                    setPresetScenario('custom');
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Target IP Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Target IP Address
              </label>
              <button
                type="button"
                onClick={() => {
                  setAutoDetectIp(!autoDetectIp);
                  setPresetScenario('custom');
                }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                  autoDetectIp 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {autoDetectIp ? '✓ Auto-Detecting Egress IP' : 'Omit for Auto-Detect'}
              </button>
            </div>

            {autoDetectIp ? (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><code className="font-mono">myip</code> parameter omitted. No-IP will bind the public IPv4/IPv6 address of this HTTP connection (198.51.100.42).</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetIp}
                  onChange={(e) => {
                    setTargetIp(e.target.value.trim());
                    setPresetScenario('custom');
                  }}
                  placeholder="e.g. 198.51.100.42"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-[#ff6600] outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandomIp}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl font-semibold transition-colors flex items-center gap-1"
                  title="Generate a different public IP to test change"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New IP
                </button>
              </div>
            )}
          </div>

          {/* User-Agent Header input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              4. User-Agent Header (Mandatory)
            </label>
            <input
              type="text"
              value={userAgent}
              onChange={(e) => {
                setUserAgent(e.target.value);
                setPresetScenario('custom');
              }}
              placeholder="e.g. DeviceName/1.0 admin@example.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono focus:border-[#ff6600] outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">No-IP requires a custom User-Agent to prevent 403 or badagent blocks.</p>
          </div>

          {/* Execute Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleExecuteApiCall}
              className="w-full py-3 px-4 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching API Call to Edge...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send API Update Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Feedback Inspector & Code Samples */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Response Feedback Panel */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Real-time Response Header Strip */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white text-xs tracking-wide">
                  Live Response Inspector
                </span>
                {simulatedResponse && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                      simulatedResponse.isSuccess
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800'
                    }`}
                  >
                    HTTP {simulatedResponse.status} {simulatedResponse.statusText}
                  </span>
                )}
              </div>

              {simulatedResponse && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-[#ff6600]" />
                    {simulatedResponse.latencyMs}ms
                  </span>
                  <span className="hidden sm:inline text-slate-600">|</span>
                  <span className="hidden sm:inline text-slate-400">{simulatedResponse.timestamp}</span>
                </div>
              )}
            </div>

            {/* Response Navigation Tabs */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'body', label: 'Response Body' },
                { id: 'exchange', label: 'Raw HTTP Exchange' },
                { id: 'propagation', label: 'Anycast PoP Propagation' },
                { id: 'headers', label: 'Response Headers' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInspectorTab(t.id as InspectorTab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    inspectorTab === t.id
                      ? 'bg-slate-800 text-[#ff914d] border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Response Content Viewers */}
            <div className="p-4 sm:p-5 text-xs font-mono">
              {isSimulating ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#ff6600] mx-auto" />
                  <p className="text-slate-300 font-sans text-xs">
                    Dispatching HTTP request to <code className="text-[#ff914d] font-mono">dynupdate.no-ip.com</code>...
                  </p>
                  <p className="text-slate-500 text-[11px] font-sans">
                    Authenticating credentials and testing Anycast route...
                  </p>
                </div>
              ) : simulatedResponse ? (
                <>
                  {/* Tab 1: Response Body */}
                  {inspectorTab === 'body' && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-500 text-[11px] mb-1.5 flex items-center justify-between">
                          <span>Raw Text Payload Returned by API:</span>
                          <span className="text-[10px] text-slate-400">Content-Type: text/plain</span>
                        </div>
                        <div
                          className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-between ${
                            simulatedResponse.isSuccess
                              ? 'bg-emerald-950/30 border-emerald-800/70 text-emerald-400'
                              : 'bg-rose-950/30 border-rose-800/70 text-rose-400'
                          }`}
                        >
                          <span className="tracking-wide">{simulatedResponse.body}</span>
                          <span className="text-xs font-normal opacity-80">
                            {simulatedResponse.isSuccess ? '✓ Protocol Success' : '✕ Protocol Error'}
                          </span>
                        </div>
                      </div>

                      {/* Plain-English Meaning & Actionable Advice */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-sans">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-[#ff6600] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-200 text-xs block">Return Code Meaning:</span>
                            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                              {simulatedResponse.meaning}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-[11px]">
                          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Client / Firmware Action Advice:
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {simulatedResponse.actionAdvice}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Raw HTTP Exchange */}
                  {inspectorTab === 'exchange' && (
                    <div className="space-y-4 text-[11px] sm:text-xs">
                      <div>
                        <span className="text-[#ff914d] font-bold block mb-1 font-sans">HTTP Request Dispatched:</span>
                        <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto leading-relaxed">
                          <code>
{`GET /nic/update?hostname=${domain}${autoDetectIp ? '' : `&myip=${targetIp}`} HTTP/1.1
Host: dynupdate.no-ip.com
Authorization: Basic ${getAuthHeaderValue()}
User-Agent: ${userAgent || 'DeviceFirmware/3.2'}
Accept: */*`}
                          </code>
                        </pre>
                      </div>

                      <div>
                        <span className="text-emerald-400 font-bold block mb-1 font-sans">HTTP Response Received:</span>
                        <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto leading-relaxed">
                          <code>
{`HTTP/1.1 ${simulatedResponse.status} ${simulatedResponse.statusText}
Server: ${simulatedResponse.headers['server']}
Date: ${simulatedResponse.headers['date']}
Content-Type: text/plain; charset=UTF-8
Content-Length: ${simulatedResponse.headers['content-length']}
X-NoIP-Edge: ${simulatedResponse.headers['x-noip-edge']}
X-RateLimit-Remaining: ${simulatedResponse.headers['x-ratelimit-remaining']}

${simulatedResponse.body}`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Anycast PoP Propagation */}
                  {inspectorTab === 'propagation' && (
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-[#ff6600]" />
                          Global Anycast Edge Distribution Status
                        </span>
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          {simulatedResponse.isSuccess ? '100% Propagated Worldwide' : 'Propagation Halted'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { region: 'North America West', city: 'San Jose, US', latency: '12ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                          { region: 'North America East', city: 'Ashburn, US', latency: '24ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                          { region: 'Europe Central', city: 'Frankfurt, DE', latency: '68ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                          { region: 'Europe West', city: 'London, UK', latency: '74ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                          { region: 'Asia Pacific', city: 'Tokyo, JP', latency: '112ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                          { region: 'Australia', city: 'Sydney, AU', latency: '144ms', ip: simulatedResponse.isSuccess ? simulatedResponse.appliedIp : currentDnsIp },
                        ].map((pop) => (
                          <div key={pop.city} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${simulatedResponse.isSuccess ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                {pop.city}
                              </div>
                              <div className="text-[10px] text-slate-500">{pop.region}</div>
                            </div>
                            <div className="text-right font-mono text-[11px]">
                              <span className="text-slate-200 block font-semibold">{pop.ip}</span>
                              <span className="text-slate-500 text-[10px]">{pop.latency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Response Headers */}
                  {inspectorTab === 'headers' && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                      {Object.entries(simulatedResponse.headers).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-slate-800/60 pb-1">
                          <span className="text-slate-400">{key}:</span>
                          <span className="text-slate-200">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Code Samples Generated in Real Time matching playground values */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {(
                  [
                    { id: 'curl', label: 'cURL', icon: Terminal },
                    { id: 'python', label: 'Python', icon: Code2 },
                    { id: 'nodejs', label: 'Node.js / TS', icon: Code2 },
                    { id: 'go', label: 'Go', icon: Code2 },
                    { id: 'powershell', label: 'PowerShell', icon: Terminal },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeCodeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCodeTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff6600] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                title="Copy code to clipboard"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-x-auto text-xs font-mono leading-relaxed bg-slate-950 text-slate-300 max-h-64">
              <pre className="text-[11px] sm:text-xs">
                <code>{getCodeSnippet(activeCodeTab)}</code>
              </pre>
            </div>
          </div>

          {/* Playground Simulation Call History */}
          <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <History className="w-3.5 h-3.5 text-[#ff6600]" />
                <span>Simulation Call History</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Last {callHistory.length} calls</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {callHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isSuccess ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    ></span>
                    <span className="text-slate-300 font-semibold">{item.domain}</span>
                    <span className="text-slate-500 hidden sm:inline">→ {item.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold ${
                        item.isSuccess ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.statusText}
                    </span>
                    <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Return Codes Reference Table */}
      <div className="mt-10 bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-[#ff6600]" />
              No-IP Dynamic Update API Return Codes Specification
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Responses returned in the body of <code className="text-[#ff914d] font-mono">GET /nic/update</code> for parser implementations:
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">HTTP 200 Standard Return</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {returnCodes.map((rc) => {
            const badgeBg =
              rc.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : rc.type === 'info'
                ? 'bg-blue-950/60 border-blue-800/60 text-blue-400'
                : rc.type === 'warning'
                ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                : 'bg-rose-950/60 border-rose-800/60 text-rose-400';

            return (
              <div
                key={rc.code}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5"
              >
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border whitespace-nowrap ${badgeBg}`}>
                  {rc.code}
                </span>
                <span className="text-slate-300 text-[11px] leading-snug">
                  {rc.meaning}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
