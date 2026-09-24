import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Send, 
  Check, 
  ArrowUpRight, 
  ExternalLink,
  Activity,
  Heart
} from 'lucide-react';
import { NoIpLogo } from './NoIpLogo';

interface FooterProps {
  onOpenPortChecker: () => void;
  onOpenDucSimulator: () => void;
  onSelectAudience: (audience: 'business' | 'home') => void;
  onOpenDnsLookup?: (domain?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPortChecker,
  onOpenDucSimulator,
  onSelectAudience,
  onOpenDnsLookup,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
  };

  const solutionsLinks = [
    { label: 'All Business Solutions', action: () => onSelectAudience('business') },
    { label: 'All Personal Solutions', action: () => onSelectAudience('home') },
    { label: 'Partnership & Resellers', href: '#partners-resellers-section' },
    { label: 'Dynamic DNS', href: '#dynamic-dns' },
    { label: 'Managed DNS', href: '#managed-dns' },
    { label: 'Domains', href: '#hero-domain-card' },
    { label: 'Email', href: '#email' },
    { label: 'Monitoring', href: '#monitoring' },
    { label: 'SSL Certificates', href: '#ssl' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const resourcesLinks = [
    { label: 'Core Banking Ledger API', href: '#core-banking-ledger-studio', highlight: true },
    { label: 'Integrate via API', href: '#integrate-via-api', highlight: true },
    { label: 'API Documents', href: '#integrate-via-api' },
    { label: 'Real Public DNS Lookup', action: () => onOpenDnsLookup?.(), highlight: true },
    { label: 'DNS Security Best Practices', href: '#dns-security-best-practices', highlight: true },
    { label: 'Blog', href: '#resources-section' },
    { label: 'Knowledge Base', href: '#resources-section' },
    { label: 'DDNS Keys', href: '#active-hostnames-section' },
    { label: 'Download Agent/Update Client', action: onOpenDucSimulator },
    { label: 'Integrate & OEM', href: '#partners-resellers-section' },
    { label: 'Open Support Ticket', href: '#support' },
    { label: 'Check My Port Forwarding', action: onOpenPortChecker, highlight: true },
  ];

  const companyLinks = [
    { label: 'About us', href: '#why-choose-section' },
    { label: 'Contact us', href: '#talk-business' },
    { label: 'Careers', href: '#careers' },
    { label: 'Press & media', href: '#press' },
    { label: 'Why No-IP', href: '#why-choose-section' },
    { label: 'No-IP Status', href: '#footer-system-status' },
  ];

  const legalLinks = [
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Privacy policy', href: '#privacy' },
    { label: 'Report Abuse', href: '#abuse' },
  ];

  const socialLinks = [
    { name: 'X (Twitter)', href: 'https://twitter.com/noip' },
    { name: 'Facebook', href: 'https://facebook.com/noip' },
    { name: 'Youtube', href: 'https://youtube.com/noip' },
    { name: 'Instagram', href: 'https://instagram.com/noip' },
    { name: 'Reddit', href: 'https://reddit.com/r/noip' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800" id="main-footer">
      {/* Newsletter & Contact Top Strip */}
      <div className="border-b border-slate-800/80 py-10 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <NoIpLogo variant="light" className="h-9" />
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Uptime Guaranteed</span>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="w-full md:w-auto">
            <p className="text-slate-200 font-semibold mb-2 text-center md:text-left">
              Want to stay in the know? Sign up to receive our newsletter!
            </p>
            {newsletterSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-800/50">
                <Check className="w-4 h-4" />
                <span>Thank you for subscribing to No-IP updates!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:border-[#ff6600] outline-none w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Direct Support & Developer Profile */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Author & Direct Contact
            </h4>
            <div className="space-y-2">
              <a
                href="mailto:fs2217732@gmail.com"
                className="flex items-center gap-2 text-slate-300 hover:text-[#ff6600] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#ff6600]" />
                <span className="font-medium">fs2217732@gmail.com</span>
              </a>
              <a
                href="tel:+17758531883"
                className="flex items-center gap-2 text-slate-300 hover:text-[#ff6600] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#ff6600]" />
                <span>+1 775-853-1883</span>
              </a>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Created by fs2217732</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Personalized dynamic DNS & remote port forwarding suite configured for <strong className="text-slate-300">fs2217732</strong>.
              </p>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Solutions
            </h4>
            <ul className="space-y-2">
              {solutionsLinks.map((link) => (
                <li key={link.label}>
                  {link.action ? (
                    <button
                      onClick={link.action}
                      className="hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  {link.action ? (
                    <button
                      onClick={link.action}
                      className={`hover:text-white transition-colors text-left flex items-center gap-1 ${
                        link.highlight ? 'text-[#ff914d] font-bold' : ''
                      }`}
                    >
                      {link.label}
                      {link.highlight && <Activity className="w-3 h-3" />}
                    </button>
                  ) : (
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <h5 className="font-bold text-slate-300 text-[11px] mb-2">Connect with Us</h5>
              <div className="flex flex-wrap gap-2 text-slate-400">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    onClick={(e) => e.preventDefault()}
                    className="hover:text-white transition-colors text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800 hover:border-slate-700"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status & Copyright Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-5 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>©1999-2026 • Vitalwerks Internet Solutions, LLC dba No-IP • All Rights Reserved.</p>
            <p className="flex items-center justify-center md:justify-start gap-1.5 text-slate-400">
              <span>Engineered & Customized by</span>
              <span className="font-bold text-[#ff914d] bg-[#ff914d]/10 px-1.5 py-0.5 rounded border border-[#ff914d]/20">fs2217732</span>
              <span>•</span>
              <a href="mailto:fs2217732@gmail.com" className="text-slate-300 hover:text-white underline underline-offset-2">
                fs2217732@gmail.com
              </a>
            </p>
          </div>

          {/* System Status Bar */}
          <button 
            id="footer-system-status"
            type="button"
            onClick={() => {
              document.getElementById('network-status-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-wrap items-center justify-center gap-3 bg-slate-900 hover:bg-slate-850 px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-left"
            title="Inspect Live Anycast PoP Latency Spectrum"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>No-IP System Status: All Systems Operational (150 PoPs)</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="font-mono text-[10px] text-slate-500">
              Latency Spectrum & Node Health →
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
