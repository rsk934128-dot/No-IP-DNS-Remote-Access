import React, { useState } from 'react';
import { 
  Radio, 
  Server, 
  ArrowRight, 
  RotateCw, 
  Globe2, 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Router as RouterIcon, 
  Camera, 
  Check, 
  Zap,
  Layers
} from 'lucide-react';

export const DnsExplainers: React.FC = () => {
  const [simulatedIpStep, setSimulatedIpStep] = useState(1);
  const [activeDnsNode, setActiveDnsNode] = useState('us-west');

  const ips = ['98.142.61.104', '74.125.19.42', '172.56.21.89'];

  const cycleIp = () => {
    setSimulatedIpStep((prev) => (prev + 1) % ips.length);
  };

  const currentDynamicIp = ips[simulatedIpStep];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dual Explainer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Card 1: What is DDNS? */}
          <div 
            id="ddns-explainer-section" 
            className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-[#ff6600] font-bold text-xs uppercase tracking-wider mb-2">
                <Radio className="w-4 h-4" /> Core Technology
              </div>
              <h3 className="text-2xl font-bold text-[#0a2540] tracking-tight">
                What is DDNS?
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Dynamic DNS (DDNS) is a service that automatically updates your domain name to match your changing IP address. Most home internet connections use dynamic IPs, which can make it hard to remotely access your networked devices. That’s where DDNS comes in.
              </p>

              {/* Interactive Visual Simulation */}
              <div className="mt-6 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Interactive DDNS Live Resolver</span>
                  <button
                    onClick={cycleIp}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-[#ff6600] rounded-md font-bold text-[11px] transition-colors"
                  >
                    <RotateCw className="w-3 h-3" /> Simulate ISP IP Change
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
                  {/* Home Device */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <RouterIcon className="w-6 h-6 text-slate-700 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-800 block">Your Home Router</span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      {currentDynamicIp}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">(ISP changes this randomly)</span>
                  </div>

                  {/* No-IP Cloud Sync */}
                  <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200 relative">
                    <div className="w-7 h-7 rounded-full bg-[#ff6600] text-white flex items-center justify-center mx-auto mb-1 shadow-xs">
                      <Zap className="w-4 h-4 animate-pulse" />
                    </div>
                    <span className="text-[11px] font-bold text-[#ff6600] block">No-IP Cloud Sync</span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">Instant DUC handshake</span>
                    <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">✓ 100% Synced</span>
                  </div>

                  {/* Remote Access */}
                  <div className="p-3 rounded-lg bg-slate-900 text-white border border-slate-800">
                    <Smartphone className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-100 block">Your Device Anywhere</span>
                    <span className="text-[10px] font-mono text-[#ff914d] font-bold block mt-1">
                      home.ddns.net
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Always connects!</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-500 text-center">
                  Whenever your ISP assigns a new IP address, the No-IP client or router detects it and updates <span className="font-mono text-slate-700 font-semibold">home.ddns.net</span> within seconds.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Free personal hostnames available</span>
              <a
                href="#hostname-creator-form"
                className="font-bold text-[#ff6600] hover:underline flex items-center gap-1"
              >
                Create Hostname <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: What is Managed DNS? */}
          <div 
            id="managed-dns-explainer-section" 
            className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Server className="w-4 h-4" /> Global Infrastructure
              </div>
              <h3 className="text-2xl font-bold text-[#0a2540] tracking-tight">
                What is Managed DNS?
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Managed DNS is a service that routes traffic to your domain name using a global network of authoritative DNS servers. Instead of running and maintaining your own DNS infrastructure, managed DNS lets you rely on a fast, secure, and redundant platform built for performance and uptime.
              </p>

              {/* Anycast Global PoP Visualizer */}
              <div className="mt-6 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Anycast 150+ PoP Global Network</span>
                  <span className="text-blue-600 font-bold text-[11px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    100% Uptime SLA
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'us-west', name: 'Americas (US & CA)', ping: '4ms', status: 'Optimal' },
                    { id: 'eu-central', name: 'Europe (Frankfurt)', ping: '8ms', status: 'Optimal' },
                    { id: 'ap-east', name: 'Asia-Pacific (Tokyo)', ping: '11ms', status: 'Optimal' },
                  ].map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setActiveDnsNode(node.id)}
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        activeDnsNode === node.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Globe2 className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-mono text-[10px] font-bold text-emerald-600">{node.ping}</span>
                      </div>
                      <span className="font-semibold block text-[11px] mt-1.5 truncate">{node.name}</span>
                      <span className="text-[10px] text-slate-500 block">{node.status}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    DDoS mitigation + automatic geographic failover guarantees zero resolution failures.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Enterprise Anycast routing</span>
              <a
                href="#talk-business"
                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Explore Enterprise <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
