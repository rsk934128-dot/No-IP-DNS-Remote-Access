import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Globe,
  Key,
  Database,
  Info,
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  ShieldAlert,
  BookOpen
} from 'lucide-react';

export const IntegrateViaApiSection: React.FC = () => {
  // Mode: 'simple' for concise, readable 5-line examples; 'complete' for production error-handling
  const [snippetMode, setSnippetMode] = useState<'simple' | 'complete'>('simple');
  // Active Code Language Tab
  const [activeLang, setActiveLang] = useState<'python' | 'curl' | 'nodejs'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleScrollToResources = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const resourcesEl = document.getElementById('resources-section');
    if (resourcesEl) {
      resourcesEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open('https://www.noip.com/integrate/api', '_blank', 'noopener,noreferrer');
    }
  };

  // Dynamic Customizer Parameters
  const [customDomain, setCustomDomain] = useState('office.ddns.net');
  const [customIp, setCustomIp] = useState('198.51.100.42');
  const [autoDetectIp, setAutoDetectIp] = useState(false);
  const [customUser, setCustomUser] = useState('ddns_key_user_8721');
  const [customPass, setCustomPass] = useState('k3y_sec_99187a4c9b');
  const [showConfig, setShowConfig] = useState(false);

  // Live Test Output Simulation
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<{
    code: string;
    body: string;
    latency: number;
    status: number;
    type: 'success' | 'nochg' | 'error';
  } | null>(null);

  const handleCopy = () => {
    const code = getSnippet(activeLang, snippetMode);
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const isAuthError = !customUser || customUser.includes('invalid') || !customPass;
      const isDomainError = !customDomain || !customDomain.includes('.');

      if (isAuthError) {
        setTestOutput({
          status: 401,
          code: 'badauth',
          body: 'badauth',
          latency: 86,
          type: 'error'
        });
      } else if (isDomainError) {
        setTestOutput({
          status: 200,
          code: 'nohost',
          body: 'nohost',
          latency: 74,
          type: 'error'
        });
      } else {
        const ipToUse = autoDetectIp ? '198.51.100.42' : (customIp || '198.51.100.42');
        setTestOutput({
          status: 200,
          code: `good ${ipToUse}`,
          body: `good ${ipToUse}`,
          latency: 92,
          type: 'success'
        });
      }
    }, 400);
  };

  // Generate Snippets (Simple vs Complete)
  const getSnippet = (lang: 'python' | 'curl' | 'nodejs', mode: 'simple' | 'complete'): string => {
    const domain = customDomain || 'office.ddns.net';
    const user = customUser || 'username';
    const pass = customPass || 'password';
    const ip = customIp || '198.51.100.42';

    if (mode === 'simple') {
      if (lang === 'python') {
        return `# Simple Python DNS Update (using requests)
import requests

response = requests.get(
    "https://dynupdate.no-ip.com/nic/update",
    params={"hostname": "${domain}"${autoDetectIp ? '' : `, "myip": "${ip}"`}},
    auth=("${user}", "${pass}"),
    headers={"User-Agent": "SimpleDdnsClient/1.0 dev@partnercorp.net"}
)

# Output: "good ${ip}" or "nochg ${ip}"
print(f"Status: {response.status_code}, Response: {response.text}")`;
      }

      if (lang === 'curl') {
        if (autoDetectIp) {
          return `# Simple cURL DNS Update (Auto-detects connecting public IP)
curl -u "${user}:${pass}" \\
  -A "SimpleDdnsAgent/1.0 dev@partnercorp.net" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=${domain}"`;
        }
        return `# Simple cURL DNS Update (Explicit target IP)
curl -u "${user}:${pass}" \\
  -A "SimpleDdnsAgent/1.0 dev@partnercorp.net" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=${domain}&myip=${ip}"`;
      }

      // Node.js Simple
      return `// Simple Node.js (v18+ native fetch) DNS Update
const auth = Buffer.from('${user}:${pass}').toString('base64');
const endpoint = 'https://dynupdate.no-ip.com/nic/update?hostname=${domain}${autoDetectIp ? '' : `&myip=${ip}`}';

const res = await fetch(endpoint, {
  headers: {
    'Authorization': \`Basic \${auth}\`,
    'User-Agent': 'SimpleDdnsClient/1.0 dev@partnercorp.net'
  }
});

console.log(await res.text()); // e.g. "good ${ip}"`;
    }

    // Complete Production-Grade Mode
    if (lang === 'python') {
      return `import requests
from requests.auth import HTTPBasicAuth

# -------------------------------------------------------------
# No-IP Dynamic DNS Programmatic Update in Python
# -------------------------------------------------------------
HOSTNAME = "${domain}"
USERNAME = "${user}"
PASSWORD = "${pass}"
${autoDetectIp ? '# Omit NEW_IP to allow No-IP to auto-detect client egress IP\nNEW_IP = None' : `NEW_IP = "${ip}"`}

# Official No-IP Dynamic Update API Endpoint
API_URL = "https://dynupdate.no-ip.com/nic/update"

# Request parameters
params = {"hostname": HOSTNAME}
if NEW_IP:
    params["myip"] = NEW_IP

# Mandatory User-Agent header (Format: AppName/Version contact-email)
headers = {
    "User-Agent": "Python-DdnsClient/2.1 contact@partnercorp.net"
}

try:
    response = requests.get(
        API_URL,
        params=params,
        auth=HTTPBasicAuth(USERNAME, PASSWORD),
        headers=headers,
        timeout=10
    )
    
    # API response is returned as plain text (e.g., 'good 198.51.100.42' or 'nochg 198.51.100.42')
    result = response.text.strip()
    print(f"HTTP Status: {response.status_code}")
    print(f"Raw Response: {result}")

    # Parse return codes
    if result.startswith("good"):
        applied_ip = result.split()[1]
        print(f"✓ Success! DNS updated to {applied_ip}")
    elif result.startswith("nochg"):
        current_ip = result.split()[1]
        print(f"✓ No change needed. DNS already points to {current_ip}")
    elif result == "badauth":
        print("✕ Error: Invalid username or DDNS Key credentials.")
    elif result == "nohost":
        print(f"✕ Error: Hostname '{HOSTNAME}' does not exist.")
    elif result == "abuse":
        print("✕ Error: Blocked for rapid polling. Please wait 30 minutes.")
    else:
        print(f"✕ Unknown API response: {result}")

except requests.exceptions.RequestException as err:
    print(f"Network error updating DNS: {err}")`;
    }

    if (lang === 'curl') {
      if (autoDetectIp) {
        return `# -------------------------------------------------------------
# No-IP Dynamic DNS Update via cURL (Auto-detect IP)
# -------------------------------------------------------------
# When 'myip' is omitted, No-IP uses the connecting public egress IP.

curl -X GET \\
  -u "${user}:${pass}" \\
  -A "Curl-DdnsAgent/1.0 admin@partnercorp.net" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=${domain}"

# Example Responses:
#   good 198.51.100.42  -> Successfully updated
#   nochg 198.51.100.42 -> IP is already up to date
#   badauth             -> Invalid credentials
#   nohost              -> Hostname not found under this account`;
      }
      return `# -------------------------------------------------------------
# No-IP Dynamic DNS Update via cURL (Explicit Target IP)
# -------------------------------------------------------------
# -u : HTTP Basic Authentication (username:password or ddns_key:secret)
# -A : Required descriptive User-Agent header

curl -X GET \\
  -u "${user}:${pass}" \\
  -A "Curl-DdnsAgent/1.0 admin@partnercorp.net" \\
  "https://dynupdate.no-ip.com/nic/update?hostname=${domain}&myip=${ip}"

# Expected Return Codes:
#   good ${ip}   -> Successfully updated to ${ip}
#   nochg ${ip}  -> IP is identical; no change needed
#   badauth      -> Authentication failure
#   nohost       -> Hostname does not exist`;
    }

    // Node.js (native fetch v18+)
    return `// -------------------------------------------------------------
// No-IP Dynamic DNS Programmatic Update in Node.js (Fetch API)
// -------------------------------------------------------------
const HOSTNAME = '${domain}';
const USERNAME = '${user}';
const PASSWORD = '${pass}';
${autoDetectIp ? '// Omit target IP to let No-IP auto-detect egress address\nconst TARGET_IP = null;' : `const TARGET_IP = '${ip}';`}

async function updateDns() {
  const url = new URL('https://dynupdate.no-ip.com/nic/update');
  url.searchParams.set('hostname', HOSTNAME);
  if (TARGET_IP) {
    url.searchParams.set('myip', TARGET_IP);
  }

  // HTTP Basic Authentication base64 encoding
  const basicAuth = Buffer.from(\`\${USERNAME}:\${PASSWORD}\`).toString('base64');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': \`Basic \${basicAuth}\`,
        'User-Agent': 'Node-DdnsWorker/3.0 dev@partnercorp.net',
        'Accept': 'text/plain'
      }
    });

    const body = (await response.text()).trim();
    console.log(\`HTTP \${response.status} - API Response: "\${body}"\`);

    // Parse No-IP Protocol standard return codes
    const [status, resolvedIp] = body.split(' ');
    
    switch (status) {
      case 'good':
        console.log(\`✓ DNS updated successfully to \${resolvedIp}\`);
        return { success: true, ip: resolvedIp };
      case 'nochg':
        console.log(\`✓ DNS record already points to \${resolvedIp} (no change)\`);
        return { success: true, ip: resolvedIp };
      case 'badauth':
        throw new Error('Authentication failed: check username or DDNS Key.');
      case 'nohost':
        throw new Error(\`Hostname '\${HOSTNAME}' not found on account.\`);
      case 'abuse':
        throw new Error('Blocked for rapid polling. Please wait at least 30 minutes.');
      default:
        throw new Error(\`Unexpected API response: \${body}\`);
    }
  } catch (error) {
    console.error('DNS update failed:', error.message);
    throw error;
  }
}

// Execute update
updateDns();`;
  };

  return (
    <section id="integrate-via-api" className="mt-16 pt-12 border-t border-slate-800 font-sans">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-[#ff914d] border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5 text-[#ff6600]" />
            Developer Documentation & Code Samples
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Integrate via API
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Update Dynamic DNS records programmatically from custom firmware, scheduled cron jobs, IoT devices, or backend services. Clear, simple code examples for fast developer onboarding.
          </p>
        </div>

        {/* Quick Spec & Full API Documentation Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Endpoint:</span>
            <code className="text-[#ff914d] font-mono font-semibold">GET /nic/update</code>
          </div>

          <button
            id="btn-integrate-view-full-docs"
            type="button"
            onClick={handleScrollToResources}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Scroll to Resources section or view full documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ff6600]" />
            <span>View Full API Documentation</span>
          </button>

          <a
            href="https://www.noip.com/integrate/api"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Open official documentation in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Simple Integration Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveLang('python');
            setSnippetMode('simple');
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeLang === 'python' && snippetMode === 'simple'
              ? 'bg-slate-900 border-[#ff6600] shadow-md ring-1 ring-orange-500/20'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Python Example
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
              5 lines
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
            requests.get("https://dynupdate.no-ip.com/nic/update", ...)
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLang('curl');
            setSnippetMode('simple');
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeLang === 'curl' && snippetMode === 'simple'
              ? 'bg-slate-900 border-[#ff6600] shadow-md ring-1 ring-orange-500/20'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              cURL One-Liner
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
              CLI / Bash
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
            curl -u user:pass "https://dynupdate.no-ip.com/..."
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLang('nodejs');
            setSnippetMode('simple');
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeLang === 'nodejs' && snippetMode === 'simple'
              ? 'bg-slate-900 border-[#ff6600] shadow-md ring-1 ring-orange-500/20'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Node.js Fetch
            </span>
            <span className="text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800 px-1.5 py-0.5 rounded font-mono">
              ESM / Node 18+
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
            await fetch('https://dynupdate.no-ip.com/nic/update?hostname=...')
          </p>
        </button>
      </div>

      {/* Main Snippet Container */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Control Bar: Language Switcher + Mode Toggle + Customizer Toggle + Copy Button */}
        <div className="bg-slate-900/95 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Language Selector Tabs + Simple/Full Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveLang('python')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLang === 'python'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="font-mono text-emerald-400 font-bold">Py</span>
                <span>Python</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLang('curl')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLang === 'curl'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>cURL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLang('nodejs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLang === 'nodejs'
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="font-mono text-sky-400 font-bold">JS</span>
                <span>Node.js</span>
              </button>
            </div>

            {/* Simple vs Complete Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSnippetMode('simple')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  snippetMode === 'simple'
                    ? 'bg-slate-800 text-white shadow-inner font-bold text-[#ff914d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Concise, lightweight code snippet"
              >
                ⚡ Simple Example
              </button>
              <button
                type="button"
                onClick={() => setSnippetMode('complete')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  snippetMode === 'complete'
                    ? 'bg-slate-800 text-white shadow-inner font-bold text-[#ff914d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full production error-handling and return code parser"
              >
                Production Ready
              </button>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Toggle Dynamic Variable Customizer */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                showConfig
                  ? 'bg-slate-800 text-[#ff914d] border-orange-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
              title="Customize hostname, IP, and credentials in the snippet"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customize Parameters</span>
              <span className="sm:hidden">Configure</span>
            </button>

            {/* Run Test Simulation Button */}
            <button
              type="button"
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              title="Test code snippet output"
            >
              <Play className={`w-3 h-3 text-emerald-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Running...' : 'Test Run'}</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#ff6600] hover:bg-[#e65c00] active:scale-95 text-white px-3.5 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
              title="Copy code snippet to clipboard"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Collapsible Parameter Customizer Bar */}
        {showConfig && (
          <div className="bg-slate-900/70 border-b border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#ff6600]" /> Target Hostname
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="office.ddns.net"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#ff6600] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-sky-400" /> Target IP
                </span>
                <label className="text-[10px] text-slate-400 font-normal flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDetectIp}
                    onChange={(e) => setAutoDetectIp(e.target.checked)}
                    className="rounded text-[#ff6600] accent-[#ff6600]"
                  />
                  Auto-detect
                </label>
              </label>
              <input
                type="text"
                disabled={autoDetectIp}
                value={autoDetectIp ? '(auto-detect egress IP)' : customIp}
                onChange={(e) => setCustomIp(e.target.value)}
                placeholder="198.51.100.42"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#ff6600] outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" /> Username / Key
              </label>
              <input
                type="text"
                value={customUser}
                onChange={(e) => setCustomUser(e.target.value)}
                placeholder="ddns_key_user_8721"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#ff6600] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" /> Password / Secret
              </label>
              <input
                type="text"
                value={customPass}
                onChange={(e) => setCustomPass(e.target.value)}
                placeholder="k3y_sec_99187a4c9b"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#ff6600] outline-none"
              />
            </div>
          </div>
        )}

        {/* Live Test Run Output Drawer */}
        {testOutput && (
          <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              {testOutput.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <div>
                <span className="text-slate-400">Simulated Terminal Output: </span>
                <span className={`font-bold ${testOutput.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  HTTP {testOutput.status} &rarr; "{testOutput.body}"
                </span>
                <span className="text-slate-500 ml-2">({testOutput.latency}ms)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTestOutput(null)}
              className="text-slate-500 hover:text-slate-300 text-xs font-sans"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Code Snippet Display */}
        <div className="p-4 sm:p-6 bg-slate-950 overflow-x-auto text-xs font-mono leading-relaxed text-slate-300">
          <pre className="text-xs sm:text-[13px] leading-relaxed whitespace-pre font-mono">
            <code>{getSnippet(activeLang, snippetMode)}</code>
          </pre>
        </div>

        {/* Footer Specification Bar */}
        <div className="bg-slate-900/90 px-4 sm:px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span><strong className="text-slate-200">Protocol:</strong> HTTP 1.1 / TLS 1.3</span>
            <span><strong className="text-slate-200">Auth:</strong> RFC 7617 HTTP Basic</span>
            <span><strong className="text-slate-200">Rate Limit:</strong> 1 req / 30s</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Need scoped credentials?</span>
            <span className="text-[#ff914d] font-semibold">Generate DDNS Keys in Portal</span>
          </div>
        </div>
      </div>

      {/* Quick API Return Codes Matrix */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-950 border border-emerald-800 text-emerald-400">
            good &lt;IP&gt;
          </span>
          <div>
            <span className="font-bold text-slate-200 block">Update Succeeded</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              The DNS record has been updated and synchronized across all global Anycast edge nodes.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-sky-950 border border-sky-800 text-sky-400">
            nochg &lt;IP&gt;
          </span>
          <div>
            <span className="font-bold text-slate-200 block">IP Unchanged</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Target IP is identical to existing record. Client should sleep and avoid aggressive polling.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-rose-950 border border-rose-800 text-rose-400">
            badauth / nohost
          </span>
          <div>
            <span className="font-bold text-slate-200 block">Protocol Error</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Invalid username/key or hostname does not exist under the account. Stop update loop immediately.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
