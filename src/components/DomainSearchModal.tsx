import React, { useState } from 'react';
import { Globe, X, Search, Check, ShoppingCart, ArrowRight } from 'lucide-react';

interface DomainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (domainName: string, price: number) => void;
}

export const DomainSearchModal: React.FC<DomainSearchModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ domain: string; available: boolean; price: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedDomain, setAddedDomain] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) return;

    setIsSearching(true);
    setTimeout(() => {
      setResults([
        { domain: `${clean}.com`, available: true, price: 14.99 },
        { domain: `${clean}.net`, available: true, price: 16.99 },
        { domain: `${clean}.org`, available: true, price: 15.99 },
        { domain: `${clean}.io`, available: false, price: 49.99 },
      ]);
      setIsSearching(false);
    }, 400);
  };

  const handleAdd = (domain: string, price: number) => {
    onAddToCart(domain, price);
    setAddedDomain(domain);
    setTimeout(() => setAddedDomain(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a2540]">No-IP Domain Registration</h3>
              <p className="text-xs text-slate-500">Search available top-level domains with free privacy & DNS management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="py-4">
          <label htmlFor="domain-search-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Find your custom domain name:
          </label>
          <div className="flex gap-2">
            <input
              id="domain-search-input"
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. mycompany, homeserver"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {results.map((res) => (
              <div key={res.domain} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{res.domain}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {res.available ? (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Available Now
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Taken</span>
                    )}
                    <span className="text-slate-400">• Free WHOIS Privacy</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">${res.price}/yr</span>
                  {res.available && (
                    <button
                      onClick={() => handleAdd(res.domain, res.price)}
                      className="px-3 py-1.5 bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      {addedDomain === res.domain ? (
                        <>
                          <Check className="w-3 h-3" /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3" /> Add to Cart
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
