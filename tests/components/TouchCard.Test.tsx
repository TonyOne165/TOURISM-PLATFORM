/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { TourCard } from '../../src/components/tours/TourCard';
import type { Tour } from '../../src/types';

// Mock tour data
const mockTour: Tour = {
  id: 'test-tour-1',
  title: 'Cartagena City Tour',
  slug: 'cartagena-city-tour',
  description: 'Explore the beautiful city of Cartagena',
  price: 150000,
  duration: 'Full Day',
  images: ['https://example.com/tour-image.jpg'],
  coords: {
    lat: 10.3932,
    lng: -75.4832
  },
  rating: 4.8,
  reviews: [
    {
      id: 'review-1',
      userId: 'user-1',
      userName: 'John Doe',
      rating: 5,
      comment: 'Amazing tour!',
      createdAt: Timestamp.fromDate(new Date())
    }
  ],
  createdAt: Timestamp.fromDate(new Date()),
  authorId: 'author-1'
};

describe('TourCard Component', () => {
  // Test 1: Renderización básica
  it('renders basic tour information correctly', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    );

    expect(screen.getByText('Cartagena City Tour')).toBeInTheDocument();
    expect(screen.getByText('$150,000')).toBeInTheDocument();
    expect(screen.getByText('Full Day')).toBeInTheDocument();
  });

  // Test 2: Imagen del tour
  it('displays the tour image with correct fallback', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockTour.images[0]);
    expect(image).toHaveAttribute('alt', mockTour.title);
  });

  // Test 3: Link al detalle
  it('contains a link to the tour detail page with correct slug', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/tours/${mockTour.slug}`);
  });

  // Test 4: Manejo de descripción larga
  it('truncates long descriptions appropriately', () => {
    const longDescription = 'A'.repeat(200);
    const tourWithLongDescription = {
      ...mockTour,
      description: longDescription
    };

    render(
      <BrowserRouter>
        <TourCard tour={tourWithLongDescription} />
      </BrowserRouter>
    );

    const displayedDescription = screen.getByText(/A+/);
    expect(displayedDescription.textContent!.length).toBeLessThan(longDescription.length);
  });

  // Test 5: Formato de precio
  it('formats the price correctly', () => {
    const tourWithBigPrice = {
      ...mockTour,
      price: 1234567
    };

    render(
      <BrowserRouter>
        <TourCard tour={tourWithBigPrice} />
      </BrowserRouter>
    );

    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  // Test 6: Calificación
  it('displays the rating correctly', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    );

    const rating = screen.getByText('4.8');
    expect(rating).toBeInTheDocument();
    expect(rating.closest('.badge')).toBeInTheDocument();
  });

  // Test 7: Sin imágenes
  it('handles missing images gracefully', () => {
    const tourWithoutImages = {
      ...mockTour,
      images: []
    };

    render(
      <BrowserRouter>
        <TourCard tour={tourWithoutImages} />
      </BrowserRouter>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/tour-placeholder.jpg');
  });
});