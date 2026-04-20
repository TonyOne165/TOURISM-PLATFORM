import { Timestamp } from 'firebase/firestore';

// ============ USER ============
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role: 'user' | 'admin';
  phone?: string | null;
  blocked?: boolean;
  preferences?: UserPreferences;
  stats?: UserStats;
  loyaltyPoints?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserPreferences {
  budget?: 'low' | 'medium' | 'high' | 'luxury';
  interests?: string[];
  preferredAccommodationType?: string;
  language?: string;
}

export interface UserStats {
  totalTrips: number;
  totalSpent: number;
  destinationsVisited: number;
  reviewsWritten: number;
}

// ============ COORDINATES ============
export interface Coords {
  lat: number;
  lng: number;
}

// ============ REVIEW ============
export interface Review {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  tourId?: string;
  tourTitle?: string;
  accommodationId?: string;
  accommodationName?: string;
  type: 'tour' | 'accommodation';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============ TOUR ============
export interface Tour {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  coords: Coords;
  duration: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  createdAt: Timestamp;
  authorId: string;
  featured?: boolean;
  category?: string;
  maxParticipants?: number;
  includes?: string[];
  difficulty?: 'easy' | 'moderate' | 'hard';
  meetingPoint?: string;
  city?: string;
  updatedAt?: Timestamp;
}

// ============ ACCOMMODATION ============
export interface Accommodation {
  id?: string;
  name: string;
  slug: string;
  description: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'villa' | 'cabin';
  pricePerNight: number;
  originalPrice?: number;
  images: string[];
  coords: Coords;
  address: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  rooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  contactPhone?: string;
  contactEmail?: string;
  featured?: boolean;
  associatedTourIds?: string[];
  city?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============ PAYMENT ============
export type PaymentMethod = 'paypal' | 'google_pay' | 'apple_pay' | 'credit_card' | 'debit_card' | 'pse';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ============ BOOKING ============
export interface Booking {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tourId?: string;
  tourTitle?: string;
  accommodationId?: string;
  accommodationName?: string;
  type: 'tour' | 'accommodation';
  date: Timestamp;
  endDate?: Timestamp;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  participants?: number;
  totalPrice?: number;
  notes?: string;
  promoCode?: string;
  discount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============ PROMOTION ============
export interface Promotion {
  id?: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'group';
  value: number;
  minPurchase?: number;
  minParticipants?: number;
  maxUses: number;
  currentUses: number;
  applicableTo: 'all' | 'tours' | 'accommodations';
  specificIds?: string[];
  startDate: Timestamp;
  endDate: Timestamp;
  active: boolean;
  createdAt: Timestamp;
}

// ============ MESSAGE ============
export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  receiverId: string;
  receiverName: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: Timestamp;
}

// ============ VISITED DESTINATION ============
export interface VisitedDestination {
  id?: string;
  userId: string;
  tourId: string;
  tourTitle: string;
  tourCategory?: string;
  visitDate: Timestamp;
  rating?: number;
  photos?: string[];
  notes?: string;
  createdAt: Timestamp;
}

// ============ ANALYTICS EVENT ============
export interface AnalyticsEvent {
  id?: string;
  type: 'page_view' | 'booking_created' | 'booking_cancelled' | 'review_created' | 'search' | 'user_registered';
  userId?: string;
  data?: Record<string, unknown>;
  createdAt: Timestamp;
}

// ============ CART ============
export interface CartItem {
  id: string;
  type: 'tour' | 'accommodation';
  itemId: string;
  title: string;
  image: string;
  price: number;
  date: string;
  endDate?: string;
  participants: number;
  notes?: string;
}

// ============ AI CHAT ============
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cards?: ChatCard[];
  actions?: ChatAction[];
  quickReplies?: string[];
}

export interface ChatCard {
  type: 'tour' | 'accommodation';
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  slug: string;
  subtitle?: string;
}

export interface ChatAction {
  label: string;
  type: 'navigate' | 'add_to_cart' | 'set_input' | 'start_booking';
  payload: string;
  icon?: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  title: string;
}

// ============ INPUT TYPES ============
export interface CreateTourInput {
  title: string;
  description: string;
  price: number;
  coords: Coords;
  duration: string;
  category?: string;
  featured?: boolean;
  maxParticipants?: number;
  includes?: string[];
  difficulty?: 'easy' | 'moderate' | 'hard';
  meetingPoint?: string;
}

export interface CreateBookingInput {
  tourId?: string;
  tourTitle?: string;
  accommodationId?: string;
  accommodationName?: string;
  type: 'tour' | 'accommodation';
  date: Date | Timestamp;
  endDate?: Date | Timestamp;
  participants?: number;
  totalPrice?: number;
  notes?: string;
  promoCode?: string;
  discount?: number;
  paymentMethod?: PaymentMethod;
}

export interface CreateAccommodationInput {
  name: string;
  description: string;
  type: Accommodation['type'];
  pricePerNight: number;
  coords: Coords;
  address: string;
  amenities: string[];
  rooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  featured?: boolean;
  associatedTourIds?: string[];
}

// ============ DASHBOARD STATS ============
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  totalTours: number;
  totalAccommodations: number;
  averageRating: number;
  popularTours: { tourId: string; title: string; bookings: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
}
