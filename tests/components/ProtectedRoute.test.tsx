import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../../src/components/layout/ProtectedRoute'
import type { AuthContextValue } from '../../src/contexts/AuthContext'
import * as useAuthModule from '../../src/hooks/useAuth'

vi.mock('../../src/hooks/useAuth')

const mockAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
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
  ...overrides,
})

const mockUser = {
  uid: '123',
  role: 'user' as const,
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
}

const mockAdmin = {
  uid: '456',
  role: 'admin' as const,
  displayName: 'Admin User',
  email: 'admin@example.com',
  photoURL: null,
}

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ user: mockUser, currentUser: mockUser, loading: false })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ user: null, loading: false })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    // Component should render but Navigate to /login, so content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading spinner while checking authentication', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ user: null, loading: true })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    // Check for loading spinner (DaisyUI loading spinner with .loading class)
    const spinner = document.querySelector('.loading')
    expect(spinner).toBeTruthy()
  })

  it('renders children for regular users without requireAdmin prop', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ user: mockUser, currentUser: mockUser, loading: false })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>User Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('User Content')).toBeInTheDocument()
  })

  it('blocks non-admin users from requireAdmin routes', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ user: mockUser, currentUser: mockUser, isAdmin: false, loading: false })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    // Admin-only content should not render
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('allows admins to access requireAdmin routes', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(
      mockAuthContext({ 
        user: mockAdmin, 
        currentUser: mockAdmin,
        isAdmin: true,
        loading: false 
      })
    )

    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})