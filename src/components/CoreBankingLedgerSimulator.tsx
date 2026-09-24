import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Code,
  Copy,
  Check,
  Download,
  Key,
  Lock,
  Radio,
  FileSpreadsheet,
  FileJson,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Sliders,
  DollarSign,
  Undo2,
  Search
} from 'lucide-react';
import { HttpEventLog } from '../types/ledgerEvents';
import { WebhookEventLogViewer } from './WebhookEventLogViewer';

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  type: 'CUSTOMER_CHECKING' | 'MERCHANT_SETTLEMENT' | 'CENTRAL_ESCROW' | 'FEE_CLEARING';
  currency: string;
  balance: number;
  availableBalance: number;
  reservedBalance: number;
  routingCode: string;
  status: 'ACTIVE' | 'FROZEN';
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  txHash: string;
  idempotencyKey: string;
  reference: string;
  type: 'TRANSFER' | 'PAYMENT_SETTLEMENT' | 'ESCROW_LOCK' | 'REVERSAL' | 'FEE';
  status: 'SETTLED' | 'PENDING' | 'OTP_PENDING' | 'REVERSED';
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  description: string;
  metadata: {
    channel: 'IN_HOUSE_API' | 'CORE_LEDGER' | 'PAYMENT_BRIDGE';
    clientIp?: string;
    otpVerified?: boolean;
    settlementSpeed: 'INSTANT_0s' | 'BATCH';
  };
}

export interface WebhookEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'payment.initiated'
    | 'payment.otp_verified'
    | 'ledger.debited'
    | 'ledger.credited'
    | 'settlement.completed'
    | 'transfer.failed'
    | 'dispute.reversed';
  targetUrl: string;
  httpStatus: number;
  attempts: number;
  signature: string;
  payload: Record<string, unknown>;
  deliveryStatus: 'DELIVERED' | 'RETRYING' | 'FAILED';
  latencyMs: number;
}

// Initial Simulated Accounts
const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-cust-1',
    accountNumber: 'ACC-882109',
    accountName: 'Sheikh S. (Customer Personal Checking)',
    type: 'CUSTOMER_CHECKING',
    currency: 'USD',
    balance: 14500.0,
    availableBalance: 14500.0,
    reservedBalance: 0,
    routingCode: 'NBK-BD-01',
    status: 'ACTIVE',
  },
  {
    id: 'acc-merch-1',
    accountNumber: 'ACC-990014',
    accountName: 'PrimeTech Merchant Vault (Own Store)',
    type: 'MERCHANT_SETTLEMENT',
    currency: 'USD',
    balance: 68420.5,
    availableBalance: 68420.5,
    reservedBalance: 0,
    routingCode: 'NBK-BD-01',
    status: 'ACTIVE',
  },
  {
    id: 'acc-escrow-1',
    accountNumber: 'ACC-001000',
    accountName: 'Core Banking Clearing & Settlement Vault',
    type: 'CENTRAL_ESCROW',
    currency: 'USD',
    balance: 500000.0,
    availableBalance: 500000.0,
    reservedBalance: 0,
    routingCode: 'NBK-BD-00',
    status: 'ACTIVE',
  },
  {
    id: 'acc-fee-1',
    accountNumber: 'ACC-770023',
    accountName: 'In-House 0% Fee Clearing Account',
    type: 'FEE_CLEARING',
    currency: 'USD',
    balance: 0.0,
    availableBalance: 0.0,
    reservedBalance: 0,
    routingCode: 'NBK-BD-00',
    status: 'ACTIVE',
  },
];

// Initial Demo Ledger Entries
const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'TXN-7739102',
    timestamp: '2026-09-24T13:40:12Z',
    txHash: '0x8f2a9c148e42b6a938cde114a872654921bdfc08',
    idempotencyKey: 'idemp_9281a-7b3e-4fa0',
    reference: 'INV-2026-0041',
    type: 'PAYMENT_SETTLEMENT',
    status: 'SETTLED',
    debitAccount: 'ACC-882109',
    creditAccount: 'ACC-990014',
    amount: 250.0,
    currency: 'USD',
    description: 'In-House Direct Checkout: Annual SaaS Subscription (Instant Settlement)',
    metadata: {
      channel: 'IN_HOUSE_API',
      clientIp: '198.51.100.42',
      otpVerified: true,
      settlementSpeed: 'INSTANT_0s',
    },
  },
  {
    id: 'TXN-7739098',
    timestamp: '2026-09-24T12:15:45Z',
    txHash: '0x4c99e1208a34b22f778cde55b098124987fa1209',
    idempotencyKey: 'idemp_3491b-8c1d-2ea9',
    reference: 'TRF-88102',
    type: 'TRANSFER',
    status: 'SETTLED',
    debitAccount: 'ACC-001000',
    creditAccount: 'ACC-882109',
    amount: 1200.0,
    currency: 'USD',
    description: 'Direct Account Inward Liquidity Top-up',
    metadata: {
      channel: 'CORE_LEDGER',
      clientIp: '198.51.100.42',
      otpVerified: true,
      settlementSpeed: 'INSTANT_0s',
    },
  },
];

// Initial Seed HTTP & Webhook Activity Stream (Incoming & Outgoing POST requests)
const INITIAL_HTTP_LOGS: HttpEventLog[] = [
  {
    id: 'REQ-post-10928',
    timestamp: '2026-09-24T13:40:11Z',
    direction: 'INCOMING',
    method: 'POST',
    url: '/api/v1/ledger/transfers',
    source: 'Merchant Checkout Frontend (198.51.100.42)',
    destination: 'Core Banking Ledger API',
    eventType: 'transfers.initiate',
    status: 200,
    statusText: 'OK',
    headers: {
      'Host': 'core-banking.internal.net',
      'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
      'Content-Type': 'application/json',
      'X-Idempotency-Key': 'idemp_9281a-7b3e-4fa0',
      'User-Agent': 'NoIp-Fintech-Client/1.4',
      'X-Forwarded-For': '198.51.100.42',
    },
    payload: {
      payerAccount: 'ACC-882109',
      payeeAccount: 'ACC-990014',
      amount: 250.0,
      currency: 'USD',
      reference: 'INV-2026-0041',
      memo: 'In-House Direct Checkout: Annual SaaS Subscription',
    },
    response: {
      success: true,
      paymentId: 'PAY-7739102',
      status: 'AWAITING_OTP',
      challenge: '2FA_IN_HOUSE_OTP',
      expiresInSeconds: 180,
    },
    latencyMs: 24,
    deliveryStatus: 'DELIVERED',
    txReference: 'INV-2026-0041',
  },
  {
    id: 'EVT-wh-88200',
    timestamp: '2026-09-24T13:40:12Z',
    direction: 'OUTGOING',
    method: 'POST',
    url: 'https://merchant-app.local/api/webhooks/bank-listener',
    source: 'Core Banking Webhook Dispatcher',
    destination: 'Merchant Webhook Receiver (https://merchant-app.local)',
    eventType: 'payment.initiated',
    status: 200,
    statusText: 'OK',
    headers: {
      'Host': 'merchant-app.local',
      'Content-Type': 'application/json',
      'X-Bank-Signature': 'sha256=4c99e1208a34b22f778cde55b098124987fa12097f2b1a9e88d4c02288',
      'X-Bank-Event': 'payment.initiated',
      'X-Bank-Delivery-Id': 'DELIV-wh-99021',
      'X-Bank-Timestamp': '2026-09-24T13:40:12Z',
    },
    payload: {
      event: 'payment.initiated',
      paymentId: 'PAY-7739102',
      reference: 'INV-2026-0041',
      payerAccount: 'ACC-882109',
      payeeAccount: 'ACC-990014',
      amount: 250.0,
      currency: 'USD',
      status: 'AWAITING_OTP',
    },
    response: {
      received: true,
      ackId: 'ACK-MERCH-8812',
      processedAt: '2026-09-24T13:40:12Z',
    },
    signature: 'sha256=4c99e1208a34b22f778cde55b098124987fa12097f2b1a9e88d4c02288',
    latencyMs: 38,
    deliveryStatus: 'DELIVERED',
    txReference: 'INV-2026-0041',
  },
  {
    id: 'REQ-post-10929',
    timestamp: '2026-09-24T13:40:13Z',
    direction: 'INCOMING',
    method: 'POST',
    url: '/api/v1/payments/verify-otp',
    source: 'Customer 2FA Device (198.51.100.42)',
    destination: 'Core Banking Auth Vault',
    eventType: 'payments.verify_otp',
    status: 200,
    statusText: 'OK',
    headers: {
      'Host': 'core-banking.internal.net',
      'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
      'Content-Type': 'application/json',
      'X-Client-Signature': 'auth_sig_88201bcf',
    },
    payload: {
      paymentId: 'PAY-7739102',
      otpCode: '849201',
      reference: 'INV-2026-0041',
    },
    response: {
      verified: true,
      authStatus: 'AUTHORIZED',
      txHash: '0x8f2a9c148e42b6a938cde114a872654921bdfc08',
      ledgerCommitted: true,
    },
    latencyMs: 19,
    deliveryStatus: 'DELIVERED',
    txReference: 'INV-2026-0041',
  },
  {
    id: 'EVT-wh-88201',
    timestamp: '2026-09-24T13:40:14Z',
    direction: 'OUTGOING',
    method: 'POST',
    url: 'https://merchant-app.local/api/webhooks/bank-listener',
    source: 'Core Banking Webhook Dispatcher',
    destination: 'Merchant Webhook Receiver (https://merchant-app.local)',
    eventType: 'settlement.completed',
    status: 200,
    statusText: 'OK',
    headers: {
      'Host': 'merchant-app.local',
      'Content-Type': 'application/json',
      'X-Bank-Signature': 'sha256=a8f09b2e44d8c772e1098847b2c019283746a5b6c7d8e9f07f2b1a9e88d4c02288',
      'X-Bank-Event': 'settlement.completed',
      'X-Bank-Delivery-Id': 'DELIV-wh-99022',
      'X-Bank-Timestamp': '2026-09-24T13:40:14Z',
    },
    payload: {
      event: 'settlement.completed',
      transactionId: 'TXN-7739102',
      amount: 250.0,
      currency: 'USD',
      merchantAccount: 'ACC-990014',
      payerAccount: 'ACC-882109',
      feeDeducted: 0.0,
      netSettled: 250.0,
      clearingChannel: 'IN_HOUSE_DIRECT',
      blockHash: '0x8f2a9c148e42b6a938cde114a872654921bdfc08',
      settledAt: '2026-09-24T13:40:13Z',
    },
    response: {
      received: true,
      ackId: 'ACK-MERCH-8813',
      orderUpdated: 'PAID_FULFILLED',
    },
    signature: 'sha256=a8f09b2e44d8c772e1098847b2c019283746a5b6c7d8e9f07f2b1a9e88d4c02288',
    latencyMs: 42,
    deliveryStatus: 'DELIVERED',
    txReference: 'INV-2026-0041',
  },
];

// Simple deterministic hash simulation for HMAC signature
function simulateHmacSha256(secret: string, payloadStr: string): string {
  let hash = 0;
  const combined = secret + ':' + payloadStr;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256=${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}7f2b1a9e88d4c02288`;
}

export const CoreBankingLedgerSimulator: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'console' | 'ledger' | 'webhooks' | 'code'>('console');

  // Accounts state
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);

  // Webhook & HTTP Event Log State (Incoming & Outgoing POST requests)
  const [webhookUrl, setWebhookUrl] = useState<string>('https://merchant-app.local/api/webhooks/bank-listener');
  const [webhookSecret, setWebhookSecret] = useState<string>('whsec_inhouse_bank_live_99a8b7c6d5e4f3a2b1');
  const [httpLogs, setHttpLogs] = useState<HttpEventLog[]>(INITIAL_HTTP_LOGS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookEvent[]>([
    {
      id: 'EVT-wh-88201',
      timestamp: '2026-09-24T13:40:13Z',
      eventType: 'settlement.completed',
      targetUrl: 'https://merchant-app.local/api/webhooks/bank-listener',
      httpStatus: 200,
      attempts: 1,
      signature: 'sha256=a8f09b2e44d8c772e1098847b2c019283746a5b6c7d8e9f0',
      payload: {
        event: 'settlement.completed',
        transactionId: 'TXN-7739102',
        amount: 250.0,
        currency: 'USD',
        merchantAccount: 'ACC-990014',
        payerAccount: 'ACC-882109',
        feeDeducted: 0.0,
        netSettled: 250.0,
        clearingChannel: 'IN_HOUSE_DIRECT',
        settledAt: '2026-09-24T13:40:12Z',
      },
      deliveryStatus: 'DELIVERED',
      latencyMs: 42,
    },
  ]);

  // Payment flow simulator state
  const [payerAccId, setPayerAccId] = useState<string>('acc-cust-1');
  const [payeeAccId, setPayeeAccId] = useState<string>('acc-merch-1');
  const [transferAmount, setTransferAmount] = useState<number>(180.0);
  const [paymentReference, setPaymentReference] = useState<string>('INV-2026-0092');
  const [paymentNote, setPaymentNote] = useState<string>('Web Hosting & Domain Direct Settlement');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [flowStep, setFlowStep] = useState<'INITIATE' | 'OTP_CHALLENGE' | 'COMPLETED'>('INITIATE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Selected JSON payload for modal preview
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active REST Endpoint in Console
  const [selectedEndpoint, setSelectedEndpoint] = useState<'transfers' | 'verifyOtp' | 'balance' | 'reversal'>('transfers');
  const [apiResponsePreview, setApiResponsePreview] = useState<string | null>(null);
  const [webhookSearchFilter, setWebhookSearchFilter] = useState<string>('');

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackNotice({ type, text });
    setTimeout(() => setFeedbackNotice(null), 4500);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to log an HTTP event (either incoming or outgoing POST)
  const logHttpEvent = useCallback((event: Omit<HttpEventLog, 'id' | 'timestamp'>) => {
    const idPrefix = event.direction === 'INCOMING' ? 'REQ-post' : 'EVT-wh';
    const newLog: HttpEventLog = {
      ...event,
      id: `${idPrefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString(),
    };
    setHttpLogs((prev) => [newLog, ...prev.slice(0, 79)]);
    return newLog;
  }, []);

  // Dispatch Webhook Helper
  const dispatchWebhook = useCallback((
    eventType: WebhookEvent['eventType'],
    payload: Record<string, unknown>,
    customUrl?: string,
    customRef?: string
  ) => {
    const target = customUrl || webhookUrl;
    const payloadStr = JSON.stringify(payload);
    const signature = simulateHmacSha256(webhookSecret, payloadStr);
    const latency = Math.floor(Math.random() * 35) + 20;
    const nowIso = new Date().toISOString();
    const eventId = `EVT-wh-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newEvent: WebhookEvent = {
      id: eventId,
      timestamp: nowIso,
      eventType,
      targetUrl: target,
      httpStatus: 200,
      attempts: 1,
      signature,
      payload,
      deliveryStatus: 'DELIVERED',
      latencyMs: latency,
    };

    setWebhookLogs((prev) => [newEvent, ...prev.slice(0, 49)]);

    // Record in real-time HTTP Event Log as OUTGOING HTTP POST
    logHttpEvent({
      direction: 'OUTGOING',
      method: 'POST',
      url: target,
      source: 'Core Banking Webhook Dispatcher',
      destination: `Merchant Callback Listener (${target})`,
      eventType,
      status: 200,
      statusText: 'OK',
      headers: {
        'Host': target.replace(/^https?:\/\//, '').split('/')[0] || 'merchant-app.local',
        'Content-Type': 'application/json',
        'X-Bank-Signature': signature,
        'X-Bank-Event': eventType,
        'X-Bank-Delivery-Id': `DELIV-${Date.now()}`,
        'X-Bank-Timestamp': nowIso,
      },
      payload,
      response: {
        received: true,
        ackId: `ACK-MERCH-${Date.now().toString().slice(-6)}`,
        processedAt: nowIso,
      },
      signature,
      latencyMs: latency,
      deliveryStatus: 'DELIVERED',
      txReference: customRef,
    });

    return newEvent;
  }, [webhookSecret, webhookUrl, logHttpEvent]);

  // Step 1: Initiate Payment & Generate OTP
  const handleInitiatePayment = () => {
    if (transferAmount <= 0) {
      notify('Please enter a valid transfer amount greater than 0.', 'error');
      return;
    }

    const payer = accounts.find((a) => a.id === payerAccId);
    if (!payer || payer.availableBalance < transferAmount) {
      notify(`Insufficient funds in ${payer?.accountNumber || 'payer account'}.`, 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const idemp = `idemp_${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const payee = accounts.find((a) => a.id === payeeAccId);

      // 1. Log INCOMING HTTP POST request from checkout terminal to Core Banking Ledger API
      logHttpEvent({
        direction: 'INCOMING',
        method: 'POST',
        url: '/api/v1/ledger/transfers',
        source: 'Merchant Checkout Terminal (198.51.100.42)',
        destination: 'Core Banking Ledger API Engine',
        eventType: 'transfers.initiate',
        status: 200,
        statusText: 'OK',
        headers: {
          'Host': 'core-banking.internal.net',
          'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idemp,
          'User-Agent': 'NoIp-Fintech-Client/1.4',
          'X-Forwarded-For': '198.51.100.42',
        },
        payload: {
          payerAccount: payer.accountNumber,
          payeeAccount: payee?.accountNumber,
          amount: transferAmount,
          currency: 'USD',
          reference: paymentReference,
          memo: paymentNote,
        },
        response: {
          success: true,
          status: 'AWAITING_OTP',
          challenge: '2FA_IN_HOUSE_OTP',
          simulatedOtpCode: generatedOtp,
          expiresInSeconds: 180,
        },
        latencyMs: Math.floor(Math.random() * 15) + 14,
        deliveryStatus: 'DELIVERED',
        txReference: paymentReference,
      });

      // 2. Set OTP Challenge in state
      setSimulatedOtp(generatedOtp);
      setEnteredOtp(generatedOtp); // prefill for easy test simulation
      setFlowStep('OTP_CHALLENGE');
      setIsProcessing(false);

      // 3. Dispatch OUTGOING payment.initiated webhook
      dispatchWebhook(
        'payment.initiated',
        {
          event: 'payment.initiated',
          paymentId: `PAY-${Date.now()}`,
          reference: paymentReference,
          payerAccount: payer.accountNumber,
          payeeAccount: payee?.accountNumber,
          amount: transferAmount,
          currency: 'USD',
          status: 'AWAITING_OTP',
          otpExpirySeconds: 180,
        },
        undefined,
        paymentReference
      );

      notify(`Step 1 Complete: Inbound POST received. In-House OTP dispatched: ${generatedOtp}`, 'info');
    }, 400);
  };

  // Step 2: Verify OTP & Execute Double-Entry Instant Settlement
  const handleVerifyOtpAndSettle = () => {
    if (enteredOtp !== simulatedOtp) {
      notify('Invalid OTP code. Please enter the generated code.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const payer = accounts.find((a) => a.id === payerAccId);
      const payee = accounts.find((a) => a.id === payeeAccId);

      if (!payer || !payee) {
        setIsProcessing(false);
        return;
      }

      const txId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const nowIso = new Date().toISOString();
      const hash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Update Balances
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === payer.id) {
            return {
              ...acc,
              balance: Number((acc.balance - transferAmount).toFixed(2)),
              availableBalance: Number((acc.availableBalance - transferAmount).toFixed(2)),
            };
          }
          if (acc.id === payee.id) {
            return {
              ...acc,
              balance: Number((acc.balance + transferAmount).toFixed(2)),
              availableBalance: Number((acc.availableBalance + transferAmount).toFixed(2)),
            };
          }
          return acc;
        })
      );

      // Create Double-Entry Record
      const newEntry: LedgerEntry = {
        id: txId,
        timestamp: nowIso,
        txHash: hash,
        idempotencyKey: `idemp_${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reference: paymentReference,
        type: 'PAYMENT_SETTLEMENT',
        status: 'SETTLED',
        debitAccount: payer.accountNumber,
        creditAccount: payee.accountNumber,
        amount: transferAmount,
        currency: 'USD',
        description: paymentNote || 'Direct In-House Core Ledger Settlement (0% Commission)',
        metadata: {
          channel: 'IN_HOUSE_API',
          clientIp: '198.51.100.42',
          otpVerified: true,
          settlementSpeed: 'INSTANT_0s',
        },
      };

      setLedgerEntries((prev) => [newEntry, ...prev]);

      // 1. Log INCOMING HTTP POST: Verify OTP
      logHttpEvent({
        direction: 'INCOMING',
        method: 'POST',
        url: '/api/v1/payments/verify-otp',
        source: 'Customer 2FA Device (198.51.100.42)',
        destination: 'Core Banking Auth Vault',
        eventType: 'payments.verify_otp',
        status: 200,
        statusText: 'OK',
        headers: {
          'Host': 'core-banking.internal.net',
          'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
          'Content-Type': 'application/json',
          'X-Client-Signature': `auth_sig_${Math.random().toString(16).slice(2, 10)}`,
        },
        payload: {
          reference: paymentReference,
          otpCode: enteredOtp,
          verifiedAt: nowIso,
        },
        response: {
          verified: true,
          authStatus: 'AUTHORIZED',
          txHash: hash,
          ledgerId: txId,
          settlementSpeed: 'INSTANT_0s',
        },
        latencyMs: Math.floor(Math.random() * 14) + 14,
        deliveryStatus: 'DELIVERED',
        txReference: paymentReference,
      });

      // 2. Dispatch OUTGOING Webhooks: payment.otp_verified
      dispatchWebhook('payment.otp_verified', {
        event: 'payment.otp_verified',
        transactionId: txId,
        verifiedAt: nowIso,
        status: 'VERIFIED',
      }, undefined, paymentReference);

      // 3. Dispatch OUTGOING Webhooks: settlement.completed
      dispatchWebhook('settlement.completed', {
        event: 'settlement.completed',
        transactionId: txId,
        amount: transferAmount,
        currency: 'USD',
        payerAccount: payer.accountNumber,
        payeeAccount: payee.accountNumber,
        instantSettlement: true,
        thirdPartyGatewayFee: 0.0,
        netProceedsCredited: transferAmount,
        blockHash: hash,
        settledAt: nowIso,
      }, undefined, paymentReference);

      // 4. Dispatch OUTGOING internal audit sink event
      dispatchWebhook('ledger.debited' as any, {
        event: 'ledger.double_entry_committed',
        transactionId: txId,
        blockHash: hash,
        debitAccount: payer.accountNumber,
        creditAccount: payee.accountNumber,
        settlementSpeed: 'INSTANT_0s',
        clearingChannel: 'IN_HOUSE_API',
      }, 'https://audit-log.internal.bank/v1/events', paymentReference);

      setIsProcessing(false);
      setFlowStep('COMPLETED');
      notify(`✓ Instant Settlement Success! $${transferAmount.toFixed(2)} credited directly to ${payee.accountNumber}. Webhook dispatched.`, 'success');
    }, 450);
  };

  const handleResetFlow = () => {
    setFlowStep('INITIATE');
    setSimulatedOtp('');
    setEnteredOtp('');
    setPaymentReference(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Test Webhook Dispatch Trigger
  const handleTestWebhookDispatch = () => {
    const testTx = `TEST-TXN-${Date.now().toString().slice(-6)}`;
    dispatchWebhook('settlement.completed', {
      event: 'settlement.completed',
      testNotice: 'Simulated In-House Bank Webhook Ping',
      transactionId: testTx,
      amount: 99.0,
      currency: 'USD',
      payer: 'ACC-882109',
      receiver: 'ACC-990014',
      fee: 0.0,
      dispatchedBy: 'CoreBankingLedgerSimulator',
      timestamp: new Date().toISOString(),
    }, undefined, testTx);
    notify(`✓ Outbound Webhook event delivered to ${webhookUrl} with HMAC-SHA256 signature header.`, 'success');
  };

  // Simulation Handlers for Tab 3 & Console
  const handleSimulateInboundPost = () => {
    const idemp = `idemp_${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const randomAmount = Number((Math.random() * 450 + 50).toFixed(2));
    const ref = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    logHttpEvent({
      direction: 'INCOMING',
      method: 'POST',
      url: '/api/v1/ledger/transfers',
      source: 'Remote Merchant Storefront (203.0.113.19)',
      destination: 'Core Banking Ledger API',
      eventType: 'transfers.initiate',
      status: 200,
      statusText: 'OK',
      headers: {
        'Host': 'core-banking.internal.net',
        'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idemp,
        'User-Agent': 'NoIp-Checkout-SDK/2.1',
        'X-Forwarded-For': '203.0.113.19',
      },
      payload: {
        payerAccount: 'ACC-882109',
        payeeAccount: 'ACC-990014',
        amount: randomAmount,
        currency: 'USD',
        reference: ref,
        memo: 'Simulated Inbound Storefront Direct Checkout',
      },
      response: {
        success: true,
        paymentId: `PAY-${Date.now()}`,
        status: 'AWAITING_OTP',
        challenge: '2FA_IN_HOUSE_OTP',
        expiresInSeconds: 180,
      },
      latencyMs: Math.floor(Math.random() * 20) + 15,
      deliveryStatus: 'DELIVERED',
      txReference: ref,
    });

    notify(`✓ Recorded Inbound HTTP POST to /api/v1/ledger/transfers ($${randomAmount.toFixed(2)})`, 'success');
  };

  const handleSimulateOutboundWebhook = () => {
    handleTestWebhookDispatch();
  };

  const handleSimulateRetryFailover = () => {
    const ref = `RETRY-${Date.now().toString().slice(-4)}`;

    // First log a failed attempt (503)
    logHttpEvent({
      direction: 'OUTGOING',
      method: 'POST',
      url: webhookUrl,
      source: 'Core Banking Webhook Dispatcher',
      destination: `Merchant Callback Listener (${webhookUrl})`,
      eventType: 'settlement.completed',
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Host': webhookUrl.replace(/^https?:\/\//, '').split('/')[0] || 'merchant-app.local',
        'Content-Type': 'application/json',
        'X-Bank-Signature': simulateHmacSha256(webhookSecret, 'failover_sim'),
        'X-Delivery-Attempt': '1 of 3',
      },
      payload: {
        event: 'settlement.completed',
        notice: 'First attempt simulate network glitch',
        retryInSeconds: 2,
      },
      response: {
        error: 'Connection reset by peer / gateway timeout',
      },
      latencyMs: 142,
      deliveryStatus: 'RETRYING',
      retryCount: 1,
      txReference: ref,
    });

    notify('⚠️ First delivery attempt returned HTTP 503. Initiating automated retry with exponential backoff...', 'error');

    // After 800ms simulate the successful retry (200 OK)
    setTimeout(() => {
      logHttpEvent({
        direction: 'OUTGOING',
        method: 'POST',
        url: webhookUrl,
        source: 'Core Banking Webhook Dispatcher (Retry Worker)',
        destination: `Merchant Callback Listener (${webhookUrl})`,
        eventType: 'settlement.completed',
        status: 200,
        statusText: 'OK',
        headers: {
          'Host': webhookUrl.replace(/^https?:\/\//, '').split('/')[0] || 'merchant-app.local',
          'Content-Type': 'application/json',
          'X-Bank-Signature': simulateHmacSha256(webhookSecret, 'failover_sim_ok'),
          'X-Delivery-Attempt': '2 of 3 (Successful Recovery)',
        },
        payload: {
          event: 'settlement.completed',
          retrySuccessful: true,
          acknowledged: true,
        },
        response: {
          received: true,
          ackId: `ACK-RETRY-${Date.now().toString().slice(-6)}`,
        },
        latencyMs: 38,
        deliveryStatus: 'DELIVERED',
        retryCount: 2,
        txReference: ref,
      });
      notify('✓ Webhook retry attempt #2 succeeded with HTTP 200 OK.', 'success');
    }, 850);
  };

  const handleRetrySingleEvent = (event: HttpEventLog) => {
    notify(`Re-dispatching webhook ${event.id} to ${event.url}...`, 'info');
    setTimeout(() => {
      logHttpEvent({
        direction: 'OUTGOING',
        method: 'POST',
        url: event.url,
        source: 'Core Banking Webhook Dispatcher (Manual Replay)',
        destination: event.destination,
        eventType: event.eventType,
        status: 200,
        statusText: 'OK',
        headers: {
          ...event.headers,
          'X-Manual-Replay': 'true',
          'X-Replay-Timestamp': new Date().toISOString(),
        },
        payload: event.payload,
        response: {
          received: true,
          replayed: true,
          ackId: `ACK-REPLAY-${Date.now().toString().slice(-6)}`,
        },
        signature: event.signature,
        latencyMs: Math.floor(Math.random() * 25) + 20,
        deliveryStatus: 'DELIVERED',
        txReference: event.txReference,
      });
      notify(`✓ Webhook replay delivered successfully (200 OK)!`, 'success');
    }, 400);
  };

  const handleClearLogs = () => {
    setHttpLogs([]);
    setWebhookLogs([]);
    notify('Cleared all HTTP event logs.', 'info');
  };

  const handleResetLogs = () => {
    setHttpLogs(INITIAL_HTTP_LOGS);
    setWebhookSearchFilter('');
    notify('Reset HTTP event logs to default seed stream.', 'success');
  };

  const handleViewWebhookForTx = (referenceOrId: string) => {
    setWebhookSearchFilter(referenceOrId);
    setActiveTab('webhooks');
    notify(`Filtered Webhook Event Log for "${referenceOrId}".`, 'info');
  };

  const handleSimulateReversal = (entry: LedgerEntry) => {
    if (entry.type === 'REVERSAL') {
      notify('This transaction is already a reversal entry.', 'error');
      return;
    }

    const nowIso = new Date().toISOString();
    const revId = `TXN-REV-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const revHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const revRef = `REV-${entry.reference}`;

    // 1. Log Inbound HTTP POST request: POST /api/v1/ledger/reversals
    logHttpEvent({
      direction: 'INCOMING',
      method: 'POST',
      url: '/api/v1/ledger/reversals',
      source: 'Merchant Dispute Portal (198.51.100.42)',
      destination: 'Core Banking Reversal Engine',
      eventType: 'ledger.reversal_initiated',
      status: 200,
      statusText: 'OK',
      headers: {
        'Host': 'core-banking.internal.net',
        'Authorization': 'Bearer bank_sec_live_99a8b7c6d5e4f3a2b1',
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `idemp_rev_${Date.now()}`,
      },
      payload: {
        originalTransactionId: entry.id,
        amount: entry.amount,
        currency: entry.currency,
        reason: 'Customer direct dispute resolution & settlement reversal',
        reference: revRef,
      },
      response: {
        success: true,
        reversalTransactionId: revId,
        status: 'REVERSED',
        reversedHash: revHash,
        settlementSpeed: 'INSTANT_0s',
      },
      latencyMs: Math.floor(Math.random() * 15) + 16,
      deliveryStatus: 'DELIVERED',
      txReference: revRef,
    });

    // 2. Add Reversal Ledger Entry (swap debit and credit accounts)
    const reversalEntry: LedgerEntry = {
      id: revId,
      timestamp: nowIso,
      txHash: revHash,
      idempotencyKey: `idemp_rev_${Date.now()}`,
      reference: revRef,
      type: 'REVERSAL',
      status: 'SETTLED',
      debitAccount: entry.creditAccount, // Debited from previous payee
      creditAccount: entry.debitAccount, // Credited back to previous payer
      amount: entry.amount,
      currency: entry.currency,
      description: `Double-Entry Reversal for ${entry.id} (${entry.reference})`,
      metadata: {
        channel: 'IN_HOUSE_API',
        clientIp: '198.51.100.42',
        otpVerified: true,
        settlementSpeed: 'INSTANT_0s',
      },
    };

    setLedgerEntries((prev) => [reversalEntry, ...prev]);

    // 3. Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.accountNumber === entry.debitAccount) {
          return {
            ...acc,
            balance: Number((acc.balance + entry.amount).toFixed(2)),
            availableBalance: Number((acc.availableBalance + entry.amount).toFixed(2)),
          };
        }
        if (acc.accountNumber === entry.creditAccount) {
          return {
            ...acc,
            balance: Number((acc.balance - entry.amount).toFixed(2)),
            availableBalance: Number((acc.availableBalance - entry.amount).toFixed(2)),
          };
        }
        return acc;
      })
    );

    // 4. Dispatch OUTGOING Webhook for refund.processed
    dispatchWebhook(
      'settlement.completed',
      {
        event: 'refund.processed',
        action: 'LEDGER_REVERSAL',
        originalTransactionId: entry.id,
        reversalTransactionId: revId,
        refundedAmount: entry.amount,
        currency: entry.currency,
        refundedPayerAccount: entry.debitAccount,
        debitedPayeeAccount: entry.creditAccount,
        settledAt: nowIso,
        status: 'REFUND_SETTLED',
      },
      undefined,
      revRef
    );

    notify(`✓ Reversal processed: $${entry.amount.toFixed(2)} refunded. Incoming POST & Outbound Webhook logged!`, 'success');
  };

  // Export Ledger to CSV
  const handleExportLedgerCsv = () => {
    const headers = [
      'Transaction ID',
      'Timestamp (ISO)',
      'Reference',
      'Type',
      'Status',
      'Debit Account',
      'Credit Account',
      'Amount',
      'Currency',
      'SHA256 Block Hash',
      'Description',
      'Channel',
      'Settlement Speed',
    ];

    const rows = ledgerEntries.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.reference}"`,
      `"${e.type}"`,
      `"${e.status}"`,
      `"${e.debitAccount}"`,
      `"${e.creditAccount}"`,
      e.amount,
      `"${e.currency}"`,
      `"${e.txHash}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.metadata.channel}"`,
      `"${e.metadata.settlementSpeed}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core-banking-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notify(`✓ Exported ${ledgerEntries.length} double-entry ledger transactions as CSV.`, 'success');
  };

  // Export Ledger to JSON
  const handleExportLedgerJson = () => {
    const dataStr = JSON.stringify(
      {
        system: 'No-IP Core Banking Mock Ledger & In-House Webhook Dispatcher',
        exportDate: new Date().toISOString(),
        totalTransactions: ledgerEntries.length,
        accounts: accounts.map((a) => ({
          accountNumber: a.accountNumber,
          accountName: a.accountName,
          balance: a.balance,
          currency: a.currency,
        })),
        transactions: ledgerEntries,
      },
      null,
      2
    );

    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `core-banking-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notify('✓ Exported ledger statement as JSON.', 'success');
  };

  return (
    <div id="core-banking-ledger-studio" className="rounded-3xl border border-slate-800 bg-slate-900/90 text-slate-100 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Top Banner Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>In-House Fintech Architecture • 0% Third-Party Gateway Fee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Core Banking Mock Ledger & Webhook Dispatcher</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Direct Core Banking integration without relying on external payment gateways. Run atomic double-entry ledger transactions, simulate in-house 2FA/OTP verification, and dispatch cryptographic HMAC-SHA256 webhooks for instant settlement.
            </p>
          </div>

          {/* Quick Stat Pill Widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Balance</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ${accounts[1].balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 block">Merchant Vault</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Time</span>
              <span className="text-lg font-mono font-bold text-[#ff914d]">0s (Instant)</span>
              <span className="text-[10px] text-slate-400 block">No 3P Escrow Hold</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Commission Fee</span>
              <span className="text-lg font-mono font-bold text-sky-400">0.00%</span>
              <span className="text-[10px] text-slate-400 block">Direct API Bridge</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'console'
                ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Simulator & Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Double-Entry General Ledger ({ledgerEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhooks')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'webhooks'
                ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Webhook Event Log ({httpLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Integration SDK & API Endpoints</span>
          </button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedbackNotice && (
        <div
          className={`mx-6 mt-4 p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : feedbackNotice.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              : 'bg-sky-950/80 border-sky-500/40 text-sky-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : feedbackNotice.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{feedbackNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: INTERACTIVE PAYMENT SIMULATOR & SANDBOX */}
      {activeTab === 'console' && (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Top Account Balances Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{acc.accountNumber}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      acc.type === 'MERCHANT_SETTLEMENT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : acc.type === 'CUSTOMER_CHECKING'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {acc.type.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 truncate" title={acc.accountName}>
                  {acc.accountName}
                </h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-mono font-extrabold text-white">
                    ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">{acc.currency}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Avail: ${acc.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="font-mono text-emerald-500">Routing: {acc.routingCode}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Flow Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#ff6600]" />
                    <span>In-House Direct Payment & Settlement Terminal</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test the complete flow from customer checkout to OTP challenge and instant ledger settlement.
                  </p>
                </div>
                {flowStep === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={handleResetFlow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Transfer</span>
                  </button>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    flowStep === 'INITIATE'
                      ? 'bg-[#ff6600]/20 border-[#ff6600] text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">1</span>
                  <span>Initiate</span>
                </div>
                <span className="text-slate-600">→</span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    flowStep === 'OTP_CHALLENGE'
                      ? 'bg-[#ff6600]/20 border-[#ff6600] text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">2</span>
                  <span>2FA OTP</span>
                </div>
                <span className="text-slate-600">→</span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    flowStep === 'COMPLETED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">3</span>
                  <span>Settled (0s)</span>
                </div>
              </div>

              {/* Step 1: Form */}
              {flowStep === 'INITIATE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Debit (From Payer)</label>
                      <select
                        value={payerAccId}
                        onChange={(e) => setPayerAccId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#ff6600]"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.accountNumber} - {a.accountName} (${a.availableBalance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Credit (To Payee)</label>
                      <select
                        value={payeeAccId}
                        onChange={(e) => setPayeeAccId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#ff6600]"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.accountNumber} - {a.accountName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#ff6600]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Invoice / Order Reference</label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#ff6600]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Payment Memo / Reason</label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#ff6600]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-[#ff6600] hover:bg-[#e05a00] text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Step 1: Initiate Payment & Generate OTP Challenge</span>
                  </button>
                </div>
              )}

              {/* Step 2: OTP Challenge */}
              {flowStep === 'OTP_CHALLENGE' && (
                <div className="space-y-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">In-House 2FA OTP Authentication</h4>
                      <p className="text-xs text-slate-400">
                        Zero third-party SMS dependency. Proprietary token dispatched via encrypted API push:
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Dispatched OTP Code (Simulated):</span>
                      <span className="text-xl font-mono font-extrabold text-amber-400 tracking-widest">{simulatedOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(simulatedOtp, 'otp-code')}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 cursor-pointer"
                    >
                      {copiedId === 'otp-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Enter 6-Digit Authorization Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base font-mono text-center tracking-widest text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyOtpAndSettle}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Step 2: Verify OTP & Execute Instant Settlement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlowStep('INITIATE')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Completed */}
              {flowStep === 'COMPLETED' && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-bold text-white">Payment Settled Immediately!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    The transaction was committed to the double-entry general ledger with 0s settlement latency. Real-time HMAC-SHA256 webhooks were dispatched to the merchant callback endpoint.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ledger')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      View Ledger Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('webhooks')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      View Dispatched Webhook
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Architecture Card */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Why Direct Core Banking Integration?</span>
              </h4>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">1. Full Control (Zero Intermediaries)</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Transactions process directly through your own core server and ledger. No 2.9% + $0.30 third-party merchant fees, chargeback middlemen, or payout holds.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400 block">2. Real-Time Settlement & Instant Payouts</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Funds land directly in your internal account balance immediately upon OTP verification. No T+2 or T+7 delayed settlement windows.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-purple-400 block">3. Cryptographic Webhook Dispatching</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Every ledger mutation signs an HMAC-SHA256 payload with a shared secret to notify your e-commerce or SaaS microservices securely.
                  </p>
                </div>
              </div>

              {/* Live Webhook & Inbound HTTP Activity Quick Stream */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      Live HTTP Activity Stream
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('webhooks')}
                    className="text-[11px] text-[#ff914d] hover:text-[#ff6600] font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <span>Full Log ({httpLogs.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {httpLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setActiveTab('webhooks')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-[11px] gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {log.direction === 'INCOMING' ? (
                          <span className="p-1 rounded bg-sky-500/20 text-sky-400 shrink-0" title="Incoming HTTP POST">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0" title="Outgoing Webhook POST">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{log.eventType}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                              {log.direction === 'INCOMING' ? 'IN' : 'OUT'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" title={log.url}>
                            {log.url}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span className="text-[10px] text-slate-400">{log.latencyMs}ms</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.status < 400
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold">Test Webhook Trigger:</span>
                <button
                  type="button"
                  onClick={handleTestWebhookDispatch}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Send Ping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOUBLE-ENTRY GENERAL LEDGER TABLE */}
      {activeTab === 'ledger' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Double-Entry General Ledger (GL) Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every transaction contains immutable debit and credit legs with cryptographic block hashes and idempotency safeguards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportLedgerCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer border border-slate-700"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportLedgerJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer border border-slate-700"
              >
                <FileJson className="w-3.5 h-3.5 text-sky-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                  <th className="py-3 px-4">TX ID & Hash</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Debit Account</th>
                  <th className="py-3 px-4">Credit Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">HTTP Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {ledgerEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{e.id}</div>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[140px]" title={e.txHash}>
                        {e.txHash.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                        {e.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-rose-400 font-semibold">{e.debitAccount}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-semibold">{e.creditAccount}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-white">
                      ${e.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          e.status === 'SETTLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px] max-w-xs truncate" title={e.description}>
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => handleViewWebhookForTx(e.reference || e.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-all cursor-pointer"
                          title="View related incoming and outgoing HTTP POST requests"
                        >
                          <Radio className="w-3 h-3 text-emerald-400" />
                          <span>Logs</span>
                        </button>

                        {e.type !== 'REVERSAL' && e.status === 'SETTLED' && (
                          <button
                            type="button"
                            onClick={() => handleSimulateReversal(e)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[10px] font-bold border border-rose-800/40 transition-all cursor-pointer"
                            title="Simulate Inbound Reversal POST & Outbound Refund Webhook"
                          >
                            <Undo2 className="w-3 h-3" />
                            <span>Reverse POST</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME WEBHOOK & HTTP EVENT LOG */}
      {activeTab === 'webhooks' && (
        <div className="p-6 sm:p-8 space-y-6">
          <WebhookEventLogViewer
            logs={httpLogs}
            onClearLogs={handleClearLogs}
            onResetLogs={handleResetLogs}
            onSimulateInboundPost={handleSimulateInboundPost}
            onSimulateOutboundWebhook={handleSimulateOutboundWebhook}
            onSimulateRetryFailover={handleSimulateRetryFailover}
            onRetrySingleEvent={handleRetrySingleEvent}
            webhookUrl={webhookUrl}
            webhookSecret={webhookSecret}
            onUpdateWebhookUrl={setWebhookUrl}
            onUpdateWebhookSecret={setWebhookSecret}
            searchFilter={webhookSearchFilter}
            onSearchFilterChange={setWebhookSearchFilter}
          />
        </div>
      )}

      {/* TAB 4: INTEGRATION SDK & REST ENDPOINTS */}
      {activeTab === 'code' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-sky-400" />
              <span>Fintech API Endpoints & Developer Integration</span>
            </h3>
            <p className="text-xs text-slate-400">
              Integrate your own banking bridge in Node.js, Python, or cURL without third-party commission fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              onClick={() => setSelectedEndpoint('transfers')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedEndpoint === 'transfers'
                  ? 'bg-slate-800/90 border-[#ff6600]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  POST
                </span>
                <span className="text-[10px] text-slate-400">Direct Bridge</span>
              </div>
              <span className="font-mono text-xs font-bold text-white block">/api/v1/ledger/transfers</span>
              <p className="text-[11px] text-slate-400 mt-1">Initiate double-entry transfer with Idempotency Key.</p>
            </div>

            <div
              onClick={() => setSelectedEndpoint('verifyOtp')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedEndpoint === 'verifyOtp'
                  ? 'bg-slate-800/90 border-[#ff6600]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  POST
                </span>
                <span className="text-[10px] text-slate-400">2FA Security</span>
              </div>
              <span className="font-mono text-xs font-bold text-white block">/api/v1/payments/verify-otp</span>
              <p className="text-[11px] text-slate-400 mt-1">Validate in-house OTP token & release settlement.</p>
            </div>

            <div
              onClick={() => setSelectedEndpoint('balance')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedEndpoint === 'balance'
                  ? 'bg-slate-800/90 border-[#ff6600]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  GET
                </span>
                <span className="text-[10px] text-slate-400">Real-time</span>
              </div>
              <span className="font-mono text-xs font-bold text-white block">/api/v1/ledger/balance</span>
              <p className="text-[11px] text-slate-400 mt-1">Query available and locked ledger reserves.</p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span className="text-white font-semibold">Node.js / Express Core Banking Client Sample</span>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    `// In-House Core Banking Transfer Integration
import axios from 'axios';
import crypto from 'crypto';

const BANK_URL = 'https://core-banking.internal.net';
const SECRET_KEY = 'whsec_inhouse_bank_live_99a8b7c6d5e4f3a2b1';

export async function executeDirectTransfer(payerAcc, payeeAcc, amount, idempotencyKey) {
  const payload = {
    payerAccount: payerAcc,
    payeeAccount: payeeAcc,
    amount: amount,
    currency: 'USD',
    reference: 'INV-' + Date.now(),
    instantSettlement: true
  };

  const response = await axios.post(\`\${BANK_URL}/api/v1/ledger/transfers\`, payload, {
    headers: {
      'Authorization': 'Bearer bank_sec_live_token',
      'X-Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}`,
                    'code-sample'
                  )
                }
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                {copiedId === 'code-sample' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-5 text-slate-300 overflow-x-auto leading-relaxed">
{`// In-House Core Banking Direct Transfer Integration
import axios from 'axios';
import crypto from 'crypto';

const BANK_URL = 'https://core-banking.internal.net';
const SECRET_KEY = 'whsec_inhouse_bank_live_99a8b7c6d5e4f3a2b1';

export async function executeDirectTransfer(payerAcc, payeeAcc, amount, idempotencyKey) {
  const payload = {
    payerAccount: payerAcc,
    payeeAccount: payeeAcc,
    amount: amount,
    currency: 'USD',
    reference: 'INV-' + Date.now(),
    instantSettlement: true
  };

  const response = await axios.post(\`\${BANK_URL}/api/v1/ledger/transfers\`, payload, {
    headers: {
      'Authorization': 'Bearer bank_sec_live_token',
      'X-Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Webhook JSON Inspection Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Webhook Payload Inspector</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">[{selectedWebhook.eventType}]</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWebhook(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block">HTTP Signature Header:</span>
                <span className="text-emerald-400 break-all">{selectedWebhook.signature}</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-72 overflow-y-auto text-slate-300">
                <pre>{JSON.stringify(selectedWebhook.payload, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => copyText(JSON.stringify(selectedWebhook.payload, null, 2), 'modal-payload')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
              >
                {copiedId === 'modal-payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWebhook(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
