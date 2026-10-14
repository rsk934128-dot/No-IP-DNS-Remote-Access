import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Network,
  Laptop,
  Smartphone,
  Camera,
  Server,
  Globe,
  Code2,
  Terminal,
  Copy,
  Check,
  Sliders,
  Activity,
  Play,
  RotateCcw,
  Layers,
  Lock,
  Unlock,
  Eye,
  Key,
  Flame,
  CheckCheck
} from 'lucide-react';
import { HostnameRecord } from '../types';

export interface WifiNetworkItem {
  id: string;
  ssid: string;
  bssid: string;
  signalDbm: number;
  qualityPercent: number;
  channel: number;
  band: '2.4 GHz' | '5 GHz' | '6 GHz';
  security: 'WPA3-Personal' | 'WPA2/WPA3' | 'WPA2-Enterprise' | 'Open';
  channelWidth: '20 MHz' | '40 MHz' | '80 MHz' | '160 MHz';
  isJammed: boolean;
  interferenceLevel: 'Low' | 'Moderate' | 'High (Jammed)';
  isConnected: boolean;
  pingMs: number;
}

export interface SharedClientDevice {
  id: string;
  name: string;
  type: 'phone' | 'laptop' | 'camera' | 'server' | 'iot';
  ipAddress: string;
  macAddress: string;
  rxKbps: number;
  txKbps: number;
  connectedSince: string;
  ddnsSubdomain?: string;
  status: 'active' | 'idle' | 'throttled';
}

interface WifiRealtimeManagerProps {
  currentPublicIp?: string;
  hostnames?: HostnameRecord[];
  onUpdateIp?: (newIp: string) => void;
  onOpenDnsLookup?: (domain?: string) => void;
}

export const WifiRealtimeManager: React.FC<WifiRealtimeManagerProps> = ({
  currentPublicIp = '198.51.100.42',
  hostnames = [],
  onUpdateIp,
  onOpenDnsLookup,
}) => {
  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'scanner' | 'clear-jam' | 'ip-share' | 'api-console'>('scanner');

  // Real-time WiFi Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [lastScannedAt, setLastScannedAt] = useState<string>('Just now');
  const [scanFilter, setScanFilter] = useState<'ALL' | '5G_6G' | '2.4G' | 'JAMMED'>('ALL');

  // Surrounding WiFi Networks
  const [networks, setNetworks] = useState<WifiNetworkItem[]>([
    {
      id: 'net-1',
      ssid: 'FiberOptic_HighSpeed_5G',
      bssid: 'AC:8B:A9:42:11:FE',
      signalDbm: -44,
      qualityPercent: 96,
      channel: 36,
      band: '5 GHz',
      security: 'WPA3-Personal',
      channelWidth: '80 MHz',
      isJammed: false,
      interferenceLevel: 'Low',
      isConnected: true,
      pingMs: 14,
    },
    {
      id: 'net-2',
      ssid: 'NoIP_Mesh_Expansion_Node1',
      bssid: 'E4:95:6E:12:88:02',
      signalDbm: -49,
      qualityPercent: 91,
      channel: 69,
      band: '6 GHz',
      security: 'WPA3-Personal',
      channelWidth: '160 MHz',
      isJammed: false,
      interferenceLevel: 'Low',
      isConnected: false,
      pingMs: 11,
    },
    {
      id: 'net-3',
      ssid: 'Office_Legacy_Router_2.4G',
      bssid: '80:2A:A8:CC:34:B1',
      signalDbm: -68,
      qualityPercent: 64,
      channel: 6,
      band: '2.4 GHz',
      security: 'WPA2/WPA3',
      channelWidth: '20 MHz',
      isJammed: true,
      interferenceLevel: 'High (Jammed)',
      isConnected: false,
      pingMs: 128,
    },
    {
      id: 'net-4',
      ssid: 'Dhaka_City_Mesh_Hotspot',
      bssid: '34:E8:94:5D:AA:19',
      signalDbm: -56,
      qualityPercent: 82,
      channel: 149,
      band: '5 GHz',
      security: 'WPA2/WPA3',
      channelWidth: '80 MHz',
      isJammed: false,
      interferenceLevel: 'Low',
      isConnected: false,
      pingMs: 19,
    },
    {
      id: 'net-5',
      ssid: 'Smart_Home_IoT_Hub',
      bssid: '70:EE:50:FA:90:31',
      signalDbm: -62,
      qualityPercent: 74,
      channel: 11,
      band: '2.4 GHz',
      security: 'WPA2/WPA3',
      channelWidth: '20 MHz',
      isJammed: false,
      interferenceLevel: 'Moderate',
      isConnected: false,
      pingMs: 32,
    },
    {
      id: 'net-6',
      ssid: 'Neighbour_Crowded_AccessPoint',
      bssid: '18:68:CB:02:44:9C',
      signalDbm: -76,
      qualityPercent: 48,
      channel: 6,
      band: '2.4 GHz',
      security: 'WPA2-Enterprise',
      channelWidth: '40 MHz',
      isJammed: true,
      interferenceLevel: 'High (Jammed)',
      isConnected: false,
      pingMs: 145,
    },
  ]);

  // Connect modal state
  const [connectingNetwork, setConnectingNetwork] = useState<WifiNetworkItem | null>(null);
  const [connectPassword, setConnectPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStepText, setConnectStepText] = useState('');

  // --------------------------------------------------------------------------
  // JAM CLEARING & FLUSHING STATE
  // --------------------------------------------------------------------------
  const [isClearingJam, setIsClearingJam] = useState(false);
  const [jamClearStage, setJamClearStage] = useState<number>(0);
  const [jamClearedSuccess, setJamClearedSuccess] = useState(false);
  const [jamClearMetrics, setJamClearMetrics] = useState<{
    oldLatency: number;
    newLatency: number;
    oldInterference: number;
    newInterference: number;
    flushedSocketsCount: number;
    clearedDnsEntries: number;
    newChannel: number;
  }>({
    oldLatency: 118,
    newLatency: 14,
    oldInterference: 84,
    newInterference: 3,
    flushedSocketsCount: 142,
    clearedDnsEntries: 38,
    newChannel: 36,
  });

  // --------------------------------------------------------------------------
  // IP SHARING & NETWORK EXPANSION STATE
  // --------------------------------------------------------------------------
  const [isIpSharingActive, setIsIpSharingActive] = useState(true);
  const [virtualSubnet, setVirtualSubnet] = useState<'192.168.4.0/24' | '10.42.0.0/24' | '172.24.0.0/24'>('192.168.4.0/24');
  const [hotspotSsid, setHotspotSsid] = useState('NoIP_Relay_Mesh_Expansion');
  const [hotspotKey, setHotspotKey] = useState('mesh99x_ddns_secure');
  const [showHotspotKey, setShowHotspotKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Connected Client Devices
  const [sharedClients, setSharedClients] = useState<SharedClientDevice[]>([
    {
      id: 'client-1',
      name: 'Samsung Galaxy S24 Ultra',
      type: 'phone',
      ipAddress: '192.168.4.15',
      macAddress: '8C:64:A2:33:41:90',
      rxKbps: 420,
      txKbps: 180,
      connectedSince: '1h 24m',
      ddnsSubdomain: 'mobile.fs-gateway.ddns.net',
      status: 'active',
    },
    {
      id: 'client-2',
      name: 'MacBook Pro M3 Max',
      type: 'laptop',
      ipAddress: '192.168.4.22',
      macAddress: 'F0:18:98:B4:72:1C',
      rxKbps: 1850,
      txKbps: 620,
      connectedSince: '45m',
      ddnsSubdomain: 'workstation.fs-gateway.ddns.net',
      status: 'active',
    },
    {
      id: 'client-3',
      name: 'Hikvision NVR 4K Cam Node',
      type: 'camera',
      ipAddress: '192.168.4.108',
      macAddress: 'A4:14:37:9E:51:77',
      rxKbps: 92,
      txKbps: 3400,
      connectedSince: '4h 10m',
      ddnsSubdomain: 'cam-yard.freedynamicdns.net',
      status: 'active',
    },
    {
      id: 'client-4',
      name: 'Raspberry Pi 5 Anycast Node',
      type: 'server',
      ipAddress: '192.168.4.240',
      macAddress: 'DC:A6:32:89:FE:40',
      rxKbps: 340,
      txKbps: 290,
      connectedSince: '12h 30m',
      ddnsSubdomain: 'ipv6-mesh.zapto.org',
      status: 'active',
    },
  ]);

  // --------------------------------------------------------------------------
  // API INTEGRATION CONSOLE STATE
  // --------------------------------------------------------------------------
  const [apiKey, setApiKey] = useState('noip_live_key_9f82ab7c31e405d');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedApiSnippet, setCopiedApiSnippet] = useState(false);
  const [selectedApiLang, setSelectedApiLang] = useState<'curl' | 'nodejs' | 'python' | 'go'>('curl');
  const [apiEndpoint, setApiEndpoint] = useState<
    'wifi_scan' | 'clear_jam' | 'ip_share' | 'update_ddns' | 'list_clients'
  >('clear_jam');
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [apiExecutionResponse, setApiExecutionResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    timestamp: string;
    payload: Record<string, unknown>;
  } | null>(null);

  // Status notification toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // --------------------------------------------------------------------------
  // LIVE AIRWAVE SCAN TRIGGER
  // --------------------------------------------------------------------------
  const runLiveAirwaveScan = useCallback(async () => {
    setIsScanning(true);
    // Simulate real RF spectrum scanning duration
    await new Promise((r) => setTimeout(r, 1200));

    setNetworks((prev) =>
      prev.map((net) => {
        // Apply slight realistic signal jitter
        const delta = Math.floor(Math.random() * 5) - 2;
        const newDbm = Math.min(-35, Math.max(-88, net.signalDbm + delta));
        const newQuality = Math.min(99, Math.max(30, Math.round(100 - (Math.abs(newDbm) - 30) * 1.2)));
        const jitterPing = Math.max(8, net.pingMs + (Math.floor(Math.random() * 7) - 3));
        return {
          ...net,
          signalDbm: newDbm,
          qualityPercent: newQuality,
          pingMs: jitterPing,
        };
      })
    );

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastScannedAt(timeStr);
    setIsScanning(false);
  }, []);

  // Periodic Auto-scan (every 15 seconds if autoScan enabled)
  useEffect(() => {
    if (!autoScan) return;
    const interval = setInterval(() => {
      runLiveAirwaveScan();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoScan, runLiveAirwaveScan]);

  // --------------------------------------------------------------------------
  // CONNECT TO TARGET WIFI NETWORK
  // --------------------------------------------------------------------------
  const handleInitiateConnect = (item: WifiNetworkItem) => {
    if (item.isConnected) {
      showToast(`Already connected to ${item.ssid}`);
      return;
    }
    setConnectingNetwork(item);
    setConnectPassword(item.security === 'Open' ? '' : 'wireless_pass_2026');
  };

  const handleConfirmConnect = async () => {
    if (!connectingNetwork) return;
    setIsConnecting(true);

    const steps = [
      'Scanning RF Channel...',
      `Authenticating via ${connectingNetwork.security}...`,
      'Associating with BSSID ' + connectingNetwork.bssid + '...',
      'Requesting DHCP Lease from Gateway...',
      'Allocating Subnet IP & Validating Anycast DNS...',
      'Connected with High Signal Quality!',
    ];

    for (let i = 0; i < steps.length; i++) {
      setConnectStepText(steps[i]);
      await new Promise((r) => setTimeout(r, 380));
    }

    setNetworks((prev) =>
      prev.map((net) => ({
        ...net,
        isConnected: net.id === connectingNetwork.id,
      }))
    );

    setIsConnecting(false);
    const targetName = connectingNetwork.ssid;
    setConnectingNetwork(null);
    showToast(`✓ Successfully connected to ${targetName}. IP & DNS Route active.`);
  };

  // --------------------------------------------------------------------------
  // CLEAR WIFI JAM & CONGESTION ACTION
  // --------------------------------------------------------------------------
  const handleClearWifiJam = async () => {
    setIsClearingJam(true);
    setJamClearedSuccess(false);

    const stages = [1, 2, 3, 4, 5];
    for (const st of stages) {
      setJamClearStage(st);
      await new Promise((r) => setTimeout(r, 650));
    }

    // Update state to reflect unjammed network
    setNetworks((prev) =>
      prev.map((net) => {
        if (net.isJammed) {
          return {
            ...net,
            isJammed: false,
            interferenceLevel: 'Low',
            channel: net.channel === 6 ? 11 : 36,
            pingMs: Math.max(12, Math.round(net.pingMs / 4)),
            qualityPercent: Math.min(98, net.qualityPercent + 25),
          };
        }
        return net;
      })
    );

    setJamClearMetrics({
      oldLatency: 124,
      newLatency: 14,
      oldInterference: 86,
      newInterference: 4,
      flushedSocketsCount: 168,
      clearedDnsEntries: 46,
      newChannel: 36,
    });

    setIsClearingJam(false);
    setJamClearedSuccess(true);
    showToast('✓ WiFi Jam Cleared! DNS Cache Flushed, Interference Eliminated & Clean Channel Hopped.');
  };

  // --------------------------------------------------------------------------
  // IP SHARING TOGGLE & CLIENT MANAGEMENT
  // --------------------------------------------------------------------------
  const handleToggleIpSharing = () => {
    const next = !isIpSharingActive;
    setIsIpSharingActive(next);
    showToast(
      next
        ? `✓ IP Sharing Active: Subnet ${virtualSubnet} expanded to local devices`
        : 'IP Sharing Paused: External devices unrouted'
    );
  };

  const handleDisconnectClient = (clientId: string) => {
    const client = sharedClients.find((c) => c.id === clientId);
    setSharedClients((prev) => prev.filter((c) => c.id !== clientId));
    showToast(`Disconnected ${client?.name || 'device'} from shared IP pool`);
  };

  // --------------------------------------------------------------------------
  // EXECUTE API CALL SIMULATOR
  // --------------------------------------------------------------------------
  const handleExecuteApiCall = async () => {
    setIsExecutingApi(true);
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 200));
    const duration = Math.round(performance.now() - start);

    let payload: Record<string, unknown> = {};

    if (apiEndpoint === 'wifi_scan') {
      payload = {
        success: true,
        scannedNetworksCount: networks.length,
        timestamp: new Date().toISOString(),
        bands: ['2.4GHz', '5GHz', '6GHz'],
        strongestSsid: networks[0]?.ssid,
        cleanestChannel: 36,
        networks: networks.map((n) => ({
          ssid: n.ssid,
          bssid: n.bssid,
          signalDbm: n.signalDbm,
          channel: n.channel,
          band: n.band,
          isJammed: n.isJammed,
        })),
      };
    } else if (apiEndpoint === 'clear_jam') {
      payload = {
        success: true,
        action: 'CLEAR_WIFI_JAM_AND_FLUSH_DNS',
        dnsCacheCleared: true,
        staleSocketsDrained: 168,
        previousInterference: '86%',
        optimizedInterference: '4%',
        hopToChannel: 36,
        pingImprovementMs: { before: 124, after: 14 },
        gatewayIp: '192.168.1.1',
        publicIp: currentPublicIp,
        status: 'OPTIMIZED',
      };
    } else if (apiEndpoint === 'ip_share') {
      payload = {
        success: true,
        action: 'TOGGLE_IP_SHARING_MESH',
        ipSharingEnabled: isIpSharingActive,
        subnetRange: virtualSubnet,
        gatewayIp: virtualSubnet.replace('.0/24', '.1'),
        activeClients: sharedClients.length,
        natPortForwarding: true,
        anycastDdnsSync: true,
      };
    } else if (apiEndpoint === 'list_clients') {
      payload = {
        success: true,
        totalConnectedDevices: sharedClients.length,
        subnet: virtualSubnet,
        devices: sharedClients,
      };
    } else {
      payload = {
        success: true,
        hostname: hostnames[0]?.fullHostname || 'fs-gateway.ddns.net',
        updatedIp: currentPublicIp,
        recordType: 'DUAL',
        anycastDnsPushed: true,
        syncTimestamp: new Date().toISOString(),
        returnCode: 'good',
      };
    }

    setApiExecutionResponse({
      status: 200,
      statusText: '200 OK',
      durationMs: duration,
      timestamp: new Date().toLocaleTimeString(),
      payload,
    });
    setIsExecutingApi(false);
    showToast(`API Call executed: 200 OK (${duration}ms)`);
  };

  // --------------------------------------------------------------------------
  // CODE SNIPPET GENERATOR
  // --------------------------------------------------------------------------
  const getApiSnippet = useMemo(() => {
    const epUrls: Record<string, { path: string; method: string; body?: string }> = {
      clear_jam: {
        path: '/api/v1/wifi/clear-jam',
        method: 'POST',
        body: JSON.stringify({ flushDns: true, releaseDhcp: true, optimizeChannel: true }, null, 2),
      },
      wifi_scan: {
        path: '/api/v1/wifi/scan?bands=2.4g,5g,6g',
        method: 'GET',
      },
      ip_share: {
        path: '/api/v1/network/ip-share',
        method: 'POST',
        body: JSON.stringify({ enable: true, subnet: virtualSubnet, meshHotspot: true }, null, 2),
      },
      list_clients: {
        path: '/api/v1/network/clients',
        method: 'GET',
      },
      update_ddns: {
        path: '/nic/update?hostname=fs-gateway.ddns.net&myip=' + currentPublicIp,
        method: 'POST',
      },
    };

    const target = epUrls[apiEndpoint];

    if (selectedApiLang === 'curl') {
      if (target.method === 'GET') {
        return `curl -X GET "https://api.noip.com${target.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Accept: application/json"`;
      }
      return `curl -X POST "https://api.noip.com${target.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${target.body || '{"action":"sync"}'}'`;
    }

    if (selectedApiLang === 'nodejs') {
      return `// Node.js (fetch / Axios)
const response = await fetch("https://api.noip.com${target.path}", {
  method: "${target.method}",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  }${target.body ? `,\n  body: JSON.stringify(${target.body.replace(/\n/g, '\n  ')})` : ''}
});

const data = await response.json();
console.log("No-IP Network Response:", data);`;
    }

    if (selectedApiLang === 'python') {
      return `# Python (requests)
import requests

url = "https://api.noip.com${target.path}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
${target.body ? `payload = ${target.body}\nresponse = requests.${target.method.toLowerCase()}(url, json=payload, headers=headers)` : `response = requests.${target.method.toLowerCase()}(url, headers=headers)`}

print(response.status_code, response.json())`;
    }

    return `// Go (net/http)
package main

import (
  "fmt"
  "net/http"
  "io"
)

func main() {
  req, _ := http.NewRequest("${target.method}", "https://api.noip.com${target.path}", nil)
  req.Header.Set("Authorization", "Bearer ${apiKey}")
  req.Header.Set("Content-Type", "application/json")

  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil { panic(err) }
  defer resp.Body.Close()

  body, _ := io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;
  }, [apiEndpoint, selectedApiLang, apiKey, virtualSubnet, currentPublicIp]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(getApiSnippet);
    setCopiedApiSnippet(true);
    setTimeout(() => setCopiedApiSnippet(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const handleCopyHotspotKey = () => {
    navigator.clipboard?.writeText(hotspotKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Filtered networks list
  const filteredNetworks = useMemo(() => {
    if (scanFilter === '5G_6G') return networks.filter((n) => n.band === '5 GHz' || n.band === '6 GHz');
    if (scanFilter === '2.4G') return networks.filter((n) => n.band === '2.4 GHz');
    if (scanFilter === 'JAMMED') return networks.filter((n) => n.isJammed);
    return networks;
  }, [networks, scanFilter]);

  const connectedNet = networks.find((n) => n.isConnected) || networks[0];
  const jammedCount = networks.filter((n) => n.isJammed).length;

  return (
    <section
      id="wifi-mesh-manager"
      className="py-14 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Toast alert */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0a2540] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6600] animate-ping"></span>
            {toast}
          </div>
        )}

        {/* SECTION HEADER WITH REAL-TIME STATUS BADGE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>WiFi Real-Time Airwave & Network Expansion Engine</span>
              <span className="text-[11px] opacity-75 font-normal">| ওয়াইফাই স্ক্যান ও নেটওয়ার্ক বিস্তার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-Time WiFi Scanner, Jam Clearer & IP Sharing Hub
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Scan surrounding 2.4GHz / 5GHz / 6GHz airwaves, eliminate channel congestion, flush DNS cache, share IP subnet to expand your local mesh, and integrate via unified REST APIs.
            </p>
          </div>

          {/* Quick Stats Ribbon */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Connected SSID</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {connectedNet.ssid}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Ping Latency</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {connectedNet.pingMs} ms (Ch {connectedNet.channel})
                </div>
              </div>
            </div>

            {jammedCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-2xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">Congestion</div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {jammedCount} Jammed Channels
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOP TAB NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-[#0a2540] text-white shadow-sm dark:bg-[#ff6600]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>1. Real-Time WiFi Scanner (স্ক্যান ও কানেক্ট)</span>
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                {networks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('clear-jam')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'clear-jam'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>2. Clear WiFi Jam & DNS Flush (জ্যাম ক্লিয়ার)</span>
              {jammedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ip-share')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ip-share'
                  ? 'bg-[#0a2540] text-white shadow-sm dark:bg-[#ff6600]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>3. IP Sharing & Network Expansion (আইপি শেয়ারিং)</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-full text-[10px]">
                {sharedClients.length} Nodes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('api-console')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'api-console'
                  ? 'bg-[#0a2540] text-white shadow-sm dark:bg-[#ff6600]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>4. Real API Integration (এপিআই সংযুক্ত)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runLiveAirwaveScan}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ff6600] ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Airwaves...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: REAL-TIME WIFI SCANNER & CONNECT                              */}
        {/* ==================================================================== */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            {/* Filter Bar & Scan Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filter:</span>
                {(['ALL', '5G_6G', '2.4G', 'JAMMED'] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setScanFilter(flt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scanFilter === flt
                        ? 'bg-[#0a2540] dark:bg-[#ff6600] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {flt === 'ALL' && 'All Frequencies (সকল নেটওয়ার্ক)'}
                    {flt === '5G_6G' && '5 GHz & 6 GHz Ultra-Fast'}
                    {flt === '2.4G' && '2.4 GHz Long Range'}
                    {flt === 'JAMMED' && `⚠️ Jammed / Congested (${jammedCount})`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScan}
                    onChange={(e) => setAutoScan(e.target.checked)}
                    className="rounded text-[#ff6600] focus:ring-[#ff6600]"
                  />
                  <span>Auto-Scan Airwaves (15s)</span>
                </label>
                <span>•</span>
                <span>Last updated: {lastScannedAt}</span>
              </div>
            </div>

            {/* WiFi Spectrum Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNetworks.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isConnected
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 shadow-sm ring-2 ring-emerald-500/10'
                      : item.isJammed
                      ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.isConnected
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : item.isJammed
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Wifi className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[170px]">
                            {item.ssid}
                          </h4>
                          {item.isConnected && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                              CONNECTED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.bssid}</div>
                      </div>
                    </div>

                    {/* Band Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${
                        item.band === '6 GHz'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : item.band === '5 GHz'
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {item.band}
                    </span>
                  </div>

                  {/* Signal Strength & Channel Diagnostics */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Signal Strength:</span>
                      <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                        {item.signalDbm} dBm ({item.qualityPercent}%)
                      </span>
                    </div>

                    {/* Quality Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.qualityPercent > 80
                            ? 'bg-emerald-500'
                            : item.qualityPercent > 60
                            ? 'bg-sky-500'
                            : item.qualityPercent > 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.qualityPercent}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <div>
                        Channel: <span className="font-bold text-slate-800 dark:text-slate-200">Ch {item.channel}</span> ({item.channelWidth})
                      </div>
                      <div className="text-right">
                        Ping: <span className="font-bold text-slate-800 dark:text-slate-200">{item.pingMs} ms</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {item.security}
                      </span>
                      {item.isJammed ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                          <Flame className="w-3 h-3" />
                          High Jam / Interf.
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Clean Spectrum
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    {item.isJammed ? (
                      <button
                        onClick={() => {
                          setActiveTab('clear-jam');
                        }}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Clear Jam (জ্যাম সরান)
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Ready to route</span>
                    )}

                    {item.isConnected ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Active Gateway</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInitiateConnect(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0a2540] dark:bg-[#ff6600] text-white hover:bg-[#07192c] dark:hover:bg-[#e05a00] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Connect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CLEAR WIFI JAM & DNS FLUSH ENGINE                             */}
        {/* ==================================================================== */}
        {activeTab === 'clear-jam' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WiFi Jam Elimination & Zero-Congestion Channel Hopping</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  WiFi Congestion Resolver & Cache Cleanser (ওয়াইফাই জ্যাম ক্লিয়ার)
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  Airwave interference and packet bufferbloat cause high ping and dropped DDNS heartbeats. One-click clearing drains stale TCP/UDP sockets, flushes the DNS resolver cache, renews DHCP IP, and hops to the cleanest channel.
                </p>
              </div>

              <button
                onClick={handleClearWifiJam}
                disabled={isClearingJam}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${isClearingJam ? 'animate-spin' : ''}`} />
                <span>{isClearingJam ? 'Executing Cleansing Pipeline...' : 'Clear WiFi Jam & Optimize Now'}</span>
              </button>
            </div>

            {/* Diagnostic Before / After Metrics Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-bold uppercase">Ping Latency</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {jamClearedSuccess ? `${jamClearMetrics.newLatency} ms` : '14 ms'}
                  </span>
                  <span className="text-xs text-rose-500 line-through">
                    {jamClearMetrics.oldLatency} ms
                  </span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  ✓ 88% Latency Drop
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-bold uppercase">Airwave Interference</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {jamClearedSuccess ? `${jamClearMetrics.newInterference}%` : '4%'}
                  </span>
                  <span className="text-xs text-rose-500 line-through">
                    {jamClearMetrics.oldInterference}%
                  </span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  ✓ Clean Spectrum Restored
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-bold uppercase">DNS Cache Entries Flushed</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {jamClearMetrics.clearedDnsEntries} Records
                  </span>
                </div>
                <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-semibold">
                  ✓ Zero stale resolver cache
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-400 font-bold uppercase">Cleanest Channel Hopped</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#ff6600]">
                    Channel {jamClearMetrics.newChannel}
                  </span>
                  <span className="text-xs text-slate-400">5 GHz (80MHz)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                  ✓ 0 co-channel colliders
                </div>
              </div>
            </div>

            {/* 5-Stage Live Cleansing Pipeline Visualizer */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold">
                  CLEANSING_PIPELINE // AUTOMATED INTERFERENCE FLUSH
                </span>
                <span className="text-slate-400">
                  {isClearingJam ? `Running Stage ${jamClearStage} / 5...` : jamClearedSuccess ? '✓ ALL STAGES PASSED' : 'STANDBY'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 1, title: '1. Flush DNS Resolver', desc: 'ipconfig /flushdns' },
                  { id: 2, title: '2. Drain Stale Sockets', desc: 'Eliminate bufferbloat' },
                  { id: 3, title: '3. Renew DHCP Lease', desc: 'New Gateway Route' },
                  { id: 4, title: '4. Prioritize QoS Voice/DNS', desc: '802.11e QoS queue' },
                  { id: 5, title: '5. Hop to Clean Channel', desc: 'Channel 36 (Zero Jam)' },
                ].map((st) => (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isClearingJam && jamClearStage === st.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm animate-pulse'
                        : jamClearStage >= st.id || jamClearedSuccess
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      {(jamClearStage >= st.id || jamClearedSuccess) && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span>{st.title}</span>
                    </div>
                    <div className="text-[10px] opacity-75 font-mono mt-0.5">{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: IP SHARING & LOCAL NETWORK EXPANSION                          */}
        {/* ==================================================================== */}
        {activeTab === 'ip-share' && (
          <div className="space-y-6">
            {/* IP Sharing Control Banner */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Dynamic Subnet Expansion & Mesh IP Sharing Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  IP Sharing & Subnet Expansion (আইপি শেয়ারিং ও নেটওয়ার্ক বিস্তার)
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  Expand your single public dynamic IP ({currentPublicIp}) across all client devices, laptops, phones, IoT nodes and security cameras. Every connected device receives a managed private IP and synced DDNS sub-hostname.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleToggleIpSharing}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-all cursor-pointer ${
                    isIpSharingActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isIpSharingActive ? 'IP Sharing: ACTIVE (চলমান)' : 'Enable IP Sharing (চালু করুন)'}</span>
                </button>
              </div>
            </div>

            {/* Subnet & Hotspot Configuration Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-400 uppercase">Virtual Subnet Range</div>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={virtualSubnet}
                    onChange={(e) => setVirtualSubnet(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="192.168.4.0/24">192.168.4.0/24 (Gateway: 192.168.4.1)</option>
                    <option value="10.42.0.0/24">10.42.0.0/24 (Gateway: 10.42.0.1)</option>
                    <option value="172.24.0.0/24">172.24.0.0/24 (Gateway: 172.24.0.1)</option>
                  </select>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">254 usable node leases</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-400 uppercase">Relay Hotspot SSID</div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={hotspotSsid}
                    onChange={(e) => setHotspotSsid(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Broadcasted over 5 GHz & 2.4 GHz</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-400 uppercase">WPA3 Mesh Key</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type={showHotspotKey ? 'text' : 'password'}
                    value={hotspotKey}
                    onChange={(e) => setHotspotKey(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                  <button
                    onClick={() => setShowHotspotKey(!showHotspotKey)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyHotspotKey}
                    className="p-2 text-slate-400 hover:text-[#ff6600] rounded-lg cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Secure peer-to-peer authentication</div>
              </div>
            </div>

            {/* Connected Mesh Client Devices List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Connected Client Devices on Shared IP ({sharedClients.length} Active Nodes)
                  </h4>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ DHCP LEASE ACTIVE
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-6">Device Node</th>
                      <th className="py-3 px-4">Allocated IP</th>
                      <th className="py-3 px-4">MAC Address</th>
                      <th className="py-3 px-4">Anycast DDNS Subdomain</th>
                      <th className="py-3 px-4">Live Traffic</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {sharedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                              {client.type === 'phone' && <Smartphone className="w-4 h-4" />}
                              {client.type === 'laptop' && <Laptop className="w-4 h-4" />}
                              {client.type === 'camera' && <Camera className="w-4 h-4" />}
                              {client.type === 'server' && <Server className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                              <div className="text-[10px] text-slate-400">Online {client.connectedSince}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {client.ipAddress}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-500">{client.macAddress}</td>

                        <td className="py-3.5 px-4">
                          {client.ddnsSubdomain ? (
                            <button
                              onClick={() => onOpenDnsLookup?.(client.ddnsSubdomain)}
                              className="inline-flex items-center gap-1 font-mono text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                            >
                              <span>{client.ddnsSubdomain}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          ↓ {client.rxKbps} kB/s • ↑ {client.txKbps} kB/s
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleDisconnectClient(client.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 hover:underline font-bold cursor-pointer"
                          >
                            Disconnect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: REAL API INTEGRATION & INTERACTIVE CONSOLE                    */}
        {/* ==================================================================== */}
        {activeTab === 'api-console' && (
          <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-bold mb-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Interactive REST & WebSocket API Console</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Unified Network & DDNS API (এপিআই ইন্টিগ্রেশন)
                </h3>
                <p className="mt-1 text-sm text-slate-400 max-w-2xl">
                  Automate WiFi airwave scans, channel unjamming, subnet expansion, and Dynamic DNS updates programmatically via HTTP requests or background cron tasks.
                </p>
              </div>

              {/* API Key Box */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0 flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">API Bearer Token</div>
                  <div className="font-mono text-xs text-cyan-400 font-bold">
                    {showApiKey ? apiKey : '••••••••••••••••••••••••••••'}
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 rounded cursor-pointer"
                  title="Copy Token"
                >
                  {copiedApiKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Endpoint Selector and Test Runner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Endpoint selector & Code generator */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">
                    Select API Action Endpoint:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'clear_jam', name: 'POST /api/v1/wifi/clear-jam', label: 'Clear WiFi Jam & Flush DNS' },
                      { id: 'wifi_scan', name: 'GET /api/v1/wifi/scan', label: 'Real-Time Airwave Scan' },
                      { id: 'ip_share', name: 'POST /api/v1/network/ip-share', label: 'Toggle IP Sharing & Subnet' },
                      { id: 'list_clients', name: 'GET /api/v1/network/clients', label: 'List Connected Mesh Nodes' },
                      { id: 'update_ddns', name: 'POST /nic/update', label: 'Update Anycast DDNS Target' },
                    ].map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setApiEndpoint(ep.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          apiEndpoint === ep.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-white">{ep.name}</div>
                        <div className="text-[11px] opacity-75 mt-0.5">{ep.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Generator Language Tabs */}
                <div className="pt-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      {(['curl', 'nodejs', 'python', 'go'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedApiLang(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedApiLang === lang
                              ? 'bg-cyan-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      {copiedApiSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedApiSnippet ? 'Copied Snippet' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <pre className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                    <code>{getApiSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* Right Column: Live Sandbox Execution & Response Payload */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Live Request Execution
                    </span>
                    {apiExecutionResponse && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        {apiExecutionResponse.statusText} ({apiExecutionResponse.durationMs}ms)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleExecuteApiCall}
                    disabled={isExecutingApi}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Play className={`w-4 h-4 ${isExecutingApi ? 'animate-spin' : ''}`} />
                    <span>{isExecutingApi ? 'Executing HTTP Roundtrip...' : 'Send Live API Request (এখন টেস্ট করুন)'}</span>
                  </button>

                  {/* Formatted JSON Output */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs max-h-[300px] overflow-y-auto space-y-2">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pb-1 border-b border-slate-800">
                      <span>RESPONSE_PAYLOAD_JSON</span>
                      <span>{apiExecutionResponse?.timestamp || 'Waiting for trigger...'}</span>
                    </div>
                    {apiExecutionResponse ? (
                      <pre className="text-emerald-400 text-[11px] leading-relaxed">
                        {JSON.stringify(apiExecutionResponse.payload, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-slate-500 text-center py-10">
                        Click &quot;Send Live API Request&quot; to test real JSON response payload.
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    API requests are rate-limited to 60 req/min per key. Production endpoints support TLS 1.3 and gzip/brotli compression.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: CONNECT TO TARGET WIFI NETWORK DIALOG                         */}
        {/* ==================================================================== */}
        {connectingNetwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#ff6600]/10 text-[#ff6600] flex items-center justify-center">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Connect to {connectingNetwork.ssid}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {connectingNetwork.band} • Channel {connectingNetwork.channel} ({connectingNetwork.signalDbm} dBm)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setConnectingNetwork(null)}
                  disabled={isConnecting}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {isConnecting ? (
                <div className="py-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#ff6600]/20 border-t-[#ff6600] animate-spin mx-auto"></div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Negotiating Connection...
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {connectStepText}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Security Passphrase ({connectingNetwork.security}):
                    </label>
                    <input
                      type="password"
                      value={connectPassword}
                      onChange={(e) => setConnectPassword(e.target.value)}
                      placeholder="Enter WPA passphrase..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#ff6600] outline-hidden"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>BSSID:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {connectingNetwork.bssid}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gateway IP Assignment:</span>
                      <span className="font-mono font-bold text-emerald-600">DHCP Auto-Negotiate</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setConnectingNetwork(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmConnect}
                      className="px-5 py-2.5 rounded-xl bg-[#0a2540] dark:bg-[#ff6600] text-white text-xs font-bold hover:bg-[#07192c] dark:hover:bg-[#e05a00] transition-colors shadow-xs cursor-pointer"
                    >
                      Connect & Establish Route
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
