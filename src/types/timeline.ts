// Timeline/Milestone Types

export interface Milestone {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  category: MilestoneCategory;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export type MilestoneCategory = 
  | 'venue'
  | 'catering'
  | 'decor'
  | 'attire'
  | 'entertainment'
  | 'invitations'
  | 'photography'
  | 'transportation'
  | 'other';

export const MILESTONE_CATEGORIES: { value: MilestoneCategory; label: string; icon: string }[] = [
  { value: 'venue', label: 'Venue', icon: '🏛️' },
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'decor', label: 'Decoration', icon: '🎨' },
  { value: 'attire', label: 'Attire', icon: '👗' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎵' },
  { value: 'invitations', label: 'Invitations', icon: '💌' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'transportation', label: 'Transportation', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export const getMilestoneCategoryLabel = (category: MilestoneCategory): string => {
  return MILESTONE_CATEGORIES.find(c => c.value === category)?.label || 'Other';
};

export const getMilestoneCategoryIcon = (category: MilestoneCategory): string => {
  return MILESTONE_CATEGORIES.find(c => c.value === category)?.icon || '✨';
};

// Photo Gallery Types
export interface EventPhoto {
  id: string;
  eventId: string;
  imageUrl: string;
  caption?: string;
  uploadedAt: string;
}
