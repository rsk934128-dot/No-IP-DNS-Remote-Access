import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ArrowUpRight,
  Cloud,
  Lock,
  Search,
  CheckCircle2,
  Zap,
  Plus,
  Edit2,
  X,
  Network,
  Info,
  Layers,
  HeartPulse,
  Wifi,
  WifiOff,
  AlertTriangle,
  Radio,
  Sliders,
  Play,
  Pause,
  ArrowRight,
  Download,
  FileText,
  FileSpreadsheet,
  Bell,
  Mail,
  Volume2
} from 'lucide-react';
import { HostnameRecord, DnsRecordType, HostnameHeartbeat, HeartbeatAlertConfig, AlertLogEntry } from '../types';
import { HeartbeatAlertSettingsModal } from './HeartbeatAlertSettingsModal';

interface ActiveHostnamesManagerProps {
  hostnames: HostnameRecord[];
  currentIp?: string;
  onAddHostname?: (record: HostnameRecord) => void;
  onUpdateHostname?: (id: string, updates: Partial<HostnameRecord>) => void;
  onDeleteHostname: (id: string) => void;
  onRefreshHostname: (id: string) => void;
  onRefreshAllHostnames?: () => Promise<void> | void;
  onOpenPortChecker: (port?: number, host?: string) => void;
  onOpenDucSimulator: () => void;
  isCloudSynced?: boolean;
  onOpenAuthModal?: () => void;
  userEmail?: string;
  onOpenDnsLookup?: (domain?: string) => void;
}

const DOMAIN_OPTIONS = [
  '.ddns.net',
  '.freedynamicdns.net',
  '.zapto.org',
  '.hopto.org',
  '.bounceme.net',
  '.myvnc.com',
  '.servegame.com'
];

export const ActiveHostnamesManager: React.FC<ActiveHostnamesManagerProps> = ({
  hostnames,
  currentIp = '198.51.100.42',
  onAddHostname,
  onUpdateHostname,
  onDeleteHostname,
  onRefreshHostname,
  onRefreshAllHostnames,
  onOpenPortChecker,
  onOpenDucSimulator,
  isCloudSynced = true,
  onOpenAuthModal,
  userEmail,
  onOpenDnsLookup,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-Refresh DNS state (persisted in localStorage, defaults to true)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('noip_auto_refresh');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [countdown, setCountdown] = useState<number>(60);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // HEARTBEAT & UPTIME MONITOR STATE
  // --------------------------------------------------------------------------
  const [isHeartbeatActive, setIsHeartbeatActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('noip_heartbeat_active');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [heartbeatCountdown, setHeartbeatCountdown] = useState<number>(30);
  const [isProbingAll, setIsProbingAll] = useState<boolean>(false);
  const [probingHostId, setProbingHostId] = useState<string | null>(null);
  const [selectedDiagnosticHost, setSelectedDiagnosticHost] = useState<HostnameRecord | null>(null);

  // Simulated outage overrides (for testing failure / recovery)
  const [simulatedOutages, setSimulatedOutages] = useState<Record<string, boolean>>({});

  // Heartbeat tracking dictionary per hostname
  const [heartbeats, setHeartbeats] = useState<Record<string, HostnameHeartbeat>>(() => {
    const initial: Record<string, HostnameHeartbeat> = {};
    hostnames.forEach((h, idx) => {
      // Give initial realistic heartbeat state
      const initialLatency = 24 + (idx * 9);
      initial[h.id] = {
        hostnameId: h.id,
        isReachable: true,
        latencyMs: initialLatency,
        lastChecked: 'Just now',
        status: 'ONLINE',
        uptimePercentage: 100,
        recentTicks: ['UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP'],
        packetLoss: 0,
        dnsResolved: true,
        httpStatus: 200,
      };
    });
    return initial;
  });

  // Keep heartbeats map in sync when hostnames change
  useEffect(() => {
    setHeartbeats((prev) => {
      const next = { ...prev };
      hostnames.forEach((h) => {
        if (!next[h.id]) {
          next[h.id] = {
            hostnameId: h.id,
            isReachable: true,
            latencyMs: 28,
            lastChecked: 'Just now',
            status: 'ONLINE',
            uptimePercentage: 100,
            recentTicks: ['UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP'],
            packetLoss: 0,
            dnsResolved: true,
            httpStatus: 200,
          };
        }
      });
      return next;
    });
  }, [hostnames]);

  // Filter tabs: ALL, REACHABLE, UNREACHABLE, DUAL, A, AAAA
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'REACHABLE' | 'UNREACHABLE' | 'DUAL' | 'A' | 'AAAA'>('ALL');

  // Modal states for adding or editing records
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HostnameRecord | null>(null);

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('.ddns.net');
  const [newRecordType, setNewRecordType] = useState<DnsRecordType>('DUAL');
  const [newIpv4, setNewIpv4] = useState(currentIp);
  const [newIpv6, setNewIpv6] = useState('2001:db8:85a3::8a2e:370:7334');
  const [newPort, setNewPort] = useState(80);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editIpv4, setEditIpv4] = useState('');
  const [editIpv6, setEditIpv6] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --------------------------------------------------------------------------
  // HEARTBEAT FAILURE ALERT & NOTIFICATION THRESHOLD STATE
  // --------------------------------------------------------------------------
  const [isAlertConfigModalOpen, setIsAlertConfigModalOpen] = useState<boolean>(false);
  
  const [alertConfig, setAlertConfig] = useState<HeartbeatAlertConfig>(() => {
    try {
      const saved = localStorage.getItem('noip_heartbeat_alert_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      thresholdMinutes: 5, // Default 5 minutes
      emailAlerts: true,
      recipientEmail: userEmail && !userEmail.startsWith('guest') ? userEmail : 'fs2217732@gmail.com',
      secondaryEmail: '',
      desktopAlerts: true,
      notifyOnRecovery: true,
      webhookEnabled: false,
      webhookUrl: '',
      soundAlert: true,
    };
  });

  // Persist alertConfig changes
  useEffect(() => {
    try {
      localStorage.setItem('noip_heartbeat_alert_config', JSON.stringify(alertConfig));
    } catch {}
  }, [alertConfig]);

  // Alert dispatch logs
  const [alertLogs, setAlertLogs] = useState<AlertLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('noip_heartbeat_alert_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('noip_heartbeat_alert_logs', JSON.stringify(alertLogs));
    } catch {}
  }, [alertLogs]);

  // Downtime tracking map per hostname
  const [downtimeTracking, setDowntimeTracking] = useState<Record<string, {
    startedAt: number;
    alertDispatched: boolean;
    alertDispatchedAt?: number;
  }>>({});

  // Browser desktop notification permission
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Active in-app desktop notification banner toast
  const [activeAlertToast, setActiveAlertToast] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'alarm' | 'recovery' | 'info';
    timestamp: string;
  } | null>(null);

  // Audio chime synthesizer
  const playAlertChime = useCallback((type: 'alarm' | 'recovery' | 'test' = 'alarm') => {
    if (!alertConfig.soundAlert && type !== 'test') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'recovery') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {}
  }, [alertConfig.soundAlert]);

  const handleRequestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        return perm;
      } catch {}
    }
    return 'default';
  };

  const triggerOutageAlert = useCallback((h: HostnameRecord, durationMinutes: number) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const channelsUsed: string[] = [];
    if (alertConfig.emailAlerts) channelsUsed.push('Email');
    if (alertConfig.desktopAlerts) channelsUsed.push('Desktop');
    if (alertConfig.webhookEnabled) channelsUsed.push('Webhook');

    const totalSec = Math.round(durationMinutes * 60);
    const durStr = `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;
    const alertMsg = `CRITICAL: ${h.fullHostname} unreachable for ${durStr} (> ${alertConfig.thresholdMinutes}m threshold).`;

    playAlertChime('alarm');

    if (alertConfig.desktopAlerts && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[NO-IP ALERT] Hostname Down > ${alertConfig.thresholdMinutes}m`, {
          body: `${h.fullHostname} is unreachable. Downtime: ${durStr}.`,
        });
      } catch {}
    }

    setActiveAlertToast({
      id: `alert-${Date.now()}`,
      title: `🚨 Outage Threshold Breached: ${h.fullHostname}`,
      message: `Hostname has been unreachable for ${durStr} (exceeded your ${alertConfig.thresholdMinutes}-minute notification threshold). Alert dispatched to ${alertConfig.recipientEmail}.`,
      type: 'alarm',
      timestamp,
    });

    setAlertLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        hostname: h.fullHostname,
        timestamp,
        type: 'FAILURE_THRESHOLD',
        channels: channelsUsed,
        recipient: alertConfig.recipientEmail,
        downtimeFormatted: durStr,
        message: alertMsg,
        status: 'SENT',
      },
      ...prev.slice(0, 49),
    ]);
  }, [alertConfig, playAlertChime]);

  const triggerRecoveryAlert = useCallback((h: HostnameRecord, durationMinutes: number) => {
    if (!alertConfig.notifyOnRecovery) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const channelsUsed: string[] = [];
    if (alertConfig.emailAlerts) channelsUsed.push('Email');
    if (alertConfig.desktopAlerts) channelsUsed.push('Desktop');

    const totalSec = Math.round(durationMinutes * 60);
    const durStr = `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;
    const recMsg = `RECOVERED: ${h.fullHostname} is back online after ${durStr} downtime.`;

    playAlertChime('recovery');

    if (alertConfig.desktopAlerts && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[NO-IP RECOVERY] Hostname Restored`, {
          body: `${h.fullHostname} is reachable again (Total Downtime: ${durStr}).`,
        });
      } catch {}
    }

    setActiveAlertToast({
      id: `rec-${Date.now()}`,
      title: `✓ Hostname Recovered: ${h.fullHostname}`,
      message: `Reachability restored. Server is responding to ICMP/HTTP heartbeat probes (Total Downtime: ${durStr}).`,
      type: 'recovery',
      timestamp,
    });

    setAlertLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        hostname: h.fullHostname,
        timestamp,
        type: 'RECOVERY',
        channels: channelsUsed,
        recipient: alertConfig.recipientEmail,
        downtimeFormatted: durStr,
        message: recMsg,
        status: 'SENT',
      },
      ...prev.slice(0, 49),
    ]);
  }, [alertConfig, playAlertChime]);

  // --------------------------------------------------------------------------
  // HEARTBEAT PROBING LOGIC
  // --------------------------------------------------------------------------
  const probeSingleHostname = useCallback(async (h: HostnameRecord) => {
    setProbingHostId(h.id);
    setHeartbeats((prev) => ({
      ...prev,
      [h.id]: {
        ...(prev[h.id] || {
          hostnameId: h.id,
          uptimePercentage: 100,
          recentTicks: [],
          packetLoss: 0,
          dnsResolved: true,
        }),
        status: 'CHECKING',
      },
    }));

    // Simulate probe latency
    await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 250));

    const isSimulatedDown = Boolean(simulatedOutages[h.id]);
    const hasTarget = Boolean(h.targetIp || h.targetIpv6);
    const isReachable = !isSimulatedDown && hasTarget;

    const latency = isReachable ? Math.floor(22 + Math.random() * 30) : 0;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHeartbeats((prev) => {
      const current = prev[h.id];
      const previousTicks = current?.recentTicks || ['UP', 'UP', 'UP', 'UP'];
      const newTicks = [...previousTicks.slice(1), isReachable ? ('UP' as const) : ('DOWN' as const)];
      const upCount = newTicks.filter((t) => t === 'UP').length;
      const uptimePercentage = Math.round((upCount / newTicks.length) * 100);

      return {
        ...prev,
        [h.id]: {
          hostnameId: h.id,
          isReachable,
          latencyMs: latency,
          lastChecked: nowTime,
          status: isReachable ? 'ONLINE' : 'OFFLINE',
          uptimePercentage,
          recentTicks: newTicks,
          packetLoss: isReachable ? 0 : 100,
          dnsResolved: !isSimulatedDown,
          httpStatus: isReachable ? 200 : 504,
          errorMessage: isReachable ? undefined : 'Connection timed out after 3000ms (Host Unreachable)',
        },
      };
    });

    // Outage threshold calculation & alert dispatch
    if (!isReachable) {
      setDowntimeTracking((prev) => {
        const currentDt = prev[h.id] || { startedAt: Date.now(), alertDispatched: false };
        const elapsedMinutes = (Date.now() - currentDt.startedAt) / 60000;

        if (alertConfig.enabled && elapsedMinutes >= alertConfig.thresholdMinutes && !currentDt.alertDispatched) {
          triggerOutageAlert(h, elapsedMinutes);
          return {
            ...prev,
            [h.id]: {
              ...currentDt,
              alertDispatched: true,
              alertDispatchedAt: Date.now(),
            },
          };
        }

        return {
          ...prev,
          [h.id]: currentDt,
        };
      });
    } else {
      setDowntimeTracking((prev) => {
        const currentDt = prev[h.id];
        if (currentDt) {
          if (currentDt.alertDispatched) {
            const elapsedMinutes = (Date.now() - currentDt.startedAt) / 60000;
            triggerRecoveryAlert(h, elapsedMinutes);
          }
          const next = { ...prev };
          delete next[h.id];
          return next;
        }
        return prev;
      });
    }

    setProbingHostId(null);
  }, [simulatedOutages, alertConfig, triggerOutageAlert, triggerRecoveryAlert]);

  const probeAllHostnames = useCallback(async (showToastNotice = true) => {
    setIsProbingAll(true);
    for (const h of hostnames) {
      await probeSingleHostname(h);
    }
    setIsProbingAll(false);
    if (showToastNotice) {
      setStatusNotification('Heartbeat probe completed: All hostnames tested for reachability.');
      setTimeout(() => setStatusNotification(null), 3500);
    }
  }, [hostnames, probeSingleHostname]);

  // Periodic Heartbeat Timer (runs every 30 seconds when isHeartbeatActive)
  useEffect(() => {
    if (!isHeartbeatActive) return;

    const interval = setInterval(() => {
      setHeartbeatCountdown((prev) => {
        if (prev <= 1) {
          probeAllHostnames(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHeartbeatActive, probeAllHostnames]);

  const handleToggleHeartbeatMonitor = () => {
    const next = !isHeartbeatActive;
    setIsHeartbeatActive(next);
    try {
      localStorage.setItem('noip_heartbeat_active', String(next));
    } catch (e) {
      console.warn('Could not save heartbeat preference:', e);
    }
    if (next) {
      setHeartbeatCountdown(30);
      probeAllHostnames(false);
    }
  };

  const handleToggleSimulatedOutage = (hostId: string) => {
    setSimulatedOutages((prev) => {
      const isCurrentlyDown = Boolean(prev[hostId]);
      const nextState = !isCurrentlyDown;
      const updated = { ...prev, [hostId]: nextState };
      
      const host = hostnames.find((h) => h.id === hostId);
      const fqdn = host ? host.fullHostname : hostId;

      if (nextState) {
        setStatusNotification(`⚠️ Outage Simulated for ${fqdn}: Hostname marked Unreachable (Red).`);
      } else {
        setStatusNotification(`✓ Restored reachability for ${fqdn}: Status returning to Reachable (Green).`);
      }
      setTimeout(() => setStatusNotification(null), 4000);

      // Trigger immediate probe on this host to update status indicator
      setTimeout(() => {
        if (host) probeSingleHostname(host);
      }, 100);

      return updated;
    });
  };

  const handleTriggerTestEmail = useCallback((customEmail?: string) => {
    const target = customEmail || alertConfig.recipientEmail;
    playAlertChime('test');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlertLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        hostname: hostnames[0]?.fullHostname || 'homeserver.ddns.net',
        timestamp: now,
        type: 'TEST_EMAIL',
        channels: ['Email'],
        recipient: target,
        downtimeFormatted: '0m (Test)',
        message: `Test alert notification dispatched to ${target}. Configuration is active and verified.`,
        status: 'SENT',
      },
      ...prev,
    ]);
    setStatusNotification(`✓ Simulated test outage email dispatched to ${target}`);
    setTimeout(() => setStatusNotification(null), 4000);
  }, [alertConfig.recipientEmail, hostnames, playAlertChime]);

  const handleTriggerTestDesktop = useCallback(() => {
    playAlertChime('alarm');
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[NO-IP TEST] Heartbeat Alert`, {
          body: `Test notification: 5-minute failure threshold alert is configured for ${alertConfig.recipientEmail}.`,
        });
      } catch {}
    }
    setActiveAlertToast({
      id: `test-${Date.now()}`,
      title: `🔔 Test Desktop Notification`,
      message: `Alert threshold is set to ${alertConfig.thresholdMinutes} minutes. If any hostname remains unreachable for > ${alertConfig.thresholdMinutes}m, you will receive an alert like this!`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  }, [alertConfig, playAlertChime]);

  const handleSimulateOutageThreshold = useCallback((hostnameId: string, minutesAgo: number) => {
    const host = hostnames.find((h) => h.id === hostnameId);
    if (!host) return;

    setSimulatedOutages((prev) => ({ ...prev, [hostnameId]: true }));

    const backdatedStart = Date.now() - (minutesAgo * 60 * 1000);
    setDowntimeTracking((prev) => ({
      ...prev,
      [hostnameId]: {
        startedAt: backdatedStart,
        alertDispatched: false,
      },
    }));

    setTimeout(() => {
      probeSingleHostname(host);
    }, 100);

    setStatusNotification(`Simulating > ${Math.floor(minutesAgo)}m outage on ${host.fullHostname}: Alert threshold will trigger immediately.`);
    setTimeout(() => setStatusNotification(null), 4000);
  }, [hostnames, probeSingleHostname]);

  const handleResetOutageSimulation = useCallback((hostnameId: string) => {
    const host = hostnames.find((h) => h.id === hostnameId);
    setSimulatedOutages((prev) => {
      const next = { ...prev };
      delete next[hostnameId];
      return next;
    });

    setTimeout(() => {
      if (host) probeSingleHostname(host);
    }, 100);

    if (host) {
      setStatusNotification(`Restored ${host.fullHostname}: Probe running to verify reachability and send recovery notification.`);
      setTimeout(() => setStatusNotification(null), 4000);
    }
  }, [hostnames, probeSingleHostname]);

  // --------------------------------------------------------------------------
  // DNS REFRESH ENGINE
  // --------------------------------------------------------------------------
  const triggerRefresh = useCallback(async (isManual = false) => {
    setIsRefreshing(true);
    try {
      if (onRefreshAllHostnames) {
        await onRefreshAllHostnames();
      } else {
        for (const h of hostnames) {
          onRefreshHostname(h.id);
        }
      }
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastRefreshedAt(timeStr);
      setStatusNotification(isManual ? 'Manual refresh complete. DNS status updated.' : 'Auto-refreshed DNS status for all hostnames.');
      setTimeout(() => setStatusNotification(null), 3500);
      // Run quick heartbeat check along with DNS refresh
      probeAllHostnames(false);
    } catch (e) {
      console.error('Error refreshing hostnames:', e);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [onRefreshAllHostnames, onRefreshHostname, hostnames, probeAllHostnames]);

  // Auto-Refresh 60-second timer
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerRefresh(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, triggerRefresh]);

  const handleToggleAutoRefresh = () => {
    const next = !autoRefresh;
    setAutoRefresh(next);
    try {
      localStorage.setItem('noip_auto_refresh', String(next));
    } catch (e) {
      console.warn('Could not save auto-refresh preference:', e);
    }
    if (next) {
      setCountdown(60);
      triggerRefresh(false);
    }
  };

  const handleManualRefreshAll = () => {
    setCountdown(60);
    triggerRefresh(true);
  };

  // --------------------------------------------------------------------------
  // EDIT & ADD HOSTNAMES
  // --------------------------------------------------------------------------
  const handleOpenEditModal = (item: HostnameRecord) => {
    setEditingRecord(item);
    setEditIpv4(item.targetIp || '');
    setEditIpv6(item.targetIpv6 || '');
    setEditError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const trimmedV4 = editIpv4.trim();
    const trimmedV6 = editIpv6.trim();

    if (!trimmedV4 && !trimmedV6) {
      setEditError('Please provide at least an IPv4 address (A record) or an IPv6 address (AAAA record).');
      return;
    }

    let determinedType: DnsRecordType = 'A';
    if (trimmedV4 && trimmedV6) {
      determinedType = 'DUAL';
    } else if (trimmedV6 && !trimmedV4) {
      determinedType = 'AAAA';
    } else {
      determinedType = 'A';
    }

    if (onUpdateHostname) {
      onUpdateHostname(editingRecord.id, {
        targetIp: trimmedV4,
        targetIpv6: trimmedV6,
        recordType: determinedType,
      });
    }

    setStatusNotification(`Updated DNS records for ${editingRecord.fullHostname} (${determinedType})`);
    setTimeout(() => setStatusNotification(null), 3500);
    setEditingRecord(null);
  };

  const handleCreateNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) {
      setFormError('Please enter a valid hostname prefix.');
      return;
    }

    const trimmedV4 = newIpv4.trim();
    const trimmedV6 = newIpv6.trim();

    if (newRecordType === 'A' && !trimmedV4) {
      setFormError('IPv4 address is required for an A record.');
      return;
    }

    if (newRecordType === 'AAAA' && !trimmedV6) {
      setFormError('IPv6 address is required for an AAAA record.');
      return;
    }

    if (newRecordType === 'DUAL' && (!trimmedV4 || !trimmedV6)) {
      setFormError('Both IPv4 (A) and IPv6 (AAAA) addresses are required for Dual-Stack configuration.');
      return;
    }

    const fullHostname = `${clean}${newDomain}`;
    const newRecord: HostnameRecord = {
      id: `host_${Date.now()}`,
      name: clean,
      domain: newDomain,
      fullHostname,
      targetIp: newRecordType === 'AAAA' ? '' : trimmedV4,
      targetIpv6: newRecordType === 'A' ? '' : trimmedV6,
      recordType: newRecordType,
      lastUpdated: 'Just now',
      status: 'Active',
      port: Number(newPort) || 80,
    };

    if (onAddHostname) {
      onAddHostname(newRecord);
    }

    setStatusNotification(`Created ${fullHostname} with ${newRecordType} DNS records.`);
    setTimeout(() => setStatusNotification(null), 3500);
    setIsAddModalOpen(false);
    setNewName('');
    setFormError(null);
  };

  // --------------------------------------------------------------------------
  // CALCULATED STATS & FILTERING
  // --------------------------------------------------------------------------
  const reachableCount = useMemo(() => {
    return hostnames.filter((h) => heartbeats[h.id]?.isReachable).length;
  }, [hostnames, heartbeats]);

  const unreachableCount = hostnames.length - reachableCount;

  const averageLatency = useMemo(() => {
    const reachable = hostnames.filter((h) => heartbeats[h.id]?.isReachable);
    if (reachable.length === 0) return 0;
    const sum = reachable.reduce((acc, h) => acc + (heartbeats[h.id]?.latencyMs || 0), 0);
    return Math.round(sum / reachable.length);
  }, [hostnames, heartbeats]);

  const networkUptimePercentage = useMemo(() => {
    if (hostnames.length === 0) return 100;
    const sum = hostnames.reduce((acc, h) => acc + (heartbeats[h.id]?.uptimePercentage || 100), 0);
    return (sum / hostnames.length).toFixed(1);
  }, [hostnames, heartbeats]);

  const filteredHostnames = hostnames.filter((h) => {
    const hb = heartbeats[h.id];
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'REACHABLE') return hb?.isReachable;
    if (activeFilter === 'UNREACHABLE') return !hb?.isReachable;
    if (activeFilter === 'DUAL') {
      return h.recordType === 'DUAL' || (Boolean(h.targetIp) && Boolean(h.targetIpv6));
    }
    if (activeFilter === 'A') {
      return h.recordType === 'A' || (!h.targetIpv6 && Boolean(h.targetIp));
    }
    if (activeFilter === 'AAAA') {
      return h.recordType === 'AAAA' || (!h.targetIp && Boolean(h.targetIpv6));
    }
    return true;
  });

  const countDual = hostnames.filter(h => h.recordType === 'DUAL' || (Boolean(h.targetIp) && Boolean(h.targetIpv6))).length;
  const countA = hostnames.filter(h => h.recordType === 'A' || (!h.targetIpv6 && Boolean(h.targetIp))).length;
  const countAaaa = hostnames.filter(h => h.recordType === 'AAAA' || (!h.targetIp && Boolean(h.targetIpv6))).length;

  // --------------------------------------------------------------------------
  // BACKUP & EXPORT ENGINE (JSON & CSV)
  // --------------------------------------------------------------------------
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [includeTelemetry, setIncludeTelemetry] = useState<boolean>(true);
  const [copiedExportData, setCopiedExportData] = useState<boolean>(false);

  const generateExportString = useCallback((format: 'json' | 'csv', scope: 'all' | 'filtered', withStats: boolean) => {
    const targetList = scope === 'filtered' ? filteredHostnames : hostnames;
    const nowIso = new Date().toISOString();

    if (format === 'json') {
      const exportObject = {
        metadata: {
          system: "No-IP Dynamic DNS Remote Access & DNS Security Manager",
          version: "1.2.0",
          exportTimestamp: nowIso,
          accountEmail: userEmail || "guest@ddns.local",
          totalRecords: targetList.length,
          scope: scope === 'filtered' ? `Filtered (${activeFilter})` : "All Hostnames",
          containsTelemetry: withStats,
        },
        records: targetList.map((h) => {
          const hb = heartbeats[h.id];
          return {
            id: h.id,
            name: h.name,
            domain: h.domain,
            fullHostname: h.fullHostname,
            recordType: h.recordType || 'A',
            ipv4Target: h.targetIp || null,
            ipv6Target: h.targetIpv6 || null,
            port: h.port || 80,
            status: h.status,
            lastSynced: h.lastUpdated,
            ...(withStats && hb ? {
              heartbeatMonitor: {
                isReachable: hb.isReachable,
                latencyMs: hb.latencyMs,
                status: hb.status,
                uptimePercentage: hb.uptimePercentage,
                lastChecked: hb.lastChecked,
                packetLoss: hb.packetLoss ?? 0,
                dnsResolved: hb.dnsResolved ?? true,
              }
            } : {})
          };
        })
      };
      return JSON.stringify(exportObject, null, 2);
    } else {
      // CSV Export
      const headers = [
        "Hostname Prefix",
        "Domain",
        "Full FQDN",
        "Record Type",
        "IPv4 (A Record)",
        "IPv6 (AAAA Record)",
        "Port",
        "DNS Status",
        "Last Sync"
      ];

      if (withStats) {
        headers.push(
          "Heartbeat Reachability",
          "Ping Latency (ms)",
          "Uptime (%)",
          "Packet Loss (%)",
          "Last Heartbeat Probe"
        );
      }

      const rows = targetList.map((h) => {
        const hb = heartbeats[h.id];
        const row = [
          `"${(h.name || '').replace(/"/g, '""')}"`,
          `"${(h.domain || '').replace(/"/g, '""')}"`,
          `"${(h.fullHostname || '').replace(/"/g, '""')}"`,
          `"${(h.recordType || 'A').replace(/"/g, '""')}"`,
          `"${(h.targetIp || '').replace(/"/g, '""')}"`,
          `"${(h.targetIpv6 || '').replace(/"/g, '""')}"`,
          h.port || 80,
          `"${(h.status || 'Active').replace(/"/g, '""')}"`,
          `"${(h.lastUpdated || '').replace(/"/g, '""')}"`
        ];

        if (withStats) {
          row.push(
            `"${hb ? (hb.isReachable ? 'Reachable (Online)' : 'Unreachable (Down)') : 'Unknown'}"`,
            hb ? hb.latencyMs : 0,
            hb ? `${hb.uptimePercentage}%` : '100%',
            hb ? `${hb.packetLoss ?? 0}%` : '0%',
            `"${hb ? hb.lastChecked : 'N/A'}"`
          );
        }

        return row.join(',');
      });

      return [headers.join(','), ...rows].join('\r\n');
    }
  }, [hostnames, filteredHostnames, activeFilter, userEmail, heartbeats]);

  // Live export preview string
  const currentExportPreview = useMemo(() => {
    return generateExportString(exportFormat, exportScope, includeTelemetry);
  }, [generateExportString, exportFormat, exportScope, includeTelemetry]);

  const handleDownloadExport = (formatToUse?: 'json' | 'csv', scopeToUse?: 'all' | 'filtered') => {
    const fmt = formatToUse || exportFormat;
    const scp = scopeToUse || exportScope;
    const content = generateExportString(fmt, scp, includeTelemetry);
    const mimeType = fmt === 'json' ? 'application/json;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `noip-dns-records-${scp === 'filtered' ? 'filtered-' : ''}${dateStr}.${fmt}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const count = scp === 'filtered' ? filteredHostnames.length : hostnames.length;
    setStatusNotification(`✓ Downloaded ${count} hostname records as ${fmt.toUpperCase()} backup (${filename})`);
    setTimeout(() => setStatusNotification(null), 4000);
    setIsExportModalOpen(false);
    setIsExportDropdownOpen(false);
  };

  const handleCopyExportData = () => {
    navigator.clipboard?.writeText(currentExportPreview);
    setCopiedExportData(true);
    setTimeout(() => setCopiedExportData(false), 2000);
  };

  return (
    <section id="active-hostnames-section" className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header and Top Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-1">
              <Server className="w-3.5 h-3.5" /> Dynamic DNS Manager
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold text-[#0a2540] dark:text-white">
                My Active Dynamic DNS Hostnames
              </h2>
              {isCloudSynced ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span>Cloud Firestore Synced</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-500/30">
                  <Cloud className="w-3 h-3 text-amber-500" />
                  <span>Local Session</span>
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live heartbeat reachability monitoring, A & AAAA Dual-Stack records, and automatic DNS verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Heartbeat Probe All Button */}
            <button
              type="button"
              onClick={() => probeAllHostnames(true)}
              disabled={isProbingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Run instant reachability heartbeat probe on all registered hostnames"
            >
              <HeartPulse className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isProbingAll ? 'animate-ping' : ''}`} />
              <span>{isProbingAll ? 'Probing...' : 'Check Heartbeats'}</span>
            </button>

            {/* Export Backup Button */}
            <div className="relative">
              <div className="inline-flex rounded-lg shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-l-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition-all cursor-pointer"
                  title="Export and backup registered hostnames as CSV or JSON"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Export Backup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className="px-2 py-2 rounded-r-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-t border-b border-r border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition-all cursor-pointer"
                  title="Quick export options"
                >
                  <span className="text-[10px]">▼</span>
                </button>
              </div>

              {isExportDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsExportDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Download
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadExport('json', 'all')}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Download JSON</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">.json</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadExport('csv', 'all')}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Download CSV</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">.csv</span>
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#ff6600] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors text-left cursor-pointer"
                    >
                      <span>Advanced Export & Preview...</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Heartbeat Outage Alerts & Notification Threshold Button */}
            <button
              type="button"
              onClick={() => setIsAlertConfigModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                alertConfig.enabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
              title={`Configure email and desktop notification thresholds (Current: ${alertConfig.thresholdMinutes}m threshold)`}
            >
              <Bell className={`w-3.5 h-3.5 ${alertConfig.enabled ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>Alerts ({alertConfig.thresholdMinutes}m)</span>
              {alertConfig.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {/* Add Hostname Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff6600] hover:bg-[#e05a00] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
              title="Add a new Dynamic DNS Hostname with IPv4 / IPv6 AAAA records"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hostname / AAAA</span>
            </button>

            {onOpenDnsLookup && (
              <button
                type="button"
                onClick={() => onOpenDnsLookup()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-sky-500" />
                <span>DNS Lookup</span>
              </button>
            )}

            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                <span>{userEmail && !userEmail.startsWith('guest') ? 'Account' : 'Cloud Sync'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDucSimulator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-[#ff6600] dark:text-[#ff914d] border border-orange-200 dark:border-orange-800/60 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>DUC Client</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPortChecker()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer border border-transparent dark:border-slate-700"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Check Ports</span>
            </button>
          </div>
        </div>

        {/* HEARTBEAT & UPTIME METRICS OVERVIEW BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Reachability Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Host Reachability
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {reachableCount} / {hostnames.length}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>
            {unreachableCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                <WifiOff className="w-3 h-3 text-rose-500" />
                {unreachableCount} Down
              </span>
            )}
          </div>

          {/* Average Latency Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Avg Response Latency
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {averageLatency}ms
                </span>
                <span className="text-[11px] text-slate-400">ICMP / HTTP Ping</span>
              </div>
            </div>
          </div>

          {/* Overall Uptime Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Overall Health & Uptime
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {networkUptimePercentage}%
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Past 24h</span>
              </div>
            </div>
          </div>

          {/* Heartbeat Monitor Control Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleHeartbeatMonitor}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isHeartbeatActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                title={isHeartbeatActive ? 'Heartbeat monitor active (30s interval). Click to pause.' : 'Heartbeat monitor paused. Click to enable.'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isHeartbeatActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Heartbeat Probe
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {isHeartbeatActive ? `Probing every 30s (${heartbeatCountdown}s)` : 'Probing paused'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAlertConfigModalOpen(true)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  alertConfig.enabled
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
                    : 'bg-white dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
                title={`Configure Outage Notification Thresholds (Current: ${alertConfig.thresholdMinutes}m)`}
              >
                <Bell className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => probeAllHostnames(true)}
                disabled={isProbingAll}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                title="Run Heartbeat Probe on All"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isProbingAll ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE OUTAGE & NOTIFICATION THRESHOLD STATUS BANNER */}
        {unreachableCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50/40 dark:from-rose-950/40 dark:via-amber-950/20 dark:to-rose-950/30 border border-rose-300 dark:border-rose-800/80 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {unreachableCount} Hostname{unreachableCount > 1 ? 's' : ''} Currently Unreachable
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    Threshold: {alertConfig.thresholdMinutes}m
                  </span>
                </div>
                <span className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 block">
                  {alertConfig.enabled
                    ? `Sentinel active: Notifications dispatching to ${alertConfig.recipientEmail} (${alertConfig.desktopAlerts ? 'Email + Desktop' : 'Email'}) if outage exceeds ${alertConfig.thresholdMinutes} minutes.`
                    : 'Alert notifications are currently disabled in settings.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAlertConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shadow-2xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Configure Thresholds & Alerts</span>
            </button>
          </div>
        )}

        {/* Toolbar: Filters (All, Reachable, Unreachable, Dual-Stack, etc.) and Auto-Refresh Switch */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          {/* Left: Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All ({hostnames.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('REACHABLE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'REACHABLE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Reachable ({reachableCount})
            </button>
            {unreachableCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('UNREACHABLE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'UNREACHABLE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Unreachable ({unreachableCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveFilter('DUAL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'DUAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Dual-Stack ({countDual})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('A')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'A'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              IPv4 ({countA})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('AAAA')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'AAAA'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              IPv6 ({countAaaa})
            </button>
          </div>

          {/* Right: DNS Auto-Refresh Switch & Manual Sync */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="auto-refresh-switch"
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <button
                  type="button"
                  id="auto-refresh-switch"
                  role="switch"
                  aria-checked={autoRefresh}
                  onClick={handleToggleAutoRefresh}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    autoRefresh ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={autoRefresh ? 'DNS Auto-Refresh is enabled (60s). Click to pause.' : 'DNS Auto-Refresh is paused. Click to enable.'}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      autoRefresh ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <div className="text-left">
                  <span className="text-xs font-bold text-[#0a2540] dark:text-white flex items-center gap-1">
                    DNS Auto-Sync {autoRefresh && <span className="text-[10px] text-emerald-600 font-bold">({countdown}s)</span>}
                  </span>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={handleManualRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Manually fetch latest DNS status now"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ff6600] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync DNS'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Export hostnames and DNS records as CSV or JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Transient Status Feedback */}
        {statusNotification && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{statusNotification}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Hostnames Table with Heartbeat & Reachability Column */}
        {filteredHostnames.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <p className="text-slate-600 dark:text-slate-300 font-medium">No hostnames matching current filter.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try switching filters or click "Add Hostname / AAAA" to register a new record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Hostname & FQDN</th>
                  <th className="py-3 px-4 min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Heartbeat / Reachability</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[240px]">Target Endpoints (A & AAAA)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Last Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredHostnames.map((item) => {
                  const hasIpv4 = Boolean(item.targetIp);
                  const hasIpv6 = Boolean(item.targetIpv6);
                  const isDual = (hasIpv4 && hasIpv6) || item.recordType === 'DUAL';

                  const hb = heartbeats[item.id] || {
                    hostnameId: item.id,
                    isReachable: true,
                    latencyMs: 28,
                    lastChecked: 'Just now',
                    status: 'ONLINE',
                    uptimePercentage: 100,
                    recentTicks: ['UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP'],
                    packetLoss: 0,
                    dnsResolved: true,
                  };

                  const isCheckingThis = probingHostId === item.id || (isProbingAll && hb.status === 'CHECKING');
                  const isOnline = hb.isReachable && !isCheckingThis;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Hostname Column */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{item.fullHostname}</span>
                          <button
                            onClick={() => handleCopy(item.fullHostname, item.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                            title="Copy Full Hostname"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 pl-0.5">
                          <span className="text-[11px] text-slate-400">{item.domain}</span>
                          {item.port && (
                            <span className="text-[10px] text-slate-400 font-mono">Port: {item.port}</span>
                          )}
                        </div>
                      </td>

                      {/* HEARTBEAT REACHABILITY STATUS COLUMN (Green/Red Status Indicator) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {/* Live Status Badge */}
                          <div className="flex items-center gap-2">
                            {isCheckingThis ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                                <span>Probing...</span>
                              </span>
                            ) : isOnline ? (
                              /* GREEN STATUS INDICATOR */
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 shadow-2xs">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span>Reachable</span>
                                <span className="font-mono text-[10px] font-normal text-emerald-600 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                  {hb.latencyMs}ms
                                </span>
                              </div>
                            ) : (
                              /* RED STATUS INDICATOR */
                              <div className="flex flex-col gap-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 shadow-2xs">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                  </span>
                                  <span>Unreachable</span>
                                  <span className="font-mono text-[10px] font-normal text-rose-600 dark:text-rose-400 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                                    Down
                                  </span>
                                </div>

                                {/* Outage Duration & Alert Threshold Status */}
                                {(() => {
                                  const dt = downtimeTracking[item.id];
                                  if (!dt) return null;
                                  const elapsedSec = Math.max(1, Math.floor((Date.now() - dt.startedAt) / 1000));
                                  const elapsedMin = Math.floor(elapsedSec / 60);
                                  const remSec = elapsedSec % 60;
                                  const isThresholdExceeded = elapsedMin >= alertConfig.thresholdMinutes;

                                  return (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-[10px] font-mono font-semibold ${
                                        isThresholdExceeded ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                                      }`}>
                                        Down: {elapsedMin}m {remSec}s
                                      </span>
                                      {dt.alertDispatched ? (
                                        <button
                                          type="button"
                                          onClick={() => setIsAlertConfigModalOpen(true)}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
                                          title={`Alert dispatched to ${alertConfig.recipientEmail} after breaching ${alertConfig.thresholdMinutes}m threshold`}
                                        >
                                          <Bell className="w-2.5 h-2.5 text-amber-500" />
                                          <span>Alert Sent</span>
                                        </button>
                                      ) : isThresholdExceeded ? (
                                        <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">
                                          &gt; {alertConfig.thresholdMinutes}m
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-slate-400">
                                          (Alert at {alertConfig.thresholdMinutes}m)
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Probe Single Hostname Button */}
                            <button
                              type="button"
                              onClick={() => probeSingleHostname(item)}
                              disabled={isCheckingThis}
                              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Test heartbeat reachability for this hostname now"
                            >
                              <HeartPulse className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Mini Uptime Sparkline Ticks (Last 12 checks) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-mono">Uptime:</span>
                            <div className="flex items-center gap-0.5">
                              {hb.recentTicks.map((tick, tIdx) => (
                                <span
                                  key={tIdx}
                                  title={`Heartbeat probe ${tIdx + 1}: ${tick === 'UP' ? 'Healthy / Reachable' : 'Unreachable / Connection Refused'}`}
                                  className={`w-1.5 h-3.5 rounded-xs transition-all ${
                                    tick === 'UP'
                                      ? 'bg-emerald-500 hover:bg-emerald-400'
                                      : 'bg-rose-500 hover:bg-rose-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">
                              {hb.uptimePercentage}%
                            </span>
                          </div>

                          {/* Quick Diagnostics trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedDiagnosticHost(item)}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span>Diagnostics & Failover</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* IP Endpoints Column (A and AAAA displayed together) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          {/* IPv4 (A record) */}
                          {hasIpv4 ? (
                            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px]">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-500/20 shrink-0">
                                  A
                                </span>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate" title={item.targetIp}>
                                  {item.targetIp}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCopy(item.targetIp, `ipv4_${item.id}`)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 shrink-0 cursor-pointer"
                                title="Copy IPv4 (A record)"
                              >
                                {copiedId === `ipv4_${item.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add IPv4 (A Record)
                            </button>
                          )}

                          {/* IPv6 (AAAA record) */}
                          {hasIpv6 ? (
                            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 font-mono text-[11px]">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 dark:bg-purple-500/25 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-500/30 shrink-0">
                                  AAAA
                                </span>
                                <span className="text-purple-950 dark:text-purple-200 font-semibold truncate" title={item.targetIpv6}>
                                  {item.targetIpv6}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCopy(item.targetIpv6 || '', `ipv6_${item.id}`)}
                                className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 p-0.5 shrink-0 cursor-pointer"
                                title="Copy IPv6 (AAAA record)"
                              >
                                {copiedId === `ipv6_${item.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add IPv6 (AAAA Record)
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Record Type Badge */}
                      <td className="py-3.5 px-4 align-top">
                        {isDual ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/30 shadow-2xs">
                            <Layers className="w-3 h-3 text-emerald-500" />
                            Dual-Stack
                          </span>
                        ) : hasIpv6 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-500/30">
                            <Globe className="w-3 h-3 text-purple-500" />
                            AAAA (IPv6)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-500/30">
                            <Server className="w-3 h-3 text-blue-500" />
                            A (IPv4)
                          </span>
                        )}
                      </td>

                      {/* Last Sync */}
                      <td className="py-3.5 px-4 align-top text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.lastUpdated}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Probe: {hb.lastChecked}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {onOpenDnsLookup && (
                            <button
                              onClick={() => onOpenDnsLookup(item.fullHostname)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 rounded text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                              title="Lookup live public DNS (A and AAAA records) for this hostname"
                            >
                              <Search className="w-3 h-3 text-sky-500" />
                              <span>Lookup</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenPortChecker(item.port || 80, item.fullHostname)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-[#ff6600] dark:hover:text-[#ff914d] rounded text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                            title="Test Port on this Hostname"
                          >
                            <Activity className="w-3 h-3" />
                            <span>Port</span>
                          </button>

                          {/* Edit IP / AAAA button */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Configure IPv4 (A) & IPv6 (AAAA) records"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL 1: Heartbeat Diagnostics & Outage Simulator Modal */}
        {selectedDiagnosticHost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Heartbeat & Uptime Diagnostics
                    </h3>
                    <p className="text-xs font-mono text-[#ff6600]">
                      {selectedDiagnosticHost.fullHostname}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDiagnosticHost(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const diagHb = heartbeats[selectedDiagnosticHost.id] || {
                  isReachable: true,
                  latencyMs: 32,
                  uptimePercentage: 100,
                  packetLoss: 0,
                  status: 'ONLINE',
                  recentTicks: ['UP', 'UP', 'UP', 'UP'],
                  lastChecked: 'Just now',
                };
                const isDown = !diagHb.isReachable;
                const isSimDown = Boolean(simulatedOutages[selectedDiagnosticHost.id]);

                return (
                  <div className="mt-5 space-y-4">
                    {/* Live Indicator Callout */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      isDown
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80'
                        : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3.5 w-3.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isDown ? 'bg-rose-400' : 'bg-emerald-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                            isDown ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}></span>
                        </span>
                        <div>
                          <span className={`font-bold text-sm block ${
                            isDown ? 'text-rose-900 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-300'
                          }`}>
                            {isDown ? 'Status: Unreachable (Down)' : 'Status: Reachable (Online)'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            Last probe performed at {diagHb.lastChecked}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className={`text-base font-bold block ${
                          isDown ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isDown ? 'Timeout' : `${diagHb.latencyMs}ms`}
                        </span>
                        <span className="text-[10px] text-slate-400 block">RTT Latency</span>
                      </div>
                    </div>

                    {/* Reachability Checks Checklist */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">DNS Resolution:</span>
                        <span className={`font-bold ${isDown ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isDown ? '✗ ServFail / Timeout' : '✓ 200 OK (Resolved)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">IPv4 Endpoint (A Record):</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {selectedDiagnosticHost.targetIp || 'None configured'}
                        </span>
                      </div>
                      {selectedDiagnosticHost.targetIpv6 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">IPv6 Endpoint (AAAA Record):</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]" title={selectedDiagnosticHost.targetIpv6}>
                            {selectedDiagnosticHost.targetIpv6}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">TCP Port Handshake:</span>
                        <span className={`font-bold ${isDown ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isDown ? '✗ Connection Refused' : `✓ Port ${selectedDiagnosticHost.port || 80} Open`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">24-Hour Uptime SLA:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {diagHb.uptimePercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Uptime Sparkline History */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Recent Heartbeat Checks History:
                      </span>
                      <div className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {diagHb.recentTicks.map((t, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <span className={`w-full h-8 rounded-xs transition-colors ${
                              t === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            <span className="text-[9px] text-slate-400 font-mono">#{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Failure / Outage Simulation Toggle */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                            Test Failover Simulation
                          </span>
                          <span className="text-[11px] text-amber-700 dark:text-amber-300 block">
                            Simulate an endpoint crash to test red warning alerts and recovery.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSimulatedOutage(selectedDiagnosticHost.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isSimDown
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        {isSimDown ? 'Restore Online' : 'Simulate Outage'}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => probeSingleHostname(selectedDiagnosticHost)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Re-probe Host Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDiagnosticHost(null)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* MODAL 2: Add New Hostname (with IPv4, IPv6 AAAA, or Dual-Stack) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#ff6600] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Add Dynamic DNS Record
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure A (IPv4), AAAA (IPv6), or Dual-Stack resolution.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewRecord} className="mt-4 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Hostname Prefix & Domain */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hostname & Domain
                  </label>
                  <div className="flex rounded-xl shadow-2xs border border-slate-300 dark:border-slate-700 overflow-hidden focus-within:border-[#ff6600] focus-within:ring-1 focus-within:ring-[#ff6600]">
                    <input
                      type="text"
                      required
                      placeholder="e.g. homeserver"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-transparent outline-hidden font-mono"
                    />
                    <select
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border-l border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
                    >
                      {DOMAIN_OPTIONS.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Record Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Record Architecture
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRecordType('DUAL')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        newRecordType === 'DUAL'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">Dual-Stack</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">A + AAAA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRecordType('A')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        newRecordType === 'A'
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">IPv4 Only</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">A Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRecordType('AAAA')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        newRecordType === 'AAAA'
                          ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold ring-1 ring-purple-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">IPv6 Only</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">AAAA Record</span>
                    </button>
                  </div>
                </div>

                {/* IPv4 Input (if DUAL or A) */}
                {(newRecordType === 'DUAL' || newRecordType === 'A') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">A</span>
                        Target IPv4 Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewIpv4(currentIp)}
                        className="text-[10px] text-[#ff6600] hover:underline font-semibold"
                      >
                        Use Detected ({currentIp})
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 198.51.100.42"
                      value={newIpv4}
                      onChange={(e) => setNewIpv4(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-[#ff6600] font-mono"
                    />
                  </div>
                )}

                {/* IPv6 Input (if DUAL or AAAA) */}
                {(newRecordType === 'DUAL' || newRecordType === 'AAAA') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-bold text-[10px]">AAAA</span>
                        Target IPv6 Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewIpv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')}
                        className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        Sample Global IPv6
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2001:db8:85a3::8a2e:370:7334"
                      value={newIpv6}
                      onChange={(e) => setNewIpv6(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-[#ff6600] font-mono"
                    />
                  </div>
                )}

                {/* Port */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Default Port
                  </label>
                  <input
                    type="number"
                    value={newPort}
                    onChange={(e) => setNewPort(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#ff6600] hover:bg-[#e05a00] shadow-xs cursor-pointer"
                  >
                    Register Hostname
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Edit Existing Hostname Records (A / AAAA) */}
        {editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Configure IP Endpoints
                    </h3>
                    <p className="text-xs font-mono text-[#ff6600]">
                      {editingRecord.fullHostname}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                {editError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                    {editError}
                  </div>
                )}

                {/* IPv4 Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">A</span>
                      IPv4 Target Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditIpv4(currentIp)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Use Current ({currentIp})
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 198.51.100.42 (Leave empty if IPv6 only)"
                    value={editIpv4}
                    onChange={(e) => setEditIpv4(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Points DNS A record to your router or server's public IPv4 address.
                  </span>
                </div>

                {/* IPv6 Address (AAAA Record) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-bold text-[10px]">AAAA</span>
                      IPv6 Target Address (AAAA Record)
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditIpv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      Fill Sample IPv6
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 2001:db8:85a3::8a2e:370:7334"
                    value={editIpv6}
                    onChange={(e) => setEditIpv6(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-hidden focus:border-purple-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Modern networks with Carrier-Grade NAT (CGNAT) resolve natively via IPv6 AAAA records.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    Providing both IPv4 and IPv6 automatically configures <strong>Dual-Stack (A+AAAA)</strong>, allowing clients to pick the fastest route via RFC 8305 (Happy Eyeballs v2).
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                  >
                    Save DNS Records
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: Export & Backup DNS Records Modal (CSV & JSON) */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Export & Backup DNS Records
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Export your registered dynamic DNS hostnames and endpoints for backup or spreadsheet analysis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* Format Selection (JSON vs CSV) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('json')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        exportFormat === 'json'
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">JSON Format</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                          .json
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Full machine-readable configuration with complete metadata. Recommended for backup and restore.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        exportFormat === 'csv'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">CSV Format</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          .csv
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Standard comma-separated table format. Compatible with Microsoft Excel, Google Sheets, and LibreOffice.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Scope Selection & Telemetry Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Export Scope
                    </label>
                    <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1">
                      <button
                        type="button"
                        onClick={() => setExportScope('all')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          exportScope === 'all'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        All Hostnames ({hostnames.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportScope('filtered')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          exportScope === 'filtered'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Current Filter ({filteredHostnames.length})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Additional Options
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeTelemetry}
                        onChange={(e) => setIncludeTelemetry(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Include Heartbeat & Latency Telemetry
                      </span>
                    </label>
                  </div>
                </div>

                {/* File Preview Card */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      File Preview & Details
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {exportScope === 'filtered' ? `Filter: ${activeFilter}` : 'All Hostnames'} • {new Blob([currentExportPreview]).size} bytes
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyExportData}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {copiedExportData ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Data</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-200 p-3.5 font-mono text-[11px] overflow-hidden">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                      <span className="text-emerald-400">
                        📄 noip-dns-records-{exportScope === 'filtered' ? 'filtered-' : ''}{new Date().toISOString().slice(0, 10)}.{exportFormat}
                      </span>
                      <span>UTF-8 Encoded</span>
                    </div>
                    <pre className="max-h-48 overflow-y-auto overflow-x-auto text-[11px] leading-relaxed select-all">
                      {currentExportPreview}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadExport('json')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      Quick JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadExport('csv')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      Quick CSV
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsExportModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadExport()}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${
                        exportFormat === 'json'
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {exportFormat.toUpperCase()} Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heartbeat Outage Alert Configuration Modal */}
        <HeartbeatAlertSettingsModal
          isOpen={isAlertConfigModalOpen}
          onClose={() => setIsAlertConfigModalOpen(false)}
          config={alertConfig}
          onSaveConfig={(newConfig) => {
            setAlertConfig(newConfig);
            setStatusNotification(`✓ Saved alert settings: ${newConfig.thresholdMinutes}-minute threshold active for ${newConfig.recipientEmail}`);
            setTimeout(() => setStatusNotification(null), 4000);
          }}
          hostnames={hostnames}
          heartbeats={heartbeats}
          downtimeTracking={downtimeTracking}
          alertLogs={alertLogs}
          onClearLogs={() => setAlertLogs([])}
          onTriggerTestEmail={handleTriggerTestEmail}
          onTriggerTestDesktop={handleTriggerTestDesktop}
          onRequestBrowserPermission={handleRequestBrowserPermission}
          browserPermission={browserPermission}
          onSimulateOutageThreshold={handleSimulateOutageThreshold}
          onResetOutageSimulation={handleResetOutageSimulation}
          simulatedOutages={simulatedOutages}
        />

        {/* Floating In-App Alert Notification Toast */}
        {activeAlertToast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl border bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 ring-4 ring-amber-500/10 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeAlertToast.type === 'alarm' 
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                  : activeAlertToast.type === 'recovery'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}>
                {activeAlertToast.type === 'alarm' ? (
                  <WifiOff className="w-5 h-5 animate-pulse" />
                ) : activeAlertToast.type === 'recovery' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeAlertToast.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{activeAlertToast.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {activeAlertToast.message}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlertToast(null);
                      setIsAlertConfigModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Configure Thresholds...
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAlertToast(null)}
                    className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlertToast(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
