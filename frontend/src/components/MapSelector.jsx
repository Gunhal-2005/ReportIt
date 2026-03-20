import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapSelector = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position]);

  const autoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => alert('Could not get your location')
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="form-label" style={{ marginBottom: 0 }}>Select Location</span>
        <button type="button" onClick={autoDetect} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
          Auto-Detect Location
        </button>
      </div>
      <div className="map-container">
        <MapContainer 
          center={[13.0827, 80.2707]} 
          zoom={12} 
          minZoom={11}
          maxBounds={[
            [12.80, 80.00], // Southwest bounds
            [13.35, 80.35]  // Northeast bounds
          ]}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <LocationMarker position={position} setPosition={setPosition} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSelector;
