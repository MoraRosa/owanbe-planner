import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Wallet, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { createEvent, createBudgetCategory, initDB } from '@/lib/indexedDb';
import { CELEBRATION_CATEGORIES, type CelebrationCategory } from '@/types/planner';
import { toast } from 'sonner';

const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Catering & Food', color: '#E07A5F' },
  { name: 'Venue & Decor', color: '#7B4B94' },
  { name: 'Entertainment', color: '#3D9970' },
  { name: 'Photography/Video', color: '#D4A853' },
  { name: 'Fashion & Attire', color: '#E07A5F' },
  { name: 'Miscellaneous', color: '#6B7280' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '' as CelebrationCategory,
    date: '',
    time: '',
    venue: '',
    location: '',
    description: '',
    estimatedGuests: '',
    totalBudget: '',
    coverImageUrl: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to create an event');
      return;
    }

    if (!formData.title || !formData.category || !formData.date || !formData.totalBudget) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await initDB();

      // Create the event
      const event = await createEvent({
        userId: user.id,
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time: formData.time || undefined,
        venue: formData.venue || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : undefined,
        totalBudget: parseFloat(formData.totalBudget),
        currency: 'NGN',
        coverImageUrl: formData.coverImageUrl || undefined,
        status: 'planning',
      });

      // Create default budget categories
      const budgetPerCategory = parseFloat(formData.totalBudget) / DEFAULT_BUDGET_CATEGORIES.length;
      for (const cat of DEFAULT_BUDGET_CATEGORIES) {
        await createBudgetCategory({
          eventId: event.id,
          name: cat.name,
          allocatedAmount: Math.round(budgetPerCategory),
          spentAmount: 0,
          color: cat.color,
        });
      }

      toast.success('Event created successfully! 🎉');
      navigate(`/dashboard/events/${event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-celebration">
            Create New Event
          </h1>
          <p className="text-muted-foreground mt-1">
            Start planning your celebration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="card-celebration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-gold" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Adebayo & Chidinma's Wedding"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Event Type *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {CELEBRATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell guests about your celebration..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => handleChange('coverImageUrl', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Location */}
        <Card className="card-celebration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-coral" />
              Date & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="e.g., Eko Hotel & Suites"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City/Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Nigeria"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Guests */}
        <Card className="card-celebration">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="w-5 h-5 text-teal" />
              Budget & Guests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget (NGN) *</Label>
              <Input
                id="totalBudget"
                type="number"
                placeholder="e.g., 5000000"
                value={formData.totalBudget}
                onChange={(e) => handleChange('totalBudget', e.target.value)}
                required
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                We'll create default budget categories for you
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedGuests">Estimated Guest Count</Label>
              <Input
                id="estimatedGuests"
                type="number"
                placeholder="e.g., 200"
                value={formData.estimatedGuests}
                onChange={(e) => handleChange('estimatedGuests', e.target.value)}
                min="1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-coral"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
