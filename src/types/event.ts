export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  price: number;
  currency: string;
  capacity: number;
  bookedCount: number;
  category: EventCategory;
  imageUrl: string;
  highlights: string[];
  dressCode?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = 
  | 'wedding'
  | 'owambe'
  | 'birthday'
  | 'naming'
  | 'corporate'
  | 'funeral'
  | 'graduation'
  | 'traditional'
  | 'other';

export interface Booking {
  id: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfGuests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: string[]; // booking IDs
  createdAt: string;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'owambe', label: 'Owambe', icon: '🎉' },
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'naming', label: 'Naming Ceremony', icon: '👶' },
  { value: 'corporate', label: 'Corporate', icon: '💼' },
  { value: 'funeral', label: 'Funeral', icon: '🕊️' },
  { value: 'graduation', label: 'Graduation', icon: '🎓' },
  { value: 'traditional', label: 'Traditional', icon: '🏺' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export const getCategoryLabel = (category: EventCategory): string => {
  return EVENT_CATEGORIES.find(c => c.value === category)?.label || 'Other';
};

export const getCategoryIcon = (category: EventCategory): string => {
  return EVENT_CATEGORIES.find(c => c.value === category)?.icon || '✨';
};
