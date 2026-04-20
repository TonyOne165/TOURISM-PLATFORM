// ============ MAP CONSTANTS ============
export const MAP_DEFAULT_CENTER = { lat: 10.3932, lng: -75.4832 } // Cartagena
export const MAP_DEFAULT_ZOOM = 12

// ============ TOUR CATEGORIES ============
export const TOUR_CATEGORIES = [
  'Beach',
  'Historical',
  'Cultural',
  'Adventure',
  'Nature',
  'City Tour'
] as const

// ============ ACCOMMODATION TYPES ============
export const ACCOMMODATION_TYPES = [
  'hotel',
  'hostel',
  'apartment',
  'resort',
  'villa',
  'cabin'
] as const

// ============ AMENITIES ============
export const AMENITIES = [
  'WiFi',
  'Pool',
  'Parking',
  'Breakfast',
  'Air Conditioning',
  'Kitchen',
  'TV',
  'Gym',
  'Spa',
  'Beach Access',
  'Restaurant',
  'Bar',
  'Room Service',
  'Laundry',
  'Pet Friendly'
] as const

// ============ BOOKING STATUSES ============
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const

// ============ FIREBASE COLLECTIONS ============
export const COLLECTIONS = {
  USERS: 'users',
  TOURS: 'tours',
  BOOKINGS: 'bookings',
  ACCOMMODATIONS: 'accommodations',
  REVIEWS: 'reviews',
  PROMOTIONS: 'promotions',
  MESSAGES: 'messages',
  VISITED_DESTINATIONS: 'visited_destinations',
  ANALYTICS: 'analytics',
  JOIN_REQUESTS: 'join_requests'
} as const

// ============ STORAGE PATHS ============
export const STORAGE_PATHS = {
  TOUR_IMAGES: 'tours',
  USER_IMAGES: 'users',
  ACCOMMODATION_IMAGES: 'accommodations'
} as const

// ============ FILE UPLOAD LIMITS ============
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ============ PAGINATION ============
export const ITEMS_PER_PAGE = 12

// ============ CARTAGENA COORDINATES ============
export const CARTAGENA_COORDS = {
  CITY_CENTER: { lat: 10.4236, lng: -75.5366 },
  ISLAS_DEL_ROSARIO: { lat: 10.1667, lng: -75.7667 },
  BARU: { lat: 10.2167, lng: -75.6167 },
  VOLCAN_TOTUMO: { lat: 10.7333, lng: -75.2167 },
  CIENAGA_VIRGEN: { lat: 10.4500, lng: -75.5167 },
  CASTILLO_FELIPE: { lat: 10.4235, lng: -75.5414 },
  CONVENTO_POPA: { lat: 10.4175, lng: -75.5339 }
} as const

// ============ CITIES ============
export const CITIES = ['San Andrés Islas', 'Cartagena'] as const

// ============ VALIDATION ============
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100
} as const

// ============ DIFFICULTY LEVELS ============
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Fácil', color: 'badge-success' },
  { value: 'moderate', label: 'Moderado', color: 'badge-warning' },
  { value: 'hard', label: 'Difícil', color: 'badge-error' }
] as const

// ============ PROMOTION TYPES ============
export const PROMOTION_TYPES = [
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'fixed', label: 'Monto Fijo' },
  { value: 'group', label: 'Descuento Grupal' }
] as const
