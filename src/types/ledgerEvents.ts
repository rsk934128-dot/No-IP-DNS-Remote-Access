export type HttpDirection = 'INCOMING' | 'OUTGOING';

export interface HttpEventLog {
  id: string;
  timestamp: string;
  direction: HttpDirection;
  method: 'POST';
  url: string;
  source: string;
  destination: string;
  eventType: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
  latencyMs: number;
  signature?: string;
  deliveryStatus: 'DELIVERED' | 'RETRYING' | 'FAILED';
  retryCount?: number;
  txReference?: string;
}
