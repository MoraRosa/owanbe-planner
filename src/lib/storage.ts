import { Event, Booking, DashboardStats } from '@/types/event';

const EVENTS_KEY = 'owanbe_events';
const BOOKINGS_KEY = 'owanbe_bookings';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Event operations
export const getEvents = (): Event[] => {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getEvent = (id: string): Event | undefined => {
  const events = getEvents();
  return events.find(e => e.id === id);
};

export const saveEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount'>): Event => {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: generateId(),
    bookedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
};

export const updateEvent = (id: string, updates: Partial<Event>): Event | undefined => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return undefined;
  
  events[index] = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return events[index];
};

export const deleteEvent = (id: string): boolean => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  return true;
};

// Booking operations
export const getBookings = (): Booking[] => {
  const data = localStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBooking = (id: string): Booking | undefined => {
  const bookings = getBookings();
  return bookings.find(b => b.id === id);
};

export const getEventBookings = (eventId: string): Booking[] => {
  const bookings = getBookings();
  return bookings.filter(b => b.eventId === eventId);
};

export const saveBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  
  // Update event booked count
  const event = getEvent(booking.eventId);
  if (event) {
    updateEvent(event.id, { bookedCount: event.bookedCount + booking.numberOfGuests });
  }
  
  return newBooking;
};

export const updateBooking = (id: string, updates: Partial<Booking>): Booking | undefined => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return undefined;
  
  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  return bookings[index];
};

export const deleteBooking = (id: string): boolean => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) return false;
  
  // Update event booked count
  const event = getEvent(booking.eventId);
  if (event) {
    updateEvent(event.id, { 
      bookedCount: Math.max(0, event.bookedCount - booking.numberOfGuests) 
    });
  }
  
  const filtered = bookings.filter(b => b.id !== id);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
  return true;
};

// Dashboard stats
export const getDashboardStats = (): DashboardStats => {
  const events = getEvents();
  const bookings = getBookings();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
  const thisMonthBookings = paidBookings.filter(b => new Date(b.createdAt) >= startOfMonth);

  return {
    totalEvents: events.length,
    upcomingEvents: upcomingEvents.length,
    totalBookings: bookings.length,
    pendingBookings: pendingBookings.length,
    totalRevenue: paidBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    thisMonthRevenue: thisMonthBookings.reduce((sum, b) => sum + b.totalAmount, 0),
  };
};

// Seed sample data for demo
export const seedSampleData = (): void => {
  const existingEvents = getEvents();
  if (existingEvents.length > 0) return;

  const sampleEvents: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount'>[] = [
    {
      title: "Adebayo & Chidinma's Wedding",
      description: "Join us for a spectacular celebration of love as Adebayo and Chidinma tie the knot in a grand traditional and white wedding ceremony. Expect an unforgettable owambe experience!",
      date: "2025-02-14",
      time: "10:00",
      location: "Lagos, Nigeria",
      venue: "Eko Hotel & Suites, Victoria Island",
      price: 50000,
      currency: "NGN",
      capacity: 500,
      category: "wedding",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      highlights: ["Live Band Performance", "5-Course Nigerian Cuisine", "Asoebi Coordination", "Jollof Rice Competition"],
      dressCode: "Asoebi: Gold & Coral",
      status: "upcoming",
    },
    {
      title: "Chief Okonkwo's 60th Birthday Owambe",
      description: "Come celebrate six decades of excellence with Chief Okonkwo! An evening of music, dance, and the finest Nigerian hospitality awaits.",
      date: "2025-03-08",
      time: "16:00",
      location: "Abuja, Nigeria",
      venue: "International Conference Centre",
      price: 25000,
      currency: "NGN",
      capacity: 300,
      category: "owambe",
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      highlights: ["Live DJ & Afrobeats", "Traditional Dance Groups", "Photo Booth", "Premium Small Chops"],
      dressCode: "Native Attire - Aso Oke",
      status: "upcoming",
    },
    {
      title: "Baby Adaeze's Naming Ceremony",
      description: "The Nnamdi family invites you to celebrate the naming of their bundle of joy. A beautiful traditional ceremony followed by refreshments.",
      date: "2025-01-25",
      time: "11:00",
      location: "Enugu, Nigeria",
      venue: "Nnamdi Family Compound",
      price: 0,
      currency: "NGN",
      capacity: 150,
      category: "naming",
      imageUrl: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800",
      highlights: ["Traditional Naming Rites", "Igbo Cultural Display", "Family Portraits", "Palm Wine & Kola Nuts"],
      status: "upcoming",
    },
    {
      title: "Tech Lagos Annual Summit",
      description: "Nigeria's premier technology conference bringing together innovators, entrepreneurs, and investors from across Africa.",
      date: "2025-04-15",
      time: "09:00",
      location: "Lagos, Nigeria",
      venue: "Landmark Event Centre",
      price: 75000,
      currency: "NGN",
      capacity: 1000,
      category: "corporate",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      highlights: ["Keynote Speakers", "Networking Sessions", "Startup Pitches", "Exhibition Hall"],
      dressCode: "Smart Casual",
      status: "upcoming",
    },
    {
      title: "University of Lagos Class of 2015 Reunion",
      description: "Ten years later, we come together again! Join your coursemates for an evening of memories, laughter, and reconnection.",
      date: "2025-05-20",
      time: "18:00",
      location: "Lagos, Nigeria",
      venue: "UNILAG Alumni Centre",
      price: 15000,
      currency: "NGN",
      capacity: 200,
      category: "graduation",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
      highlights: ["Class Photos", "Awards Night", "Live Music", "Memory Lane Exhibition"],
      dressCode: "All White",
      status: "upcoming",
    },
  ];

  sampleEvents.forEach(event => saveEvent(event));
};
