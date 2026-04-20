import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../utils/constants';
import type { Tour } from '../../types';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface GlobalMapProps {
  tours: Tour[];
}

const GlobalMap: React.FC<GlobalMapProps> = ({ tours }) => {
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg border border-base-300">
      <MapContainer
        center={[MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng]}
        zoom={MAP_DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {tours.map((tour) => (
          <Marker
            key={tour.id}
            position={[tour.coords.lat, tour.coords.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <h3 className="font-semibold text-base mb-2">{tour.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {tour.description.substring(0, 100)}...
                </p>
                <p className="text-primary font-bold mb-3">
                  ${tour.price.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/tours/${tour.slug}`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    View
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export { GlobalMap };
