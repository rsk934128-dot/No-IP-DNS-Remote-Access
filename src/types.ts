export interface HostnameRecord {
  id: string;
  name: string;
  domain: string;
  fullHostname: string;
  targetIp: string;
  recordType: 'A' | 'AAAA' | 'CNAME';
  lastUpdated: string;
  status: 'Active' | 'Updating' | 'Expired';
  port: number;
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
