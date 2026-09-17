import React, { useState } from 'react';
import { ShieldCheck, Briefcase, ArrowRight, CheckCircle2, X, Send, Clock, PhoneCall } from 'lucide-react';

interface DualCtaSectionProps {
  onScrollToHostnameForm: () => void;
}

export const DualCtaSection: React.FC<DualCtaSectionProps> = ({ onScrollToHostnameForm }) => {
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [businessSubmitted, setBusinessSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessSubmitted(true);
    setTimeout(() => {
      // keep confirmation state
    }, 500);
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Free Personal DDNS Account */}
          <div className="bg-white rounded-2xl border-2 border-orange-200/80 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-orange-100/50 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#ff6600] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4" /> Personal & Enthusiasts
              </div>

              <h3 className="text-2xl font-bold text-[#0a2540] mb-3">
                Free Personal DDNS Account
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Get secure in seconds. Create your free home Dynamic DNS account today with no credit card info required, then simply upgrade your services if/when needed.
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Up to 3 free hostnames (e.g. yourname.ddns.net)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Free Dynamic Update Client (DUC) for Windows, Mac & Linux</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Supports any router with DDNS client settings built-in</span>
                </li>
              </ul>
            </div>

            <button
              id="cta-free-personal-btn"
              onClick={onScrollToHostnameForm}
              className="w-full sm:w-auto self-start py-3.5 px-6 bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Let's Talk Business */}
          <div 
            id="talk-business"
            className="bg-[#0a2540] text-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-blue-500/20 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-900/70 border border-blue-700 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Briefcase className="w-4 h-4" /> Commercial & Enterprise
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Let’s Talk Business
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Protect your company’s assets with Managed DNS and more. Tell us what you’re looking to achieve and one of our Business Experts will be in touch within 24 hours (M-F).
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>100% Uptime SLA with 150+ Global Anycast PoPs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full API automation, RBAC, and dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Security integrator white-labeling and volume licenses</span>
                </li>
              </ul>
            </div>

            <button
              id="cta-talk-business-btn"
              onClick={() => {
                setBusinessSubmitted(false);
                setBusinessModalOpen(true);
              }}
              className="w-full sm:w-auto self-start py-3.5 px-6 bg-white hover:bg-slate-100 text-[#0a2540] font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#ff6600]" />
              Talk to a Business Expert
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Business Consultation Modal */}
      {businessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[#0a2540]">
                  Contact No-IP Business Experts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guaranteed consultation response within 24 hours (Monday – Friday).
                </p>
              </div>
              <button
                onClick={() => setBusinessModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {businessSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#0a2540]">Inquiry Received!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Thank you, <span className="font-semibold">{companyName || 'valued partner'}</span>. Our enterprise infrastructure architect will contact <span className="font-semibold">{workEmail || 'your email'}</span> within 24 business hours.
                </p>
                <button
                  onClick={() => setBusinessModalOpen(false)}
                  className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleBusinessSubmit} className="py-4 space-y-3 text-xs">
                <div>
                  <label htmlFor="company-name-input" className="block font-bold text-slate-700 mb-1">Company / Organization Name</label>
                  <input
                    id="company-name-input"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Network Security LLC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="work-email-input" className="block font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    id="work-email-input"
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-none text-xs"
                  />
                </div>

                <div>
                  <label htmlFor="requirements-textarea" className="block font-bold text-slate-700 mb-1">Tell us about your setup & goals</label>
                  <textarea
                    id="requirements-textarea"
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Number of remote locations, camera DVRs, API integration requirements, or custom domain needs..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-none text-xs"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Response time: under 24 hours (M-F)</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
