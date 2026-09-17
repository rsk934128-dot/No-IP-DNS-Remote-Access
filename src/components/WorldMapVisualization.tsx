import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import {
  POINTS_OF_PRESENCE,
  PointOfPresence,
  BACKBONE_ROUTES,
  MajorBackboneRoute,
} from '../data/popsData';
import {
  Globe,
  Radio,
  Activity,
  Zap,
  ShieldCheck,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  CheckCircle2,
  Share2,
  Server,
} from 'lucide-react';

type RegionFilter =
  | 'All'
  | 'North America'
  | 'Europe'
  | 'Asia Pacific'
  | 'Latin America'
  | 'Middle East & Africa';

export interface ProjectedPoP extends PointOfPresence {
  x: number;
  y: number;
  isValid: boolean;
}

export const WorldMapVisualization: React.FC = () => {
  // Filters & State
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoP, setSelectedPoP] = useState<ProjectedPoP | null>(null);
  const [hoveredPoP, setHoveredPoP] = useState<ProjectedPoP | null>(null);
  
  // Layer toggles
  const [showPulsing, setShowPulsing] = useState(true);
  const [showBackbone, setShowBackbone] = useState(true);
  const [onlyPrimary, setOnlyPrimary] = useState(false);

  // Live Anycast Ping Simulation State
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    originCity: string;
    resolvedPoP: ProjectedPoP;
    latency: number;
  } | null>(null);

  // SVG Zoom & Pan state
  const [zoomTransform, setZoomTransform] = useState({ k: 1, x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dimensions
  const width = 960;
  const height = 480;

  // D3 Projection and Path Generator
  const { pathGenerator, countryPaths, graticulePath, spherePath, projection } = useMemo(() => {
    // Natural Earth 1 projection provides a realistic, aesthetically balanced world view
    const proj = d3
      .geoNaturalEarth1()
      .scale(155)
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath().projection(proj);

    // Convert TopoJSON to GeoJSON features
    const countries = topojson.feature(
      worldData as unknown as Parameters<typeof topojson.feature>[0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (worldData as any).objects.countries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    const graticule = d3.geoGraticule10();

    return {
      projection: proj,
      pathGenerator: pathGen,
      countryPaths: countries.features.map((feature: unknown) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (feature as any).id || Math.random().toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d: pathGen(feature as any) || '',
      })),
      graticulePath: pathGen(graticule) || '',
      spherePath: pathGen({ type: 'Sphere' }) || '',
    };
  }, [width, height]);

  // Project PoP coordinates to [x, y]
  const projectedPoPs = useMemo(() => {
    return POINTS_OF_PRESENCE.map((pop) => {
      const coords = projection(pop.coordinates);
      return {
        ...pop,
        x: coords ? coords[0] : 0,
        y: coords ? coords[1] : 0,
        isValid: coords !== null,
      };
    });
  }, [projection]);

  // Filtered PoPs
  const filteredPoPs = useMemo(() => {
    return projectedPoPs.filter((pop) => {
      if (!pop.isValid) return false;
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
  }, [projectedPoPs, selectedRegion, searchQuery, onlyPrimary]);

  // Backbone Lines
  const backboneRoutesWithCoords = useMemo(() => {
    const popMap = new Map(projectedPoPs.map((p) => [p.id, p]));
    return BACKBONE_ROUTES.map((route) => {
      const from = popMap.get(route.fromId);
      const to = popMap.get(route.toId);
      if (!from || !to || !from.isValid || !to.isValid) return null;

      // Create an arched bezier curve between two points
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Lift curve towards north
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - Math.min(dist * 0.25, 45);

      const pathData = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

      return {
        ...route,
        pathData,
        from,
        to,
      };
    }).filter(Boolean);
  }, [projectedPoPs]);

  // Zoom helpers
  const handleZoom = (delta: number) => {
    setZoomTransform((prev) => {
      const newK = Math.max(0.8, Math.min(prev.k * delta, 4));
      return { ...prev, k: newK };
    });
  };

  const handleResetZoom = () => {
    setZoomTransform({ k: 1, x: 0, y: 0 });
    setSelectedPoP(null);
    setSearchQuery('');
    setSelectedRegion('All');
  };

  // Simulate an Anycast DNS Query
  const handleSimulatePing = () => {
    setIsSimulatingPing(true);
    setPingResult(null);

    // Random test origin from list of client regions
    const originCities = [
      { name: 'London, UK', coords: [-0.1278, 51.5074] as [number, number] },
      { name: 'San Jose, CA', coords: [-121.8863, 37.3382] as [number, number] },
      { name: 'Tokyo, Japan', coords: [139.6917, 35.6895] as [number, number] },
      { name: 'Frankfurt, Germany', coords: [8.6821, 50.1109] as [number, number] },
      { name: 'Sydney, Australia', coords: [151.2093, -33.8688] as [number, number] },
      { name: 'São Paulo, Brazil', coords: [-46.6333, -23.5505] as [number, number] },
      { name: 'Singapore', coords: [103.8198, 1.3521] as [number, number] },
    ];
    const pickedOrigin = originCities[Math.floor(Math.random() * originCities.length)];

    // Find closest PoP
    let closestPoP = projectedPoPs[0];
    let minDistance = Infinity;

    projectedPoPs.forEach((pop) => {
      const dLon = pop.coordinates[0] - pickedOrigin.coords[0];
      const dLat = pop.coordinates[1] - pickedOrigin.coords[1];
      const dist = Math.sqrt(dLon * dLon + dLat * dLat);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoP = pop;
      }
    });

    setTimeout(() => {
      setSelectedPoP(closestPoP);
      setPingResult({
        originCity: pickedOrigin.name,
        resolvedPoP: closestPoP,
        latency: Math.max(2, Math.round(closestPoP.latencyMs + Math.random() * 2)),
      });
      setIsSimulatingPing(false);
    }, 700);
  };

  // Count metrics per region
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

  return (
    <div
      id="global-pops-interactive-map"
      className="mt-12 rounded-3xl bg-slate-950/90 border border-slate-800/90 shadow-2xl p-4 sm:p-7 relative overflow-hidden backdrop-blur-md text-slate-100"
    >
      {/* Background radial gradient */}
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
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/40">
              {POINTS_OF_PRESENCE.length} Active Nodes
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Explore our low-latency Anycast routing fabric. Distributed across Tier 1 internet
            exchanges on 6 continents for 100% authoritative uptime and sub-10ms query resolution.
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
            <span className="text-xs text-slate-400 block font-medium">Global Latency</span>
            <span className="text-base sm:text-lg font-black text-[#ff6600]">4.8 ms</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="text-xs text-slate-400 block font-medium">DNS Uptime</span>
            <span className="text-base sm:text-lg font-black text-purple-400">99.999%</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Region Tabs, Search & Layer Toggles */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 relative z-10">
        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-thin">
          {(['All', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'] as RegionFilter[]).map((region) => (
            <button
              key={region}
              onClick={() => {
                setSelectedRegion(region);
                setSelectedPoP(null);
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

        {/* Search & Actions */}
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
            onClick={handleSimulatePing}
            disabled={isSimulatingPing}
            className="px-3 py-1.5 rounded-lg bg-linear-to-r from-[#ff6600] to-amber-600 hover:from-[#e55c00] hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Simulate Real-time Anycast DNS Query"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingPing ? 'animate-spin' : ''}`} />
            <span>{isSimulatingPing ? 'Testing Route...' : 'Simulate Query'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative rounded-2xl bg-[#06101e] border border-slate-800/80 overflow-hidden shadow-inner">
        {/* Floating Map Action Tools: Zoom & Layers */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Layer Controls (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
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
            <span>Primary Hubs</span>
          </label>
        </div>

        {/* Simulated Query Live Result Notification */}
        {pingResult && (
          <div className="absolute top-3 left-3 z-20 bg-slate-900/95 border border-emerald-500/50 rounded-xl p-3 shadow-xl backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-white">
                Anycast Query Successfully Resolved
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Query from <strong className="text-white">{pingResult.originCity}</strong> routed to
              closest Anycast PoP <strong className="text-emerald-400">{pingResult.resolvedPoP.city}</strong> in{' '}
              <span className="font-bold text-[#ff6600]">{pingResult.latency}ms</span>.
            </p>
          </div>
        )}

        {/* SVG World Canvas */}
        <div className="w-full overflow-hidden flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[560px] select-none cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <defs>
              {/* Radial gradient for sphere ocean */}
              <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#081b33" />
                <stop offset="100%" stopColor="#030b17" />
              </radialGradient>

              {/* Glowing Pulse Ring Filter */}
              <filter id="popGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Backbone line linear gradient */}
              <linearGradient id="backboneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ff6600" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Transform Group for Zoom & Pan */}
            <g
              transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`}
              style={{
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* Ocean Sphere Background */}
              <path
                d={spherePath}
                fill="url(#oceanGradient)"
                stroke="#1e3a5f"
                strokeWidth="0.75"
              />

              {/* Graticule Latitude/Longitude Grid Lines */}
              <path
                d={graticulePath}
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.5"
                strokeDasharray="2,3"
                opacity="0.6"
              />

              {/* World Landmasses / Countries */}
              <g className="countries">
                {countryPaths.map((country: { id: string; d: string }) => (
                  <path
                    key={country.id}
                    d={country.d}
                    fill="#132337"
                    stroke="#1e3a5f"
                    strokeWidth="0.6"
                    className="transition-colors hover:fill-[#1b314d]"
                  />
                ))}
              </g>

              {/* Backbone Fiber Routes */}
              {showBackbone && (
                <g className="backbone-mesh">
                  {backboneRoutesWithCoords.map((route) => {
                    if (!route) return null;
                    const isConnectedToSelected =
                      selectedPoP &&
                      (selectedPoP.id === route.fromId || selectedPoP.id === route.toId);

                    return (
                      <g key={route.id}>
                        <path
                          d={route.pathData}
                          fill="none"
                          stroke={isConnectedToSelected ? '#ff6600' : 'url(#backboneGradient)'}
                          strokeWidth={isConnectedToSelected ? 2 : 1}
                          strokeDasharray={isConnectedToSelected ? 'none' : '3,3'}
                          opacity={isConnectedToSelected ? 1 : 0.45}
                        />
                        {/* Animated traveling packet pulse along backbone */}
                        {isConnectedToSelected && (
                          <circle r="3" fill="#ff6600" filter="url(#popGlow)">
                            <animateMotion
                              path={route.pathData}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 150+ Points of Presence (PoPs) */}
              <g className="pop-nodes">
                {filteredPoPs.map((pop, idx) => {
                  const isSelected = selectedPoP?.id === pop.id;
                  const isHovered = hoveredPoP?.id === pop.id;
                  const isPrimary = pop.isPrimaryHub;

                  // Pulse animation delay stagger so all 150 nodes create a continuous breathing network effect
                  const pulseDelay = (idx % 8) * 0.25;

                  return (
                    <g
                      key={pop.id}
                      transform={`translate(${pop.x}, ${pop.y})`}
                      className="cursor-pointer transition-transform"
                      onClick={() => setSelectedPoP(pop)}
                      onMouseEnter={() => setHoveredPoP(pop)}
                      onMouseLeave={() => setHoveredPoP(null)}
                    >
                      {/* Pulsing Radar Ring (for active nodes) */}
                      {showPulsing && pop.status === 'active' && (
                        <>
                          <circle
                            r={isPrimary ? 9 : 6}
                            fill={isPrimary ? '#ff6600' : '#10b981'}
                            opacity="0.3"
                            style={{
                              animation: `ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite`,
                              animationDelay: `${pulseDelay}s`,
                              transformOrigin: 'center center',
                            }}
                          />
                          {isPrimary && (
                            <circle
                              r="13"
                              fill="none"
                              stroke="#ff6600"
                              strokeWidth="0.8"
                              opacity="0.4"
                              style={{
                                animation: `ping 3.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
                                animationDelay: `${pulseDelay + 0.5}s`,
                              }}
                            />
                          )}
                        </>
                      )}

                      {/* Highlight Beacon Ring when Selected or Hovered */}
                      {(isSelected || isHovered) && (
                        <circle
                          r="11"
                          fill="none"
                          stroke={isSelected ? '#ff6600' : '#38bdf8'}
                          strokeWidth="1.8"
                          filter="url(#popGlow)"
                          className="animate-pulse"
                        />
                      )}

                      {/* Core PoP Node Circle */}
                      <circle
                        r={isSelected ? 5.5 : isPrimary ? 3.8 : 2.5}
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
                        strokeWidth={isSelected ? 1.5 : 0.8}
                        filter={isPrimary || isSelected ? 'url(#popGlow)' : undefined}
                      />

                      {/* Larger hit target for effortless mobile/desktop clicking */}
                      <circle r="12" fill="transparent" />
                    </g>
                  );
                })}
              </g>

              {/* Floating Tooltip Over Node */}
              {(hoveredPoP || selectedPoP) && (
                <g
                  transform={`translate(${
                    (selectedPoP || hoveredPoP)!.x
                  }, ${(selectedPoP || hoveredPoP)!.y - 12})`}
                  className="pointer-events-none"
                >
                  <rect
                    x="-60"
                    y="-30"
                    width="120"
                    height="24"
                    rx="6"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="-14"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {(selectedPoP || hoveredPoP)!.city} ({(selectedPoP || hoveredPoP)!.latencyMs}ms)
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive PoP Detail Card & Network Stats */}
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
                    {selectedPoP ? selectedPoP.city : 'Ashburn, VA (Primary Global Hub)'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedPoP
                      ? `${selectedPoP.country} • ${selectedPoP.region}`
                      : 'United States • North America Anycast Core'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                  Active Anycast
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  DNS Latency
                </span>
                <span className="text-base font-extrabold text-[#ff6600]">
                  {selectedPoP ? `${selectedPoP.latencyMs} ms` : '3 ms'}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  SLA Uptime
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  {selectedPoP ? `${selectedPoP.uptimePct}%` : '99.999%'}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Subnet CIDR
                </span>
                <span className="text-xs font-mono font-bold text-slate-200 truncate block mt-0.5">
                  {selectedPoP ? selectedPoP.ipRange : '198.51.100.0/24'}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  BGP Anycast
                </span>
                <span className="text-xs font-bold text-purple-300 block mt-0.5">
                  Full Mesh (AS-Anycast)
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">
                Tier 1 Transit & Peering:{' '}
                <strong className="text-slate-100 font-semibold">
                  {selectedPoP
                    ? selectedPoP.transitProviders
                    : 'Equinix IBX / Lumen / Telia Carrier / DE-CIX'}
                </strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 uppercase font-bold shrink-0 ml-2">
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
                  <span>North America (48 PoPs)</span>
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
                  <span>Latin America & MEA (30 PoPs)</span>
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
              DDoS Protected Core
            </span>
            <span>Sub-second failover</span>
          </div>
        </div>
      </div>
    </div>
  );
};
