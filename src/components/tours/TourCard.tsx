import React from 'react';
import { Link } from 'react-router-dom';
import type { Tour } from '../../types';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const imageUrl = tour.images && tour.images.length > 0
    ? tour.images[0]
    : 'https://placehold.co/400x300?text=No+Image';

  return (
    <div className="card bg-brand-cream shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-brand-dark">
          {tour.title}
          {tour.featured && <div className="badge bg-brand-brown text-white border-0">Featured</div>}
        </h2>
        <p className="text-sm text-brand-dark/60 line-clamp-2">{tour.description}</p>

        <div className="flex items-center gap-2 my-2">
          <div className="rating rating-sm">
            {[1, 2, 3, 4, 5].map(star => (
              <input
                key={star}
                type="radio"
                className="mask mask-star-2 bg-brand-brown"
                checked={Math.round(tour.rating) === star}
                readOnly
              />
            ))}
          </div>
          <span className="text-sm text-brand-dark/60">({tour.rating.toFixed(1)})</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="badge badge-outline border-brand-brown text-brand-dark">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tour.duration}
          </div>
          <div className="text-brand-blue font-bold text-lg">
            ${tour.price.toLocaleString()}
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link to={`/tours/${tour.slug}`} className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm">
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};
