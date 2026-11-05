import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapPin,
  Truck,
  AlertTriangle,
  Layers,
  Info,
  Filter,
  RefreshCw,
  Maximize2,
  Search,
  Navigation,
  Compass,
  Building2,
  X
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { SmartBin } from '../types';

// Leaflet default icon fix for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Default Peelamedu, Coimbatore Coordinates
const PEELAMEDU_CENTER: [number, number] = [11.0260, 77.0100];
const DEFAULT_ZOOM = 15;

// Predefined Peelamedu Road-Network Collection Routes
// Route A: Avinashi Road (NH 544) Express Corridor
const ROUTE_A_WAYPOINTS: [number, number][] = [
  [11.0185, 76.9860], // Lakshmi Mills Junction (Avinashi Rd West)
  [11.0210, 76.9945], // Nava India Junction
  [11.0245, 77.0028], // PSG College of Technology Gate
  [11.0260, 77.0085], // Peelamedu Central Bus Shelter
  [11.0275, 77.0110], // PSGR Krishnammal College
  [11.0282, 77.0130], // Hope College Junction
  [11.0308, 77.0182], // Fun Republic Mall Promenade
  [11.0282, 77.0130], // Return loop via Hope College
  [11.0245, 77.0028], // Back to PSG Tech Corridor
];

// Route B: TIDEL Park IT SEZ & Aerodrome Circuit
const ROUTE_B_WAYPOINTS: [number, number][] = [
  [11.0282, 77.0130], // Hope College Junction
  [11.0330, 77.0170], // Hopes - Vilankurichi Link
  [11.0360, 77.0195], // Codissia Trade Fair Complex Ring Road
  [11.0345, 77.0260], // TIDEL Park Coimbatore & ELCOT IT SEZ
  [11.0325, 77.0320], // Civil Aerodrome Link Road
  [11.0315, 77.0385], // Coimbatore International Airport Cargo Access
  [11.0308, 77.0182], // Fun Republic Mall Junction
  [11.0282, 77.0130], // Return to Hope College
];

// Key Peelamedu Landmarks catalog for instant search and quick-jump navigation
export const PEELAMEDU_LANDMARKS = [
  { name: 'Peelamedu Central', query: 'peelamedu', coords: [11.0260, 77.0100] as [number, number], category: 'Transit & Core', description: 'Central Peelamedu municipal corridor along Avinashi Road.' },
  { name: 'PSG College of Technology', query: 'psg tech', coords: [11.0245, 77.0028] as [number, number], category: 'Education', description: 'Premier autonomous technical institution on Avinashi Road.' },
  { name: 'Hope College Junction', query: 'hope college', coords: [11.0282, 77.0130] as [number, number], category: 'Junction', description: 'Crucial interchange linking Avinashi Road and Kamarajar Road.' },
  { name: 'TIDEL Park Coimbatore', query: 'tidel park', coords: [11.0345, 77.0260] as [number, number], category: 'IT SEZ', description: 'Flagship ELCOT IT special economic zone on Vilankurichi Road.' },
  { name: 'Fun Republic Mall', query: 'fun republic', coords: [11.0308, 77.0182] as [number, number], category: 'Commercial', description: 'Major retail, dining and entertainment destination.' },
  { name: 'Coimbatore Airport (CJB)', query: 'airport', coords: [11.0315, 77.0385] as [number, number], category: 'Transit', description: 'Civil Aerodrome Post & international passenger terminal.' },
  { name: 'Lakshmi Mills Junction', query: 'lakshmi mills', coords: [11.0185, 76.9860] as [number, number], category: 'Junction', description: 'Western entry junction into Peelamedu via Avinashi Road.' },
  { name: 'Nava India Junction', query: 'nava india', coords: [11.0210, 76.9945] as [number, number], category: 'Campus Zone', description: 'Academic crossroads connecting Avinashi Road.' },
  { name: 'Codissia Complex', query: 'codissia', coords: [11.0360, 77.0195] as [number, number], category: 'Exhibition', description: 'Trade fair and industrial convention centre.' },
];

interface VehicleState {
  id: string;
  plate: string;
  driver: string;
  zone: string;
  status: 'Collecting' | 'In Transit' | 'Returning' | 'Available';
  speedKmH: number;
  currentLat: number;
  currentLng: number;
  routeColor: string;
  routeIndex: number;
  routeWaypoints: [number, number][];
  capacityKg: number;
  currentLoadKg: number;
}

export const LiveCityMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Dedicated Leaflet LayerGroups
  const binsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const vehiclesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Marker registry for programmatic popups
  const binMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const [bins, setBins] = useState<SmartBin[]>([]);
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [tileError, setTileError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Layer toggles
  const [showBins, setShowBins] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    title: string;
    subtitle: string;
    type: 'bin' | 'vehicle' | 'landmark' | 'street' | 'zone';
    coords: [number, number];
    rawObject?: any;
  }>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<string>('All Peelamedu');

  // Live vehicles state relocated to Peelamedu with TN-38 Coimbatore registration
  const [vehicles, setVehicles] = useState<VehicleState[]>([
    {
      id: 'VEH-EV-01',
      plate: 'TN-38-EV-4421',
      driver: 'Karthik R.',
      zone: 'Peelamedu - Avinashi Commercial Corridor',
      status: 'Collecting',
      speedKmH: 26,
      currentLat: ROUTE_A_WAYPOINTS[2][0], // PSG Tech
      currentLng: ROUTE_A_WAYPOINTS[2][1],
      routeColor: '#166534',
      routeIndex: 2,
      routeWaypoints: ROUTE_A_WAYPOINTS,
      capacityKg: 3500,
      currentLoadKg: 2150,
    },
    {
      id: 'VEH-EV-02',
      plate: 'TN-38-EV-4422',
      driver: 'Murugan S.',
      zone: 'TIDEL Park & Airport Sector',
      status: 'In Transit',
      speedKmH: 38,
      currentLat: ROUTE_B_WAYPOINTS[3][0], // TIDEL Park
      currentLng: ROUTE_B_WAYPOINTS[3][1],
      routeColor: '#2563EB',
      routeIndex: 3,
      routeWaypoints: ROUTE_B_WAYPOINTS,
      capacityKg: 3500,
      currentLoadKg: 1420,
    },
  ]);

  // 1. Fetch smart bins from backend
  const loadMapData = useCallback(async () => {
    try {
      const binList = await api.getBins();
      setBins(binList);
    } catch (e) {
      console.error('Failed to fetch smart bins:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();

    // Subscribe to realtime bin changes
    const unsubscribe = api.subscribeToBins?.(() => {
      loadMapData();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadMapData]);

  // 2. Initialize Leaflet Map centered at Peelamedu, Coimbatore
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    try {
      // Map centered on Peelamedu, Coimbatore (11.0260, 77.0100) at zoom 15
      const map = L.map(container, {
        center: PEELAMEDU_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Real OpenStreetMap Tiles
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | Peelamedu, Coimbatore GIS',
      }).addTo(map);

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      // Initialize layer groups
      const routesGroup = L.layerGroup().addTo(map);
      const binsGroup = L.layerGroup().addTo(map);
      const vehiclesGroup = L.layerGroup().addTo(map);

      routesLayerGroupRef.current = routesGroup;
      binsLayerGroupRef.current = binsGroup;
      vehiclesLayerGroupRef.current = vehiclesGroup;

      // Ensure proper sizing on render
      map.invalidateSize();
      const timer1 = setTimeout(() => map.invalidateSize(), 150);
      const timer2 = setTimeout(() => map.invalidateSize(), 400);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        window.removeEventListener('resize', handleResize);
        map.remove();
        mapInstanceRef.current = null;
        routesLayerGroupRef.current = null;
        binsLayerGroupRef.current = null;
        vehiclesLayerGroupRef.current = null;
      };
    } catch (err) {
      console.error('Error initializing Leaflet map at Peelamedu:', err);
    }
  }, []);

  // 3. Periodic Live Vehicle Movement Simulation along Peelamedu road networks
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((veh) => {
          const nextIndex = (veh.routeIndex + 1) % veh.routeWaypoints.length;
          const [nextLat, nextLng] = veh.routeWaypoints[nextIndex];

          return {
            ...veh,
            routeIndex: nextIndex,
            currentLat: nextLat,
            currentLng: nextLng,
            speedKmH: Math.floor(Math.random() * 15) + 24, // 24 - 39 km/h
            currentLoadKg: Math.min(veh.capacityKg, veh.currentLoadKg + Math.floor(Math.random() * 20)),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 4. Render Collection Routes around Peelamedu
  useEffect(() => {
    const routesGroup = routesLayerGroupRef.current;
    if (!routesGroup) return;

    routesGroup.clearLayers();

    if (!showRoutes || filterMode === 'VEHICLES_ONLY') return;

    // Route A (Emerald Green - Avinashi Commercial Corridor)
    L.polyline(ROUTE_A_WAYPOINTS, {
      color: '#166534',
      weight: 4.5,
      opacity: 0.85,
      dashArray: '6, 8',
    })
      .bindTooltip('<b>Route A:</b> Peelamedu - Avinashi Road Express (VEH-EV-01)', { sticky: true })
      .addTo(routesGroup);

    // Route B (Blue - TIDEL Park & Aerodrome Circuit)
    L.polyline(ROUTE_B_WAYPOINTS, {
      color: '#2563EB',
      weight: 4.5,
      opacity: 0.85,
      dashArray: '4, 6',
    })
      .bindTooltip('<b>Route B:</b> TIDEL Park IT SEZ & Airport Circuit (VEH-EV-02)', { sticky: true })
      .addTo(routesGroup);
  }, [showRoutes, filterMode]);

  // 5. Render Smart Garbage Bin Markers across Peelamedu
  useEffect(() => {
    const binsGroup = binsLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!binsGroup || !map || bins.length === 0) return;

    binsGroup.clearLayers();
    binMarkersRef.current.clear();

    if (!showBins || filterMode === 'VEHICLES_ONLY') return;

    bins.forEach((bin) => {
      if (filterMode === 'CRITICAL' && bin.fill_level < 90) return;
      if (filterMode === 'NEAR_FULL' && (bin.fill_level < 70 || bin.fill_level >= 90)) return;
      if (filterMode === 'NORMAL' && bin.fill_level >= 70) return;

      // Color mapping: Green (<70%), Orange (70-89%), Red (>=90%)
      const isCritical = bin.fill_level >= 90;
      const isNearFull = bin.fill_level >= 70 && bin.fill_level < 90;

      const markerBg = isCritical ? '#DC2626' : isNearFull ? '#D97706' : '#16A34A';
      const pulseHtml = isCritical
        ? `<div class="absolute -inset-1.5 rounded-full bg-red-500 opacity-60 animate-ping"></div>`
        : '';

      const customBinIcon = L.divIcon({
        className: 'custom-bin-marker-div',
        html: `
          <div style="position: relative; width: 34px; height: 34px;">
            ${pulseHtml}
            <div style="
              position: relative;
              background-color: ${markerBg};
              width: 34px;
              height: 34px;
              border-radius: 50%;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-family: 'Inter', system-ui, sans-serif;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              ${Math.round(bin.fill_level)}%
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([bin.latitude, bin.longitude], { icon: customBinIcon }).addTo(binsGroup);
      binMarkersRef.current.set(bin.bin_code, marker);

      // Popup with full IoT telemetry
      const popupHtml = `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 4px; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-weight: 700; font-size: 13px; color: #0F172A;">${bin.bin_code}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: ${isCritical ? '#FEE2E2' : isNearFull ? '#FEF3C7' : '#DCFCE7'}; color: ${isCritical ? '#991B1B' : isNearFull ? '#92400E' : '#166534'};">
              ${bin.status}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #1E293B; margin-bottom: 4px;">${bin.location_name}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">Zone: <b>Peelamedu, Coimbatore</b> • Stream: <b>${bin.waste_category}</b></div>

          <div style="background-color: #F8FAFC; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: 11px; line-height: 1.6;">
            <div>Fill Level: <b style="color: ${markerBg};">${Math.round(bin.fill_level)}%</b> (${(bin.fill_level * bin.max_capacity_liters / 100).toFixed(0)} / ${bin.max_capacity_liters} L)</div>
            <div>Payload Weight: <b>${bin.weight_kg} kg</b></div>
            <div>Temperature: <b>${bin.temperature_c}°C</b> | Battery: <b>${bin.battery_level}%</b></div>
            <div style="font-size: 10px; color: #94A3B8; margin-top: 4px;">GPS: ${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)} (Peelamedu)</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 290 });

      marker.on('click', () => {
        setSelectedBin(bin);
      });
    });
  }, [bins, filterMode, showBins]);

  // 6. Render Collection Vehicles in Peelamedu
  useEffect(() => {
    const vehiclesGroup = vehiclesLayerGroupRef.current;
    if (!vehiclesGroup) return;

    vehiclesGroup.clearLayers();
    vehicleMarkersRef.current.clear();

    if (!showVehicles || (filterMode !== 'all' && filterMode !== 'VEHICLES_ONLY')) return;

    vehicles.forEach((veh) => {
      const truckIcon = L.divIcon({
        className: 'custom-truck-marker-div',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              background-color: #17231C;
              width: 40px;
              height: 40px;
              border-radius: 12px;
              border: 2.5px solid ${veh.routeColor};
              box-shadow: 0 4px 16px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-size: 18px;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              🚚
            </div>
            <span style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: #22C55E;
              border: 2px solid #FFFFFF;
            "></span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([veh.currentLat, veh.currentLng], { icon: truckIcon }).addTo(vehiclesGroup);
      vehicleMarkersRef.current.set(veh.id, marker);
      vehicleMarkersRef.current.set(veh.plate, marker);

      const vehiclePopupHtml = `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 4px; min-width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: monospace; font-weight: 700; font-size: 13px; color: #0F172A;">${veh.plate}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: #DCFCE7; color: #166534;">
              ${veh.status}
            </span>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #1E293B;">Driver: ${veh.driver} (ID: ${veh.id})</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">Zone: <b>${veh.zone}</b></div>
          <div style="background-color: #F8FAFC; border-radius: 8px; padding: 8px; font-size: 11px; line-height: 1.6;">
            <div>Speed: <b>${veh.speedKmH} km/h</b> (Simulated Route Progression)</div>
            <div>Current Load: <b>${veh.currentLoadKg} / ${veh.capacityKg} kg</b> (${Math.round((veh.currentLoadKg / veh.capacityKg) * 100)}%)</div>
            <div style="font-size: 10px; color: #94A3B8; margin-top: 4px;">Hardware Telemetry: Awaiting Active Vehicle CAN/GPS Hardware Link</div>
          </div>
            <div style="font-size: 10px; color: #94A3B8; margin-top: 4px;">Telemetry GPS: ${veh.currentLat.toFixed(4)}, ${veh.currentLng.toFixed(4)}</div>
          </div>
        </div>
      `;

      marker.bindPopup(vehiclePopupHtml, { maxWidth: 290 });
    });
  }, [vehicles, showVehicles, filterMode]);

  // 7. Search Handler (Bins, Vehicles, Peelamedu Streets, Landmarks, Zones)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      title: string;
      subtitle: string;
      type: 'bin' | 'vehicle' | 'landmark' | 'street' | 'zone';
      coords: [number, number];
      rawObject?: any;
    }> = [];

    // Search Bins by ID or Location
    bins.forEach((b) => {
      if (
        b.bin_code.toLowerCase().includes(q) ||
        b.location_name.toLowerCase().includes(q) ||
        b.waste_category.toLowerCase().includes(q)
      ) {
        results.push({
          title: `${b.bin_code} (${b.waste_category})`,
          subtitle: `${b.location_name} • ${Math.round(b.fill_level)}% Full`,
          type: 'bin',
          coords: [b.latitude, b.longitude],
          rawObject: b,
        });
      }
    });

    // Search Vehicles by Plate, ID, Driver or Zone
    vehicles.forEach((v) => {
      if (
        v.plate.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q) ||
        v.zone.toLowerCase().includes(q)
      ) {
        results.push({
          title: `${v.plate} (${v.id})`,
          subtitle: `Driver: ${v.driver} • ${v.zone}`,
          type: 'vehicle',
          coords: [v.currentLat, v.currentLng],
          rawObject: v,
        });
      }
    });

    // Search Peelamedu Landmarks & Streets
    PEELAMEDU_LANDMARKS.forEach((lm) => {
      if (
        lm.name.toLowerCase().includes(q) ||
        lm.description.toLowerCase().includes(q) ||
        lm.category.toLowerCase().includes(q)
      ) {
        results.push({
          title: lm.name,
          subtitle: `${lm.category} • ${lm.description}`,
          type: 'landmark',
          coords: lm.coords,
        });
      }
    });

    // Peelamedu Collection Zones
    if ('peelamedu collection zone'.includes(q) || 'avinashi road'.includes(q)) {
      results.push({
        title: 'Peelamedu Collection Zone',
        subtitle: 'Avinashi Road Commercial Corridor & Campus Sector',
        type: 'zone',
        coords: [11.0260, 77.0100],
      });
    }
    if ('tidel park zone'.includes(q) || 'vilankurichi'.includes(q) || 'sez'.includes(q)) {
      results.push({
        title: 'TIDEL Park & ELCOT IT SEZ Zone',
        subtitle: 'Vilankurichi Road Technology Sector',
        type: 'zone',
        coords: [11.0345, 77.0260],
      });
    }
    if ('airport zone'.includes(q) || 'aerodrome'.includes(q) || 'sitra'.includes(q)) {
      results.push({
        title: 'Civil Aerodrome & Airport Zone',
        subtitle: 'Coimbatore International Airport Logistics Sector',
        type: 'zone',
        coords: [11.0315, 77.0385],
      });
    }

    setSearchResults(results.slice(0, 8));
    setIsSearchOpen(true);
  }, [searchQuery, bins, vehicles]);

  // Navigate to selected search result or landmark
  const handleSelectSearchResult = (result: {
    coords: [number, number];
    type: string;
    rawObject?: any;
    title: string;
  }) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveLandmark(result.title);

    // Smoothly fly to target with zoom 16
    map.flyTo(result.coords, 16, { duration: 1.2 });

    // Open popup if bin or vehicle
    if (result.type === 'bin' && result.rawObject) {
      setSelectedBin(result.rawObject);
      const marker = binMarkersRef.current.get(result.rawObject.bin_code);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    } else if (result.type === 'vehicle' && result.rawObject) {
      const marker = vehicleMarkersRef.current.get(result.rawObject.id);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  };

  // Quick jump to landmark
  const handleQuickJumpLandmark = (lm: typeof PEELAMEDU_LANDMARKS[0]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActiveLandmark(lm.name);
    map.flyTo(lm.coords, 16, { duration: 1.2 });
  };

  // Reset to default Peelamedu center
  const handleResetToPeelamedu = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setActiveLandmark('All Peelamedu');
    map.setView(PEELAMEDU_CENTER, DEFAULT_ZOOM, { animate: true });
  };

  // Fit all markers and center map
  const handleFitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allCoords: [number, number][] = [
      ...bins.map((b) => [b.latitude, b.longitude] as [number, number]),
      ...vehicles.map((v) => [v.currentLat, v.currentLng] as [number, number]),
    ];

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else {
      map.setView(PEELAMEDU_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Geographical Info & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7EBE7] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Live GIS Fleet & Sensor Operations
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 font-mono">
              Peelamedu, Coimbatore (11.0260° N, 77.0100° E)
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Fleet Movement: Simulated Dispatch Demo
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1.5">
            Peelamedu GIS & Field Logistics Command Centre
          </h2>
          <p className="text-xs text-[#747D75] mt-0.5">
            Real-time geospatial tracking of smart bins along Avinashi Road, TIDEL Park & Coimbatore Airport corridor.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Interactive Search Input */}
          <div className="relative flex-1 sm:w-80">
            <div className="flex items-center bg-[#F5F6F4] px-3.5 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Bin ID, TN-38 vehicle, landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex justify-between items-center">
                  <span>Peelamedu Results ({searchResults.length})</span>
                  <span>Press item to jump</span>
                </div>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                      {item.type === 'bin' && <MapPin className="w-3.5 h-3.5" />}
                      {item.type === 'vehicle' && <Truck className="w-3.5 h-3.5" />}
                      {item.type === 'landmark' && <Building2 className="w-3.5 h-3.5" />}
                      {item.type === 'zone' && <Navigation className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Pins Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F5F6F4] px-3 py-2 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Features ({bins.length} Bins + Vehicles)</option>
              <option value="CRITICAL">🔴 Critical Bins (≥ 90%)</option>
              <option value="NEAR_FULL">🟠 Nearly Full (70–89%)</option>
              <option value="NORMAL">🟢 Normal (&lt; 70%)</option>
              <option value="VEHICLES_ONLY">🚚 EV Vehicles Only</option>
            </select>
          </div>

          {/* Fit Bounds Button */}
          <button
            onClick={handleFitAllMarkers}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            title="Fit All Markers to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Fit All</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadMapData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center"
            title="Refresh Fleet Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Landmark Quick-Jump Navigator & Layer Toggles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-[#E7EBE7] text-xs">
        {/* Peelamedu Landmark Quick Jump Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Peelamedu:</span>
          </span>

          <button
            onClick={handleResetToPeelamedu}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeLandmark === 'All Peelamedu'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📍 Center (11.0260, 77.0100)
          </button>

          {PEELAMEDU_LANDMARKS.slice(1, 7).map((lm) => (
            <button
              key={lm.name}
              onClick={() => handleQuickJumpLandmark(lm)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                activeLandmark === lm.name
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
              }`}
            >
              {lm.name}
            </button>
          ))}
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-slate-400 font-medium text-[11px] mr-1 hidden lg:inline">Layers:</span>
          <button
            onClick={() => setShowBins(!showBins)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showBins
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold'
                : 'bg-slate-100 text-slate-400 line-through'
            }`}
          >
            Bins ({bins.length})
          </button>

          <button
            onClick={() => setShowVehicles(!showVehicles)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showVehicles
                ? 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold'
                : 'bg-slate-100 text-slate-400 line-through'
            }`}
          >
            EVs ({vehicles.length})
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showRoutes
                ? 'bg-purple-100 text-purple-900 border border-purple-300 font-semibold'
                : 'bg-slate-100 text-slate-400 line-through'
            }`}
          >
            Routes
          </button>
        </div>
      </div>

      {/* Interactive Map Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E7EBE7] shadow-xs relative overflow-hidden">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Loading Peelamedu OpenStreetMap Telemetry...</span>
            </div>
          </div>
        )}

        {/* Tile Server Error Fallback */}
        {tileError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>OpenStreetMap tile server latency detected. Peelamedu telemetry markers remain operational.</span>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{ height: '590px', minHeight: '520px', width: '100%', position: 'relative' }}
          className="w-full rounded-2xl overflow-hidden z-10"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xl text-xs space-y-2 pointer-events-auto max-w-xs">
          <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100">
            <span>Peelamedu GIS Legend</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
              CCMC Fleet
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#16A34A] flex-shrink-0" />
              <span>Normal (&lt; 70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D97706] flex-shrink-0" />
              <span>Near Full (70–89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#DC2626] flex-shrink-0" />
              <span>Critical (≥ 90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-[#17231C] text-white flex items-center justify-center text-[9px] flex-shrink-0">
                🚚
              </span>
              <span>TN-38 EV Vehicle</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#166534]" />
              <span>Route A (Avinashi Rd)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#2563EB]" />
              <span>Route B (TIDEL/Airport)</span>
            </span>
          </div>
        </div>

        {/* Selected Bin Drawer Detail Card */}
        {selectedBin && (
          <div className="absolute top-6 right-6 z-20 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xl max-w-xs w-full space-y-3 pointer-events-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedBin.bin_code}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{selectedBin.location_name}</h4>
              </div>
              <button
                onClick={() => setSelectedBin(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Fill Percentage:</span>
              <span
                className={`font-bold ${
                  selectedBin.fill_level >= 90
                    ? 'text-red-600'
                    : selectedBin.fill_level >= 70
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {Math.round(selectedBin.fill_level)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  selectedBin.fill_level >= 90
                    ? 'bg-red-500'
                    : selectedBin.fill_level >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${selectedBin.fill_level}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Waste Stream:</span>
                <span className="font-semibold text-slate-900">{selectedBin.waste_category}</span>
              </div>
              <div className="flex justify-between">
                <span>Payload Weight:</span>
                <span className="font-semibold text-slate-900">{selectedBin.weight_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Internal Temp:</span>
                <span className="font-semibold text-slate-900">{selectedBin.temperature_c}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Battery Level:</span>
                <span className="font-semibold text-slate-900">{selectedBin.battery_level}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Coordinates:</span>
                <span className="font-mono">
                  {selectedBin.latitude.toFixed(4)}, {selectedBin.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Geospatial Simulation Notice */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
        <span>
          <strong>Coimbatore Municipal Corporation (CCMC) Peelamedu Zone:</strong> Live GPS coordinates centered at 11.0260° N, 77.0100° E covering Avinashi Road (NH 544), Hope College, PSG Tech, TIDEL Park & Coimbatore International Airport.
        </span>
      </div>
    </div>
  );
};
