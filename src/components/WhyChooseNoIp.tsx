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
      icon: <Sparkles className="w-5 h-5 text-[#ff6600]" />,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      badge: 'Intuitive Tools',
      actionLabel: 'View Setup Guides',
      action: onOpenKnowledgeBase,
    },
    {
      id: 'uptime',
      title: '100% Uptime Guarantee',
      desc: 'Our robust Anycast Network with 150+ points of presence around the world ensures that your services never experience any downtime. Guaranteed.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      image: '/src/assets/images/anycast_datacenter_1789920040526.jpg',
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
      icon: <Headphones className="w-5 h-5 text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
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
              className="bg-slate-50/70 border border-slate-200 rounded-2xl overflow-hidden hover:bg-white hover:border-[#ff6600]/40 transition-all hover:shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/15 pointer-events-none" />
                  
                  {/* Floating Icon Badge */}
                  <div className="absolute top-3 left-3 p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-white/40">
                    {item.icon}
                  </div>

                  <div className="absolute bottom-2.5 left-3">
                    <span className="text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <h3 className="text-lg font-bold text-[#0a2540] group-hover:text-[#ff6600] transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-7 pb-6 pt-3 border-t border-slate-200/70">
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
