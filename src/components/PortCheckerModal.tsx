import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  Server, 
  HelpCircle,
  Wifi,
  Sparkles
} from 'lucide-react';
import { PortCheckResult } from '../types';

interface PortCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIp: string;
  initialPort?: number;
  initialHost?: string;
  onOpenPublicTunnelsOffer: () => void;
}

export const PortCheckerModal: React.FC<PortCheckerModalProps> = ({
  isOpen,
  onClose,
  defaultIp,
  initialPort = 80,
  initialHost = '',
  onOpenPublicTunnelsOffer,
}) => {
  const [targetIpOrHost, setTargetIpOrHost] = useState(initialHost || defaultIp);
  const [portNumber, setPortNumber] = useState<number>(initialPort);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PortCheckResult | null>(null);

  useEffect(() => {
    if (initialHost) {
      setTargetIpOrHost(initialHost);
    } else {
      setTargetIpOrHost(defaultIp);
    }
    if (initialPort) {
      setPortNumber(initialPort);
    }
  }, [initialHost, defaultIp, initialPort, isOpen]);

  if (!isOpen) return null;

  const presets = [
    { port: 80, name: 'HTTP Web' },
    { port: 443, name: 'HTTPS SSL' },
    { port: 22, name: 'SSH' },
    { port: 3389, name: 'Windows RDP' },
    { port: 25565, name: 'Minecraft' },
    { port: 8000, name: 'CCTV / NVR' },
    { port: 32400, name: 'Plex Media' },
    { port: 8123, name: 'Home Assistant' },
  ];

  const handleCheckPort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portNumber || !targetIpOrHost) return;

    setIsChecking(true);
    setResult(null);

    // Simulate network socket handshake
    setTimeout(() => {
      // Deterministic simulation based on target & port
      const isOpenPort = portNumber === 80 || portNumber === 443 || portNumber === 8080 || portNumber === 25565;
      const matchedPreset = presets.find((p) => p.port === portNumber)?.name || 'Custom Service';

      setResult({
        port: portNumber,
        service: matchedPreset,
        status: isOpenPort ? 'open' : 'closed',
        ip: targetIpOrHost,
        latencyMs: isOpenPort ? Math.floor(Math.random() * 25) + 12 : undefined,
        timestamp: new Date().toLocaleTimeString(),
        message: isOpenPort
          ? `Port ${portNumber} is OPEN on ${targetIpOrHost}! Your device service is reachable from the public internet.`
          : `Port ${portNumber} is CLOSED or filtered on ${targetIpOrHost}. The connection timed out.`,
      });

      setIsChecking(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-[#ff6600]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a2540]">
                Check My Port Forwarding
              </h3>
              <p className="text-xs text-slate-500">
                Official No-IP Open Port Check Tool & Connection Verifier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Port Check Form */}
        <form onSubmit={handleCheckPort} className="py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="port-check-ip" className="block text-xs font-bold text-slate-700 uppercase">
                IP Address or Hostname
              </label>
              <input
                id="port-check-ip"
                type="text"
                required
                value={targetIpOrHost}
                onChange={(e) => setTargetIpOrHost(e.target.value)}
                placeholder="198.51.100.42 or yourname.ddns.net"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="port-check-number" className="block text-xs font-bold text-slate-700 uppercase">
                Port to Check
              </label>
              <input
                id="port-check-number"
                type="number"
                min={1}
                max={65535}
                required
                value={portNumber}
                onChange={(e) => setPortNumber(parseInt(e.target.value) || 80)}
                placeholder="80"
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-none"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Common Service Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.port}
                  type="button"
                  onClick={() => setPortNumber(p.port)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    portNumber === p.port
                      ? 'bg-[#ff6600] text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.port} ({p.name})
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full py-2.5 px-4 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing TCP Handshake on Port {portNumber}...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Check Port
              </>
            )}
          </button>
        </form>

        {/* Results Area */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-xs animate-in fade-in duration-150 ${
              result.status === 'open'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {result.status === 'open' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {result.status === 'open' ? 'SUCCESS: Port is OPEN' : 'Connection Refused: Port is CLOSED'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {result.timestamp}
                  </span>
                </div>

                <p className="font-medium text-xs leading-relaxed">
                  {result.message}
                </p>

                {result.latencyMs && (
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Round-trip latency: {result.latencyMs}ms via Anycast Gateway
                  </p>
                )}

                {result.status === 'closed' && (
                  <div className="mt-2 pt-2 border-t border-amber-200/80 space-y-1.5 text-[11px] text-amber-900">
                    <p className="font-semibold">Troubleshooting Steps:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                      <li>Ensure your application or service is actively running and listening on port {result.port}.</li>
                      <li>Check your router’s "Port Forwarding" or "Virtual Server" table to confirm forwarding to the local IP.</li>
                      <li>Check if your ISP uses <strong>CGNAT</strong> (Carrier-Grade NAT) which prevents inbound ports.</li>
                    </ul>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPublicTunnelsOffer();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0a2540] text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#ff6600]" />
                        Bypass Port Forwarding with Public Tunnels (25% off)
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Tests TCP connection from No-IP external probing nodes</span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
