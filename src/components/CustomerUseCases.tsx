import React, { useState } from 'react';
import { 
  Building2, 
  Home as HomeIcon, 
  Network, 
  Sliders, 
  Cctv, 
  Gamepad2, 
  HardDrive, 
  Tv, 
  ArrowRight, 
  CheckCircle, 
  X,
  Shield,
  Layers,
  Zap
} from 'lucide-react';
import { CustomerAudience } from '../types';

interface CustomerUseCasesProps {
  activeAudience: CustomerAudience;
  setActiveAudience: (audience: CustomerAudience) => void;
  onOpenPortChecker: () => void;
}

interface CaseItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tags: string[];
  fullDetails: {
    overview: string;
    benefits: string[];
    technicalSetup: string;
  };
}

export const CustomerUseCases: React.FC<CustomerUseCasesProps> = ({
  activeAudience,
  setActiveAudience,
  onOpenPortChecker,
}) => {
  const [selectedCaseModal, setSelectedCaseModal] = useState<CaseItem | null>(null);

  const businessCases: CaseItem[] = [
    {
      id: 'multi-location',
      title: 'Manage Multi-Location Networks',
      desc: 'Ensure reliable access to devices, servers, and critical services across your enterprise, simplifying network management and maximizing uptime.',
      icon: <Network className="w-6 h-6 text-blue-600" />,
      tags: ['Branch Offices', 'SD-WAN', 'Multi-Site IP'],
      fullDetails: {
        overview: 'Organizations operating retail chains, remote branches, or satellite offices often face the challenge of dynamic public IPs assigned by local ISPs. No-IP dynamically syncs every branch router with a unified corporate sub-domain, preventing connectivity drops.',
        benefits: [
          'Eliminate the high recurring cost of static enterprise IPs at every satellite location',
          'Automated health-check failover to standby connections',
          'API synchronization with Cisco, Mikrotik, and Ubiquiti hardware',
          'Centralized management dashboard for thousands of endpoints'
        ],
        technicalSetup: 'Deploy the No-IP Linux/Windows client or enable the native DDNS setting in your branch gateway router to point to your enterprise hostname.'
      }
    },
    {
      id: 'sysadmin',
      title: 'Perform System Administration',
      desc: 'Acquire and configure domains, manage DNS zones and corporate firewalls, and more with our full system admin suite.',
      icon: <Sliders className="w-6 h-6 text-[#ff6600]" />,
      tags: ['DNS Zones', 'Firewall Rules', 'API Automation'],
      fullDetails: {
        overview: 'System administrators need reliable programmatic control over DNS records, reverse lookups, TTL controls, and automated SSL certificate renewals without complex server overhead.',
        benefits: [
          'RESTful API for CI/CD automated hostname creation and DNS propagation',
          'Granular Role-Based Access Control (RBAC) for junior vs. senior admins',
          'Custom TTL settings as low as 60 seconds for near-instant IP failover',
          'Direct integration with corporate firewalls and VPN concentrators'
        ],
        technicalSetup: 'Use our official No-IP REST API endpoints or PowerShell/Bash scripts to automate IP updates and zone modifications.'
      }
    },
    {
      id: 'security-monitoring',
      title: 'Security and Alarm Monitoring',
      desc: 'Provide clients with reliable, secure remote access to their security cameras, alarms, and surveillance systems—anytime, anywhere.',
      icon: <Cctv className="w-6 h-6 text-emerald-600" />,
      tags: ['CCTV / NVR', 'Alarm Panels', 'White-Label DDNS'],
      fullDetails: {
        overview: 'Alarm integrators and surveillance technicians install thousands of DVR/NVR recorders that require remote viewing apps for homeowners and property managers. No-IP provides dedicated DDNS profiles so camera feeds never drop.',
        benefits: [
          'Native integration in Hikvision, Dahua, Axis, Honeywell, and Bosch firmware',
          'White-label custom domain branding for alarm installer loyalty',
          'Public Tunnels option to bypass carrier-grade NAT (CGNAT) and port forwarding',
          'Eliminates expensive on-site technician truck rolls caused by ISP IP resets'
        ],
        technicalSetup: 'Enter your No-IP DDNS credentials directly inside the NVR network menu or use Public Tunnels for port-free camera feeds.'
      }
    }
  ];

  const homeCases: CaseItem[] = [
    {
      id: 'gaming-rdp',
      title: 'Remote Desktop & Gaming Servers',
      desc: 'Host your own Minecraft, Palworld, Valheim, or Discord bot servers, or access your high-performance home workstation from anywhere via Windows RDP or Parsec.',
      icon: <Gamepad2 className="w-6 h-6 text-purple-600" />,
      tags: ['Minecraft 25565', 'Windows RDP 3389', 'Zero Lag'],
      fullDetails: {
        overview: 'Share a single, memorable address like "alex-mc.ddns.net" with your friends instead of texting them your changing numeric IP address every time your home router reboots.',
        benefits: [
          'Never lose connection to your game worlds or remote desktop sessions',
          'Free Dynamic DNS keeps working 24/7/365',
          'Low-latency Anycast routing ensures direct peer-to-peer connection',
          'Works seamlessly with Windows, macOS, Linux, and Proxmox hosts'
        ],
        technicalSetup: 'Install the free No-IP Dynamic Update Client (DUC) on your gaming PC and forward your game port (e.g., 25565) in your router.'
      }
    },
    {
      id: 'home-nas-cloud',
      title: 'Private Cloud & Media Servers (Plex / NAS)',
      desc: 'Stream your music, 4K movies, and sync personal photos securely to Synology, TrueNAS, unRAID, or Nextcloud without third-party subscription fees.',
      icon: <HardDrive className="w-6 h-6 text-blue-600" />,
      tags: ['Synology', 'Nextcloud', 'TrueNAS / unRAID'],
      fullDetails: {
        overview: 'Take full ownership of your personal data. Connect your mobile phone to your home storage drive from any cellular network with end-to-end SSL encryption.',
        benefits: [
          'Full-speed direct streaming without bandwidth throttling from public clouds',
          'Pre-built DDNS support built into Synology DSM and QNAP QTS operating systems',
          'Pair with Let’s Encrypt automated certificates for green browser padlocks',
          'Access file backups while traveling internationally'
        ],
        technicalSetup: 'Select "No-IP" in your Synology DSM / QNAP Control Panel > External Access > DDNS, and authenticate with your account credentials.'
      }
    },
    {
      id: 'smart-home-iot',
      title: 'Smart Home & Home Assistant Remote Access',
      desc: 'Control your smart lights, thermostats, garage doors, and Zigbee sensors via Home Assistant, ESPHome, or Node-RED from the road.',
      icon: <Tv className="w-6 h-6 text-amber-600" />,
      tags: ['Home Assistant', 'Node-RED', 'IoT Automation'],
      fullDetails: {
        overview: 'Remotely access your Home Assistant dashboard (port 8123) without paying monthly cloud companion subscriptions. Receive instant push alerts when motion is detected.',
        benefits: [
          'Direct TLS encrypted communication to your local home coordinator',
          'Zero recurring monthly fees for remote companion app connection',
          'Supports webhooks for GPS geolocation automations',
          'Automatic IP updates even after power outages or modem power cycles'
        ],
        technicalSetup: 'Install the official No-IP add-on inside Home Assistant Community Store (HACS) or configure your home router DDNS page.'
      }
    }
  ];

  const currentList = activeAudience === 'business' ? businessCases : homeCases;

  return (
    <section id="how-customers-use-section" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] tracking-tight">
            How Customers Use No-IP
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            People and companies across the world use No-IP’s Dynamic DNS and Managed DNS services to access their computers and files remotely, monitor cameras or smart devices, and more.
          </p>

          {/* Interactive Toggle Pills: Business vs. Home */}
          <div className="inline-flex items-center p-1.5 mt-8 bg-slate-200/90 rounded-xl shadow-inner gap-1">
            <button
              id="audience-tab-business"
              onClick={() => setActiveAudience('business')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                activeAudience === 'business'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Business
            </button>

            <button
              id="audience-tab-home"
              onClick={() => setActiveAudience('home')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                activeAudience === 'home'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HomeIcon className="w-4 h-4 text-[#ff6600]" />
              Home
            </button>
          </div>
        </div>

        {/* 3 Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-[#0a2540]/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    {item.icon}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0a2540] mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  id={`learn-more-${item.id}-btn`}
                  onClick={() => setSelectedCaseModal(item)}
                  className="text-xs font-bold text-[#ff6600] hover:text-[#e65c00] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenPortChecker}
                  className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                  title="Check port accessibility for this use case"
                >
                  Check Ports
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learn More Details Modal */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-[#ff6600] rounded-xl border border-orange-100">
                  {selectedCaseModal.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0a2540]">
                    {selectedCaseModal.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detailed Solution Blueprint & Architecture
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCaseModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-[#0a2540] uppercase tracking-wider text-xs mb-1">Overview</h4>
                <p className="text-slate-600 leading-relaxed">{selectedCaseModal.fullDetails.overview}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0a2540] uppercase tracking-wider text-xs mb-2">Key Advantages</h4>
                <ul className="space-y-1.5">
                  {selectedCaseModal.fullDetails.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-[#0a2540] text-xs mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#ff6600]" />
                  Setup Instruction
                </h4>
                <p className="text-xs text-slate-600">{selectedCaseModal.fullDetails.technicalSetup}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCaseModal(null);
                  onOpenPortChecker();
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
              >
                Test Required Ports
              </button>

              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-5 py-2 bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
