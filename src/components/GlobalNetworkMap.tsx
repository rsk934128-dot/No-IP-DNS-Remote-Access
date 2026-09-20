import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
  Sphere,
  Graticule,
} from 'react-simple-maps';
import worldData from 'world-atlas/countries-110m.json';
import {
  POINTS_OF_PRESENCE,
  PointOfPresence,
  BACKBONE_ROUTES,
} from '../data/popsData';
import {
  Radio,
  Zap,
  ShieldCheck,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  CheckCircle2,
  Server,
  Activity,
  Globe2,
  Crosshair,
  Maximize2,
} from 'lucide-react';

type RegionFilter =
  | 'All'
  | 'North America'
  | 'Europe'
  | 'Asia Pacific'
  | 'Latin America'
  | 'Middle East & Africa';

export const GlobalNetworkMap: React.FC = () => {
  // Filters & Selection State
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoP, setSelectedPoP] = useState<PointOfPresence | null>(null);
  const [hoveredPoP, setHoveredPoP] = useState<PointOfPresence | null>(null);

  // Map Navigation & Zoom State
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [10, 18],
    zoom: 1,
  });

  // Layer toggles
  const [showPulsing, setShowPulsing] = useState(true);
  const [showBackbone, setShowBackbone] = useState(true);
  const [onlyPrimary, setOnlyPrimary] = useState(false);

  // Live Anycast Ping Simulation State
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    originCity: string;
    originCoords: [number, number];
    resolvedPoP: PointOfPresence;
    latency: number;
    popCount: number;
  } | null>(null);

  // Map of PoPs by ID for quick backbone lookups
  const popMap = useMemo(() => {
    return new Map(POINTS_OF_PRESENCE.map((p) => [p.id, p]));
  }, []);

  // Filtered PoPs based on Region, Search Query, and Primary Hub toggle
  const filteredPoPs = useMemo(() => {
    return POINTS_OF_PRESENCE.filter((pop) => {
      if (onlyPrimary && !pop.isPrimaryHub) return false;
      if (selectedRegion !== 'All' && pop.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          pop.city.toLowerCase().includes(query) ||
          pop.country.toLowerCase().includes(query) ||
          pop.region.toLowerCase().includes(query) ||
          pop.transitProviders.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedRegion, searchQuery, onlyPrimary]);

  // Backbone fiber routes with resolved coordinate pairs
  const activeBackboneRoutes = useMemo(() => {
    return BACKBONE_ROUTES.map((route) => {
      const from = popMap.get(route.fromId);
      const to = popMap.get(route.toId);
      if (!from || !to) return null;
      return {
        id: route.id,
        fromId: route.fromId,
        toId: route.toId,
        fromCoords: from.coordinates,
        toCoords: to.coordinates,
        fromCity: from.city,
        toCity: to.city,
      };
    }).filter(Boolean) as Array<{
      id: string;
      fromId: string;
      toId: string;
      fromCoords: [number, number];
      toCoords: [number, number];
      fromCity: string;
      toCity: string;
    }>;
  }, [popMap]);

  // Zoom handlers
  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.4, 4.5),
    }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.4, 1),
    }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [10, 18], zoom: 1 });
    setSelectedPoP(null);
    setSearchQuery('');
    setSelectedRegion('All');
    setPingResult(null);
  };

  const handleMoveEnd = (newPosition: { coordinates?: [number, number]; zoom?: number }) => {
    if (newPosition && newPosition.coordinates) {
      setPosition({
        coordinates: newPosition.coordinates,
        zoom: newPosition.zoom ?? 1,
      });
    }
  };

  // Focus on a specific PoP
  const handleSelectPoP = (pop: PointOfPresence) => {
    setSelectedPoP(pop);
    setPosition((prev) => ({
      coordinates: pop.coordinates,
      zoom: Math.max(prev.zoom, 1.8),
    }));
  };

  // Simulate an Anycast DNS Query from a random global test origin
  const handleSimulatePing = () => {
    setIsSimulatingPing(true);
    setPingResult(null);

    const clientOrigins = [
      { name: 'London, UK', coords: [-0.1278, 51.5074] as [number, number] },
      { name: 'San Jose, CA', coords: [-121.8863, 37.3382] as [number, number] },
      { name: 'Tokyo, Japan', coords: [139.6917, 35.6895] as [number, number] },
      { name: 'Frankfurt, Germany', coords: [8.6821, 50.1109] as [number, number] },
      { name: 'Sydney, Australia', coords: [151.2093, -33.8688] as [number, number] },
      { name: 'São Paulo, Brazil', coords: [-46.6333, -23.5505] as [number, number] },
      { name: 'Singapore', coords: [103.8198, 1.3521] as [number, number] },
      { name: 'Nairobi, Kenya', coords: [36.8219, -1.2921] as [number, number] },
      { name: 'Mumbai, India', coords: [72.8777, 19.076] as [number, number] },
    ];

    const picked = clientOrigins[Math.floor(Math.random() * clientOrigins.length)];

    // Compute spherical Euclidean distance approximation to find closest active PoP
    let closestPoP = POINTS_OF_PRESENCE[0];
    let minDistance = Infinity;

    POINTS_OF_PRESENCE.forEach((pop) => {
      const dLon = pop.coordinates[0] - picked.coords[0];
      const dLat = pop.coordinates[1] - picked.coords[1];
      const dist = Math.sqrt(dLon * dLon + dLat * dLat);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoP = pop;
      }
    });

    setTimeout(() => {
      setSelectedPoP(closestPoP);
      setPosition({
        coordinates: closestPoP.coordinates,
        zoom: 2,
      });
      setPingResult({
        originCity: picked.name,
        originCoords: picked.coords,
        resolvedPoP: closestPoP,
        latency: Math.max(2, Math.round(closestPoP.latencyMs + Math.random() * 2)),
        popCount: POINTS_OF_PRESENCE.length,
      });
      setIsSimulatingPing(false);
    }, 650);
  };

  // Region count metrics
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: POINTS_OF_PRESENCE.length,
      'North America': 0,
      Europe: 0,
      'Asia Pacific': 0,
      'Latin America': 0,
      'Middle East & Africa': 0,
    };
    POINTS_OF_PRESENCE.forEach((p) => {
      if (counts[p.region] !== undefined) {
        counts[p.region]++;
      }
    });
    return counts;
  }, []);

  const activeFocusPoP = selectedPoP || hoveredPoP || popMap.get('pop-na-ashburn') || POINTS_OF_PRESENCE[0];

  return (
    <div
      id="global-pops-interactive-map"
      className="mt-12 rounded-3xl bg-slate-950/90 border border-slate-800/90 shadow-2xl p-4 sm:p-7 relative overflow-hidden backdrop-blur-md text-slate-100"
    >
      {/* Background radial gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff6600]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Telemetry Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 relative z-10 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>LIVE GLOBAL ANYCAST DNS MESH</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>150+ Global Points of Presence (PoPs)</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/40">
              {POINTS_OF_PRESENCE.length} Active Nodes
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Powered by high-capacity Anycast BGP routing across 6 continents. All nodes broadcast identical IP ranges
            via Tier-1 transit providers to deliver instant DNS resolution and zero-latency failover.
          </p>
        </div>

        {/* Global SLA Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="text-xs text-slate-400 block font-medium">Nodes Online</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {POINTS_OF_PRESENCE.length} / {POINTS_OF_PRESENCE.length}
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="text-xs text-slate-400 block font-medium">Avg Latency</span>
            <span className="text-base sm:text-lg font-black text-[#ff6600]">4.8 ms</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="text-xs text-slate-400 block font-medium">Anycast Uptime</span>
            <span className="text-base sm:text-lg font-black text-purple-400">99.999%</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Region Tabs, Search & Action Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 relative z-10">
        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-thin">
          {(['All', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'] as RegionFilter[]).map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => {
                setSelectedRegion(region);
                setSelectedPoP(null);
                if (region === 'North America') setPosition({ coordinates: [-95, 40], zoom: 1.8 });
                else if (region === 'Europe') setPosition({ coordinates: [15, 52], zoom: 2.2 });
                else if (region === 'Asia Pacific') setPosition({ coordinates: [115, 20], zoom: 1.7 });
                else if (region === 'Latin America') setPosition({ coordinates: [-60, -18], zoom: 1.8 });
                else if (region === 'Middle East & Africa') setPosition({ coordinates: [35, 12], zoom: 1.8 });
                else setPosition({ coordinates: [10, 18], zoom: 1 });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRegion === region
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {region === 'All' ? 'All Continents' : region} ({regionCounts[region]})
            </button>
          ))}
        </div>

        {/* Search Bar & Ping Simulator Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 150+ PoPs..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleSimulatePing}
            disabled={isSimulatingPing}
            className="px-3 py-1.5 rounded-lg bg-linear-to-r from-[#ff6600] to-amber-600 hover:from-[#e55c00] hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Simulate Real-time Anycast DNS Query"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingPing ? 'animate-spin' : ''}`} />
            <span>{isSimulatingPing ? 'Routing...' : 'Simulate Query'}</span>
          </button>
        </div>
      </div>

      {/* Main react-simple-maps Visualization Canvas */}
      <div className="relative rounded-2xl bg-[#050f1d] border border-slate-800/90 overflow-hidden shadow-inner">
        {/* Floating Zoom & Pan Controls (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Layer Controls (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPulsing}
              onChange={(e) => setShowPulsing(e.target.checked)}
              className="accent-emerald-500 rounded-sm cursor-pointer"
            />
            <span>Radar Pulses</span>
          </label>
          <span className="text-slate-700">|</span>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBackbone}
              onChange={(e) => setShowBackbone(e.target.checked)}
              className="accent-[#ff6600] rounded-sm cursor-pointer"
            />
            <span>Backbone Mesh</span>
          </label>
          <span className="text-slate-700">|</span>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyPrimary}
              onChange={(e) => setOnlyPrimary(e.target.checked)}
              className="accent-purple-500 rounded-sm cursor-pointer"
            />
            <span>Primary Hubs Only</span>
          </label>
        </div>

        {/* Real-time Query Feedback Card */}
        {pingResult && (
          <div className="absolute top-3 left-3 z-20 bg-slate-900/95 border border-emerald-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white">
                Anycast Query Successfully Resolved
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Query from <strong className="text-white">{pingResult.originCity}</strong> automatically routed to
              closest Anycast PoP <strong className="text-emerald-400">{pingResult.resolvedPoP.city}</strong> in{' '}
              <span className="font-bold text-[#ff6600]">{pingResult.latency} ms</span> via Tier 1 Anycast BGP.
            </p>
          </div>
        )}

        {/* Interactive react-simple-maps Map */}
        <div className="w-full h-auto select-none">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 165,
              center: [0, 0],
            }}
            width={960}
            height={480}
            className="w-full h-auto max-h-[560px] cursor-grab active:cursor-grabbing outline-hidden"
          >
            <defs>
              {/* Radial gradient for glowing Anycast hubs */}
              <radialGradient id="rsmGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="primaryGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff6600" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={4.5}
            >
              {/* Globe Sphere & Graticule Lat/Long lines */}
              <Sphere
                id="rsm-globe-sphere"
                fill="#071324"
                stroke="#172e4c"
                strokeWidth={0.7}
              />
              <Graticule
                stroke="#15263d"
                strokeWidth={0.5}
                strokeDasharray="2,3"
              />

              {/* World Geographies / Continents */}
              <Geographies geography={worldData as any}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: '#132338',
                          stroke: '#1e385b',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: {
                          fill: '#1a304d',
                          stroke: '#38bdf8',
                          strokeWidth: 0.7,
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#0f172a',
                          outline: 'none',
                        },
                      } as any}
                    />
                  ))
                }
              </Geographies>

              {/* Backbone Mesh Lines connecting global hubs */}
              {showBackbone &&
                activeBackboneRoutes.map((route) => {
                  const isHighlighted =
                    selectedPoP &&
                    (selectedPoP.id === route.fromId || selectedPoP.id === route.toId);

                  return (
                    <Line
                      key={route.id}
                      from={route.fromCoords}
                      to={route.toCoords}
                      stroke={isHighlighted ? '#ff6600' : '#0284c7'}
                      strokeWidth={isHighlighted ? 2 : 0.85}
                      strokeDasharray={isHighlighted ? 'none' : '2,3'}
                      strokeOpacity={isHighlighted ? 0.95 : 0.45}
                    />
                  );
                })}

              {/* Simulated ping route line */}
              {pingResult && (
                <Line
                  from={pingResult.originCoords}
                  to={pingResult.resolvedPoP.coordinates}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4,2"
                />
              )}

              {/* 150+ Anycast Point of Presence (PoP) Markers */}
              {filteredPoPs.map((pop, idx) => {
                const isSelected = selectedPoP?.id === pop.id;
                const isHovered = hoveredPoP?.id === pop.id;
                const isPrimary = pop.isPrimaryHub;
                const pulseDelay = (idx % 8) * 0.25;

                return (
                  <Marker
                    key={pop.id}
                    coordinates={pop.coordinates}
                    onClick={() => handleSelectPoP(pop)}
                    onMouseEnter={() => setHoveredPoP(pop)}
                    onMouseLeave={() => setHoveredPoP(null)}
                    className="cursor-pointer transition-transform"
                  >
                    {/* Animated radar ring pulses */}
                    {showPulsing && pop.status === 'active' && (
                      <circle
                        r={isPrimary ? 8 : 5}
                        fill={isPrimary ? 'url(#primaryGlow)' : 'url(#rsmGlow)'}
                        opacity="0.65"
                        style={{
                          animation: `ping 2.6s cubic-bezier(0, 0, 0.2, 1) infinite`,
                          animationDelay: `${pulseDelay}s`,
                          transformOrigin: 'center center',
                        }}
                      />
                    )}

                    {/* Active highlight ring when hovered or selected */}
                    {(isSelected || isHovered) && (
                      <circle
                        r="9"
                        fill="none"
                        stroke={isSelected ? '#ff6600' : '#38bdf8'}
                        strokeWidth="1.8"
                        className="animate-pulse"
                      />
                    )}

                    {/* Core PoP marker dot */}
                    <circle
                      r={isSelected ? 4.5 : isPrimary ? 3.2 : 2.2}
                      fill={
                        isSelected
                          ? '#ff6600'
                          : isPrimary
                          ? '#fb923c'
                          : pop.status === 'active'
                          ? '#10b981'
                          : '#94a3b8'
                      }
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 1.4 : 0.7}
                    />

                    {/* Floating Tooltip label over the node when hovered or selected */}
                    {(isSelected || isHovered) && (
                      <g transform="translate(0, -12)" className="pointer-events-none">
                        <rect
                          x="-55"
                          y="-20"
                          width="110"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                          stroke={isSelected ? '#ff6600' : '#38bdf8'}
                          strokeWidth="0.8"
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="-7.5"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          {pop.city} ({pop.latencyMs}ms)
                        </text>
                      </g>
                    )}
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Interactive PoP Inspector & Distribution Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selected PoP Inspector Panel */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    {activeFocusPoP.city} {activeFocusPoP.isPrimaryHub ? '(Primary Global Hub)' : ''}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {activeFocusPoP.country} • {activeFocusPoP.region}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                  Active Anycast Node
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  DNS Latency
                </span>
                <span className="text-base font-extrabold text-[#ff6600]">
                  {activeFocusPoP.latencyMs} ms
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  SLA Uptime
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  {activeFocusPoP.uptimePct}%
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Subnet CIDR
                </span>
                <span className="text-xs font-mono font-bold text-slate-200 truncate block mt-0.5">
                  {activeFocusPoP.ipRange}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  BGP Routing
                </span>
                <span className="text-xs font-bold text-purple-300 block mt-0.5">
                  Full Anycast Mesh
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-300 font-medium">
                Tier 1 Transit & Peering:{' '}
                <strong className="text-slate-100 font-semibold">
                  {activeFocusPoP.transitProviders}
                </strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 uppercase font-bold shrink-0">
                IPv4 + IPv6 Dual Stack
              </span>
            </div>
          </div>
        </div>

        {/* Global Distribution Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-[#ff6600]" />
              <span>Continental Node Distribution</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>North America (50 PoPs)</span>
                  <span className="font-bold text-emerald-400">99.999% SLA</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Europe (42 PoPs)</span>
                  <span className="font-bold text-emerald-400">99.999% SLA</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Asia Pacific (38 PoPs)</span>
                  <span className="font-bold text-emerald-400">99.998% SLA</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Latin America & MEA (28 PoPs)</span>
                  <span className="font-bold text-emerald-400">99.997% SLA</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              DDoS Protected Mesh
            </span>
            <span>Sub-second Anycast Failover</span>
          </div>
        </div>
      </div>
    </div>
  );
};
