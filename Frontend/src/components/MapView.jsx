import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing default Leaflet markers in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapView({ routes, isOptimized }) {
  // Center on Bangalore (or adjust to your city)
  const defaultCenter = [12.9716, 77.5946];

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={12} 
      className="leaflet-container" 
      style={{ height: '100%', width: '100%', background: '#0f172a' }}
    >
      {/* Dark Mode Map Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />

      {/* RENDER OPTIMIZED ROUTES */}
      {isOptimized && routes && routes.map((route, idx) => (
        <React.Fragment key={route.id || idx}>
          {/* 1. The Route Path */}
          <Polyline 
            positions={route.path} 
            pathOptions={{ 
              color: route.color, 
              weight: 4, 
              opacity: 0.8,
              dashArray: '10, 10' // Makes it look technical/planned
            }}
          />
          
          {/* 2. Start Marker (Vehicle Origin) */}
          {route.path.length > 0 && (
             <Marker position={route.path[0]}>
               <Popup>
                 <strong>{route.id}</strong><br/>
                 Start Location
               </Popup>
             </Marker>
          )}

          {/* 3. End Marker (Office/Destination) */}
          {route.path.length > 0 && (
             <Marker position={route.path[route.path.length - 1]}>
               <Popup>
                 Destination<br/>
                 (Route End)
               </Popup>
             </Marker>
          )}
        </React.Fragment>
      ))}

      {/* Fallback if no routes yet (show center marker) */}
      {!isOptimized && (
        <Marker position={defaultCenter}>
          <Popup>Velora HQ Area</Popup>
        </Marker>
      )}

    </MapContainer>
  );
}

export default MapView;