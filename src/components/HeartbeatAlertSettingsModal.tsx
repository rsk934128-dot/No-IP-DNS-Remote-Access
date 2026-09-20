import React, { useState } from 'react';
import {
  Bell,
  X,
  Mail,
  Monitor,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  ShieldCheck,
  Activity,
  Check,
  Copy,
  Info,
  ExternalLink,
  WifiOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { HostnameRecord, HostnameHeartbeat, HeartbeatAlertConfig, AlertLogEntry } from '../types';

interface HeartbeatAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeartbeatAlertConfig;
  onSaveConfig: (newConfig: HeartbeatAlertConfig) => void;
  hostnames: HostnameRecord[];
  heartbeats: Record<string, HostnameHeartbeat>;
  downtimeTracking: Record<string, { startedAt: number; alertDispatched: boolean; alertDispatchedAt?: number }>;
  alertLogs: AlertLogEntry[];
  onClearLogs: () => void;
  onTriggerTestEmail: (customEmail?: string) => void;
  onTriggerTestDesktop: () => void;
  onRequestBrowserPermission: () => Promise<NotificationPermission>;
  browserPermission: NotificationPermission;
  onSimulateOutageThreshold: (hostnameId: string, minutesAgo: number) => void;
  onResetOutageSimulation: (hostnameId: string) => void;
  simulatedOutages: Record<string, boolean>;
}

export const HeartbeatAlertSettingsModal: React.FC<HeartbeatAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  hostnames,
  heartbeats,
  downtimeTracking,
  alertLogs,
  onClearLogs,
  onTriggerTestEmail,
  onTriggerTestDesktop,
  onRequestBrowserPermission,
  browserPermission,
  onSimulateOutageThreshold,
  onResetOutageSimulation,
  simulatedOutages,
}) => {
  // Local edit state
  const [localConfig, setLocalConfig] = useState<HeartbeatAlertConfig>(config);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'simulate' | 'logs'>('settings');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [testEmailSent, setTestEmailSent] = useState<boolean>(false);
  const [testDesktopSent, setTestDesktopSent] = useState<boolean>(false);
  const [selectedSimHostname, setSelectedSimHostname] = useState<string>(hostnames[0]?.id || '');
  const [copiedEmailText, setCopiedEmailText] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(localConfig);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  const handleResetToRecommended = () => {
    setLocalConfig((prev) => ({
      ...prev,
      enabled: true,
      thresholdMinutes: 5,
      emailAlerts: true,
      desktopAlerts: true,
      notifyOnRecovery: true,
      soundAlert: true,
    }));
  };

  const thresholdOptions = [
    { value: 1, label: '1 Minute', desc: 'Aggressive (2 missed probes)' },
    { value: 3, label: '3 Minutes', desc: 'Moderate (6 missed probes)' },
    { value: 5, label: '5 Minutes', desc: 'Default / Recommended (10 missed probes)', isRecommended: true },
    { value: 10, label: '10 Minutes', desc: 'Standard (20 missed probes)' },
    { value: 15, label: '15 Minutes', desc: 'Lenient (30 missed probes)' },
  ];

  // Calculate hostnames currently in outage
  const hostsInDowntime = hostnames.filter((h) => {
    const hb = heartbeats[h.id];
    return hb && !hb.isReachable;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Heartbeat Outage Alerts & Notifications
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {localConfig.thresholdMinutes}m Threshold
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure instant email, browser desktop notifications, and sound chimes when a hostname is unreachable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-5 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#ff6600] text-[#ff6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Notification Rules & Thresholds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preview'
                ? 'border-[#ff6600] text-[#ff6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Desktop Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulate')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'simulate'
                ? 'border-[#ff6600] text-[#ff6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Test 5-Min Outage Trigger</span>
            {hostsInDowntime.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'logs'
                ? 'border-[#ff6600] text-[#ff6600]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert History ({alertLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: SETTINGS & THRESHOLDS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Master Toggle */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Enable Heartbeat Outage Alerts
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Continuously track failure duration and dispatch alerts when threshold is breached.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    localConfig.enabled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      localConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Threshold Selection Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Downtime Failure Threshold Before Alerting</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Triggers after {localConfig.thresholdMinutes} minutes ({localConfig.thresholdMinutes * 2} missed probes)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {thresholdOptions.map((opt) => {
                    const isSelected = localConfig.thresholdMinutes === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLocalConfig({ ...localConfig, thresholdMinutes: opt.value })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/40'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {opt.isRecommended && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff6600] text-white">
                            Recommended
                          </span>
                        )}
                        <span className="block font-bold text-sm text-slate-900 dark:text-white">
                          {opt.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Heartbeats are probed every 30 seconds. A <strong>5-minute threshold</strong> requires 10 consecutive connection failures before firing an alert. This prevents false alarms from temporary ISP routing spikes or home router reboot periods.
                  </span>
                </div>
              </div>

              {/* Notification Channels: Email & Desktop */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notification Delivery Channels
                </h4>

                {/* Email Channel Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Email Notifications
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Sends failure reports and resolution notices directly to your inbox.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLocalConfig({ ...localConfig, emailAlerts: !localConfig.emailAlerts })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        localConfig.emailAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          localConfig.emailAlerts ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {localConfig.emailAlerts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Primary Alert Email Recipient
                        </label>
                        <input
                          type="email"
                          value={localConfig.recipientEmail}
                          onChange={(e) => setLocalConfig({ ...localConfig, recipientEmail: e.target.value })}
                          placeholder="e.g. sysadmin@company.com"
                          className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Secondary / CC Alert Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={localConfig.secondaryEmail || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, secondaryEmail: e.target.value })}
                          placeholder="e.g. oncall@company.com"
                          className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Channel Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Desktop / Browser Push Notifications
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Fires instant operating system notification banners when the browser is running.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLocalConfig({ ...localConfig, desktopAlerts: !localConfig.desktopAlerts })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        localConfig.desktopAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          localConfig.desktopAlerts ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {localConfig.desktopAlerts && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          Browser Permission Status:
                        </span>
                        {browserPermission === 'granted' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3 text-emerald-500" />
                            Granted
                          </span>
                        ) : browserPermission === 'denied' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            <X className="w-3 h-3 text-rose-500" />
                            Blocked by Browser
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            Prompt Needed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {browserPermission !== 'granted' && (
                          <button
                            type="button"
                            onClick={onRequestBrowserPermission}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Grant Permission
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onTriggerTestDesktop();
                            setTestDesktopSent(true);
                            setTimeout(() => setTestDesktopSent(false), 2500);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          {testDesktopSent ? '✓ Notification Triggered!' : 'Send Test Notification'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recovery & Sound Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.notifyOnRecovery}
                      onChange={(e) => setLocalConfig({ ...localConfig, notifyOnRecovery: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Auto-Recovery Alert
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Notify when hostname comes back online.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.soundAlert}
                      onChange={(e) => setLocalConfig({ ...localConfig, soundAlert: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      {localConfig.soundAlert ? (
                        <Volume2 className="w-4 h-4 text-amber-500" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Audio Sound Chimes
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Synthesize audible tones on outage and recovery.
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL PREVIEW & CHANNEL TESTING */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Dispatched Outage Alert Preview (HTML Email)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This is the exact email alert formatted and dispatched to <strong>{localConfig.recipientEmail}</strong> when a hostname breaches the {localConfig.thresholdMinutes}-minute threshold.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onTriggerTestEmail(localConfig.recipientEmail);
                    setTestEmailSent(true);
                    setTimeout(() => setTestEmailSent(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testEmailSent ? '✓ Sent Test Alert!' : 'Send Test Alert to My Email'}</span>
                </button>
              </div>

              {/* Email Client Mockup */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 font-medium">From:</span> <strong>No-IP Heartbeat Sentinel</strong> &lt;alerts@noip.com&gt;
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 font-medium">To:</span> <strong>{localConfig.recipientEmail || 'user@example.com'}</strong>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <WifiOff className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                        [CRITICAL] Hostname Unreachable &gt; {localConfig.thresholdMinutes} Minutes: {hostnames[0]?.fullHostname || 'homeserver.ddns.net'}
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        Heartbeat monitor has failed to receive ICMP/HTTP ping responses for <strong>{localConfig.thresholdMinutes}m 12s</strong> ({localConfig.thresholdMinutes * 2} consecutive timeouts).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Hostname</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {hostnames[0]?.fullHostname || 'homeserver.ddns.net'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Configured IPv4</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {hostnames[0]?.targetIp || '198.51.100.42'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Status</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        DOWN / Unreachable
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Packet Loss</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">100% (Timeout)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Suggested Diagnostics:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>Check if your Dynamic Update Client (DUC) or router DDNS service is active.</li>
                      <li>Verify your router public IP matches the target IP registered on No-IP.</li>
                      <li>Ensure firewall or port forwarding rules for port {hostnames[0]?.port || 80} are accepting ingress traffic.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OUTAGE SIMULATOR & TEST 5-MIN TRIGGER */}
          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulate 5-Minute Downtime Alert Trigger
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Instead of waiting 5 real-world minutes for a server to stay down, you can trigger an immediate simulated {localConfig.thresholdMinutes}-minute outage breach to test the full alert delivery pipeline (email, desktop toast, alert log, and chime).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Target Hostname to Simulate
                  </label>
                  <select
                    value={selectedSimHostname}
                    onChange={(e) => setSelectedSimHostname(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  >
                    {hostnames.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.fullHostname} ({h.targetIp || h.targetIpv6 || 'No IP'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSimulateOutageThreshold(selectedSimHostname, localConfig.thresholdMinutes + 0.5)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <WifiOff className="w-4 h-4" />
                    <span>Trigger {localConfig.thresholdMinutes}m+ Outage Alert Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onResetOutageSimulation(selectedSimHostname)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Restore Host (Trigger Recovery Alert)</span>
                  </button>
                </div>

                {/* Current Outage Status for selected host */}
                {(() => {
                  const targetH = hostnames.find((h) => h.id === selectedSimHostname);
                  const hb = targetH ? heartbeats[targetH.id] : null;
                  const dt = targetH ? downtimeTracking[targetH.id] : null;
                  const isSimulated = Boolean(simulatedOutages[selectedSimHostname]);

                  if (!targetH || !hb) return null;

                  const elapsedSec = dt ? Math.floor((Date.now() - dt.startedAt) / 1000) : 0;
                  const elapsedMin = Math.floor(elapsedSec / 60);
                  const remSec = elapsedSec % 60;

                  return (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {targetH.fullHostname}
                        </span>
                        {hb.isReachable ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            Online & Reachable
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[10px] animate-pulse">
                            Offline (Down for {elapsedMin}m {remSec}s)
                          </span>
                        )}
                      </div>
                      {dt && (
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>Outage started: {new Date(dt.startedAt).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>Alert Dispatched: {dt.alertDispatched ? '✓ Dispatched' : 'Pending threshold'}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: ALERT DISPATCH HISTORY / AUDIT LOG */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Alert Dispatch History & Audit Trail
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Chronological record of all notifications sent via Email, Desktop push, and webhooks.
                  </p>
                </div>
                {alertLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearLogs}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {alertLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No alerts have been dispatched yet.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Alerts will automatically be recorded here whenever a host fails for &gt; {localConfig.thresholdMinutes} minutes or when you send a test alert.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">Hostname</th>
                        <th className="py-2.5 px-3">Delivery Channels</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {alertLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {log.timestamp}
                          </td>
                          <td className="py-2.5 px-3">
                            {log.type === 'FAILURE_THRESHOLD' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                <WifiOff className="w-3 h-3" />
                                Threshold Breached ({log.downtimeFormatted})
                              </span>
                            ) : log.type === 'RECOVERY' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Host Recovered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                <Send className="w-3 h-3" />
                                Test Alert
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white font-semibold">
                            {log.hostname}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              {log.channels.map((ch) => (
                                <span
                                  key={ch}
                                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                >
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                            {log.recipient}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3 h-3" />
                              Delivered
                            </span>
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToRecommended}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Recommended (5m Threshold)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#ff6600] hover:bg-[#e05a00] transition-colors shadow-xs cursor-pointer"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Notification Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
