import React, { useState } from 'react';
import { Layers, X, RefreshCw, CheckCircle2, Terminal, Shield, Play, Pause, AlertCircle } from 'lucide-react';
import { HostnameRecord } from '../types';

interface DucSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostnames: HostnameRecord[];
  currentIp: string;
  onSimulateIpUpdate: (newIp: string) => void;
}

export const DucSimulatorModal: React.FC<DucSimulatorModalProps> = ({
  isOpen,
  onClose,
  hostnames,
  currentIp,
  onSimulateIpUpdate,
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] No-IP DUC v4.1.2 service initialized.`,
    `[${new Date().toLocaleTimeString()}] Authenticated as kh…@gmail.com (Personal Plan).`,
    `[${new Date().toLocaleTimeString()}] Current WAN IP detected: ${currentIp}`,
    `[${new Date().toLocaleTimeString()}] Monitoring ${hostnames.length} active dynamic hostnames.`,
  ]);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleTriggerIpShift = () => {
    setIsUpdating(true);
    const randomIp = `198.${Math.floor(Math.random() * 80) + 10}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 240) + 10}`;

    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      `[${timestamp}] WAN IP change detected! New IP: ${randomIp}`,
      `[${timestamp}] Contacting dynupdate.no-ip.com Anycast cluster...`,
    ]);

    setTimeout(() => {
      onSimulateIpUpdate(randomIp);
      const finishedTime = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${finishedTime}] Success: All hostnames successfully bound to ${randomIp} (HTTP 200 nochg/good).`,
        `[${finishedTime}] Next scheduled heartbeat check in 5 minutes.`,
      ]);
      setIsUpdating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a2540]">
                Dynamic Update Client (DUC) Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate the background agent that keeps your hostnames synced 24/7
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

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="font-bold text-slate-800">
                Service Status: {isRunning ? 'Running (Active Daemon)' : 'Paused'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-100 flex items-center gap-1"
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>

              <button
                onClick={handleTriggerIpShift}
                disabled={isUpdating || !isRunning}
                className="px-3 py-1 bg-[#ff6600] hover:bg-[#e65c00] disabled:opacity-50 text-white rounded font-bold flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                Simulate IP Change
              </button>
            </div>
          </div>

          {/* Monitored Hostnames list */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
              Monitored Hostnames ({hostnames.length}):
            </span>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {hostnames.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs font-mono">
                  <span className="font-semibold text-slate-800">{h.fullHostname}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    ✓ Synced to {h.targetIp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                duc-service.log
              </span>
              <span>UTF-8 • Linux / Windows DUC 4.1</span>
            </div>
            {logs.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line.includes('Success') ? (
                  <span className="text-emerald-400 font-semibold">{line}</span>
                ) : line.includes('detected') ? (
                  <span className="text-[#ff914d]">{line}</span>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Official DUC available for Windows, macOS, Linux, and Docker</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
