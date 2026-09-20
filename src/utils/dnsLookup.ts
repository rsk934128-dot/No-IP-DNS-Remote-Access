export interface DnsRecordAnswer {
  name: string;
  type: number;
  typeName: string;
  TTL: number;
  data: string;
  priority?: number;
}

export interface DnsLookupResponse {
  domain: string;
  recordType: string;
  resolver: 'google' | 'cloudflare';
  status: number;
  statusName: string;
  latencyMs: number;
  isDnssecValidated: boolean;
  answers: DnsRecordAnswer[];
  authorities?: DnsRecordAnswer[];
  rawResponse?: any;
  timestamp: string;
}

export const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  257: 'CAA',
};

export const DNS_NAME_TO_TYPE_MAP: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  CAA: 257,
};

export const DNS_STATUS_NAMES: Record<number, string> = {
  0: 'NOERROR (Success)',
  1: 'FORMERR (Format Error)',
  2: 'SERVFAIL (Server Failure)',
  3: 'NXDOMAIN (Non-Existent Domain)',
  4: 'NOTIMP (Not Implemented)',
  5: 'REFUSED (Query Refused)',
};

/**
 * Normalizes and strips http/https protocols or paths from user-entered domain
 */
export function sanitizeDomainInput(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/:[0-9]+$/, '');
  return cleaned;
}

/**
 * Queries Google Public DNS or Cloudflare DoH for a single record type
 */
export async function queryDnsRecord(
  domain: string,
  recordType: string = 'A',
  resolver: 'google' | 'cloudflare' = 'google'
): Promise<DnsLookupResponse> {
  const cleanDomain = sanitizeDomainInput(domain);
  const startTime = performance.now();

  try {
    let url = '';
    const headers: Record<string, string> = {};

    if (resolver === 'cloudflare') {
      url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${encodeURIComponent(recordType)}`;
      headers['Accept'] = 'application/dns-json';
    } else {
      url = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${encodeURIComponent(recordType)}`;
    }

    const response = await fetch(url, { headers });
    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error(`DNS resolver returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const status = data.Status ?? (data.status || 0);

    const answers: DnsRecordAnswer[] = [];
    if (Array.isArray(data.Answer)) {
      data.Answer.forEach((ans: any) => {
        let val = ans.data || '';
        let priority: number | undefined;

        // Parse MX priority if record is MX
        if (ans.type === 15 && typeof val === 'string') {
          const parts = val.split(/\s+/);
          if (parts.length >= 2 && !isNaN(Number(parts[0]))) {
            priority = Number(parts[0]);
            val = parts.slice(1).join(' ');
          }
        }

        // Clean quotes from TXT records
        if (ans.type === 16 && typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }

        answers.push({
          name: ans.name,
          type: ans.type,
          typeName: DNS_TYPE_MAP[ans.type] || `TYPE${ans.type}`,
          TTL: ans.TTL,
          data: val,
          priority,
        });
      });
    }

    return {
      domain: cleanDomain,
      recordType,
      resolver,
      status,
      statusName: DNS_STATUS_NAMES[status] || `RCODE ${status}`,
      latencyMs,
      isDnssecValidated: !!data.AD,
      answers,
      rawResponse: data,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      domain: cleanDomain,
      recordType,
      resolver,
      status: -1,
      statusName: err.message || 'Lookup failed',
      latencyMs,
      isDnssecValidated: false,
      answers: [],
      rawResponse: { error: err.message },
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

/**
 * Queries multiple standard DNS record types in parallel (A, AAAA, MX, TXT, NS, CNAME, SOA)
 */
export async function queryAllDnsRecords(
  domain: string,
  resolver: 'google' | 'cloudflare' = 'google'
): Promise<DnsLookupResponse> {
  const cleanDomain = sanitizeDomainInput(domain);
  const typesToQuery = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'CAA'];
  const startTime = performance.now();

  const results = await Promise.all(
    typesToQuery.map((type) => queryDnsRecord(cleanDomain, type, resolver))
  );

  const totalLatency = Math.round(performance.now() - startTime);
  const allAnswers: DnsRecordAnswer[] = [];
  let isDnssecValidated = false;
  let generalStatus = 0;

  results.forEach((res) => {
    if (res.isDnssecValidated) isDnssecValidated = true;
    if (res.status !== 0 && generalStatus === 0) {
      generalStatus = res.status;
    }
    allAnswers.push(...res.answers);
  });

  // Deduplicate answers by type and data
  const seen = new Set<string>();
  const uniqueAnswers = allAnswers.filter((ans) => {
    const key = `${ans.type}-${ans.name}-${ans.data}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    domain: cleanDomain,
    recordType: 'ALL',
    resolver,
    status: generalStatus,
    statusName: DNS_STATUS_NAMES[generalStatus] || `RCODE ${generalStatus}`,
    latencyMs: totalLatency,
    isDnssecValidated,
    answers: uniqueAnswers,
    timestamp: new Date().toLocaleTimeString(),
  };
}
