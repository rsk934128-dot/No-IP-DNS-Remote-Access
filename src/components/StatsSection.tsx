import React from 'react';
import { Users, Calendar, ThumbsUp, Globe, ArrowDownRight } from 'lucide-react';
import { GlobalNetworkMap } from './GlobalNetworkMap';

export const StatsSection: React.FC = () => {
  const handleScrollToMap = () => {
    const mapEl = document.getElementById('global-pops-interactive-map');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    {
      value: '35M+',
      label: 'Customers',
      icon: <Users className="w-6 h-6 text-[#ff6600]" />,
      desc: 'From individual users to small businesses to Fortune 500 companies — when reliability matters, people turn to No-IP.',
      highlightColor: 'from-orange-500/10 to-transparent',
      borderColor: 'border-orange-200'
    },
    {
      value: '25+',
      label: 'Years',
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      desc: 'Few providers can match our level of trust and expertise, because we’ve been around almost as long as the internet.',
      highlightColor: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-200'
    },
    {
      value: '90%+',
      label: 'Customer Satisfaction',
      icon: <ThumbsUp className="w-6 h-6 text-emerald-600" />,
      desc: 'Our users love us! Our users trust No-IP for reliable, easy-to-use DNS solutions.',
      highlightColor: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-200'
    },
    {
      value: '150+',
      label: 'Points of Presence',
      icon: <Globe className="w-6 h-6 text-purple-600 animate-pulse" />,
      desc: 'Experience seamless connectivity and performance from anywhere on the globe with our Anycast routing mesh.',
      highlightColor: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-200',
      isInteractive: true,
    },
  ];

  return (
    <section id="stats-section" className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b,transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ff6600]">
            Trusted by the World’s Networks
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Proven Scale, Reliability & Heritage
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              onClick={stat.isInteractive ? handleScrollToMap : undefined}
              className={`bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative hover:border-slate-600 transition-all hover:-translate-y-1 shadow-md flex flex-col justify-between ${
                stat.isInteractive
                  ? 'cursor-pointer ring-1 ring-purple-500/30 hover:ring-purple-500/60 hover:bg-slate-800'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-700/50">
                    {stat.icon}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-200 mb-2 flex items-center justify-between">
                  <span>{stat.label}</span>
                  {stat.isInteractive && (
                    <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-0.5">
                      Explore Map <ArrowDownRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {stat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  No-IP Verified Metric
                </span>
                {stat.isInteractive && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    158 PoPs Online
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Global Network Map Highlighting 150+ Points of Presence */}
        <GlobalNetworkMap />
      </div>
    </section>
  );
};

