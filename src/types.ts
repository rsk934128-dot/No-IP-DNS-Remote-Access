export type DnsRecordType = 'A' | 'AAAA' | 'DUAL' | 'CNAME';

export interface HostnameRecord {
  id: string;
  name: string;
  domain: string;
  fullHostname: string;
  targetIp: string; // IPv4 address (A record)
  targetIpv6?: string; // IPv6 address (AAAA record)
  recordType: DnsRecordType;
  lastUpdated: string;
  status: 'Active' | 'Updating' | 'Expired';
  port: number;
}

export interface HostnameHeartbeat {
  hostnameId: string;
  isReachable: boolean;
  latencyMs: number;
  lastChecked: string;
  status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  uptimePercentage: number;
  recentTicks: ('UP' | 'DOWN')[]; // Series of recent checks (last 12)
  packetLoss: number;
  dnsResolved: boolean;
  httpStatus?: number;
  errorMessage?: string;
}

export interface HeartbeatAlertConfig {
  enabled: boolean;
  thresholdMinutes: number; // e.g. 5 minutes
  emailAlerts: boolean;
  recipientEmail: string;
  secondaryEmail?: string;
  desktopAlerts: boolean;
  notifyOnRecovery: boolean;
  webhookEnabled: boolean;
  webhookUrl?: string;
  soundAlert: boolean;
}

export interface AlertLogEntry {
  id: string;
  hostname: string;
  timestamp: string;
  type: 'FAILURE_THRESHOLD' | 'RECOVERY' | 'TEST_EMAIL' | 'TEST_DESKTOP';
  channels: string[];
  recipient: string;
  downtimeFormatted: string;
  message: string;
  status: 'SENT' | 'FAILED';
}

export interface PortCheckResult {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'checking';
  ip: string;
  latencyMs?: number;
  timestamp: string;
  message: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
}

export type CustomerAudience = 'business' | 'home';
