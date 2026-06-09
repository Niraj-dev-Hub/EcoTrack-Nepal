import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { Navigation, Play, Pause, RotateCcw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different markers
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

interface VehicleTrackerProps {
  selectedLocation: string;
  onTrackingStateChange?: (isTracking: boolean) => void;
  distance: number;
  onDistanceChange: (distance: number) => void;
}

// Kathmandu coordinates
const KATHMANDU_CENTER: LatLngExpression = [27.7172, 85.3240];

// Depot and various destination routes in Kathmandu
const DEPOT_LOCATION: LatLngExpression = [27.6826, 85.3158]; // Kalimati Depot
const COMMON_DESTINATIONS: Record<string, LatLngExpression> = {
  'Baneshwor': [27.6885, 85.3456],
  'Thapathali': [27.6706, 85.3191],
  'Balaju': [27.7388, 85.2857],
  'Putalisadak': [27.7049, 85.3254],
  'Koteshwor': [27.6757, 85.3757],
  'Maharajgunj': [27.7343, 85.3186],
  'Baluwatar': [27.7231, 85.3324],
  'Chappal Karkhana': [27.7325, 85.3078],
};

export default function RealTimeVehicleTracker({ 
  selectedLocation, 
  onTrackingStateChange,
  distance,
  onDistanceChange
}: VehicleTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const mapRef = useRef<any>(null);
  const truckAnimationRef = useRef<NodeJS.Timeout | null>(null);

  // Determine destination based on selected location
  const destination = COMMON_DESTINATIONS[selectedLocation] || COMMON_DESTINATIONS['Baneshwor'];
  
  // Calculate current truck position based on distance remaining
  const getTruckPosition = (): LatLngExpression => {
    const totalDistance = 6.0;
    const progressRatio = Math.max(0, (totalDistance - distance) / totalDistance);
    
    const depotLat = DEPOT_LOCATION[0] as number;
    const depotLng = DEPOT_LOCATION[1] as number;
    const destLat = destination[0] as number;
    const destLng = destination[1] as number;
    
    const currentLat = depotLat + (destLat - depotLat) * progressRatio;
    const currentLng = depotLng + (destLng - depotLng) * progressRatio;
    
    return [currentLat, currentLng];
  };

  // Get user's current location
  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 14);
        }
      });
    }
  };

  // Animate truck movement
  const handleStartTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      if (truckAnimationRef.current) {
        clearInterval(truckAnimationRef.current);
      }
      onTrackingStateChange?.(false);
      return;
    }

    setIsTracking(true);
    onTrackingStateChange?.(true);

    // Animate truck to move smoothly - updates every 200ms for smooth animation
    // Decreases 0.2 km per update = truck covers 5.4 km in ~27 seconds (realistic speed)
    truckAnimationRef.current = setInterval(() => {
      onDistanceChange(prev => {
        const newDistance = Math.max(0, prev - 0.2);
        
        // Trigger notification at 5 minutes (2.5 km)
        if (newDistance <= 2.5 && prev > 2.5) {
          // Browser alert
          alert('🚚 Truck is 5 minutes away! Please prepare your waste bags.');
          
          // Console log
          console.log(`[VEHICLE TRACKING] Truck is approximately 5 minutes away. Distance: ${newDistance.toFixed(1)} km`);
          
          // In-app notification (using browser notification API if permitted)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('EcoTrack Pickup Nearby', {
              body: `Your waste pickup truck is just 5 minutes away! Distance: ${newDistance.toFixed(1)} km`,
              icon: '🚚',
              tag: 'truck-arrival',
            });
          }
        }
        
        return newDistance;
      });
    }, 200); // Update every 200ms for smooth animation
  };

  const handleReset = () => {
    setIsTracking(false);
    if (truckAnimationRef.current) {
      clearInterval(truckAnimationRef.current);
    }
    onDistanceChange(5.4);
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    return () => {
      if (truckAnimationRef.current) {
        clearInterval(truckAnimationRef.current);
      }
    };
  }, []);

  const truckPosition = getTruckPosition();
  const eta = Math.max(0, distance * 2); // Rough ETA calculation (2 mins per km)
  const route: LatLngExpression[] = [DEPOT_LOCATION, destination];

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-96 bg-slate-100">
        <MapContainer
          center={KATHMANDU_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {/* Route line */}
          <Polyline
            positions={route}
            color="#06b6d4"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />

          {/* Depot marker */}
          <Marker
            position={DEPOT_LOCATION}
            icon={createCustomIcon('#064e3b', '🏭')}
          >
            <Popup>Kalimati Main Depot</Popup>
          </Marker>

          {/* Destination marker */}
          <Marker
            position={destination}
            icon={createCustomIcon('#7f1d1d', '🎯')}
          >
            <Popup>{selectedLocation || 'Collection Site'}</Popup>
          </Marker>

          {/* Truck marker (animates along route) */}
          {isTracking && (
            <Marker
              position={truckPosition}
              icon={createCustomIcon('#10b981', '🚚')}
            >
              <Popup>
                <div className="text-xs font-semibold">
                  <p>Garbage Truck</p>
                  <p>Distance: {distance.toFixed(1)} km</p>
                  <p>ETA: {eta.toFixed(1)} mins</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* User location marker (if available) */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={createCustomIcon('#2563eb', '📍')}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Control Panel */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg">
          <div className="space-y-3">
            {/* Status Info */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold">
              <div className="bg-slate-50 p-2 rounded text-center">
                <p className="text-slate-500 uppercase">Distance</p>
                <p className="text-lg font-mono font-bold text-slate-800">{distance.toFixed(1)} km</p>
              </div>
              <div className="bg-slate-50 p-2 rounded text-center">
                <p className="text-slate-500 uppercase">ETA</p>
                <p className="text-lg font-mono font-bold text-amber-600">{eta.toFixed(1)} m</p>
              </div>
              <div className="bg-slate-50 p-2 rounded text-center">
                <p className="text-slate-500 uppercase">Status</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  {isTracking ? '🟢 LIVE' : '⚪ READY'}
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleStartTracking}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isTracking
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Start Tracking
                  </>
                )}
              </button>

              <button
                onClick={handleGetMyLocation}
                className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Center map on your location"
              >
                <Navigation className="h-3.5 w-3.5" /> My Location
              </button>

              <button
                onClick={handleReset}
                className="py-2 px-3 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            {/* Info message */}
            <p className="text-[10px] text-slate-500 text-center">
              {isTracking 
                ? '🚀 Truck moving at 12 km/h. Alert at 2.5 km (5 mins). Arriving in ~' + Math.round(distance * 5) + 's'
                : '👆 Click "Start Tracking" to begin real-time vehicle movement'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <p className="text-emerald-600 font-bold">📍 Pickup Point</p>
          <p className="text-slate-600 mt-1">{selectedLocation || 'Baneshwor'}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-blue-600 font-bold">🏭 Starting From</p>
          <p className="text-slate-600 mt-1">Kalimati Main Depot</p>
        </div>
      </div>
    </div>
  );
}
