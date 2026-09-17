import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Server, 
  ShieldCheck, 
  Wifi, 
  Radio, 
  FileText, 
  ExternalLink,
  Menu, 
  X,
  Layers,
  ArrowUpRight,
  LogOut,
  Activity,
  CheckCircle2,
  Code2,
  Sun,
  Moon
} from 'lucide-react';
import { NoIpLogo } from './NoIpLogo';
import { useTheme } from '../context/ThemeContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenPortChecker: () => void;
  onOpenDucSimulator: () => void;
  onSelectAudience: (audience: 'business' | 'home') => void;
  cartCount: number;
  onOpenCart: () => void;
  userEmail?: string;
  activeHostnamesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPortChecker,
  onOpenDucSimulator,
  onSelectAudience,
  cartCount,
  onOpenCart,
  userEmail = 'kh…@gmail.com',
  activeHostnamesCount = 2,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');


  const solutionsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setSolutionsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ['English', 'Español', 'Français', 'Deutsch', 'Português', 'Italiano'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200" id="main-navigation-header">
      {/* Top utility sub-bar */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80 text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Need help? Call +1 775-853-1883</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              id="theme-toggle-utility-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-0.5 cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-slate-500 hover:text-[#ff6600]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="capitalize">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                id="language-selector-btn"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-1 hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-0.5 text-slate-600 dark:text-slate-300"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-[#ff6600] dark:hover:text-[#ff914d] flex items-center justify-between ${
                        selectedLanguage === lang ? 'font-bold text-[#ff6600] dark:text-[#ff914d]' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lang}
                      {selectedLanguage === lang && <CheckCircle2 className="w-3 h-3 text-[#ff6600] dark:text-[#ff914d]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Shopping Cart (0) */}
            <button
              id="shopping-cart-nav-btn"
              onClick={onOpenCart}
              className="flex items-center gap-1.5 hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors relative py-0.5 text-slate-600 dark:text-slate-300"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
              <span className="bg-[#ff6600] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {cartCount}
              </span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Logged in User Pill */}
            <div className="relative" ref={userRef}>
              <button
                id="user-account-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-[#0a2540] dark:hover:text-white font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[9px] flex items-center justify-center font-bold">
                  K
                </div>
                <span className="text-slate-500 dark:text-slate-400">Logged In as</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userEmail}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-3 z-50 text-slate-700 dark:text-slate-200 animate-in fade-in duration-100">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No-IP Personal Account</p>
                    <p className="text-sm font-bold text-[#0a2540] dark:text-white truncate">{userEmail}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded w-fit border border-emerald-200/50 dark:border-emerald-800/40">
                      <Activity className="w-3 h-3" /> {activeHostnamesCount} Active Hostnames
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        const el = document.getElementById('active-hostnames-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Manage Dynamic DNS</span>
                      <span className="text-slate-400 text-[10px]">Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDucSimulator();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-[#ff6600] dark:hover:text-[#ff914d] flex items-center justify-between"
                    >
                      <span className="font-medium">Dynamic Update Client (DUC)</span>
                      <span className="bg-orange-100 dark:bg-orange-950/80 text-[#ff6600] dark:text-[#ff914d] text-[9px] font-bold px-1.5 rounded">Simulate</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenPortChecker();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Port Forwarding Tool</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                    <button 
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5"
                    >
                      <LogOut className="w-3 h-3" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center" aria-label="No-IP Home">
            <NoIpLogo />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-200">
            {/* Solutions with Mega Menu */}
            <div className="relative" ref={solutionsRef}>
              <button
                id="solutions-nav-dropdown-btn"
                onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
                className={`flex items-center gap-1 hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2 ${
                  solutionsDropdownOpen ? 'text-[#ff6600] dark:text-[#ff914d]' : ''
                }`}
              >
                Solutions
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${solutionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {solutionsDropdownOpen && (
                <div className="absolute top-full -left-4 mt-2 w-[520px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 z-50 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">DNS Services</h4>
                    <div className="space-y-2">
                      <a
                        href="#dynamic-dns"
                        onClick={(e) => {
                          e.preventDefault();
                          setSolutionsDropdownOpen(false);
                          document.getElementById('ddns-explainer-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-2 rounded-lg hover:bg-orange-50/70 dark:hover:bg-slate-800/80 block transition-colors group"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-[#ff6600]" /> Dynamic DNS (DDNS)
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keep your domain tied to your changing home or office IP.</p>
                      </a>

                      <a
                        href="#managed-dns"
                        onClick={(e) => {
                          e.preventDefault();
                          setSolutionsDropdownOpen(false);
                          document.getElementById('managed-dns-explainer-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-2 rounded-lg hover:bg-orange-50/70 dark:hover:bg-slate-800/80 block transition-colors group"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Managed Anycast DNS
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">100% uptime with 150+ PoPs worldwide.</p>
                      </a>

                      <a
                        href="#public-tunnels"
                        onClick={(e) => {
                          e.preventDefault();
                          setSolutionsDropdownOpen(false);
                          onOpenPortChecker();
                        }}
                        className="p-2 rounded-lg hover:bg-orange-50/70 dark:hover:bg-slate-800/80 block transition-colors group"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Public Tunnels
                          <span className="text-[10px] bg-[#ff6600] text-white px-1.5 py-0.2 rounded font-bold">New</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bypass CGNAT and port forwarding headaches.</p>
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Connectivity & Tools</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSolutionsDropdownOpen(false);
                          onOpenPortChecker();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 block transition-colors group cursor-pointer"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Check My Port Forwarding
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verify if your port 80, 443, 3389 or 25565 is accessible.</p>
                      </button>

                      <button
                        onClick={() => {
                          setSolutionsDropdownOpen(false);
                          onOpenDucSimulator();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 block transition-colors group cursor-pointer"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" /> DUC Client Simulator
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated IP update agent for Windows, Linux & Mac.</p>
                      </button>

                      <a
                        href="#domain-registration"
                        onClick={(e) => {
                          e.preventDefault();
                          setSolutionsDropdownOpen(false);
                          document.getElementById('hero-domain-card')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 block transition-colors group"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Domain Registration & SSL
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Search custom .com, .net, .org with privacy included.</p>
                      </a>

                      <a
                        href="#integrate-via-api"
                        onClick={(e) => {
                          e.preventDefault();
                          setSolutionsDropdownOpen(false);
                          document.getElementById('integrate-via-api')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-2 rounded-lg hover:bg-orange-50/70 dark:hover:bg-slate-800/80 block transition-colors group border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#ff6600] dark:group-hover:text-[#ff914d] text-sm flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-[#ff6600]" /> Integrate via API
                          <span className="text-[10px] bg-slate-800 dark:bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded font-mono">REST</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Code examples & programmatic DNS updates.</p>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              id="business-nav-btn"
              onClick={() => {
                onSelectAudience('business');
                document.getElementById('how-customers-use-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2 cursor-pointer"
            >
              Business
            </button>

            <button
              id="personal-nav-btn"
              onClick={() => {
                onSelectAudience('home');
                document.getElementById('how-customers-use-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2 cursor-pointer"
            >
              Personal
            </button>

            <a
              href="#partners-resellers-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('partners-resellers-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2 flex items-center gap-1"
            >
              Partnership
            </a>

            <a
              href="#resources"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2"
            >
              Resources
            </a>

            <a
              href="#company"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('why-choose-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#ff6600] dark:hover:text-[#ff914d] transition-colors py-2"
            >
              Company
            </a>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Light / Dark Mode Navbar Toggle Button */}
          <button
            id="nav-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>

          <button
            id="nav-open-port-checker-btn"
            onClick={onOpenPortChecker}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#ff6600] dark:hover:text-[#ff914d] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-slate-700"
          >
            <Activity className="w-3.5 h-3.5 text-[#ff6600]" />
            Port Checker Tool
          </button>

          <a
            href="#create-hostname"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('hostname-creator-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-bold text-white bg-[#ff6600] hover:bg-[#e65c00] active:scale-98 px-4 py-2 rounded-lg shadow-xs transition-all"
          >
            Create Free Hostname
          </a>
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="lg:hidden flex items-center gap-1.5">
          {/* Mobile Theme Toggle Button */}
          <button
            id="mobile-nav-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-slate-200 hover:text-[#ff6600] dark:hover:text-[#ff914d] rounded-md transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            onClick={onOpenCart}
            className="p-2 text-slate-700 dark:text-slate-200 relative"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#ff6600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-md"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Theme Quick Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
              <span>Theme: <strong className="capitalize text-[#ff6600]">{theme}</strong></span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer transition-colors"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Account:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{userEmail}</span>
          </div>

          <div className="space-y-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectAudience('business');
                document.getElementById('how-customers-use-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Business Solutions
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectAudience('home');
                document.getElementById('how-customers-use-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              Personal & Home DDNS
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortChecker();
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-[#ff6600]"
            >
              <span>Check My Port Forwarding</span>
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDucSimulator();
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200"
            >
              <span>DUC Client Simulator</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('partners-resellers-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200"
            >
              <span>Partnership & Resellers</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('integrate-via-api')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-orange-50 dark:hover:bg-slate-800 text-[#ff6600] flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                Integrate via API
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono">REST</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="No-IP App Icon" className="w-7 h-7 rounded-md" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100">No-IP Mobile App</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Install to Home Screen</p>
                </div>
              </div>
              <PWAInstallButton />
            </div>

            <a
              href="#create-hostname"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 bg-[#ff6600] text-white font-bold rounded-lg text-sm"
            >
              Create Free Hostname Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
