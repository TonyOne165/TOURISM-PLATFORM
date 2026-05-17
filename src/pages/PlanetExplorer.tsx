import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import worldGeoUrl from './user/wolrd.json.txt?url';
import { InfoPanel } from '@/components/planet/InfoPanel';
import { ItemPanel, type GlobeItem } from '@/components/planet/ItemPanel';
import { useTours } from '@/hooks/useTours';
import { useAccommodations } from '@/hooks/useAccommodations';
import { fetchCitiesForCountry, fetchTouristPlaces, COUNTRY_ISO } from '@/services/overpass';

/* ================================================================
   TYPES
   ================================================================ */
interface Spherical { theta: number; phi: number }
interface Projected { x: number; y: number; z: number; visible: boolean }

interface CityData {
  name: string;
  lat: number;
  lng: number;
  touristPlaces: TouristPlaceData[];
  /** Name of the admin-1 region (department/state) this city belongs to, as it appears in admin1.geo.json */
  admin1Name?: string;
  /** Override the default city-level zoom factor (initialRadius * 80). Useful for remote islands (e.g. San Andrés) that lie far from the continent and otherwise render too small. */
  zoomMultiplier?: number;
}

interface TouristPlaceData {
  name: string;
  lat: number;
  lng: number;
  type: 'landmark' | 'beach' | 'museum' | 'restaurant' | 'park' | 'other';
  description?: string;
}

interface CountryData {
  name: string;
  capitalLat: number;
  capitalLng: number;
  borders?: number[][];
  cities: CityData[];
  /** ISO 3166-1 alpha-2 code — used to disambiguate admin1 lookups (e.g. "Córdoba" exists in AR/ES/CO) */
  iso_a2?: string;
}

interface InteractionLevel {
  level: 'globe' | 'country' | 'city' | 'place';
  countryName: string | null;
  cityName: string | null;
  placeName: string | null;
}

interface BreadcrumbItem {
  label: string;
  level: 'globe' | 'country' | 'city';
}

/* ================================================================
   DATA — Countries with cities and tourist places
   ================================================================ */
const countryData: Record<string, CountryData> = {
  'Colombia': {
    name: 'Colombia',
    iso_a2: 'CO',
    capitalLat: 4.7110,
    capitalLng: -74.0721,
    borders: [[12.5,-75.5],[12.5,-74.0],[12.0,-72.0],[11.5,-71.5],[10.5,-71.5],[9.0,-71.5],[7.5,-71.5],[6.0,-71.5],[4.5,-71.5],[3.0,-72.0],[1.5,-73.5],[0.5,-75.5],[0.5,-77.0],[0.5,-79.0],[1.5,-79.0],[3.5,-78.5],[5.0,-78.0],[6.0,-78.0],[7.5,-78.0],[9.0,-78.0],[10.5,-78.0],[12.0,-77.5],[12.5,-75.5]],
    cities: [
      {
        name: 'Cartagena',
        lat: 10.3910,
        lng: -75.4794,
        admin1Name: 'Bolívar',
        touristPlaces: [
          { name: 'Castillo San Felipe de Barajas', lat: 10.4239, lng: -75.5478, type: 'landmark', description: 'Fortaleza histórica del siglo XVII' },
          { name: 'Ciudad Amurallada', lat: 10.4236, lng: -75.5478, type: 'landmark', description: 'Centro histórico colonial' },
          { name: 'Playa Blanca', lat: 10.2667, lng: -75.5667, type: 'beach', description: 'Hermosa playa de aguas turquesas' },
          { name: 'Palacio de la Inquisición', lat: 10.4242, lng: -75.5481, type: 'museum', description: 'Museo histórico colonial' },
          { name: 'Convento de la Popa', lat: 10.4289, lng: -75.5442, type: 'landmark', description: 'Vista panorámica de la ciudad' },
        ]
      },
      {
        name: 'San Andrés Islas',
        lat: 12.5847,
        lng: -81.7006,
        admin1Name: 'San Andrés y Providencia',
        // Remote island ~700 km from the mainland; needs a deeper zoom so the archipelago fills the viewport instead of appearing as a speck next to Colombia.
        zoomMultiplier: 150,
        touristPlaces: [
          { name: 'Johnny Cay', lat: 12.5970, lng: -81.6986, type: 'beach', description: 'Islote turístico de arenas blancas' },
          { name: 'Cueva de Morgan', lat: 12.5494, lng: -81.7344, type: 'landmark', description: 'Atracción natural histórica' },
          { name: 'Hoyo Soplador', lat: 12.4892, lng: -81.7158, type: 'landmark', description: 'Géiser marino natural' },
          { name: 'Playa Spratt Bight', lat: 12.5878, lng: -81.7011, type: 'beach', description: 'Playa principal de San Andrés' },
          { name: 'Cayo Acuario', lat: 12.5103, lng: -81.6986, type: 'beach', description: 'Snorkel en aguas cristalinas' },
          { name: 'Providencia', lat: 13.3500, lng: -81.3667, type: 'beach', description: 'Isla hermana, paraíso virgen' },
        ]
      },
      {
        name: 'Bogotá',
        lat: 4.7110,
        lng: -74.0721,
        admin1Name: 'Bogota',
        touristPlaces: [
          { name: 'Museo del Oro', lat: 4.6027, lng: -74.0720, type: 'museum', description: 'Colección de orfebrería precolombina' },
          { name: 'Cerro de Monserrate', lat: 4.6058, lng: -74.0619, type: 'landmark', description: 'Vista panorámica de la ciudad' },
          { name: 'Plaza de Bolívar', lat: 4.5981, lng: -74.0758, type: 'landmark', description: 'Plaza principal de la ciudad' },
          { name: 'La Candelaria', lat: 4.5953, lng: -74.0750, type: 'landmark', description: 'Barrio histórico colonial' },
        ]
      },
      {
        name: 'Medellín',
        lat: 6.2442,
        lng: -75.5812,
        admin1Name: 'Antioquia',
        touristPlaces: [
          { name: 'Plaza Botero', lat: 6.2518, lng: -75.5639, type: 'landmark', description: 'Obras de Fernando Botero' },
          { name: 'Parque Arví', lat: 6.2753, lng: -75.5342, type: 'park', description: 'Parque ecológico en las montañas' },
          { name: 'Pueblito Paisa', lat: 6.2447, lng: -75.5931, type: 'landmark', description: 'Réplica de pueblo tradicional' },
        ]
      },
      {
        name: 'Islas del Rosario',
        lat: 10.2500,
        lng: -75.7500,
        admin1Name: 'Bolívar',
        touristPlaces: [
          { name: 'Acuario de San Martín de Pajarales', lat: 10.2556, lng: -75.7444, type: 'beach', description: 'Acuario natural en isla' },
          { name: 'Playa Grande', lat: 10.2389, lng: -75.7333, type: 'beach', description: 'Playa paradisíaca' },
          { name: 'Isla Libre', lat: 10.2667, lng: -75.7500, type: 'beach', description: 'Isla con aguas cristalinas' },
        ]
      },
      {
        name: 'Barú',
        lat: 10.2167,
        lng: -75.6167,
        admin1Name: 'Bolívar',
        touristPlaces: [
          { name: 'Playa Paraíso', lat: 10.2100, lng: -75.6200, type: 'beach', description: 'Una de las mejores playas de Colombia' },
          { name: 'Isla de Barú', lat: 10.2167, lng: -75.6167, type: 'beach', description: 'Isla con playas vírgenes' },
        ]
      },
      {
        name: 'Santa Marta',
        lat: 11.2408,
        lng: -74.2099,
        admin1Name: 'Magdalena',
        touristPlaces: [
          { name: 'Parque Tayrona', lat: 11.3028, lng: -74.0369, type: 'park', description: 'Parque natural con playas' },
          { name: 'Ciudad Perdida', lat: 11.0833, lng: -74.1167, type: 'landmark', description: 'Sitio arqueológico ancestral' },
        ]
      },
      // Capitales de departamento — admin1Name debe coincidir EXACTAMENTE con la propiedad `name` de admin1.geo.json (iso_a2 === 'CO').
      { name: 'Barranquilla',           lat: 10.9685, lng: -74.7813, admin1Name: 'Atlántico',           touristPlaces: [] },
      { name: 'Cali',                   lat: 3.4516,  lng: -76.5320, admin1Name: 'Valle del Cauca',     touristPlaces: [] },
      { name: 'Bucaramanga',            lat: 7.1193,  lng: -73.1227, admin1Name: 'Santander',           touristPlaces: [] },
      { name: 'Cúcuta',                 lat: 7.8939,  lng: -72.5078, admin1Name: 'Norte de Santander',  touristPlaces: [] },
      { name: 'Pereira',                lat: 4.8133,  lng: -75.6961, admin1Name: 'Risaralda',           touristPlaces: [] },
      { name: 'Manizales',              lat: 5.0689,  lng: -75.5174, admin1Name: 'Caldas',              touristPlaces: [] },
      { name: 'Armenia',                lat: 4.5339,  lng: -75.6811, admin1Name: 'Quindío',             touristPlaces: [] },
      { name: 'Ibagué',                 lat: 4.4389,  lng: -75.2322, admin1Name: 'Tolima',              touristPlaces: [] },
      { name: 'Neiva',                  lat: 2.9273,  lng: -75.2819, admin1Name: 'Huila',               touristPlaces: [] },
      { name: 'Popayán',                lat: 2.4448,  lng: -76.6147, admin1Name: 'Cauca',               touristPlaces: [] },
      { name: 'Pasto',                  lat: 1.2136,  lng: -77.2811, admin1Name: 'Nariño',              touristPlaces: [] },
      { name: 'Mocoa',                  lat: 1.1521,  lng: -76.6477, admin1Name: 'Putumayo',            touristPlaces: [] },
      { name: 'Florencia',              lat: 1.6144,  lng: -75.6062, admin1Name: 'Caquetá',             touristPlaces: [] },
      { name: 'Leticia',                lat: -4.2150, lng: -69.9406, admin1Name: 'Amazonas',            touristPlaces: [] },
      { name: 'Mitú',                   lat: 1.2538,  lng: -70.2342, admin1Name: 'Vaupés',              touristPlaces: [] },
      { name: 'Inírida',                lat: 3.8653,  lng: -67.9239, admin1Name: 'Guainía',             touristPlaces: [] },
      { name: 'San José del Guaviare',  lat: 2.5667,  lng: -72.6420, admin1Name: 'Guaviare',            touristPlaces: [] },
      { name: 'Villavicencio',          lat: 4.1420,  lng: -73.6266, admin1Name: 'Meta',                touristPlaces: [] },
      { name: 'Yopal',                  lat: 5.3388,  lng: -72.3940, admin1Name: 'Casanare',            touristPlaces: [] },
      { name: 'Arauca',                 lat: 7.0903,  lng: -70.7617, admin1Name: 'Arauca',              touristPlaces: [] },
      { name: 'Puerto Carreño',         lat: 6.1894,  lng: -67.4831, admin1Name: 'Vichada',             touristPlaces: [] },
      { name: 'Tunja',                  lat: 5.5446,  lng: -73.3577, admin1Name: 'Boyacá',              touristPlaces: [] },
      { name: 'Riohacha',               lat: 11.5444, lng: -72.9072, admin1Name: 'La Guajira',          touristPlaces: [] },
      { name: 'Valledupar',             lat: 10.4631, lng: -73.2532, admin1Name: 'Cesar',               touristPlaces: [] },
      { name: 'Sincelejo',              lat: 9.3047,  lng: -75.3978, admin1Name: 'Sucre',               touristPlaces: [] },
      { name: 'Montería',               lat: 8.7479,  lng: -75.8814, admin1Name: 'Córdoba',             touristPlaces: [] },
      { name: 'Quibdó',                 lat: 5.6919,  lng: -76.6583, admin1Name: 'Chocó',               touristPlaces: [] },
    ]
  },
  'USA': {
    name: 'USA',
    capitalLat: 38.9072,
    capitalLng: -77.0369,
    borders: [[49.0,-125.0],[49.0,-95.0],[49.0,-89.0],[45.0,-83.0],[42.0,-83.0],[35.0,-81.0],[31.0,-81.0],[25.0,-81.0],[25.0,-97.0],[32.0,-117.0],[49.0,-125.0]],
    cities: [
      {
        name: 'New York',
        lat: 40.7128,
        lng: -74.0060,
        touristPlaces: [
          { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445, type: 'landmark' },
          { name: 'Central Park', lat: 40.7829, lng: -73.9654, type: 'park' },
          { name: 'Times Square', lat: 40.7580, lng: -73.9855, type: 'landmark' },
        ]
      },
      {
        name: 'Los Angeles',
        lat: 34.0522,
        lng: -118.2437,
        touristPlaces: [
          { name: 'Hollywood Sign', lat: 34.1341, lng: -118.3215, type: 'landmark' },
          { name: 'Santa Monica Pier', lat: 34.0094, lng: -118.4973, type: 'beach' },
          { name: 'Griffith Observatory', lat: 34.1184, lng: -118.3004, type: 'museum' },
        ]
      },
    ]
  },
  'Canada': {
    name: 'Canada',
    capitalLat: 45.4215,
    capitalLng: -75.6972,
    borders: [[49.0,-141.0],[69.0,-141.0],[83.0,-95.0],[83.0,-60.0],[60.0,-60.0],[49.0,-89.0],[49.0,-95.0],[49.0,-125.0],[49.0,-141.0]],
    cities: [
      {
        name: 'Toronto',
        lat: 43.6532,
        lng: -79.3832,
        touristPlaces: [
          { name: 'CN Tower', lat: 43.6426, lng: -79.3871, type: 'landmark' },
          { name: 'Niagara Falls', lat: 43.0896, lng: -79.0849, type: 'landmark' },
        ]
      },
      {
        name: 'Vancouver',
        lat: 49.2827,
        lng: -123.1207,
        touristPlaces: [
          { name: 'Stanley Park', lat: 49.3017, lng: -123.1417, type: 'park' },
          { name: 'Granville Island', lat: 49.2713, lng: -123.1342, type: 'landmark' },
        ]
      },
    ]
  },
  'Mexico': {
    name: 'Mexico',
    capitalLat: 19.4326,
    capitalLng: -99.1332,
    borders: [[32.0,-117.0],[25.0,-97.0],[21.0,-97.0],[16.0,-95.0],[14.0,-92.0],[17.0,-88.0],[21.0,-87.0],[26.0,-109.0],[32.0,-117.0]],
    cities: [
      {
        name: 'Mexico City',
        lat: 19.4326,
        lng: -99.1332,
        touristPlaces: [
          { name: 'Zócalo', lat: 19.4326, lng: -99.1332, type: 'landmark' },
          { name: 'Teotihuacán', lat: 19.6925, lng: -98.8438, type: 'landmark' },
        ]
      },
      {
        name: 'Cancún',
        lat: 21.1619,
        lng: -86.8515,
        touristPlaces: [
          { name: 'Zona Hotelera', lat: 21.1333, lng: -86.7667, type: 'beach' },
          { name: 'Chichén Itzá', lat: 20.6843, lng: -88.5678, type: 'landmark' },
        ]
      },
    ]
  },
  'Brazil': {
    name: 'Brazil',
    capitalLat: -15.8267,
    capitalLng: -47.9218,
    borders: [[5.0,-60.0],[5.0,-35.0],[-5.0,-35.0],[-18.0,-39.0],[-34.0,-54.0],[-34.0,-70.0],[-16.0,-70.0],[-2.0,-68.0],[5.0,-60.0]],
    cities: [
      {
        name: 'Rio de Janeiro',
        lat: -22.9068,
        lng: -43.1729,
        touristPlaces: [
          { name: 'Christ the Redeemer', lat: -22.9519, lng: -43.2105, type: 'landmark' },
          { name: 'Copacabana Beach', lat: -22.9711, lng: -43.1822, type: 'beach' },
          { name: 'Sugarloaf Mountain', lat: -22.9489, lng: -43.1572, type: 'landmark' },
        ]
      },
      {
        name: 'São Paulo',
        lat: -23.5505,
        lng: -46.6333,
        touristPlaces: [
          { name: 'Ibirapuera Park', lat: -23.5874, lng: -46.6576, type: 'park' },
          { name: 'São Paulo Cathedral', lat: -23.5505, lng: -46.6333, type: 'landmark' },
        ]
      },
    ]
  },
  'Argentina': {
    name: 'Argentina',
    capitalLat: -34.6037,
    capitalLng: -58.3816,
    borders: [[-22.0,-65.0],[-22.0,-54.0],[-34.0,-54.0],[-55.0,-67.0],[-55.0,-74.0],[-40.0,-73.0],[-22.0,-69.0],[-22.0,-65.0]],
    cities: [
      {
        name: 'Buenos Aires',
        lat: -34.6037,
        lng: -58.3816,
        touristPlaces: [
          { name: 'Plaza de Mayo', lat: -34.6084, lng: -58.3719, type: 'landmark' },
          { name: 'La Boca', lat: -34.6345, lng: -58.3634, type: 'landmark' },
          { name: 'Teatro Colón', lat: -34.6011, lng: -58.3832, type: 'museum' },
        ]
      },
    ]
  },
  'France': {
    name: 'France',
    capitalLat: 48.8566,
    capitalLng: 2.3522,
    cities: [
      {
        name: 'Paris',
        lat: 48.8566,
        lng: 2.3522,
        touristPlaces: [
          { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, type: 'landmark' },
          { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, type: 'museum' },
          { name: 'Notre-Dame', lat: 48.8530, lng: 2.3499, type: 'landmark' },
        ]
      },
    ]
  },
  'Spain': {
    name: 'Spain',
    capitalLat: 40.4168,
    capitalLng: -3.7038,
    cities: [
      {
        name: 'Madrid',
        lat: 40.4168,
        lng: -3.7038,
        touristPlaces: [
          { name: 'Prado Museum', lat: 40.4138, lng: -3.6921, type: 'museum' },
          { name: 'Royal Palace', lat: 40.4179, lng: -3.7143, type: 'landmark' },
        ]
      },
      {
        name: 'Barcelona',
        lat: 41.3851,
        lng: 2.1734,
        touristPlaces: [
          { name: 'Sagrada Família', lat: 41.4036, lng: 2.1744, type: 'landmark' },
          { name: 'Park Güell', lat: 41.4145, lng: 2.1527, type: 'park' },
        ]
      },
    ]
  },
  'Italy': {
    name: 'Italy',
    capitalLat: 41.9028,
    capitalLng: 12.4964,
    cities: [
      {
        name: 'Rome',
        lat: 41.9028,
        lng: 12.4964,
        touristPlaces: [
          { name: 'Colosseum', lat: 41.8902, lng: 12.4922, type: 'landmark' },
          { name: 'Vatican City', lat: 41.9029, lng: 12.4534, type: 'landmark' },
          { name: 'Trevi Fountain', lat: 41.9009, lng: 12.4833, type: 'landmark' },
        ]
      },
    ]
  },
  'Japan': {
    name: 'Japan',
    capitalLat: 35.6762,
    capitalLng: 139.6503,
    cities: [
      {
        name: 'Tokyo',
        lat: 35.6762,
        lng: 139.6503,
        touristPlaces: [
          { name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967, type: 'landmark' },
          { name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004, type: 'landmark' },
          { name: 'Mount Fuji', lat: 35.3606, lng: 138.7274, type: 'landmark' },
        ]
      },
    ]
  },
  'China': {
    name: 'China',
    capitalLat: 39.9042,
    capitalLng: 116.4074,
    cities: [
      {
        name: 'Beijing',
        lat: 39.9042,
        lng: 116.4074,
        touristPlaces: [
          { name: 'Great Wall', lat: 40.4319, lng: 116.5704, type: 'landmark' },
          { name: 'Forbidden City', lat: 39.9163, lng: 116.3972, type: 'landmark' },
        ]
      },
    ]
  },
  'UK': {
    name: 'UK',
    capitalLat: 51.5074,
    capitalLng: -0.1278,
    cities: [
      {
        name: 'London',
        lat: 51.5074,
        lng: -0.1278,
        touristPlaces: [
          { name: 'Big Ben', lat: 51.5007, lng: -0.1246, type: 'landmark' },
          { name: 'Tower of London', lat: 51.5081, lng: -0.0759, type: 'landmark' },
          { name: 'Buckingham Palace', lat: 51.5014, lng: -0.1419, type: 'landmark' },
        ]
      },
    ]
  },
  'Germany': {
    name: 'Germany',
    capitalLat: 52.5200,
    capitalLng: 13.4050,
    cities: [
      {
        name: 'Berlin',
        lat: 52.5200,
        lng: 13.4050,
        touristPlaces: [
          { name: 'Brandenburg Gate', lat: 52.5163, lng: 13.3777, type: 'landmark' },
          { name: 'Berlin Wall', lat: 52.5074, lng: 13.4385, type: 'landmark' },
        ]
      },
    ]
  },
  'Australia': {
    name: 'Australia',
    capitalLat: -35.2809,
    capitalLng: 149.1300,
    borders: [[-10.0,142.0],[-10.0,154.0],[-28.0,154.0],[-39.0,146.0],[-35.0,117.0],[-26.0,113.0],[-12.0,129.0],[-10.0,142.0]],
    cities: [
      {
        name: 'Sydney',
        lat: -33.8688,
        lng: 151.2093,
        touristPlaces: [
          { name: 'Sydney Opera House', lat: -33.8568, lng: 151.2153, type: 'landmark' },
          { name: 'Sydney Harbour Bridge', lat: -33.8523, lng: 151.2108, type: 'landmark' },
        ]
      },
    ]
  },
  'Egypt': {
    name: 'Egypt',
    capitalLat: 30.0444,
    capitalLng: 31.2357,
    cities: [
      {
        name: 'Cairo',
        lat: 30.0444,
        lng: 31.2357,
        touristPlaces: [
          { name: 'Pyramids of Giza', lat: 29.9792, lng: 31.1342, type: 'landmark' },
          { name: 'Sphinx', lat: 29.9753, lng: 31.1376, type: 'landmark' },
        ]
      },
    ]
  },
  'India': {
    name: 'India',
    capitalLat: 28.6139,
    capitalLng: 77.2090,
    cities: [
      {
        name: 'New Delhi',
        lat: 28.6139,
        lng: 77.2090,
        touristPlaces: [
          { name: 'Taj Mahal', lat: 27.1751, lng: 78.0421, type: 'landmark' },
          { name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'landmark' },
        ]
      },
    ]
  },
  'Russia': {
    name: 'Russia',
    capitalLat: 55.7558,
    capitalLng: 37.6173,
    borders: [[77.0,180.0],[77.0,-180.0],[65.0,-169.0],[60.0,160.0],[50.0,142.0],[42.0,131.0],[50.0,82.0],[68.0,33.0],[77.0,180.0]],
    cities: [
      {
        name: 'Moscow',
        lat: 55.7558,
        lng: 37.6173,
        touristPlaces: [
          { name: 'Red Square', lat: 55.7539, lng: 37.6208, type: 'landmark' },
          { name: 'Kremlin', lat: 55.7520, lng: 37.6175, type: 'landmark' },
        ]
      },
    ]
  },
};

// Additional countries without detailed city data (for globe display)
const simpleCountries: CountryData[] = [
  { name: 'Peru', capitalLat: -12.0464, capitalLng: -77.0428, cities: [] },
  { name: 'Chile', capitalLat: -33.4489, capitalLng: -70.6693, cities: [] },
  { name: 'Venezuela', capitalLat: 10.4806, capitalLng: -66.9036, cities: [] },
  { name: 'Ecuador', capitalLat: -0.1807, capitalLng: -78.4678, cities: [] },
  { name: 'Guatemala', capitalLat: 14.6349, capitalLng: -90.5069, cities: [] },
  { name: 'Cuba', capitalLat: 23.1136, capitalLng: -82.3666, cities: [] },
  { name: 'Uruguay', capitalLat: -34.9011, capitalLng: -56.1645, cities: [] },
  { name: 'Bolivia', capitalLat: -16.5000, capitalLng: -68.1500, cities: [] },
  { name: 'Norway', capitalLat: 59.9139, capitalLng: 10.7522, cities: [] },
  { name: 'Sweden', capitalLat: 59.3293, capitalLng: 18.0686, cities: [] },
  { name: 'Poland', capitalLat: 52.2297, capitalLng: 21.0122, cities: [] },
  { name: 'Ukraine', capitalLat: 50.4501, capitalLng: 30.5234, cities: [] },
  { name: 'South Africa', capitalLat: -25.7479, capitalLng: 28.2293, cities: [] },
  { name: 'Nigeria', capitalLat: 9.0765, capitalLng: 7.3986, cities: [] },
  { name: 'Kenya', capitalLat: -1.2921, capitalLng: 36.8219, cities: [] },
  { name: 'Morocco', capitalLat: 34.0209, capitalLng: -6.8416, cities: [] },
  { name: 'Algeria', capitalLat: 36.7538, capitalLng: 3.0588, cities: [] },
  { name: 'Libya', capitalLat: 32.8872, capitalLng: 13.1913, cities: [] },
  { name: 'Ethiopia', capitalLat: 9.0054, capitalLng: 38.7636, cities: [] },
  { name: 'Ghana', capitalLat: 5.6037, capitalLng: -0.1870, cities: [] },
  { name: 'South Korea', capitalLat: 37.5665, capitalLng: 126.9780, cities: [] },
  { name: 'Thailand', capitalLat: 13.7563, capitalLng: 100.5018, cities: [] },
  { name: 'Indonesia', capitalLat: -6.2088, capitalLng: 106.8456, cities: [] },
  { name: 'Saudi Arabia', capitalLat: 24.7136, capitalLng: 46.6753, cities: [] },
  { name: 'Iran', capitalLat: 35.6892, capitalLng: 51.3890, cities: [] },
  { name: 'Turkey', capitalLat: 39.9334, capitalLng: 32.8597, cities: [] },
  { name: 'Kazakhstan', capitalLat: 51.1605, capitalLng: 71.4704, cities: [] },
  { name: 'Mongolia', capitalLat: 47.8864, capitalLng: 106.9057, cities: [] },
  { name: 'Pakistan', capitalLat: 33.6844, capitalLng: 73.0479, cities: [] },
  { name: 'Afghanistan', capitalLat: 34.5553, capitalLng: 69.2075, cities: [] },
  { name: 'Vietnam', capitalLat: 21.0285, capitalLng: 105.8542, cities: [] },
  { name: 'Myanmar', capitalLat: 19.7633, capitalLng: 96.0785, cities: [] },
  { name: 'New Zealand', capitalLat: -41.2865, capitalLng: 174.7762, cities: [] },
  { name: 'Papua New Guinea', capitalLat: -9.4431, capitalLng: 147.1803, cities: [] },
];

const allCountries: CountryData[] = [
  ...Object.values(countryData),
  ...simpleCountries.filter(sc => !Object.keys(countryData).includes(sc.name))
];

// Globe grid lines (latitude and longitude)
function generateGlobeGridLines(): { latLines: number[][][]; lngLines: number[][][] } {
  const latLines: number[][][] = [];
  const lngLines: number[][][] = [];

  // Latitude lines (horizontal)
  for (let lat = -80; lat <= 80; lat += 20) {
    const line: number[][] = [];
    for (let lng = -180; lng <= 180; lng += 10) {
      line.push([lat, lng]);
    }
    latLines.push(line);
  }

  // Longitude lines (vertical)
  for (let lng = -180; lng < 180; lng += 30) {
    const line: number[][] = [];
    for (let lat = -90; lat <= 90; lat += 10) {
      line.push([lat, lng]);
    }
    lngLines.push(line);
  }

  return { latLines, lngLines };
}

const { latLines: globeLatLines, lngLines: globeLngLines } = generateGlobeGridLines();

/* ================================================================
   GEOMETRY HELPERS
   ================================================================ */
function geoToSpherical(lat: number, lng: number): Spherical {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return { theta, phi };
}

function sphereTo2D(
  theta: number,
  phi: number,
  rotation: number,
  centerX: number,
  centerY: number,
  radius: number,
  rotationY = 0,
): Projected {
  const adj = theta + rotation;
  const x0 = -Math.sin(phi) * Math.cos(adj);
  const y0 = -Math.cos(phi);
  const z0 = Math.sin(phi) * Math.sin(adj);
  // Apply X-axis tilt (rotationY): positive rotationY tilts globe so northern latitudes
  // come toward the viewer's center (matches zoomEndRotationY = π/2 - phi convention).
  const cosT = Math.cos(rotationY);
  const sinT = Math.sin(rotationY);
  const x = x0;
  const y = y0 * cosT + z0 * sinT;
  const z = -y0 * sinT + z0 * cosT;
  return { x: centerX + x * radius, y: centerY + y * radius, z, visible: z > -0.2 };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/** Normalize an admin-1 region name for lookup: lowercase, strip diacritics, collapse whitespace. */
function normalizeAdmin1Name(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Easing function for smooth animations
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

/**
 * Returns a per-point pixel offset table so that markers projected within `threshold` px
 * of each other are spread radially around their cluster centroid. Keeps original lat/lng
 * intact — only mutates rendered position. Same input order yields same offsets, so the
 * click/hover handlers and the render loop stay in sync.
 */
function computeDeclusterOffsets(
  positions: { x: number; y: number }[],
  threshold = 36,
  spreadRadius = 24,
): { dx: number; dy: number }[] {
  const n = positions.length;
  const offsets: { dx: number; dy: number }[] = Array.from({ length: n }, () => ({ dx: 0, dy: 0 }));
  const visited = new Array<boolean>(n).fill(false);
  const t2 = threshold * threshold;

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const cluster: number[] = [i];
    visited[i] = true;
    for (let j = i + 1; j < n; j++) {
      if (visited[j]) continue;
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      if (dx * dx + dy * dy < t2) {
        cluster.push(j);
        visited[j] = true;
      }
    }
    if (cluster.length > 1) {
      const k = cluster.length;
      for (let m = 0; m < k; m++) {
        const angle = (m / k) * Math.PI * 2 - Math.PI / 2;
        offsets[cluster[m]] = {
          dx: Math.cos(angle) * spreadRadius,
          dy: Math.sin(angle) * spreadRadius,
        };
      }
    }
  }
  return offsets;
}

/* ================================================================
   NOMINATIM GEOCODING
   ================================================================ */
async function getCoordinatesFromNominatim(locationName: string) {
  try {
    const encoded = encodeURIComponent(locationName.trim());
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      { headers: { 'User-Agent': 'TourismPlatform/1.0' } },
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name as string };
    }
  } catch (err) {
    console.error('Error obteniendo coordenadas:', err);
  }
  return null;
}

function generateGoogleMapsStreetViewUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

/* ================================================================
   CONSTANTS
   ================================================================ */
const COLOR = '#C5C5C5';
const HIGHLIGHT_COLOR = '#007BFF';
const BASE_RADIUS = 4;
const HOVER_RADIUS = 12;
const CAPITAL_RADIUS = 6;
const CITY_RADIUS = 5;
const PLACE_RADIUS = 7;
// Hit-targets are deliberately larger than the visual marker so users don't miss small dots
const CITY_HIT_RADIUS = 22;
const PLACE_HIT_RADIUS = 20;
const COUNTRY_HIT_RADIUS = 14;
const ROTATION_SPEED = 0.003;
const DRAG_SENSITIVITY = 0.005;

// Type-specific colors for tourist places
const TYPE_COLORS: Record<string, string> = {
  landmark: '#3B82F6',
  beach: '#06B6D4',
  museum: '#F59E0B',
  restaurant: '#EF4444',
  park: '#10B981',
  other: '#8B5CF6',
};

// Tour vs Accommodation marker styling
const TOUR_COLOR = '#FB7185';        // rose-400
const ACCOM_COLOR = '#2DD4BF';       // teal-400
const ITEM_RADIUS = 9;
const ITEM_HIT_RADIUS = 24;

/** Best-effort match between a Tour/Accommodation and the currently selected city. */
function itemMatchesCity(itemCity: string | undefined, itemCoords: { lat: number; lng: number } | undefined, city: CityData): boolean {
  if (itemCity) {
    const a = normalizeAdmin1Name(itemCity);
    const b = normalizeAdmin1Name(city.name);
    // Substring match handles "Cartagena de Indias" vs "Cartagena", "San Andrés" vs "San Andrés Islas"
    if (a.includes(b) || b.includes(a)) return true;
  }
  if (itemCoords) {
    // Fallback: within ~50 km of the city center (rough flat-earth approximation, good enough)
    const dLat = itemCoords.lat - city.lat;
    const dLng = (itemCoords.lng - city.lng) * Math.cos((city.lat * Math.PI) / 180);
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    if (distKm < 50) return true;
  }
  return false;
}

// Generate static stars for space background
const STARS: { x: number; y: number; r: number; o: number }[] = [];
for (let i = 0; i < 200; i++) {
  STARS.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.3, o: Math.random() * 0.6 + 0.15 });
}

/* ================================================================
   REACT COMPONENT
   ================================================================ */
const PlanetExplorer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [ready, setReady] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionLevel>({
    level: 'globe',
    countryName: null,
    cityName: null,
    placeName: null,
  });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [showStreetViewPrompt, setShowStreetViewPrompt] = useState<{place: TouristPlaceData, lat: number, lng: number} | null>(null);
  const geoBordersRef = useRef<number[][][][]>([]); // Array of countries, each with polygons of [lat,lng] coords
  const geoDataRef = useRef<any>(null); // Store full GeoJSON data
  const countryBordersByNameRef = useRef<Map<string, number[][][]>>(new Map()); // Country name -> polygons
  const admin1BordersByNameRef = useRef<Map<string, number[][][]>>(new Map()); // Normalized name -> polygons (legacy fallback)
  const admin1BordersByKeyRef = useRef<Map<string, number[][][]>>(new Map()); // `${iso_a2}::${normName}` -> polygons (preferred)
  const admin1BordersByCountryRef = useRef<Map<string, Array<{ name: string; polys: number[][][] }>>>(new Map()); // iso_a2 -> all admin1 regions of that country
  const [dynamicLoading, setDynamicLoading] = useState(false);

  // Tours & Accommodations from Firebase (loaded once at mount)
  const { tours } = useTours();
  const { accommodations } = useAccommodations();
  const [selectedItem, setSelectedItem] = useState<GlobeItem | null>(null);
  const itemsRef = useRef<GlobeItem[]>([]);

  // Load real country borders from local GeoJSON
  useEffect(() => {
    // Load from bundled wolrd.json.txt
    const loadGeoData = async () => {
      let geojson: any = null;

      try {
        const response = await fetch(worldGeoUrl);
        if (response.ok) {
          const text = await response.text();
          geojson = JSON.parse(text);
          console.log('Loaded country borders from wolrd.json.txt');
        }
      } catch (err) {
        console.warn('Could not load country borders:', err);
        return;
      }

      if (!geojson) return;

      // Process GeoJSON into format for rendering borders
      const countries: number[][][][] = [];
      geoDataRef.current = geojson; // Store for potential later use

      const nameIndex = new Map<string, number[][][]>();
      for (const feature of geojson.features) {
        const polys: number[][][] = [];
        const geo = feature.geometry;
        // GeoJSON uses [lng, lat], we need [lat, lng]
        if (geo.type === 'Polygon') {
          for (const ring of (geo.coordinates as number[][][])) {
            const coords = ring.map(([lng, lat]) => [lat, lng]);
            if (coords.length > 2) polys.push(coords);
          }
        } else if (geo.type === 'MultiPolygon') {
          for (const polygon of (geo.coordinates as number[][][][])) {
            for (const ring of polygon) {
              const coords = ring.map(([lng, lat]) => [lat, lng]);
              if (coords.length > 2) polys.push(coords);
            }
          }
        }
        if (polys.length > 0) {
          countries.push(polys);
          const props = feature.properties || {};
          const cname = props.name || props.NAME || props.ADMIN || props.admin;
          if (cname) nameIndex.set(cname, polys);
        }
      }
      geoBordersRef.current = countries;
      countryBordersByNameRef.current = nameIndex;
    };

    loadGeoData();

    // Load admin1 (states/provinces) borders from local GeoJSON
    const loadAdmin1Data = async () => {
      let geojson: any = null;
      try {
        const response = await fetch('/admin1.geo.json');
        if (response.ok) {
          geojson = await response.json();
          console.log('Loaded admin1 borders from /admin1.geo.json');
        }
      } catch (err) {
        console.warn('Could not load admin1 borders:', err);
        return;
      }

      if (!geojson) return;

      const nameIndex = new Map<string, number[][][]>();      // normName -> polys (fallback, last-write-wins)
      const keyIndex = new Map<string, number[][][]>();       // `${iso}::${normName}` -> polys (preferred)
      const byCountry = new Map<string, Array<{ name: string; polys: number[][][] }>>();

      for (const feature of geojson.features) {
        const polys: number[][][] = [];
        const geo = feature.geometry;
        if (!geo) continue;

        if (geo.type === 'Polygon') {
          for (const ring of (geo.coordinates as number[][][])) {
            const coords = ring.map(([lng, lat]) => [lat, lng]);
            if (coords.length > 2) polys.push(coords);
          }
        } else if (geo.type === 'MultiPolygon') {
          for (const polygon of (geo.coordinates as number[][][][])) {
            for (const ring of polygon) {
              const coords = ring.map(([lng, lat]) => [lat, lng]);
              if (coords.length > 2) polys.push(coords);
            }
          }
        }

        if (polys.length === 0) continue;
        const props = feature.properties || {};
        const cname: string | undefined = props.name || props.NAME || props.admin1 || props.ADMIN1 || props.name_local;
        if (!cname) continue;

        const iso: string = (props.iso_a2 || props.ISO_A2 || '').toString().toUpperCase();
        const norm = normalizeAdmin1Name(cname);

        // Legacy single-key index (kept for backwards-compat callers)
        nameIndex.set(norm, polys);
        // Preferred ISO-scoped key
        if (iso) keyIndex.set(`${iso}::${norm}`, polys);

        // Country bucket — used to draw all admin-1 regions of a selected country
        if (iso) {
          const arr = byCountry.get(iso) ?? [];
          arr.push({ name: cname, polys });
          byCountry.set(iso, arr);
        }
      }
      admin1BordersByNameRef.current = nameIndex;
      admin1BordersByKeyRef.current = keyIndex;
      admin1BordersByCountryRef.current = byCountry;
    };

    loadAdmin1Data();
  }, []);

  /* ---- Dynamic data: fetch cities for selected country via Overpass ---- */
  useEffect(() => {
    const st = stateRef.current;
    const country = st.selectedCountry;
    if (!country || interactionState.level !== 'country') return;
    if (!COUNTRY_ISO[country.name]) return; // no ISO mapping -> skip
    // Avoid refetching if cities were already enriched (heuristic: more than hardcoded)
    if (country.cities.length > 12) return;

    let cancelled = false;
    setDynamicLoading(true);
    fetchCitiesForCountry(country.name)
      .then(cities => {
        if (cancelled || cities.length === 0) return;
        const existingNames = new Set(country.cities.map(c => c.name.toLowerCase()));
        const merged = [
          ...country.cities,
          ...cities
            .filter(c => !existingNames.has(c.name.toLowerCase()))
            .slice(0, 30)
            .map(c => ({
              name: c.name,
              lat: c.lat,
              lng: c.lng,
              touristPlaces: [],
            })),
        ];
        // Mutate the selected country in-place so the draw loop picks it up
        country.cities = merged;
      })
      .finally(() => {
        if (!cancelled) setDynamicLoading(false);
      });
    return () => { cancelled = true; };
  }, [interactionState.level, interactionState.countryName]);

  /* ---- Dynamic data: fetch tourist places for selected city via Overpass ---- */
  useEffect(() => {
    const st = stateRef.current;
    const city = st.selectedCity;
    if (!city || interactionState.level !== 'city') return;
    if (city.touristPlaces.length > 0) return; // already populated (hardcoded)

    let cancelled = false;
    setDynamicLoading(true);
    fetchTouristPlaces(city.lat, city.lng, 15000)
      .then(places => {
        if (cancelled || places.length === 0) return;
        city.touristPlaces = places.slice(0, 25);
      })
      .finally(() => {
        if (!cancelled) setDynamicLoading(false);
      });
    return () => { cancelled = true; };
  }, [interactionState.level, interactionState.cityName]);

  // mutable animation state kept in refs to avoid re-renders
  const stateRef = useRef({
    rotation: 0,
    rotationY: 0,
    zooming: false,
    zoomProgress: 0,
    zoomTarget: null as { lat: number; lng: number; name: string } | null,
    zoomStartRadius: 360,
    zoomEndRadius: 0,
    zoomStartCenter: { x: 500, y: 400 },
    zoomEndCenter: { x: 500, y: 400 },
    zoomStartRotation: 0,
    zoomStartRotationY: 0,
    zoomEndRotation: 0,
    zoomEndRotationY: 0,
    hoveredCountry: null as string | null,
    hoveredCity: null as string | null,
    hoveredPlace: null as TouristPlaceData | null,
    zoomedOut: false,
    zoomAnimationComplete: false, // Track when zoom animation finishes
    hoverRadiusMap: new Map<string, number>(),
    searchMarkers: [] as { lat: number; lng: number; name: string; displayName: string }[],
    searchMarkerPulse: 0,
    centerX: 500,
    centerY: 400,
    radius: 360,
    // Base globe radius for the current viewport (updated in resizeCanvas). Used to preserve the
    // user's manual zoom across resize events — without this, a mobile address-bar show/hide would
    // reset `radius` to the base and collapse the deep-zoom view.
    baseRadius: 360,
    // Drag state
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    dragDeltaX: 0,
    dragDeltaY: 0,
    // Pinch-to-zoom state (two-finger gesture on touch devices)
    isPinching: false,
    lastPinchDistance: 0,
    // Level state
    currentLevel: 'globe' as 'globe' | 'country' | 'city' | 'place',
    selectedCountry: null as CountryData | null,
    selectedCity: null as CityData | null,
    selectedPlace: null as TouristPlaceData | null,
    // Camera history stack — each entry is the state we want to RETURN TO when going back
    cameraStack: [] as Array<{
      radius: number; rotation: number; rotationY: number;
      centerX: number; centerY: number;
      level: 'globe' | 'country' | 'city' | 'place';
      country: CountryData | null; city: CityData | null;
      breadcrumbs: BreadcrumbItem[];
    }>,
  });

  // Items (tours + accommodations) belonging to the currently-selected city.
  // Computed once per data/level change, then mirrored into itemsRef for the canvas loop.
  const itemsForCity = useMemo<GlobeItem[]>(() => {
    if (interactionState.level !== 'city' && interactionState.level !== 'place') return [];
    const city = stateRef.current.selectedCity;
    if (!city) return [];
    const tourItems: GlobeItem[] = tours
      .filter(t => t.coords && itemMatchesCity(t.city, t.coords, city))
      .map(t => ({ kind: 'tour' as const, data: t }));
    const accItems: GlobeItem[] = accommodations
      .filter(a => a.coords && itemMatchesCity(a.city, a.coords, city))
      .map(a => ({ kind: 'accommodation' as const, data: a }));
    return [...tourItems, ...accItems];
  }, [tours, accommodations, interactionState.level, interactionState.cityName]);

  useEffect(() => { itemsRef.current = itemsForCity; }, [itemsForCity]);

  /* ---- resize canvas to fill container ---- */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;
    const st = stateRef.current;
    st.centerX = w / 2;
    st.centerY = h / 2;
    // Preserve the user's current zoom ratio across resize events. Mobile browsers fire `resize`
    // when the address bar shows/hides; without this guard we would snap `radius` back to the
    // base and yank the user out of a deep zoom (e.g. inside a city).
    const newBase = Math.min(w, h) * 0.42;
    const prevBase = st.baseRadius;
    if (prevBase > 0 && st.currentLevel !== 'globe') {
      const zoomRatio = st.radius / prevBase;
      st.radius = newBase * zoomRatio;
    } else {
      st.radius = newBase;
    }
    st.baseRadius = newBase;
  }, []);

  /* ---- navigation helpers ---- */
  const pushCameraSnapshot = useCallback((bc: BreadcrumbItem[]) => {
    const st = stateRef.current;
    st.cameraStack.push({
      radius: st.radius,
      rotation: st.rotation,
      rotationY: st.rotationY,
      centerX: st.centerX,
      centerY: st.centerY,
      level: st.currentLevel,
      country: st.selectedCountry,
      city: st.selectedCity,
      breadcrumbs: bc,
    });
  }, []);

  const goBack = useCallback(() => {
    const st = stateRef.current;
    const snap = st.cameraStack.pop();
    if (!snap) return;

    // Restore logical state synchronously
    st.currentLevel = snap.level;
    st.selectedCountry = snap.country;
    st.selectedCity = snap.city;
    st.selectedPlace = null;

    // Reset hover state to avoid stale tooltips
    st.hoveredCountry = null;
    st.hoveredCity = null;
    st.hoveredPlace = null;
    st.searchMarkers = [];

    // Animate camera to previous snapshot
    st.zooming = true;
    st.zoomProgress = 0;
    st.zoomAnimationComplete = false;
    st.zoomStartRadius = st.radius;
    st.zoomEndRadius = snap.radius;
    st.zoomStartCenter = { x: st.centerX, y: st.centerY };
    st.zoomEndCenter = { x: snap.centerX, y: snap.centerY };
    st.zoomStartRotation = st.rotation;
    st.zoomStartRotationY = st.rotationY;
    st.zoomEndRotation = snap.rotation;
    st.zoomEndRotationY = snap.rotationY;
    st.zoomTarget = { lat: 0, lng: 0, name: snap.level };

    // CRITICAL: when returning to globe, allow auto-rotation to resume
    if (snap.level === 'globe') {
      st.zoomedOut = false;
    }

    setInteractionState({
      level: snap.level,
      countryName: snap.country?.name ?? null,
      cityName: snap.city?.name ?? null,
      placeName: null,
    });
    setBreadcrumbs(snap.breadcrumbs);
    setShowStreetViewPrompt(null);
    setSelectedItem(null);
  }, []);

  /* ---- search handler ---- */
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) { setSearchAnswer('Escribe un país, ciudad o lugar turístico para buscar.'); return; }

    const st = stateRef.current;
    const queryLower = query.toLowerCase();

    // Search in tourist places first
    for (const country of allCountries) {
      for (const city of country.cities) {
        for (const place of city.touristPlaces) {
          if (place.name.toLowerCase().includes(queryLower)) {
            // Push snapshot from globe before deep-diving
            pushCameraSnapshot([]);
            st.selectedCountry = country;
            st.selectedCity = city;
            st.selectedPlace = place;
            st.currentLevel = 'place';
            setInteractionState({ level: 'place', countryName: country.name, cityName: city.name, placeName: place.name });
            setBreadcrumbs([
              { label: 'Globo', level: 'globe' },
              { label: country.name, level: 'country' },
              { label: city.name, level: 'city' },
            ]);
            zoomToLocation(place.lat, place.lng, place.name, 'place');
            setSearchAnswer(`Mostrando: ${place.name}`);
            return;
          }
        }
        if (city.name.toLowerCase().includes(queryLower)) {
          pushCameraSnapshot([]);
          st.selectedCountry = country;
          st.selectedCity = city;
          st.currentLevel = 'city';
          setInteractionState({ level: 'city', countryName: country.name, cityName: city.name, placeName: null });
          setBreadcrumbs([
            { label: 'Globo', level: 'globe' },
            { label: country.name, level: 'country' },
          ]);
          zoomToLocation(city.lat, city.lng, city.name, 'city');
          setSearchAnswer(`Mostrando: ${city.name}`);
          return;
        }
      }
      if (country.name.toLowerCase().includes(queryLower)) {
        pushCameraSnapshot([]);
        st.selectedCountry = country;
        st.currentLevel = 'country';
        setInteractionState({ level: 'country', countryName: country.name, cityName: null, placeName: null });
        setBreadcrumbs([{ label: 'Globo', level: 'globe' }]);
        zoomToLocation(country.capitalLat, country.capitalLng, country.name, 'country');
        setSearchAnswer(`Mostrando: ${country.name}`);
        return;
      }
    }

    // Geocode via Nominatim as fallback
    setSearchAnswer('Buscando ubicación...');
    const coords = await getCoordinatesFromNominatim(query);
    if (coords) {
      pushCameraSnapshot([]);
      // Add as search marker and rotate globe toward it
      st.searchMarkers = [{ lat: coords.lat, lng: coords.lng, name: query, displayName: coords.displayName }];
      st.searchMarkerPulse = 0;
      st.currentLevel = 'globe';
      st.selectedCountry = null;
      st.selectedCity = null;
      st.selectedPlace = null;
      setInteractionState({ level: 'globe', countryName: null, cityName: null, placeName: null });
      setBreadcrumbs([]);
      zoomToLocation(coords.lat, coords.lng, coords.displayName, 'country');
      setSearchAnswer(`📍 ${coords.displayName}`);
    } else {
      setSearchAnswer('No encontramos ese lugar. Intenta con otro nombre.');
    }
  }, [searchQuery, pushCameraSnapshot]);

  const zoomToLocation = (lat: number, lng: number, name: string, level: 'country' | 'city' | 'place') => {
    const st = stateRef.current;
    const spherical = geoToSpherical(lat, lng);

    st.zooming = true;
    st.zoomProgress = 0;
    st.zoomTarget = { lat, lng, name };
    st.zoomAnimationComplete = false; // Reset completion flag

    // Use initial radius as baseline to ensure consistent zoom levels
    // This is set once on canvas resize and represents the base size
    const initialRadius = Math.min(st.centerX * 2, st.centerY * 2) * 0.42;

    // Zoom factors: multiplier of initial radius
    // Country: zoom in close enough that the country fills most of the viewport
    // City: zoom so tourist places spread visually (~hundreds of px apart for ~10km separation)
    // Place: very close street-level zoom on a single landmark
    // A city can override the default city-level multiplier via CityData.zoomMultiplier — used for remote
    // islands (e.g. San Andrés) that sit hundreds of km from the continent and would otherwise be invisible.
    const cityMultiplier =
      level === 'city' && st.selectedCity?.zoomMultiplier
        ? st.selectedCity.zoomMultiplier
        : 80;
    const zoomFactors = {
      country: { endRadius: initialRadius * 6 },
      city: { endRadius: initialRadius * cityMultiplier },
      place: { endRadius: initialRadius * 220 },
    };

    const factor = zoomFactors[level];
    st.zoomStartRadius = st.radius;
    st.zoomEndRadius = factor.endRadius;
    st.zoomStartCenter = { x: st.centerX, y: st.centerY };
    st.zoomEndCenter = { x: st.centerX, y: st.centerY }; // Keep center - we rotate instead
    st.zoomStartRotation = st.rotation;
    st.zoomStartRotationY = st.rotationY;

    // Calculate rotation to center the target on screen
    // To center a point at (theta, phi), we need to:
    // 1. Rotate around Y-axis to bring it to the center of the screen
    // 2. Rotate around X-axis by -phi to bring it to the center vertically
    st.zoomEndRotation = Math.PI / 2 - spherical.theta;
    st.zoomEndRotationY = -spherical.phi + Math.PI / 2;
  };

  /* ---- street view handler ---- */
  const handleStreetView = useCallback(() => {
    const st = stateRef.current;
    if (st.selectedPlace) {
      const url = generateGoogleMapsStreetViewUrl(st.selectedPlace.lat, st.selectedPlace.lng);
      window.open(url, '_blank');
      setShowStreetViewPrompt(null);
    }
  }, []);

  /* ---- animation loop ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();
    setReady(true);

    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);

    /* mouse/touch handlers */
    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
    };

    const pinchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const clampManualRadius = (next: number) => {
      const st = stateRef.current;
      const min = st.baseRadius;       // never zoom out past the base globe size
      const max = st.baseRadius * 250; // cap deep zoom so we don't overflow numeric/visual limits
      return Math.max(min, Math.min(max, next));
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const st = stateRef.current;

      // Two-finger touch -> begin pinch-to-zoom. Cancel any drag so the single-touch rotate path
      // doesn't fight the gesture.
      if ('touches' in e && e.touches.length >= 2) {
        e.preventDefault();
        st.isDragging = false;
        st.isPinching = true;
        st.lastPinchDistance = pinchDistance(e.touches);
        // Mark dragDelta so a click cannot fire when the user lifts both fingers.
        st.dragDeltaX = 999;
        st.dragDeltaY = 999;
        return;
      }

      if (st.zooming) return;
      const pos = getMousePos(e);
      st.isDragging = true;
      st.isPinching = false;
      st.lastMouseX = pos.x;
      st.lastMouseY = pos.y;
      st.dragDeltaX = 0;
      st.dragDeltaY = 0;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) e.preventDefault();
      const st = stateRef.current;

      // Pinch-to-zoom: when two fingers are down, scale `radius` by the change in finger spacing.
      // Lives BEFORE the drag/hover branches so it short-circuits both.
      if ('touches' in e && e.touches.length >= 2 && st.isPinching) {
        if (st.zooming) return;
        const d = pinchDistance(e.touches);
        if (st.lastPinchDistance > 0) {
          const ratio = d / st.lastPinchDistance;
          st.radius = clampManualRadius(st.radius * ratio);
          st.zoomedOut = true; // stop globe-level auto-rotation while the user is interacting
        }
        st.lastPinchDistance = d;
        return;
      }

      const pos = getMousePos(e);

      if (st.isDragging) {
        const deltaX = pos.x - st.lastMouseX;
        const deltaY = pos.y - st.lastMouseY;
        st.dragDeltaX += Math.abs(deltaX);
        st.dragDeltaY += Math.abs(deltaY);
        // Invert rotation direction for natural drag feel
        st.rotation += deltaX * DRAG_SENSITIVITY;
        st.rotationY += deltaY * DRAG_SENSITIVITY;
        // At globe level we cap the tilt at ±60° to keep the poles from flipping. When the user is
        // zoomed into a country/city/place we relax the cap — zoomEndRotationY for high-latitude
        // targets can sit outside ±π/3, and clamping it on the first drag snaps the view away.
        const maxTilt = st.currentLevel === 'globe' ? Math.PI / 3 : Math.PI;
        st.rotationY = Math.max(-maxTilt, Math.min(maxTilt, st.rotationY));
        st.lastMouseX = pos.x;
        st.lastMouseY = pos.y;
        canvas.style.cursor = 'grabbing';
        return;
      }

      // Hover detection based on current level
      // Only detect hovers when zoom animation is complete (for country/city levels)
      if (st.currentLevel === 'globe') {
        let found: string | null = null;
        for (const country of allCountries) {
          const spherical = geoToSpherical(country.capitalLat, country.capitalLng);
          const p = sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY);
          if (p.visible) {
            const dx = pos.x - p.x, dy = pos.y - p.y;
            if (dx * dx + dy * dy < HOVER_RADIUS * HOVER_RADIUS) { found = country.name; break; }
          }
        }
        st.hoveredCountry = found;
        canvas.style.cursor = found ? 'pointer' : 'default';
      } else if (st.currentLevel === 'country' && st.selectedCountry && st.zoomAnimationComplete) {
        // Only hover detect cities after zoom completes
        const projected = st.selectedCountry.cities.map(city => {
          const spherical = geoToSpherical(city.lat, city.lng);
          return { city, p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        let foundCity: string | null = null;
        const hit2 = CITY_HIT_RADIUS * CITY_HIT_RADIUS;
        for (let i = 0; i < projected.length; i++) {
          const { city, p } = projected[i];
          if (!p.visible) continue;
          const dx = pos.x - (p.x + offsets[i].dx), dy = pos.y - (p.y + offsets[i].dy);
          if (dx * dx + dy * dy < hit2) { foundCity = city.name; break; }
        }
        st.hoveredCity = foundCity;
        canvas.style.cursor = foundCity ? 'pointer' : 'default';
      } else if (st.currentLevel === 'city' && st.selectedCity && st.zoomAnimationComplete) {
        // Tour/accommodation markers take hover priority over tourist places
        const items = itemsRef.current;
        if (items.length > 0) {
          const itemProj = items.map(item => {
            // TODO: Verificar coords en Firebase para ubicación exacta — los marcadores se ubican según item.data.coords; si están aproximados el pin aparecerá fuera de lugar.
            const coords = item.kind === 'tour' ? item.data.coords : item.data.coords;
            const spherical = geoToSpherical(coords.lat, coords.lng);
            return { p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
          });
          const itemOffsets = computeDeclusterOffsets(itemProj.map(it => ({ x: it.p.x, y: it.p.y })));
          const itemHit2 = ITEM_HIT_RADIUS * ITEM_HIT_RADIUS;
          let hitItem = false;
          for (let i = 0; i < itemProj.length; i++) {
            const { p } = itemProj[i];
            if (!p.visible) continue;
            const dx = pos.x - (p.x + itemOffsets[i].dx), dy = pos.y - (p.y + itemOffsets[i].dy);
            if (dx * dx + dy * dy < itemHit2) { hitItem = true; break; }
          }
          if (hitItem) {
            st.hoveredPlace = null;
            canvas.style.cursor = 'pointer';
            return;
          }
        }

        const projected = st.selectedCity.touristPlaces.map(place => {
          const spherical = geoToSpherical(place.lat, place.lng);
          return { place, p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        let foundPlace: TouristPlaceData | null = null;
        const hit2 = PLACE_HIT_RADIUS * PLACE_HIT_RADIUS;
        for (let i = 0; i < projected.length; i++) {
          const { place, p } = projected[i];
          if (!p.visible) continue;
          const dx = pos.x - (p.x + offsets[i].dx), dy = pos.y - (p.y + offsets[i].dy);
          if (dx * dx + dy * dy < hit2) { foundPlace = place; break; }
        }
        st.hoveredPlace = foundPlace;
        canvas.style.cursor = foundPlace ? 'pointer' : 'default';
      }
    };

    const onPointerUp = (e?: MouseEvent | TouchEvent) => {
      const st = stateRef.current;

      // Touch endings need to consider the touches that remain on screen.
      if (e && 'touches' in e) {
        if (e.touches.length < 2) {
          st.isPinching = false;
          st.lastPinchDistance = 0;
        }
        if (e.touches.length === 1) {
          // User lifted one of two fingers — re-anchor the remaining finger so a follow-up drag
          // doesn't jump. Keep dragDelta high so this finger-lift can't synthesize a click.
          const rect = canvas.getBoundingClientRect();
          st.lastMouseX = e.touches[0].clientX - rect.left;
          st.lastMouseY = e.touches[0].clientY - rect.top;
          st.isDragging = true;
          return;
        }
      }

      st.isDragging = false;
      st.isPinching = false;
      st.lastPinchDistance = 0;
      canvas.style.cursor = 'default';
    };

    // Mouse wheel zoom (desktop). Negative deltaY = scroll up = zoom in, so `1 - deltaY * k` gives
    // a factor > 1 when scrolling up. Independent from `zoomToLocation` — only mutates radius and
    // sets `zoomedOut` to halt auto-rotation; never changes `currentLevel`.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const st = stateRef.current;
      if (st.zooming) return; // don't fight an active zoom animation
      const factor = 1 - e.deltaY * 0.001;
      st.radius = clampManualRadius(st.radius * factor);
      st.zoomedOut = true;
    };

    const onClick = (e: MouseEvent) => {
      const st = stateRef.current;
      if (st.zooming || st.isDragging) return;

      // Only register click if there was minimal drag movement
      if (st.dragDeltaX > 5 || st.dragDeltaY > 5) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (st.currentLevel === 'globe') {
        const hit2 = COUNTRY_HIT_RADIUS * COUNTRY_HIT_RADIUS;
        for (const country of allCountries) {
          const spherical = geoToSpherical(country.capitalLat, country.capitalLng);
          const p = sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY);
          if (p.visible) {
            const dx = mx - p.x, dy = my - p.y;
            if (dx * dx + dy * dy < hit2) {
              pushCameraSnapshot([]);
              st.selectedCountry = country;
              st.currentLevel = 'country';
              setInteractionState({ level: 'country', countryName: country.name, cityName: null, placeName: null });
              setBreadcrumbs([{ label: 'Globo', level: 'globe' }]);
              zoomToLocation(country.capitalLat, country.capitalLng, country.name, 'country');
              break;
            }
          }
        }
      } else if (st.currentLevel === 'country' && st.selectedCountry) {
        const projected = st.selectedCountry.cities.map(city => {
          const spherical = geoToSpherical(city.lat, city.lng);
          return { city, p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        const hit2 = CITY_HIT_RADIUS * CITY_HIT_RADIUS;
        for (let i = 0; i < projected.length; i++) {
          const { city, p } = projected[i];
          if (!p.visible) continue;
          const dx = mx - (p.x + offsets[i].dx), dy = my - (p.y + offsets[i].dy);
          if (dx * dx + dy * dy < hit2) {
            const prevBc: BreadcrumbItem[] = [{ label: 'Globo', level: 'globe' }];
            pushCameraSnapshot(prevBc);
            st.selectedCity = city;
            st.currentLevel = 'city';
            setInteractionState({ level: 'city', countryName: st.selectedCountry.name, cityName: city.name, placeName: null });
            setBreadcrumbs([
              ...prevBc,
              { label: st.selectedCountry.name, level: 'country' },
            ]);
            zoomToLocation(city.lat, city.lng, city.name, 'city');
            break;
          }
        }
      } else if (st.currentLevel === 'city' && st.selectedCity) {
        // First check tour/accommodation markers — they sit on top of tourist places.
        const items = itemsRef.current;
        if (items.length > 0) {
          const itemProj = items.map(item => {
            // TODO: Verificar coords en Firebase para ubicación exacta — el click hit-test depende de coords precisos.
            const coords = item.kind === 'tour' ? item.data.coords : item.data.coords;
            const spherical = geoToSpherical(coords.lat, coords.lng);
            return { item, p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
          });
          const itemOffsets = computeDeclusterOffsets(itemProj.map(it => ({ x: it.p.x, y: it.p.y })));
          const itemHit2 = ITEM_HIT_RADIUS * ITEM_HIT_RADIUS;
          for (let i = 0; i < itemProj.length; i++) {
            const { item, p } = itemProj[i];
            if (!p.visible) continue;
            const dx = mx - (p.x + itemOffsets[i].dx), dy = my - (p.y + itemOffsets[i].dy);
            if (dx * dx + dy * dy < itemHit2) {
              setSelectedItem(item);
              return; // consume the click; do not also fire tourist-place selection
            }
          }
        }

        const projected = st.selectedCity.touristPlaces.map(place => {
          const spherical = geoToSpherical(place.lat, place.lng);
          return { place, p: sphereTo2D(spherical.theta, spherical.phi, st.rotation, st.centerX, st.centerY, st.radius, st.rotationY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        const hit2 = PLACE_HIT_RADIUS * PLACE_HIT_RADIUS;
        for (let i = 0; i < projected.length; i++) {
          const { place, p } = projected[i];
          if (!p.visible) continue;
          const dx = mx - (p.x + offsets[i].dx), dy = my - (p.y + offsets[i].dy);
          if (dx * dx + dy * dy < hit2) {
            const prevBc: BreadcrumbItem[] = [
              { label: 'Globo', level: 'globe' },
              { label: st.selectedCountry?.name || '', level: 'country' },
            ];
            pushCameraSnapshot(prevBc);
            st.selectedPlace = place;
            st.currentLevel = 'place';
            setInteractionState({ level: 'place', countryName: st.selectedCountry?.name || null, cityName: st.selectedCity.name, placeName: place.name });
            setBreadcrumbs([
              ...prevBc,
              { label: st.selectedCity.name, level: 'city' },
            ]);
            zoomToLocation(place.lat, place.lng, place.name, 'place');
            setShowStreetViewPrompt({ place, lat: place.lat, lng: place.lng });
            break;
          }
        }
      }
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('touchcancel', onPointerUp);

    /* draw loop */
    function draw() {
      const st = stateRef.current;
      const w = canvas!.width;
      const h = canvas!.height;

      // Animate hover radii
      const hoverTargets = st.currentLevel === 'globe' ? allCountries.map(c => c.name)
        : st.currentLevel === 'country' && st.selectedCountry ? st.selectedCountry.cities.map(c => c.name)
        : st.currentLevel === 'city' && st.selectedCity ? st.selectedCity.touristPlaces.map(p => p.name)
        : [];

      for (const name of hoverTargets) {
        let target = BASE_RADIUS;
        const isHovered = st.currentLevel === 'globe' ? st.hoveredCountry === name
          : st.currentLevel === 'country' ? st.hoveredCity === name
          : st.hoveredPlace?.name === name;

        if (isHovered && !st.zooming) target = HOVER_RADIUS;
        let cur = st.hoverRadiusMap.get(name) || BASE_RADIUS;
        cur += (target - cur) * 0.25;
        st.hoverRadiusMap.set(name, cur);
      }

      let curRadius = st.radius;
      let curCX = st.centerX;
      let curCY = st.centerY;
      let curRot = st.rotation;
      let curRotY = st.rotationY;

      if (st.zooming && st.zoomTarget) {
        st.zoomProgress = Math.min(st.zoomProgress + 0.012, 1);
        const eased = easeOutCubic(st.zoomProgress);
        curRadius = lerp(st.zoomStartRadius, st.zoomEndRadius, eased);
        curRot = lerp(st.zoomStartRotation, st.zoomEndRotation, eased);
        curRotY = lerp(st.zoomStartRotationY, st.zoomEndRotationY, eased);
        curCX = lerp(st.zoomStartCenter.x, st.zoomEndCenter.x, eased);
        curCY = lerp(st.zoomStartCenter.y, st.zoomEndCenter.y, eased);
        if (st.zoomProgress >= 1) {
          st.zooming = false;
          // Only freeze rotation when zoomed INTO a region. At globe level, keep spinning.
          st.zoomedOut = st.currentLevel !== 'globe';
          st.zoomAnimationComplete = true;
          st.zoomProgress = 0;
          // Persist the final zoomed values so they don't snap back
          st.radius = st.zoomEndRadius;
          st.rotation = st.zoomEndRotation;
          st.rotationY = st.zoomEndRotationY;
          st.centerX = st.zoomEndCenter.x;
          st.centerY = st.zoomEndCenter.y;
        }
      } else if (!st.zoomedOut && st.currentLevel === 'globe' && !st.isDragging) {
        st.rotation -= ROTATION_SPEED;
        curRot = st.rotation;
      }

      ctx!.clearRect(0, 0, w, h);

      // Draw star background
      for (const star of STARS) {
        ctx!.beginPath();
        ctx!.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.o})`;
        ctx!.fill();
      }

      // Globe atmospheric glow
      const glowGrad = ctx!.createRadialGradient(curCX, curCY, curRadius * 0.85, curCX, curCY, curRadius * 1.25);
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.06)');
      glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)');
      glowGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = glowGrad;
      ctx!.fillRect(0, 0, w, h);

      // Draw globe background (gradient sphere)
      ctx!.beginPath();
      ctx!.arc(curCX, curCY, curRadius, 0, Math.PI * 2);
      const globeGrad = ctx!.createRadialGradient(curCX - curRadius * 0.3, curCY - curRadius * 0.3, 0, curCX, curCY, curRadius);
      globeGrad.addColorStop(0, 'rgba(40, 50, 70, 0.12)');
      globeGrad.addColorStop(1, 'rgba(15, 20, 30, 0.08)');
      ctx!.fillStyle = globeGrad;
      ctx!.fill();
      ctx!.strokeStyle = 'rgba(100, 150, 255, 0.12)';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Draw country borders from real GeoJSON data
      // Adjust alpha based on zoom level - more visible when zoomed in
      const borders = geoBordersRef.current;
      if (borders.length > 0) {
        ctx!.strokeStyle = COLOR;

        // Calculate alpha based on current radius (zoom level)
        // At base radius: 0.25 alpha, at 3x radius: 0.5 alpha
        const zoomRatio = curRadius / (Math.min(st.centerX * 2, st.centerY * 2) * 0.42);
        let borderAlpha = Math.min(0.5, 0.25 + (zoomRatio - 1) * 0.1);
        if (st.currentLevel === 'country') borderAlpha = 0.6; // More visible at country level
        if (st.currentLevel === 'city') borderAlpha = 0.2;   // Less visible at city level (distracting)

        ctx!.globalAlpha = borderAlpha;
        ctx!.lineWidth = 0.7;
        for (const country of borders) {
          for (const polygon of country) {
            ctx!.beginPath();
            let first = true;
            let visCount = 0;
            const pts = polygon.map(([lat, lng]) => {
              const s = geoToSpherical(lat, lng);
              const p = sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
              if (p.visible) visCount++;
              return p;
            });
            if (visCount > pts.length * 0.2) {
              for (const p of pts) {
                if (p.visible) {
                  if (first) { ctx!.moveTo(p.x, p.y); first = false; }
                  else ctx!.lineTo(p.x, p.y);
                } else {
                  first = true;
                }
              }
              ctx!.stroke();
            }
          }
        }
      }

      ctx!.globalAlpha = 1;

      // Highlight silhouette of selected country (GeoJSON polygons) at country/city/place levels
      if (st.selectedCountry && st.currentLevel !== 'globe') {
        const polys = countryBordersByNameRef.current.get(st.selectedCountry.name);
        if (polys && polys.length > 0) {
          ctx!.save();
          ctx!.strokeStyle = '#60A5FA';
          ctx!.lineWidth = 2.2;
          ctx!.shadowColor = '#3B82F6';
          ctx!.shadowBlur = 14;
          ctx!.globalAlpha = st.currentLevel === 'city' || st.currentLevel === 'place' ? 0.55 : 0.95;

          for (const ring of polys) {
            ctx!.beginPath();
            let first = true;
            const pts = ring.map(([lat, lng]) => {
              const s = geoToSpherical(lat, lng);
              return sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
            });
            const visCount = pts.filter(p => p.visible).length;
            if (visCount < pts.length * 0.2) continue;
            for (const p of pts) {
              if (p.visible) {
                if (first) { ctx!.moveTo(p.x, p.y); first = false; }
                else ctx!.lineTo(p.x, p.y);
              } else {
                first = true;
              }
            }
            // Soft fill
            ctx!.fillStyle = 'rgba(59, 130, 246, 0.08)';
            ctx!.fill();
            ctx!.stroke();
          }
          ctx!.restore();
        }
      }

      // Draw all admin-1 subdivisions (departments/states) of the selected country in a subtle stroke
      // — gives spatial context when zoomed in past the country level.
      if (st.selectedCountry && st.selectedCountry.iso_a2 && st.currentLevel !== 'globe') {
        const regions = admin1BordersByCountryRef.current.get(st.selectedCountry.iso_a2);
        if (regions && regions.length > 0) {
          const selectedAdmin1Norm = st.selectedCity?.admin1Name
            ? normalizeAdmin1Name(st.selectedCity.admin1Name)
            : st.selectedCity
              ? normalizeAdmin1Name(st.selectedCity.name)
              : null;

          ctx!.save();
          ctx!.strokeStyle = '#94A3B8'; // slate-400
          ctx!.lineWidth = 0.6;
          ctx!.globalAlpha = st.currentLevel === 'country' ? 0.35 : 0.18;

          for (const region of regions) {
            // Skip the selected one — it gets a dedicated highlight pass below
            if (selectedAdmin1Norm && normalizeAdmin1Name(region.name) === selectedAdmin1Norm) continue;
            for (const ring of region.polys) {
              ctx!.beginPath();
              let first = true;
              const pts = ring.map(([lat, lng]) => {
                const s = geoToSpherical(lat, lng);
                return sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
              });
              const visCount = pts.filter(p => p.visible).length;
              if (visCount < pts.length * 0.15) continue;
              for (const p of pts) {
                if (p.visible) {
                  if (first) { ctx!.moveTo(p.x, p.y); first = false; }
                  else ctx!.lineTo(p.x, p.y);
                } else {
                  first = true;
                }
              }
              ctx!.stroke();
            }
          }
          ctx!.restore();
        }
      }

      // Highlight silhouette of selected city's admin-1 region at city/place levels
      if (st.selectedCity && (st.currentLevel === 'city' || st.currentLevel === 'place')) {
        const iso = st.selectedCountry?.iso_a2?.toUpperCase();
        const lookupName = st.selectedCity.admin1Name ?? st.selectedCity.name;
        const norm = normalizeAdmin1Name(lookupName);
        const polys =
          (iso && admin1BordersByKeyRef.current.get(`${iso}::${norm}`)) ||
          admin1BordersByNameRef.current.get(norm) ||
          null;

        if (polys && polys.length > 0) {
          ctx!.save();
          ctx!.strokeStyle = '#FCD34D'; // amber-300
          ctx!.lineWidth = 2.0;
          ctx!.shadowColor = '#F59E0B'; // amber-500
          ctx!.shadowBlur = 10;
          ctx!.globalAlpha = st.currentLevel === 'place' ? 0.55 : 0.85;

          for (const ring of polys) {
            ctx!.beginPath();
            let first = true;
            const pts = ring.map(([lat, lng]) => {
              const s = geoToSpherical(lat, lng);
              return sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
            });
            // At deep zoom levels, the % of points behind the sphere drops to near zero;
            // we keep the threshold low so partially-visible departments still render.
            const visCount = pts.filter(p => p.visible).length;
            if (visCount < pts.length * 0.1) continue;
            for (const p of pts) {
              if (p.visible) {
                if (first) { ctx!.moveTo(p.x, p.y); first = false; }
                else ctx!.lineTo(p.x, p.y);
              } else {
                first = true;
              }
            }
            ctx!.fillStyle = 'rgba(245, 158, 11, 0.18)';
            ctx!.fill();
            ctx!.stroke();
          }
          ctx!.restore();
        }
      }

      // Draw globe grid lines (latitude and longitude) - globe level only
      if (st.currentLevel === 'globe') {
        ctx!.strokeStyle = COLOR;
        ctx!.lineWidth = 0.5;
        ctx!.globalAlpha = 0.15;

        // Draw latitude lines
        for (const line of globeLatLines) {
          ctx!.beginPath();
          let first = true;
          for (const [lat, lng] of line) {
            const s = geoToSpherical(lat, lng);
            const p = sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
            if (p.visible) {
              if (first) { ctx!.moveTo(p.x, p.y); first = false; }
              else { ctx!.lineTo(p.x, p.y); }
            } else {
              first = true;
            }
          }
          ctx!.stroke();
        }

        // Draw longitude lines
        for (const line of globeLngLines) {
          ctx!.beginPath();
          let first = true;
          for (const [lat, lng] of line) {
            const s = geoToSpherical(lat, lng);
            const p = sphereTo2D(s.theta, s.phi, curRot, curCX, curCY, curRadius, curRotY);
            if (p.visible) {
              if (first) { ctx!.moveTo(p.x, p.y); first = false; }
              else { ctx!.lineTo(p.x, p.y); }
            } else {
              first = true;
            }
          }
          ctx!.stroke();
        }
        ctx!.globalAlpha = 1;
      }

      // Draw points based on level
      // Only show next-level content AFTER zoom animation completes
      if (st.currentLevel === 'globe') {
        // Draw country capitals
        for (const country of allCountries) {
          const spherical = geoToSpherical(country.capitalLat, country.capitalLng);
          const p = sphereTo2D(spherical.theta, spherical.phi, curRot, curCX, curCY, curRadius, curRotY);
          if (p.visible) {
            const r = st.hoverRadiusMap.get(country.name) || BASE_RADIUS;
            const isHovered = st.hoveredCountry === country.name;

            if (isHovered) {
              ctx!.beginPath();
              ctx!.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
              ctx!.fillStyle = 'rgba(59, 130, 246, 0.2)';
              ctx!.fill();
            }

            ctx!.beginPath();
            ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx!.fillStyle = isHovered ? HIGHLIGHT_COLOR : COLOR;
            ctx!.fill();
            ctx!.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx!.lineWidth = 1;
            ctx!.stroke();

            if (isHovered) {
              const text = country.name;
              ctx!.font = "bold 13px 'Inter', sans-serif";
              const tw = ctx!.measureText(text).width;
              const tx = p.x + 14;
              const ty = p.y - 14;
              const pad = 6;
              ctx!.fillStyle = 'rgba(20, 25, 35, 0.9)';
              ctx!.beginPath();
              ctx!.roundRect(tx - pad, ty - 14 - pad, tw + pad * 2, 18 + pad * 2, 8);
              ctx!.fill();
              ctx!.strokeStyle = 'rgba(100, 150, 255, 0.3)';
              ctx!.lineWidth = 1;
              ctx!.stroke();
              ctx!.fillStyle = '#fff';
              ctx!.fillText(text, tx, ty);
            } else {
              ctx!.font = "12px 'Inter', sans-serif";
              ctx!.fillStyle = 'rgba(197, 197, 197, 0.7)';
              ctx!.fillText(country.name, p.x + 8, p.y - 8);
            }
          }
        }
      }

      // Only draw cities if we're at country level AND zoom animation is complete
      if (st.currentLevel === 'country' && st.selectedCountry && st.zoomAnimationComplete) {
        for (const city of st.selectedCountry.cities) {
          const spherical = geoToSpherical(city.lat, city.lng);
          const p = sphereTo2D(spherical.theta, spherical.phi, curRot, curCX, curCY, curRadius, curRotY);
          if (p.visible) {
            const r = st.hoverRadiusMap.get(city.name) || CITY_RADIUS;
            const isHovered = st.hoveredCity === city.name;

            if (isHovered) {
              ctx!.beginPath();
              ctx!.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
              ctx!.fillStyle = 'rgba(59, 130, 246, 0.2)';
              ctx!.fill();
            }

            ctx!.beginPath();
            ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx!.fillStyle = isHovered ? HIGHLIGHT_COLOR : '#60A5FA';
            ctx!.fill();
            ctx!.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx!.lineWidth = 1.2;
            ctx!.stroke();

            if (isHovered) {
              const text = `🏙️ ${city.name}`;
              ctx!.font = "bold 14px 'Inter', sans-serif";
              const tw = ctx!.measureText(text).width;
              const tx = p.x + 14;
              const ty = p.y - 14;
              const pad = 6;
              ctx!.fillStyle = 'rgba(20, 25, 35, 0.9)';
              ctx!.beginPath();
              ctx!.roundRect(tx - pad, ty - 14 - pad, tw + pad * 2, 18 + pad * 2, 8);
              ctx!.fill();
              ctx!.strokeStyle = 'rgba(96, 165, 250, 0.4)';
              ctx!.lineWidth = 1;
              ctx!.stroke();
              ctx!.fillStyle = '#fff';
              ctx!.fillText(text, tx, ty);
            } else {
              ctx!.font = "13px 'Inter', sans-serif";
              ctx!.fillStyle = 'rgba(197, 197, 197, 0.8)';
              ctx!.fillText(city.name, p.x + 8, p.y - 8);
            }
          }
        }
      }

      // Only draw tourist places if we're at city level AND zoom animation is complete
      if (st.currentLevel === 'city' && st.selectedCity && st.zoomAnimationComplete) {
        // Project all places first (preserving original index → for stable declustering),
        // then declustering offsets, then sort by depth for painter's algorithm.
        const projected = st.selectedCity.touristPlaces.map(place => {
          const spherical = geoToSpherical(place.lat, place.lng);
          return { place, p: sphereTo2D(spherical.theta, spherical.phi, curRot, curCX, curCY, curRadius, curRotY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        const placesWithDepth = projected
          .map((it, idx) => ({
            place: it.place,
            p: { ...it.p, x: it.p.x + offsets[idx].dx, y: it.p.y + offsets[idx].dy },
            z: it.p.z,
          }))
          .filter(item => item.p.visible)
          .sort((a, b) => a.z - b.z); // Sort far to near (painter's algorithm)

        for (const { place, p } of placesWithDepth) {
          const r = st.hoverRadiusMap.get(place.name) || PLACE_RADIUS;
          const isHovered = st.hoveredPlace?.name === place.name;
          const typeColor = TYPE_COLORS[place.type] || TYPE_COLORS.other;

          if (isHovered) {
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
            ctx!.fillStyle = typeColor + '33';
            ctx!.fill();
          }

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = isHovered ? '#fff' : typeColor;
          ctx!.fill();
          ctx!.strokeStyle = isHovered ? typeColor : 'rgba(255, 255, 255, 0.4)';
          ctx!.lineWidth = 1.5;
          ctx!.stroke();

          const typeIcon = place.type === 'beach' ? '🏖' : place.type === 'museum' ? '🏛' : place.type === 'park' ? '🌳' : place.type === 'restaurant' ? '🍽' : '📍';
          ctx!.font = '10px sans-serif';
          ctx!.fillText(typeIcon, p.x - 6, p.y + 4);

          if (isHovered) {
            const text = place.name;
            const desc = place.description || '';
            ctx!.font = "bold 13px 'Inter', sans-serif";
            const tw = Math.max(ctx!.measureText(text).width, desc ? ctx!.measureText(desc).width * 0.85 : 0);
            const tx = p.x + 16;
            const ty = p.y - 20;
            const boxH = desc ? 40 : 22;
            const pad = 8;
            ctx!.fillStyle = 'rgba(20, 25, 35, 0.92)';
            ctx!.beginPath();
            ctx!.roundRect(tx - pad, ty - 14 - pad, tw + pad * 2, boxH + pad * 2, 8);
            ctx!.fill();
            ctx!.strokeStyle = typeColor + '66';
            ctx!.lineWidth = 1;
            ctx!.stroke();
            ctx!.fillStyle = '#fff';
            ctx!.fillText(text, tx, ty);
            if (desc) {
              ctx!.font = "11px 'Inter', sans-serif";
              ctx!.fillStyle = 'rgba(197, 197, 197, 0.8)';
              ctx!.fillText(desc.length > 40 ? desc.slice(0, 40) + '...' : desc, tx, ty + 16);
            }
          } else {
            ctx!.font = "12px 'Inter', sans-serif";
            ctx!.fillStyle = 'rgba(197, 197, 197, 0.8)';
            ctx!.fillText(place.name, p.x + 10, p.y - 8);
          }
        }
      }

      // Draw Tour & Accommodation markers from Firebase data at city level
      if ((st.currentLevel === 'city' || st.currentLevel === 'place') && itemsRef.current.length > 0 && st.zoomAnimationComplete) {
        const items = itemsRef.current;
        const projected = items.map(item => {
          // TODO: Verificar coords en Firebase para ubicación exacta — la posición visual del pin sale de coords.lat/lng tal cual están en Firestore.
          const coords = item.kind === 'tour' ? item.data.coords : item.data.coords;
          const spherical = geoToSpherical(coords.lat, coords.lng);
          return { item, p: sphereTo2D(spherical.theta, spherical.phi, curRot, curCX, curCY, curRadius, curRotY) };
        });
        const offsets = computeDeclusterOffsets(projected.map(it => ({ x: it.p.x, y: it.p.y })));
        const renderable = projected
          .map((it, idx) => ({
            item: it.item,
            p: { ...it.p, x: it.p.x + offsets[idx].dx, y: it.p.y + offsets[idx].dy },
          }))
          .filter(it => it.p.visible)
          .sort((a, b) => a.p.z - b.p.z);

        for (const { item, p } of renderable) {
          const color = item.kind === 'tour' ? TOUR_COLOR : ACCOM_COLOR;
          const label = item.kind === 'tour' ? item.data.title : item.data.name;
          const isSelected = selectedItem != null &&
            selectedItem.kind === item.kind &&
            (selectedItem.kind === 'tour'
              ? (item.kind === 'tour' && selectedItem.data.id === item.data.id)
              : (item.kind === 'accommodation' && selectedItem.data.id === item.data.id));

          // Halo when selected
          if (isSelected) {
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, ITEM_RADIUS + 10, 0, Math.PI * 2);
            ctx!.fillStyle = color + '55';
            ctx!.fill();
          }

          // Outer ring
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, ITEM_RADIUS + 2, 0, Math.PI * 2);
          ctx!.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx!.fill();

          // Filled inner dot
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, ITEM_RADIUS, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.fill();
          ctx!.strokeStyle = '#fff';
          ctx!.lineWidth = 1.5;
          ctx!.stroke();

          // Icon (rendered with emoji)
          const icon = item.kind === 'tour' ? '🎟' : '🛏';
          ctx!.font = '11px sans-serif';
          ctx!.textAlign = 'center';
          ctx!.fillStyle = '#fff';
          ctx!.fillText(icon, p.x, p.y + 4);
          ctx!.textAlign = 'start';

          // Label
          ctx!.font = "bold 12px 'Inter', sans-serif";
          const truncated = label.length > 24 ? `${label.slice(0, 24)}…` : label;
          const tw = ctx!.measureText(truncated).width;
          const lx = p.x + ITEM_RADIUS + 6;
          const ly = p.y + 4;
          ctx!.fillStyle = 'rgba(15, 23, 42, 0.78)';
          ctx!.fillRect(lx - 4, ly - 12, tw + 8, 16);
          ctx!.fillStyle = '#fff';
          ctx!.fillText(truncated, lx, ly);
        }
      }

      // Draw search markers (from Nominatim results)
      if (st.searchMarkers.length > 0) {
        st.searchMarkerPulse = (st.searchMarkerPulse + 0.03) % (Math.PI * 2);
        const pulse = Math.sin(st.searchMarkerPulse) * 0.3 + 0.7;
        for (const marker of st.searchMarkers) {
          const spherical = geoToSpherical(marker.lat, marker.lng);
          const p = sphereTo2D(spherical.theta, spherical.phi, curRot, curCX, curCY, curRadius, curRotY);
          if (p.visible) {
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, 16 * pulse, 0, Math.PI * 2);
            ctx!.strokeStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
            ctx!.lineWidth = 2;
            ctx!.stroke();

            ctx!.beginPath();
            ctx!.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx!.fillStyle = '#EF4444';
            ctx!.fill();
            ctx!.strokeStyle = '#fff';
            ctx!.lineWidth = 2;
            ctx!.stroke();

            const text = marker.name;
            ctx!.font = "bold 13px 'Inter', sans-serif";
            const tw = ctx!.measureText(text).width;
            const tx = p.x + 14;
            const ty = p.y - 16;
            const pad = 6;
            ctx!.fillStyle = 'rgba(20, 25, 35, 0.9)';
            ctx!.beginPath();
            ctx!.roundRect(tx - pad, ty - 14 - pad, tw + pad * 2, 18 + pad * 2, 8);
            ctx!.fill();
            ctx!.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx!.lineWidth = 1;
            ctx!.stroke();
            ctx!.fillStyle = '#fff';
            ctx!.fillText(text, tx, ty);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('mouseleave', onPointerUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('touchcancel', onPointerUp);
      window.removeEventListener('resize', onResize);
    };
  }, [resizeCanvas]);

  return (
    <div className="planet-explorer-root" style={{ position: 'fixed', inset: 0, background: '#0D1117', overflow: 'hidden', fontFamily: "'Inter', sans-serif", zIndex: 50 }}>
      {/* Canvas container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {!ready && (
          <div style={{ color: '#C5C5C5', fontSize: '1.2rem' }}>Cargando planeta...</div>
        )}
        <canvas
          ref={canvasRef}
          style={{ display: 'block', background: 'transparent', maxWidth: 'none', maxHeight: 'none', cursor: 'grab' }}
        />
      </div>

      {/* Breadcrumbs and Back Button */}
      {breadcrumbs.length > 0 && (
        <nav className="planet-breadcrumbs" aria-label="Navegación">
          <button onClick={goBack} className="planet-breadcrumbs__back">← Atrás</button>
          <div className="planet-breadcrumbs__trail">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.level}>
                {index > 0 && <span style={{ color: '#666' }}>›</span>}
                <span style={{ fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal' }}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </nav>
      )}

      {/* Street View Prompt Modal */}
      {showStreetViewPrompt && (
        <div className="planet-streetview-modal">
          <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.3rem' }}>
            {showStreetViewPrompt.place.name}
          </h3>
          {showStreetViewPrompt.place.description && (
            <p style={{ color: '#aaa', marginBottom: '16px', fontSize: '0.95rem' }}>
              {showStreetViewPrompt.place.description}
            </p>
          )}
          <p style={{ color: '#C5C5C5', marginBottom: '20px' }}>
            ¿Ver este lugar en Google Street View?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleStreetView}
              style={{
                padding: '10px 24px',
                background: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Ver en Street View
            </button>
            <button
              onClick={() => setShowStreetViewPrompt(null)}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: '#C5C5C5',
                border: '1px solid #666',
                borderRadius: '24px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Search bar — center-left on desktop, full-width top on mobile */}
      <div className="planet-search">
        <div className="planet-search__box">
          <div className="planet-search__row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="País, ciudad, lugar..."
              className="planet-search__input"
            />
          </div>
          <button onClick={handleSearch} className="planet-search__btn">Buscar</button>
        </div>
        {(searchAnswer || dynamicLoading) && (
          <div className="planet-search__answer">
            {dynamicLoading ? 'Cargando datos de la región...' : searchAnswer}
          </div>
        )}
      </div>

      {/* Right info panel — context (city/country/place). Always rendered, but auto-collapses
          to a thin bar when an ItemPanel is open so the two panels don't fight for space. */}
      <InfoPanel
        country={interactionState.countryName}
        city={interactionState.cityName}
        place={interactionState.placeName}
        onClose={interactionState.level !== 'globe' ? goBack : undefined}
        forceCollapsed={!!selectedItem}
      />

      {/* Tour / Accommodation detail panel with "Reservar" CTA */}
      {selectedItem && (
        <ItemPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default PlanetExplorer;
