import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Coords } from '../../types';
import 'leaflet/dist/leaflet.css';

// Custom marker icon with CDN fallback
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TourMapProps {
  coords: Coords;
  title: string;
  price?: number;
  zoom?: number;
}

const MapController: React.FC<{ coords: Coords; zoom: number }> = ({ coords, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([coords.lat, coords.lng], zoom);
  }, [coords, zoom, map]);
  
  return null;
};

export const TourMap: React.FC<TourMapProps> = ({ coords, title, price, zoom = 14 }) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg border border-base-300">
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={[coords.lat, coords.lng]} icon={customIcon}>
          <Popup>
            <div className="text-sm">
              <strong className="text-base">{title}</strong>
              {price && (
                <p className="text-primary font-bold mt-2">
                  ${price.toLocaleString()}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-1">Meeting point</p>
            </div>
          </Popup>
        </Marker>
        <MapController coords={coords} zoom={zoom} />
      </MapContainer>
    </div>
  );
};