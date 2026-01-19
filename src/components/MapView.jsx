import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapView({ employees, isOptimized }) {
  const defaultCenter = [12.9352, 77.6245];

  // For the demo, route connecting the first two employees to a hub
  const sampleRoute = employees.length >= 2 ? [
    [employees[0].pickup_lat, employees[0].pickup_lng],
    [employees[1].pickup_lat, employees[1].pickup_lng],
    [12.9716, 77.5946] 
  ] : [];

  return (
    <MapContainer center={defaultCenter} zoom={12} className="leaflet-container" style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />

      {/* INITIAL STATE: Plotted as soon as Excel is uploaded */}
      {employees.map((emp, index) => (
        <Marker 
          key={index} 
          position={[emp.pickup_lat, emp.pickup_lng]}
        >
          <Popup>
            <div className="popup-content">
              <strong>Employee ID:</strong> {emp.employee_id} <br/>
              <strong>Priority:</strong> {emp.priority} <br/>
              <strong>Vehicle Pref:</strong> {emp.vehicle_preference}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* OPTIMIZED STATE: Routes overlaid after clicking Run */}
      {isOptimized && sampleRoute.length > 0 && (
        <Polyline 
          positions={sampleRoute} 
          color="#3b82f6" 
          weight={4} 
          opacity={0.8}
          dashArray="10, 15" 
        />
      )}
    </MapContainer>
  );
}

export default MapView;