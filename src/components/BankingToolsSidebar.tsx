import React, { useState, useMemo } from 'react';
import {
  Building2,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  Send,
  CheckCircle2,
  Code,
  Copy,
  Check,
  Download,
  Key,
  Lock,
  Radio,
  FileSpreadsheet,
  FileJson,
  Zap,
  RotateCcw,
  Sparkles,
  Search,
  ChevronRight,
  X,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BankingToolsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPortChecker?: () => void;
  onOpenDnsLookup?: () => void;
  onOpenDucSimulator?: () => void;
  onOpenDomainSearch?: () => void;
}

interface BankingProgram {
  id: string;
  letter: string;
  title: string;
  titleBn: string;
  category: 'TRANSACTIONS' | 'LEDGER' | 'WEBHOOKS' | 'SECURITY' | 'DEVELOPER';
  description: string;
  icon: React.ReactNode;
  badge: string;
  action: () => void;
  actionLabel: string;
}

export const BankingToolsSidebar: React.FC<BankingToolsSidebarProps> = ({
  isOpen,
  onClose,
  onOpenPortChecker,
  onOpenDnsLookup,
  onOpenDucSimulator,
  onOpenDomainSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Sample Account quick state
  const accountsSummary = [
    {
      name: 'Customer Checking',
      nameBn: 'গ্রাহক চেকিং হিসাব',
      accountNumber: 'ACC-882109',
      balance: '$12,450.00',
      type: 'Personal',
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    {
      name: 'Merchant Settlement Vault',
      nameBn: 'মার্চেন্ট সেটেলমেন্ট ভল্ট',
      accountNumber: 'ACC-990014',
      balance: '$84,210.50',
      type: 'Merchant (0% Fee)',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      name: 'Central Reserve Vault',
      nameBn: 'কেন্দ্রীয় রিজার্ভ ভল্ট',
      accountNumber: 'ACC-001000',
      balance: '$500,000.00',
      type: 'Treasury Capital',
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
    {
      name: 'Fee Clearing Account',
      nameBn: 'ফি ক্লিয়ারিং একাউন্ট',
      accountNumber: 'ACC-002000',
      balance: '$1,850.00',
      type: 'Internal Clearing',
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const dispatchBankingAction = (
    action: 'switch_tab' | 'export_csv' | 'export_json',
    tab?: 'console' | 'ledger' | 'webhooks' | 'code'
  ) => {
    // Scroll to the core banking ledger component
    const el = document.getElementById('core-banking-ledger-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    // Dispatch event to simulator
    window.dispatchEvent(
      new CustomEvent('core-banking-action', {
        detail: { action, tab },
      })
    );
    if (!isPinned && window.innerWidth < 1024) {
      onClose();
    }
  };

  const generateNewIdempotencyKey = () => {
    const key = `idemp_${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    setGeneratedKey(key);
    navigator.clipboard.writeText(key);
    setTimeout(() => setGeneratedKey(null), 3500);
  };

  // Comprehensive A to Z Banking Programs List
  const bankingPrograms: BankingProgram[] = useMemo(() => {
    return [
      {
        id: 'prog-a',
        letter: 'A',
        title: 'Account Balances & Liquidity',
        titleBn: 'অ্যাকাউন্ট ব্যালেন্স ও লিকুইডিটি অনুসন্ধান',
        category: 'TRANSACTIONS',
        description: 'রিয়েল-টাইম ব্যালেন্স, রিজার্ভ ক্যাপিটাল এবং উপলব্ধ ক্লিয়ারিং ফান্ড নিরীক্ষণ।',
        icon: <Wallet className="w-4 h-4 text-emerald-400" />,
        badge: 'Balances',
        actionLabel: 'Check Balances',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-b',
        letter: 'B',
        title: 'Biometric 2FA & OTP Clearance',
        titleBn: 'বায়োমেট্রিক ও ওটিপি ভেরিফিকেশন',
        category: 'SECURITY',
        description: 'উচ্চমূল্যের লেনদেনের জন্য সিকিউর ওটিপি ও 2FA অনুমোদন পরীক্ষা করুন।',
        icon: <Lock className="w-4 h-4 text-amber-400" />,
        badge: 'Security',
        actionLabel: 'Test 2FA OTP',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-c',
        letter: 'C',
        title: 'Core Direct Settlement Engine',
        titleBn: 'কোর ডাইরেক্ট সেটেলমেন্ট ইঞ্জিন',
        category: 'TRANSACTIONS',
        description: 'কোনো তৃতীয় পক্ষ ছাড়াই তাৎক্ষণিক ০ সেকেন্ডে ব্যাংক থেকে ব্যাংকে সরাসরি স্থানান্তর।',
        icon: <Zap className="w-4 h-4 text-[#ff6600]" />,
        badge: '0s Instant',
        actionLabel: 'Execute Settle',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-d',
        letter: 'D',
        title: 'Double-Entry General Ledger',
        titleBn: 'ডাবল-এন্ট্রি জেনারেল লেজার বুক',
        category: 'LEDGER',
        description: 'আন্তর্জাতিক মানসম্মত ব্যালেন্সড ডেবিট ও ক্রেডিট জার্নাল এন্ট্রি রেকর্ড।',
        icon: <Building2 className="w-4 h-4 text-blue-400" />,
        badge: 'Immutable',
        actionLabel: 'View General Ledger',
        action: () => dispatchBankingAction('switch_tab', 'ledger'),
      },
      {
        id: 'prog-e',
        letter: 'E',
        title: 'Export Financial Statements',
        titleBn: 'আর্থিক স্টেটমেন্ট ডাউনলোড (CSV / JSON)',
        category: 'LEDGER',
        description: 'অডিটর ও ট্যাক্স কমপ্লায়েন্সের জন্য ক্রিপ্টোগ্রাফিক হ্যাশযুক্ত লেজার ডাউনলোড।',
        icon: <Download className="w-4 h-4 text-cyan-400" />,
        badge: 'CSV / JSON',
        actionLabel: 'Export Statement',
        action: () => dispatchBankingAction('export_csv'),
      },
      {
        id: 'prog-f',
        letter: 'F',
        title: 'Flow Telemetry (Last 5 Settlements)',
        titleBn: 'লাস্ট ৫টি লেনদেনের লাইভ ফ্লো ভিউয়ার',
        category: 'LEDGER',
        description: 'প্রেরক থেকে প্রাপকের অ্যাকাউন্টে সরাসরি লেনদেনের ভিজ্যুয়াল আর্কিটেকচার।',
        icon: <ArrowRightLeft className="w-4 h-4 text-emerald-400" />,
        badge: 'Live Flow',
        actionLabel: 'View Flow Summary',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-g',
        letter: 'G',
        title: 'Gateway-Free Interbank Bridge',
        titleBn: 'গেটওয়ে-মুক্ত সরাসরি ইন্টারব্যাংক ব্রিজ',
        category: 'TRANSACTIONS',
        description: 'স্ট্রাইপ বা পেপ্যালের মতো ৩-৫% ফি প্রদান না করে ০% কমিশনে ইন-হাউস সেটেলমেন্ট।',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
        badge: '0% Fees',
        actionLabel: 'Open Bridge',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-h',
        letter: 'H',
        title: 'HMAC-SHA256 Signature Verification',
        titleBn: 'এইচএমএসি সিগনেচার ও সিক্রেট কি',
        category: 'SECURITY',
        description: 'ওয়েবহুক পেলোড জালিয়াতি রোধে ক্রিপ্টোগ্রাফিক সাইনিং সিক্রেট ভেরিফাই করুন।',
        icon: <Key className="w-4 h-4 text-purple-400" />,
        badge: 'HMAC-256',
        actionLabel: 'Inspect Signature',
        action: () => dispatchBankingAction('switch_tab', 'webhooks'),
      },
      {
        id: 'prog-i',
        letter: 'I',
        title: 'Idempotency Key Generator & Protection',
        titleBn: 'আইডেম্পোটেন্সি কী ও ডাবল-পেমেন্ট প্রতিরোধ',
        category: 'DEVELOPER',
        description: 'নেটওয়ার্ক রিট্রাইয়ের সময় গ্রাহকের একই টাকা যেন দুবার না কাটে তার নিরাপত্তা।',
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        badge: 'RFC-4122',
        actionLabel: 'Generate Key',
        action: generateNewIdempotencyKey,
      },
      {
        id: 'prog-j',
        letter: 'J',
        title: 'JSON REST Endpoints & Developer SDK',
        titleBn: 'জেসন রেস্ট এপিআই ও ক্লায়েন্ট এসডিকে',
        category: 'DEVELOPER',
        description: 'সরাসরি এপিআই কল করার জন্য cURL, Python এবং Node.js কোড স্নিপেট।',
        icon: <Code className="w-4 h-4 text-sky-400" />,
        badge: 'REST API',
        actionLabel: 'Open API SDK',
        action: () => dispatchBankingAction('switch_tab', 'code'),
      },
      {
        id: 'prog-k',
        letter: 'K',
        title: 'KYC & Automated Fraud Risk Scoring',
        titleBn: 'কেওয়াইসি ও অ্যান্টি-ফ্রড প্রটেকশন',
        category: 'SECURITY',
        description: 'আইপি লোকেশন, প্রক্সি ডিটেকশন ও রিয়েল-টাইম ফ্রড স্কোরিং (স্কোর: ০/১০০)।',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        badge: 'Fraud Shield',
        actionLabel: 'View Security Rules',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-l',
        letter: 'L',
        title: 'Liquidity Reserve Allocation',
        titleBn: 'লিকুইডিটি রিজার্ভ ও ক্যাপিটাল ব্যালেন্সিং',
        category: 'TRANSACTIONS',
        description: 'মার্চেন্ট সেটেলমেন্ট থেকে মূল সেন্ট্রাল রিজার্ভ ভল্টে ফান্ড রিলোকেশন।',
        icon: <Layers className="w-4 h-4 text-violet-400" />,
        badge: 'Treasury',
        actionLabel: 'Manage Reserve',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-r',
        letter: 'R',
        title: 'Reversal & Dispute Compensation Engine',
        titleBn: 'তাত্ক্ষণিক রিভার্সাল ও রিফান্ড ম্যানেজমেন্ট',
        category: 'TRANSACTIONS',
        description: 'ভুল লেনদেন বা বিরোধপূর্ণ অর্ডারের জন্য স্বয়ংক্রিয় ক্ষতিপূরণমূলক রিভার্সাল।',
        icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
        badge: 'Reversals',
        actionLabel: 'Test Reversal',
        action: () => dispatchBankingAction('switch_tab', 'console'),
      },
      {
        id: 'prog-w',
        letter: 'W',
        title: 'Webhook Event Dispatcher & Listener',
        titleBn: 'ওয়েবহুক ইভেন্ট ডিসপ্যাচার ও অডিট লগ',
        category: 'WEBHOOKS',
        description: 'ইনকামিং ও আউটগোয়িং এইচটিটিপি পোস্ট রিকোয়েস্ট ও রিট্রাই মেকানিজম নিরীক্ষণ।',
        icon: <Radio className="w-4 h-4 text-emerald-400" />,
        badge: 'Live Stream',
        actionLabel: 'Open Webhook Log',
        action: () => dispatchBankingAction('switch_tab', 'webhooks'),
      },
      {
        id: 'prog-z',
        letter: 'Z',
        title: 'Zero-Fee Anycast Network Health',
        titleBn: 'জিরো-ফি এনিকাস্ট নেটওয়ার্ক মনিটর',
        category: 'DEVELOPER',
        description: 'গ্লোবাল ১৫০+ ডেটাসেন্টার সংযোগ, ডিএনএস লেটেন্সি এবং আপটাইম স্থিতি।',
        icon: <Activity className="w-4 h-4 text-emerald-400" />,
        badge: '100% Uptime',
        actionLabel: 'Check Network',
        action: () => {
          document.getElementById('network-status-section')?.scrollIntoView({ behavior: 'smooth' });
          if (!isPinned && window.innerWidth < 1024) onClose();
        },
      },
    ];
  }, [isPinned, onClose]);

  // Filtered programs based on search and category
  const filteredPrograms = useMemo(() => {
    return bankingPrograms.filter((prog) => {
      const matchesCategory = selectedCategory === 'ALL' || prog.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prog.title.toLowerCase().includes(q) ||
        prog.titleBn.toLowerCase().includes(q) ||
        prog.letter.toLowerCase() === q ||
        prog.description.toLowerCase().includes(q) ||
        prog.badge.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [bankingPrograms, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (visible on mobile / unpinned mode) */}
      {!isPinned && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar Panel */}
      <aside
        id="banking-tools-sidebar"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col transition-transform duration-200 animate-in slide-in-from-right-full ${
          isPinned ? 'shadow-slate-950/80 ring-1 ring-emerald-500/20' : ''
        }`}
        role="dialog"
        aria-label="Core Banking A-Z Programs Sidebar"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6600] to-emerald-600 flex items-center justify-center shadow-lg shadow-orange-500/10 text-white font-black text-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>Banking Programs</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    A-Z Tools
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                কোর ব্যাংকিং এ টু জেড প্রোগ্রাম ও টুলস ডিরেক্টরি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin / Dock button */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                isPinned
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isPinned ? 'Unpin Sidebar (Floating Mode)' : 'Pin Sidebar to Workspace'}
            >
              {isPinned ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Close Banking Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Key Generator Alert / Feedback Notification */}
        {generatedKey && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">New Idempotency Key Copied!</span>
                <span className="font-mono text-[10px] text-emerald-200">{generatedKey}</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-bold">RFC 4122</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {/* Quick Account Balances Hub */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Account Balances (৪টি হিসাব)</span>
              </span>
              <button
                type="button"
                onClick={() => dispatchBankingAction('switch_tab', 'console')}
                className="text-[11px] text-[#ff6600] hover:text-[#ff914d] font-semibold cursor-pointer"
              >
                View in Console →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {accountsSummary.map((acc) => (
                <div
                  key={acc.accountNumber}
                  className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                      {acc.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.accountNumber, acc.accountNumber)}
                      className="text-slate-500 hover:text-white p-1 rounded cursor-pointer transition-colors"
                      title={`Copy ${acc.accountNumber}`}
                    >
                      {copiedAccount === acc.accountNumber ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="text-sm font-mono font-black text-white">
                    {acc.balance}
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400 font-medium">{acc.accountNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${acc.color}`}>
                      {acc.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Shortcuts Ribbon */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ff6600]" />
              <span>Fast Actions • তাত্ক্ষণিক অ্যাকশন বাটন</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => dispatchBankingAction('switch_tab', 'console')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#ff6600] text-slate-200 hover:text-white border border-slate-700/60 hover:border-orange-500 text-center transition-all cursor-pointer group"
              >
                <Send className="w-4 h-4 mx-auto mb-1 text-[#ff6600] group-hover:text-white transition-colors" />
                <span className="text-[11px] font-bold block">New Transfer</span>
                <span className="text-[9px] text-slate-400 group-hover:text-white/80 block">0s Instant</span>
              </button>

              <button
                type="button"
                onClick={() => dispatchBankingAction('switch_tab', 'ledger')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700/60 hover:border-emerald-500 text-center transition-all cursor-pointer group"
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-400 group-hover:text-white transition-colors" />
                <span className="text-[11px] font-bold block">Full Ledger</span>
                <span className="text-[9px] text-slate-400 group-hover:text-white/80 block">Double-Entry</span>
              </button>

              <button
                type="button"
                onClick={() => dispatchBankingAction('switch_tab', 'webhooks')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-600 text-slate-200 hover:text-white border border-slate-700/60 hover:border-purple-500 text-center transition-all cursor-pointer group"
              >
                <Radio className="w-4 h-4 mx-auto mb-1 text-purple-400 group-hover:text-white transition-colors" />
                <span className="text-[11px] font-bold block">Webhooks</span>
                <span className="text-[9px] text-slate-400 group-hover:text-white/80 block">Event Stream</span>
              </button>

              <button
                type="button"
                onClick={() => dispatchBankingAction('switch_tab', 'code')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700/60 hover:border-sky-500 text-center transition-all cursor-pointer group"
              >
                <Code className="w-4 h-4 mx-auto mb-1 text-sky-400 group-hover:text-white transition-colors" />
                <span className="text-[11px] font-bold block">API Endpoints</span>
                <span className="text-[9px] text-slate-400 group-hover:text-white/80 block">REST / cURL</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোগ্রাম খুঁজুন (A-Z, Ledger, OTP, Webhook, Settle, API)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff6600] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {['ALL', 'TRANSACTIONS', 'LEDGER', 'WEBHOOKS', 'SECURITY', 'DEVELOPER'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#ff6600] text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All (A-Z)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Program Items List (A-Z) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-[10px] uppercase tracking-wider">
                A-Z Programs ({filteredPrograms.length} Available)
              </span>
              <span className="text-[11px] text-slate-500">Click button to launch</span>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <Sliders className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">কোনো প্রোগ্রাম খুঁজে পাওয়া যায়নি।</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs text-[#ff6600] hover:underline"
                >
                  Clear search & show all A-Z
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-950 transition-all duration-150 group space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {/* Letter Icon Badge */}
                        <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-[#ff6600]/50 group-hover:text-[#ff914d] transition-colors">
                          {prog.letter}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white group-hover:text-[#ff914d] transition-colors">
                              {prog.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-medium block">
                            {prog.titleBn}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {prog.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pl-9">
                      {prog.description}
                    </p>

                    <div className="pt-1.5 pl-9 flex items-center justify-between border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        Category: {prog.category}
                      </span>

                      <button
                        type="button"
                        onClick={prog.action}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-[#ff6600] text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm group-hover:bg-slate-800 group-hover:hover:bg-[#ff6600]"
                      >
                        {prog.icon}
                        <span>{prog.actionLabel}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Export & Compliance Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Financial Ledger Exports</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Audit-Ready</span>
            </div>
            <p className="text-[11px] text-slate-400">
              সমস্ত ট্রানজাকশন লেজার এবং ব্যালেন্সড জার্নাল এন্ট্রি এক ক্লিকে ডাউনলোড করুন:
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatchBankingAction('export_csv')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download CSV</span>
              </button>

              <button
                type="button"
                onClick={() => dispatchBankingAction('export_json')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-sky-400" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          {/* Related DNS & Network Utilities */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              DNS & Connected System Tools
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {onOpenDnsLookup && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDnsLookup();
                    if (!isPinned && window.innerWidth < 1024) onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#ff6600] mb-1" />
                  <span className="font-bold block text-[11px]">DNS Lookup</span>
                  <span className="text-[9px] text-slate-500">Live Anycast Query</span>
                </button>
              )}

              {onOpenPortChecker && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPortChecker();
                    if (!isPinned && window.innerWidth < 1024) onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                  <span className="font-bold block text-[11px]">Port Checker</span>
                  <span className="text-[9px] text-slate-500">80, 443, 3389, 25565</span>
                </button>
              )}

              {onOpenDucSimulator && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDucSimulator();
                    if (!isPinned && window.innerWidth < 1024) onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400 mb-1" />
                  <span className="font-bold block text-[11px]">DUC Client</span>
                  <span className="text-[9px] text-slate-500">Auto IP Sync</span>
                </button>
              )}

              {onOpenDomainSearch && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDomainSearch();
                    if (!isPinned && window.innerWidth < 1024) onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-400 mb-1" />
                  <span className="font-bold block text-[11px]">Domains</span>
                  <span className="text-[9px] text-slate-500">Register .com/.net</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Pinned Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-slate-300">In-House Ledger Live</span>
          </div>

          <button
            type="button"
            onClick={() => dispatchBankingAction('switch_tab', 'console')}
            className="text-[11px] font-bold text-[#ff6600] hover:text-[#ff914d] flex items-center gap-1 cursor-pointer"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
