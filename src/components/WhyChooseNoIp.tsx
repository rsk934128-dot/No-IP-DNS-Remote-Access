import React from 'react';
import { Sparkles, ShieldCheck, Headphones, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WhyChooseNoIpProps {
  onOpenPortChecker: () => void;
  onOpenKnowledgeBase: () => void;
}

export const WhyChooseNoIp: React.FC<WhyChooseNoIpProps> = ({
  onOpenPortChecker,
  onOpenKnowledgeBase,
}) => {
  const reasons = [
    {
      id: 'easy-setup',
      title: 'Easy Setup for Everyone',
      desc: 'Our tools guide you through purchasing and setting up your domain, Dynamic DNS account, or other service, making the process straightforward and hassle-free.',
      icon: <Sparkles className="w-6 h-6 text-[#ff6600]" />,
      badge: 'Intuitive Tools',
      actionLabel: 'View Setup Guides',
      action: onOpenKnowledgeBase,
    },
    {
      id: 'uptime',
      title: '100% Uptime',
      desc: 'Our robust Anycast Network with 150+ points of presence around the world ensures that your services never experience any downtime. Guaranteed.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      badge: 'Guaranteed SLA',
      actionLabel: 'System Status Live',
      action: () => {
        const el = document.getElementById('footer-system-status');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'support',
      title: 'Comprehensive Support',
      desc: 'Our Support Center is packed with 100s of help articles, troubleshooting tools, and FAQs. And if you get stuck, our US-based Customer Success team is just a phone call away.',
      icon: <Headphones className="w-6 h-6 text-blue-600" />,
      badge: 'US-Based Success Team',
      actionLabel: 'Check Troubleshooting Tools',
      action: onOpenPortChecker,
    },
  ];

  return (
    <section id="why-choose-section" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ff6600]">
            The Gold Standard in Connectivity
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] mt-1">
            Why Choose No-IP as Your DNS Provider?
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Backed by 25 years of continuous engineering and trusted by millions worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-7 hover:bg-white hover:border-[#ff6600]/40 transition-all hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0a2540] mb-3">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/70">
                <button
                  onClick={item.action}
                  className="text-xs font-bold text-[#0a2540] group-hover:text-[#ff6600] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {item.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
