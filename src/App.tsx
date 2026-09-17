/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PromoBanner } from './components/PromoBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ActiveHostnamesManager } from './components/ActiveHostnamesManager';
import { CustomerUseCases } from './components/CustomerUseCases';
import { DnsExplainers } from './components/DnsExplainers';
import { StatsSection } from './components/StatsSection';
import { DualCtaSection } from './components/DualCtaSection';
import { WhyChooseNoIp } from './components/WhyChooseNoIp';
import { PartnersResellers } from './components/PartnersResellers';
import { NewsKnowledge } from './components/NewsKnowledge';
import { UncomplicatedConnectivity } from './components/UncomplicatedConnectivity';
import { Footer } from './components/Footer';
import { PortCheckerModal } from './components/PortCheckerModal';
import { DucSimulatorModal } from './components/DucSimulatorModal';
import { CartModal } from './components/CartModal';
import { DomainSearchModal } from './components/DomainSearchModal';
import { HostnameRecord, CustomerAudience } from './types';

export default function App() {
  // Current user's detected public IP
  const [currentIp, setCurrentIp] = useState('198.51.100.42');
  const userEmail = 'kh…@gmail.com';

  // Active hostnames in user account
  const [hostnames, setHostnames] = useState<HostnameRecord[]>([
    {
      id: 'host-1',
      name: 'kh-home',
      domain: '.ddns.net',
      fullHostname: 'kh-home.ddns.net',
      targetIp: '198.51.100.42',
      recordType: 'A',
      lastUpdated: '10 minutes ago',
      status: 'Active',
      port: 80,
    },
    {
      id: 'host-2',
      name: 'cam-yard',
      domain: '.freedynamicdns.net',
      fullHostname: 'cam-yard.freedynamicdns.net',
      targetIp: '198.51.100.42',
      recordType: 'A',
      lastUpdated: '2 hours ago',
      status: 'Active',
      port: 8000,
    },
  ]);

  // Audience toggle: 'business' | 'home'
  const [activeAudience, setActiveAudience] = useState<CustomerAudience>('business');

  // Modals state
  const [isPortCheckerOpen, setIsPortCheckerOpen] = useState(false);
  const [portCheckerPrefill, setPortCheckerPrefill] = useState<{ port?: number; host?: string }>({});
  const [isDucSimulatorOpen, setIsDucSimulatorOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDomainSearchOpen, setIsDomainSearchOpen] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState([
    {
      id: 'item-enhanced-ddns',
      name: 'Enhanced Dynamic DNS + Public Tunnels',
      description: '25 Hostnames, remove 30-day renewals, always-on remote access',
      originalPrice: 34.99,
      price: 34.99,
      term: 'year',
    },
  ]);
  const [hasDiscountApplied, setHasDiscountApplied] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddHostname = (newRecord: HostnameRecord) => {
    setHostnames((prev) => [newRecord, ...prev]);
    showToast(`Registered ${newRecord.fullHostname} to Anycast DNS!`);
  };

  const handleDeleteHostname = (id: string) => {
    setHostnames((prev) => prev.filter((h) => h.id !== id));
    showToast('Hostname removed.');
  };

  const handleRefreshHostname = (id: string) => {
    setHostnames((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, lastUpdated: 'Just now', targetIp: currentIp } : h
      )
    );
    showToast('DNS record refreshed across all Anycast PoPs.');
  };

  const handleSimulateIpUpdate = (newIp: string) => {
    setCurrentIp(newIp);
    setHostnames((prev) =>
      prev.map((h) => ({
        ...h,
        targetIp: newIp,
        lastUpdated: 'Just now (via DUC)',
      }))
    );
    showToast(`DUC updated all hostnames to ${newIp}`);
  };

  const handleOpenPortChecker = (port?: number, host?: string) => {
    setPortCheckerPrefill({ port, host });
    setIsPortCheckerOpen(true);
  };

  const handleApplyPromoCode = (code: string) => {
    if (code.toUpperCase() === 'SEP25OFF') {
      setHasDiscountApplied(true);
      setAppliedPromoCode('SEP25OFF');
      showToast('25% discount code applied to cart!');
      return true;
    }
    return false;
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddDomainToCart = (domainName: string, price: number) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `dom-${Date.now()}`,
        name: `Domain Registration: ${domainName}`,
        description: 'Includes free WHOIS privacy and Managed DNS zone',
        originalPrice: price,
        price: price,
        term: 'year',
      },
    ]);
    showToast(`Added ${domainName} to cart.`);
  };

  const handleScrollToHostnameForm = () => {
    const el = document.getElementById('hostname-creator-form');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#ff6600]/20 selection:text-[#ff6600] transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2540] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-ping"></span>
          {toastMessage}
        </div>
      )}

      {/* Top Special Offer Banner */}
      <PromoBanner
        onUpgradeClick={() => {
          setIsCartOpen(true);
          handleApplyPromoCode('SEP25OFF');
        }}
      />

      {/* Main Navigation Header */}
      <Navbar
        onOpenPortChecker={() => handleOpenPortChecker()}
        onOpenDucSimulator={() => setIsDucSimulatorOpen(true)}
        onSelectAudience={(aud) => setActiveAudience(aud)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        userEmail={userEmail}
        activeHostnamesCount={hostnames.length}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* Hero Section with Interactive Hostname Creator and 3 Core Cards */}
        <HeroSection
          currentIp={currentIp}
          onAddHostname={handleAddHostname}
          onOpenPortChecker={handleOpenPortChecker}
          onOpenDomainSearch={() => setIsDomainSearchOpen(true)}
        />

        {/* User's Dynamic DNS Management Console */}
        <ActiveHostnamesManager
          hostnames={hostnames}
          onDeleteHostname={handleDeleteHostname}
          onRefreshHostname={handleRefreshHostname}
          onOpenPortChecker={handleOpenPortChecker}
          onOpenDucSimulator={() => setIsDucSimulatorOpen(true)}
        />

        {/* How Customers Use No-IP (Business vs. Home) */}
        <CustomerUseCases
          activeAudience={activeAudience}
          setActiveAudience={setActiveAudience}
          onOpenPortChecker={() => handleOpenPortChecker()}
        />

        {/* What is DDNS? and What is Managed DNS? Educational Visualizers */}
        <DnsExplainers />

        {/* Trust & Proven Scale Metrics */}
        <StatsSection />

        {/* Dual CTA: Free Personal DDNS Account vs. Let's Talk Business */}
        <DualCtaSection onScrollToHostnameForm={handleScrollToHostnameForm} />

        {/* Why Choose No-IP as Your DNS Provider? */}
        <WhyChooseNoIp
          onOpenPortChecker={() => handleOpenPortChecker()}
          onOpenKnowledgeBase={() => {
            const el = document.getElementById('resources-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Partners & Resellers */}
        <PartnersResellers />

        {/* No-IP News & Knowledge Articles */}
        <NewsKnowledge />

        {/* Welcome to Uncomplicated Connectivity Closing Hero */}
        <UncomplicatedConnectivity onGetStarted={handleScrollToHostnameForm} />
      </main>

      {/* Complete Authentic Footer */}
      <Footer
        onOpenPortChecker={() => handleOpenPortChecker()}
        onOpenDucSimulator={() => setIsDucSimulatorOpen(true)}
        onSelectAudience={(aud) => {
          setActiveAudience(aud);
          const el = document.getElementById('how-customers-use-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive Tool Modals */}
      <PortCheckerModal
        isOpen={isPortCheckerOpen}
        onClose={() => setIsPortCheckerOpen(false)}
        defaultIp={currentIp}
        initialPort={portCheckerPrefill.port}
        initialHost={portCheckerPrefill.host}
        onOpenPublicTunnelsOffer={() => {
          setIsCartOpen(true);
          handleApplyPromoCode('SEP25OFF');
        }}
      />

      <DucSimulatorModal
        isOpen={isDucSimulatorOpen}
        onClose={() => setIsDucSimulatorOpen(false)}
        hostnames={hostnames}
        currentIp={currentIp}
        onSimulateIpUpdate={handleSimulateIpUpdate}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onApplyPromoCode={handleApplyPromoCode}
        hasDiscountApplied={hasDiscountApplied}
        appliedPromoCode={appliedPromoCode}
      />

      <DomainSearchModal
        isOpen={isDomainSearchOpen}
        onClose={() => setIsDomainSearchOpen(false)}
        onAddToCart={handleAddDomainToCart}
      />
    </div>
  );
}
