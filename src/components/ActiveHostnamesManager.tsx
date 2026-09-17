import React, { useState } from 'react';
import { 
  Server, 
  ExternalLink, 
  Check, 
  Copy, 
  Activity, 
  Trash2, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  Terminal,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { HostnameRecord } from '../types';

interface ActiveHostnamesManagerProps {
  hostnames: HostnameRecord[];
  onDeleteHostname: (id: string) => void;
  onRefreshHostname: (id: string) => void;
  onOpenPortChecker: (port?: number, host?: string) => void;
  onOpenDucSimulator: () => void;
}

export const ActiveHostnamesManager: React.FC<ActiveHostnamesManagerProps> = ({
  hostnames,
  onDeleteHostname,
  onRefreshHostname,
  onOpenPortChecker,
  onOpenDucSimulator,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="active-hostnames-section" className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-1">
              <Server className="w-3.5 h-3.5" /> Dynamic DNS Manager
            </div>
            <h2 className="text-2xl font-bold text-[#0a2540] dark:text-white">
              My Active Dynamic DNS Hostnames
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your domain endpoints, verify IP binding, and test remote device availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDucSimulator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-[#ff6600] dark:text-[#ff914d] border border-orange-200 dark:border-orange-800/60 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Dynamic Update Client (DUC)
            </button>

            <button
              onClick={() => onOpenPortChecker()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer border border-transparent dark:border-slate-700"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Check Port Forwarding
            </button>
          </div>
        </div>

        {hostnames.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <p className="text-slate-600 dark:text-slate-300 font-medium">No hostnames registered yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use the "Create Your Free Hostname Now" field above to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Hostname & FQDN</th>
                  <th className="py-3 px-4">Target IP Address</th>
                  <th className="py-3 px-4">Record Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {hostnames.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{item.fullHostname}</span>
                        <button
                          onClick={() => handleCopy(item.fullHostname, item.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                          title="Copy Full Hostname"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 pl-4">{item.domain}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{item.targetIp}</span>
                        <button
                          onClick={() => handleCopy(item.targetIp, `ip_${item.id}`)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Copy IP"
                        >
                          {copiedId === `ip_${item.id}` ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800">
                        {item.recordType} (IPv4)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.lastUpdated}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenPortChecker(80, item.fullHostname)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-[#ff6600] dark:hover:text-[#ff914d] rounded text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                          title="Test Port on this Hostname"
                        >
                          <Activity className="w-3 h-3" />
                          Test Port
                        </button>

                        <button
                          onClick={() => onRefreshHostname(item.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Force Refresh DNS Record"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteHostname(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          title="Delete Hostname"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </section>
  );
};
