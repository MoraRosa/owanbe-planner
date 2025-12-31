// Owambe Planner - Core Types

// Event types users can plan
export type CelebrationCategory = 
  | 'wedding'
  | 'owambe'
  | 'birthday'
  | 'naming'
  | 'funeral'
  | 'graduation'
  | 'retirement'
  | 'traditional'
  | 'other';

export const CELEBRATION_CATEGORIES: { value: CelebrationCategory; label: string; icon: string }[] = [
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'owambe', label: 'Owambe Party', icon: '🎉' },
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'naming', label: 'Naming Ceremony', icon: '👶' },
  { value: 'funeral', label: 'Funeral/Celebration of Life', icon: '🕊️' },
  { value: 'graduation', label: 'Graduation', icon: '🎓' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️' },
  { value: 'traditional', label: 'Traditional Ceremony', icon: '🏺' },
  { value: 'other', label: 'Other', icon: '✨' },
];

// User (Planner or Vendor)
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'planner' | 'vendor';
  avatarUrl?: string;
  createdAt: string;
}

// Planner's Event
export interface PlannerEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: CelebrationCategory;
  date: string;
  time?: string;
  location?: string;
  venue?: string;
  estimatedGuests?: number;
  totalBudget: number;
  currency: string;
  coverImageUrl?: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Vendor Categories
export type VendorCategory = 
  | 'catering'
  | 'photography'
  | 'videography'
  | 'mc'
  | 'dj'
  | 'decoration'
  | 'venue'
  | 'fashion'
  | 'makeup'
  | 'transport'
  | 'entertainment'
  | 'cake'
  | 'invitation'
  | 'other';

export const VENDOR_CATEGORIES: { value: VendorCategory; label: string; icon: string }[] = [
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'videography', label: 'Videography', icon: '🎬' },
  { value: 'mc', label: 'MC/Host', icon: '🎤' },
  { value: 'dj', label: 'DJ/Music', icon: '🎧' },
  { value: 'decoration', label: 'Decoration', icon: '🎨' },
  { value: 'venue', label: 'Venue', icon: '🏛️' },
  { value: 'fashion', label: 'Fashion/Asoebi', icon: '👗' },
  { value: 'makeup', label: 'Makeup/Beauty', icon: '💄' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'cake', label: 'Cake/Pastry', icon: '🎂' },
  { value: 'invitation', label: 'Invitation Cards', icon: '💌' },
  { value: 'other', label: 'Other', icon: '✨' },
];

// Vendor Profile
export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  categories: VendorCategory[];
  priceRangeMin: number;
  priceRangeMax: number;
  currency: string;
  location: string;
  portfolioImages: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Budget Category
export interface BudgetCategory {
  id: string;
  eventId: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  createdAt: string;
}

// Transaction/Expense
export interface Transaction {
  id: string;
  eventId: string;
  budgetCategoryId: string;
  vendorId?: string;
  description: string;
  amount: number;
  type: 'expense' | 'payment';
  receiptUrl?: string;
  date: string;
  createdAt: string;
}

// Guest
export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: 'pending' | 'attending' | 'not_attending' | 'maybe';
  plusOnes: number;
  dietaryNotes?: string;
  tableNumber?: number;
  rsvpAt?: string;
  createdAt: string;
}

// Message between Planner and Vendor
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  eventId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Dashboard stats for planner
export interface PlannerDashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalBudget: number;
  totalSpent: number;
  totalGuests: number;
  confirmedGuests: number;
  unreadMessages: number;
}

// Helper functions
export const getCategoryLabel = (category: CelebrationCategory): string => {
  return CELEBRATION_CATEGORIES.find(c => c.value === category)?.label || 'Other';
};

export const getCategoryIcon = (category: CelebrationCategory): string => {
  return CELEBRATION_CATEGORIES.find(c => c.value === category)?.icon || '✨';
};

export const getVendorCategoryLabel = (category: VendorCategory): string => {
  return VENDOR_CATEGORIES.find(c => c.value === category)?.label || 'Other';
};

export const getVendorCategoryIcon = (category: VendorCategory): string => {
  return VENDOR_CATEGORIES.find(c => c.value === category)?.icon || '✨';
};
