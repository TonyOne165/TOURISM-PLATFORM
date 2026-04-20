import React from 'react';
import type { Tour } from '../../types';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const SAMPLE_TOURS: Tour[] = [
  {
    id: 'sample-1',
    title: 'Cartagena Historic Walking Tour',
    slug: 'cartagena-historic-walking-tour',
    description: 'Pasea por las coloridas calles del centro histórico de Cartagena y descubre sus plazas, fortalezas y leyendas.',
    price: 42,
    images: ['https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&h=600&fit=crop'],
    coords: { lat: 10.4236, lng: -75.5366 },
    duration: '3 hours',
    rating: 4.7,
    reviews: [],
    createdAt: Timestamp.now(),
    authorId: 'local',
    category: 'Historical',
  },
  {
    id: 'sample-2',
    title: 'Rosario Islands Snorkel Adventure',
    slug: 'rosario-islands-snorkel-adventure',
    description: 'Explora arrecifes de coral y playas de arena blanca en un tour en lancha hacia las Islas del Rosario.',
    price: 78,
    images: ['https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&h=600&fit=crop'],
    coords: { lat: 10.1667, lng: -75.7667 },
    duration: 'Full day',
    rating: 4.9,
    reviews: [],
    createdAt: Timestamp.now(),
    authorId: 'local',
    category: 'Beach',
  },
];

interface TourListProps {
  tours: Tour[];
  loading: boolean;
  categoryFilter?: string;
  priceRange?: [number, number];
}

export const TourList: React.FC<TourListProps> = ({
  tours,
  loading,
  categoryFilter,
  priceRange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const toursToShow = tours.length > 0 ? tours : SAMPLE_TOURS;

  // ✅ Aplicar filtros (categoría y rango de precios)
  const filteredTours = toursToShow.filter((tour) => {
    const matchesCategory =
      !categoryFilter || tour.category === categoryFilter;
    const matchesPrice =
      !priceRange ||
      (tour.price >= priceRange[0] && tour.price <= priceRange[1]);
    return matchesCategory && matchesPrice;
  });

  if (filteredTours.length === 0) {
    return (
      <div className="text-center text-base-content/60 py-12">
        No tours found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTours.map((tour) => (
        <div
          key={tour.id}
          className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
        >
          <figure className="relative">
            <img
              src={tour.images?.[0] || '/placeholder.jpg'}
              alt={tour.title}
              className="h-56 w-full object-cover rounded-t-lg"
            />
            {tour.category && (
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                {tour.category}
              </span>
            )}
          </figure>

          <div className="card-body">
            <h2 className="card-title line-clamp-1">{tour.title}</h2>
            <p className="text-sm text-base-content/70 line-clamp-2">{tour.description}</p>

            <div className="flex justify-between items-center mt-3">
              <span className="font-semibold text-primary text-lg">
                ${tour.price.toLocaleString()}
              </span>
              <span className="text-sm text-base-content/60">
                {tour.rating ? `⭐ ${tour.rating.toFixed(1)}` : 'No ratings'}
              </span>
            </div>

            <div className="card-actions mt-4">
              <Link
                to={`/tours/${tour.slug}`}
                className="btn btn-primary btn-sm w-full"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TourList;
