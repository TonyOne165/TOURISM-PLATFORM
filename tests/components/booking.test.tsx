import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Booking } from '../../src/components/booking/Booking'
import * as useAuthModule from '../../src/hooks/useAuth'

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth')

const mockTour = {
  id: '1',
  title: 'Centro Histórico de Cartagena',
  price: 45,
}

const mockUser = {
  uid: '123',
  role: 'user' as const,
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
}

describe('Booking Component', () => {
  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()
  const mockOnAttempt = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders booking form when user is authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      currentUser: mockUser,
      userProfile: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    render(
      <Booking
        tour={mockTour}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    expect(screen.getByText('Centro Histórico de Cartagena')).toBeInTheDocument()
    expect(screen.getByText('$45')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument()
  })

  it('shows login message when user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      currentUser: null,
      userProfile: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    render(
      <Booking
        tour={mockTour}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    expect(screen.getByText(/please login to book this tour/i)).toBeInTheDocument()
  })

  it('displays booking date input field', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      currentUser: mockUser,
      userProfile: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    render(
      <Booking
        tour={mockTour}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    // Date input has type="date" so we query by type attribute
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('type', 'date')
  })

  it('disables book button when date is not selected', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      currentUser: mockUser,
      userProfile: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    render(
      <Booking
        tour={mockTour}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    const bookButton = screen.getByRole('button', { name: /book now/i })
    expect(bookButton).toBeDisabled()
  })

  it('enables book button when date is selected', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      currentUser: mockUser,
      userProfile: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    render(
      <Booking
        tour={mockTour}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const dateString = futureDate.toISOString().split('T')[0]

    fireEvent.change(dateInput, { target: { value: dateString } })

    await waitFor(() => {
      const bookButton = screen.getByRole('button', { name: /book now/i })
      expect(bookButton).not.toBeDisabled()
    })
  })

  it('renders correct tour information', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      currentUser: mockUser,
      userProfile: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      isAdmin: false,
    })

    const tourWithPrice = {
      ...mockTour,
      price: 99.99,
    }

    render(
      <Booking
        tour={tourWithPrice}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onAttempt={mockOnAttempt}
      />
    )

    expect(screen.getByText('Centro Histórico de Cartagena')).toBeInTheDocument()
    // Price may be formatted with locale, so we search with regex pattern
    expect(screen.getByText(/99/)).toBeInTheDocument()
  })
})