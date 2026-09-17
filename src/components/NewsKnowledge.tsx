import React, { useState } from 'react';
import { BookOpen, ArrowRight, FileText, Calendar, Clock, ExternalLink, X, Code2, CheckCircle2 } from 'lucide-react';
import { NewsItem } from '../types';

export const NewsKnowledge: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const articles: NewsItem[] = [
    {
      id: 'art-api-developer-docs',
      title: 'Full API Documentation: Dynamic DNS Update Specifications & DDNS Keys',
      category: 'Developer API',
      date: 'Updated 2026',
      readTime: '6 min read',
      excerpt: 'Official specification for programmatic DNS updates via HTTP GET, RFC 7617 Basic Authentication, custom User-Agent policies, and return code reference matrices.',
    },
    {
      id: 'art-router-setup',
      title: 'How to Configure DDNS on Netgear, TP-Link, and ASUS Routers',
      category: 'Router Guides',
      date: 'September 2026',
      readTime: '4 min read',
      excerpt: 'Most modern wireless routers have No-IP DDNS built right into the admin firmware. Follow this step-by-step walkthrough to configure automated IP synchronization in under 3 minutes.',
    },
    {
      id: 'art-port-forwarding-vs-tunnels',
      title: 'Port Forwarding vs. Public Tunnels: Which is Right for You?',
      category: 'Remote Access',
      date: 'August 2026',
      readTime: '6 min read',
      excerpt: 'Learn the difference between traditional NAT port forwarding and encrypted Public Tunnels. Understand how Public Tunnels solves CGNAT barriers without opening inbound firewall ports.',
    },
    {
      id: 'art-anycast-uptime',
      title: 'Why Anycast Architecture is Crucial for 100% DNS Uptime',
      category: 'Engineering & Infrastructure',
      date: 'July 2026',
      readTime: '5 min read',
      excerpt: 'A deep dive into how 150+ Points of Presence use BGP Anycast routing to automatically route customer queries to the nearest, fastest, and most resilient data center.',
    },
  ];

  return (
    <section id="resources-section" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6600] uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" /> Learning Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] tracking-tight">
              No-IP News & Knowledge
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Expert guides, network troubleshooting tutorials, and connectivity blueprints.
            </p>
          </div>

          <a
            href="#knowledge-base"
            onClick={(e) => {
              e.preventDefault();
              setSelectedArticle(articles[0]);
            }}
            className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1.5"
          >
            Explore Knowledge Base
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#ff6600]/40 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="bg-orange-50 text-[#ff6600] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.readTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#0a2540] group-hover:text-[#ff6600] transition-colors mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedArticle(item)}
                  className="text-xs font-bold text-[#0a2540] group-hover:text-[#ff6600] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#ff6600] uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <h3 className="text-xl font-bold text-[#0a2540] mt-1">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Published {selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-600 max-h-[60vh] overflow-y-auto leading-relaxed">
              <p className="font-semibold text-slate-800">
                {selectedArticle.excerpt}
              </p>

              {selectedArticle.id === 'art-api-developer-docs' ? (
                <>
                  <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">Standard Update Endpoint:</div>
                    <code className="text-[#ff914d] font-bold">GET https://dynupdate.no-ip.com/nic/update</code>
                  </div>

                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Authentication Requirements (RFC 7617)</h4>
                  <p>
                    All API update requests require standard HTTP Basic Authentication over TLS 1.2 or 1.3. For enhanced security and zero-trust isolation, generate dedicated DDNS Keys in your No-IP portal instead of using your master account password.
                  </p>

                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Query Parameters</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-slate-800">hostname</strong> (Required): The fully qualified domain name (FQDN) or comma-separated list of hostnames to update.</li>
                    <li><strong className="text-slate-800">myip</strong> (Optional): The IPv4 or IPv6 address to assign. If omitted, the No-IP Anycast edge automatically resolves to the client's public egress IP address.</li>
                  </ul>

                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Standard Return Codes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs pt-1">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                      <strong>good &lt;IP&gt;</strong>: Success, record updated.
                    </div>
                    <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-sky-900">
                      <strong>nochg &lt;IP&gt;</strong>: Record already matches IP.
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                      <strong>badauth</strong>: Invalid credentials or key.
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                      <strong>abuse</strong>: Rate limited / excessive polling.
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href="https://www.noip.com/integrate/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#ff6600] hover:underline"
                    >
                      Open Official No-IP API Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Step 1: Locate Dynamic DNS in your Router Admin</h4>
                  <p>
                    Log in to your router gateway (typically 192.168.1.1 or routerlogin.net). Navigate to Advanced &gt; Dynamic DNS or WAN Settings. Look for the "DDNS" service provider dropdown menu.
                  </p>

                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Step 2: Choose No-IP as the Service Provider</h4>
                  <p>
                    From the provider list, select "No-IP" or "No-IP.com". Enter your registered email address or DDNS key credentials, along with your chosen hostname (e.g., yourname.ddns.net).
                  </p>

                  <h4 className="font-bold text-[#0a2540] text-sm pt-2">Step 3: Save & Verify Handshake</h4>
                  <p>
                    Click "Apply" or "Save". Your router will immediately send a verification packet to No-IP’s Anycast update server. Within 30 seconds, your hostname status will display "Success" or "Normal".
                  </p>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-950 text-xs">
                    <strong>Pro Tip:</strong> If your ISP places you behind Carrier-Grade NAT (CGNAT), use No-IP Public Tunnels to bypass port forwarding completely.
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
