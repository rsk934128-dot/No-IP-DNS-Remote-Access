/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { PromoBanner } from './components/PromoBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ActiveHostnamesManager } from './components/ActiveHostnamesManager';
import { CustomerUseCases } from './components/CustomerUseCases';
import { DnsExplainers } from './components/DnsExplainers';
import { StatsSection } from './components/StatsSection';
import { NetworkStatus } from './components/NetworkStatus';
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
import { AuthModal } from './components/AuthModal';
import { DnsLookupModal } from './components/DnsLookupModal';
import { HostnameRecord, CustomerAudience } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useHostnames } from './hooks/useHostnames';

function NoIpApp() {
  const { user } = useAuth();

  // Current user's detected public IP
  const [currentIp, setCurrentIp] = useState('198.51.100.42');

  // Firebase Firestore Realtime Hostnames Hook
  const {
    hostnames,
    isCloudSynced,
    addHostname,
    deleteHostname,
    updateHostname,
    refreshHostname,
    refreshAllHostnames,
    updateAllHostnamesIp,
  } = useHostnames(currentIp);

  // Audience toggle: 'business' | 'home'
  const [activeAudience, setActiveAudience] = useState<CustomerAudience>('business');

  // Modals state
  const [isPortCheckerOpen, setIsPortCheckerOpen] = useState(false);
  const [portCheckerPrefill, setPortCheckerPrefill] = useState<{ port?: number; host?: string }>({});
  const [isDucSimulatorOpen, setIsDucSimulatorOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDomainSearchOpen, setIsDomainSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDnsLookupOpen, setIsDnsLookupOpen] = useState(false);
  const [dnsLookupInitialDomain, setDnsLookupInitialDomain] = useState<string | undefined>(undefined);

  const handleOpenDnsLookup = useCallback((domain?: string) => {
    setDnsLookupInitialDomain(domain);
    setIsDnsLookupOpen(true);
  }, []);

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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleAddHostname = useCallback(async (newRecord: HostnameRecord) => {
    await addHostname(newRecord);
    showToast(`Registered ${newRecord.fullHostname} to Anycast DNS (Backed by Cloud Firestore)!`);
  }, [addHostname, showToast]);

  const handleDeleteHostname = useCallback(async (id: string) => {
    await deleteHostname(id);
    showToast('Hostname removed from cloud.');
  }, [deleteHostname, showToast]);

  const handleRefreshHostname = useCallback(async (id: string) => {
    await refreshHostname(id);
    showToast('DNS record refreshed across all Anycast PoPs.');
  }, [refreshHostname, showToast]);

  const handleRefreshAllHostnames = useCallback(async () => {
    await refreshAllHostnames();
  }, [refreshAllHostnames]);

  const handleUpdateHostname = useCallback(async (id: string, updates: Partial<HostnameRecord>) => {
    await updateHostname(id, updates);
    showToast('Hostname DNS records (IPv4/IPv6 AAAA) updated successfully.');
  }, [updateHostname, showToast]);

  const handleSimulateIpUpdate = useCallback(async (newIp: string) => {
    setCurrentIp(newIp);
    await updateAllHostnamesIp(newIp);
    showToast(`DUC synced all hostnames to ${newIp} in Cloud Firestore`);
  }, [updateAllHostnamesIp, showToast]);

  const handleOpenPortChecker = useCallback((port?: number, host?: string) => {
    setPortCheckerPrefill({ port, host });
    setIsPortCheckerOpen(true);
  }, []);

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

  const displayEmail = user?.email || (user?.isAnonymous ? 'Guest User (fs2217732)' : 'fs2217732@gmail.com');
  const isAnonymousUser = user ? user.isAnonymous : true;

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
        userEmail={displayEmail}
        activeHostnamesCount={hostnames.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isAnonymous={isAnonymousUser}
        onOpenDnsLookup={handleOpenDnsLookup}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* Hero Section with Interactive Hostname Creator and 3 Core Cards */}
        <HeroSection
          currentIp={currentIp}
          onAddHostname={handleAddHostname}
          onOpenPortChecker={handleOpenPortChecker}
          onOpenDomainSearch={() => setIsDomainSearchOpen(true)}
          onOpenDnsLookup={handleOpenDnsLookup}
        />

        {/* User's Dynamic DNS Management Console with Cloud Firestore Sync Status */}
        <ActiveHostnamesManager
          hostnames={hostnames}
          currentIp={currentIp}
          onAddHostname={handleAddHostname}
          onUpdateHostname={handleUpdateHostname}
          onDeleteHostname={handleDeleteHostname}
          onRefreshHostname={handleRefreshHostname}
          onRefreshAllHostnames={handleRefreshAllHostnames}
          onOpenPortChecker={handleOpenPortChecker}
          onOpenDucSimulator={() => setIsDucSimulatorOpen(true)}
          isCloudSynced={isCloudSynced}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          userEmail={displayEmail}
          onOpenDnsLookup={handleOpenDnsLookup}
        />

        {/* How Customers Use No-IP (Business vs. Home) */}
        <CustomerUseCases
          activeAudience={activeAudience}
          setActiveAudience={setActiveAudience}
          onOpenPortChecker={() => handleOpenPortChecker()}
        />

        {/* What is DDNS? and What is Managed DNS? Educational Visualizers */}
        <DnsExplainers />

        {/* Trust & Proven Scale Metrics with Interactive react-simple-maps Anycast World Map */}
        <StatsSection />

        {/* Anycast PoP Latency & Node Connectivity Health Bar Chart */}
        <NetworkStatus />

        {/* Dual CTA: Free Personal DDNS Account vs. Let's Talk Business */}
        <DualCtaSection
          onScrollToHostnameForm={() => {
            if (isAnonymousUser) {
              setIsAuthModalOpen(true);
            } else {
              handleScrollToHostnameForm();
            }
          }}
        />

        {/* Why Choose No-IP as Your DNS Provider? */}
        <WhyChooseNoIp
          onOpenPortChecker={() => handleOpenPortChecker()}
          onOpenKnowledgeBase={() => {
            const el = document.getElementById('resources-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Partners & Resellers with Live API Simulator */}
        <PartnersResellers />

        {/* No-IP News & Knowledge Articles & DNS Security Best Practices */}
        <NewsKnowledge
          onOpenDnsLookup={handleOpenDnsLookup}
          onOpenPortChecker={(port, host) => handleOpenPortChecker(port, host)}
        />

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
        onOpenDnsLookup={handleOpenDnsLookup}
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

      {/* Real-time Public DNS Lookup Modal */}
      <DnsLookupModal
        isOpen={isDnsLookupOpen}
        onClose={() => setIsDnsLookupOpen(false)}
        initialDomain={dnsLookupInitialDomain}
        onTestPortOnIp={(ip) => handleOpenPortChecker(80, ip)}
      />

      <DucSimulatorModal
        isOpen={isDucSimulatorOpen}
        onClose={() => setIsDucSimulatorOpen(false)}
        hostnames={hostnames}
        currentIp={currentIp}
        onSimulateIpUpdate={handleSimulateIpUpdate}
        userEmail={displayEmail}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onApplyPromoCode={handleApplyPromoCode}
        hasDiscountApplied={hasDiscountApplied}
        appliedPromoCode={appliedPromoCode}
        userEmail={displayEmail}
      />

      <DomainSearchModal
        isOpen={isDomainSearchOpen}
        onClose={() => setIsDomainSearchOpen(false)}
        onAddToCart={handleAddDomainToCart}
      />

      {/* Firebase Cloud Authentication & Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NoIpApp />
    </AuthProvider>
  );
}
