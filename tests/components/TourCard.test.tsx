import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TourCard } from '../../src/components/tours/TourCard'
import { Timestamp } from 'firebase/firestore'

const mockTour = {
  id: '1',
  title: 'Centro Histórico de Cartagena',
  description: 'Explora las calles empedradas del casco antiguo de Cartagena, declarado Patrimonio de la Humanidad por la UNESCO.',
  price: 45,
  images: ['https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800'],
  duration: '4 hours',
  rating: 4.8,
  coords: { lat: 10.4236, lng: -75.5366 },
  slug: 'centro-historico-cartagena',
  reviews: [],
  createdAt: Timestamp.fromDate(new Date()),
  authorId: 'admin-user',
  featured: true,
  category: 'Historical'
}

describe('TourCard Component', () => {
  beforeEach(() => {
    // Clear any previous renders
  })

  it('renders tour title correctly', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    expect(screen.getByText('Centro Histórico de Cartagena')).toBeInTheDocument()
  })

  it('renders tour price in the correct format', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    expect(screen.getByText('$45')).toBeInTheDocument()
  })

  it('displays tour rating', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    // Rating is displayed in parentheses like (4.8)
    expect(screen.getByText(/4\.8/)).toBeInTheDocument()
  })

  it('shows tour duration', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    expect(screen.getByText('4 hours')).toBeInTheDocument()
  })

  it('displays featured badge when tour is featured', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('renders view details link with correct href', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    const link = screen.getByRole('link', { name: /view details/i })
    expect(link).toHaveAttribute('href', '/tours/centro-historico-cartagena')
  })

  it('renders tour image with correct alt text', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>
    )

    const image = screen.getByAltText('Centro Histórico de Cartagena')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockTour.images[0])
  })

  it('renders placeholder image when no images are available', () => {
    const tourWithoutImages = { ...mockTour, images: [] }
    
    render(
      <BrowserRouter>
        <TourCard tour={tourWithoutImages} />
      </BrowserRouter>
    )

    const image = screen.getByAltText('Centro Histórico de Cartagena')
    expect(image).toHaveAttribute('src', 'https://placehold.co/400x300?text=No+Image')
  })
})