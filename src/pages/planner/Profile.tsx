import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Calendar, 
  PartyPopper, 
  Camera, 
  Globe, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin,
  ExternalLink,
  Edit3,
  X,
  Check
} from 'lucide-react';
import { update, getUser, getUserEvents } from '@/lib/indexedDb';
import type { User as UserType, PlannerEvent } from '@/types/planner';
import { format } from 'date-fns';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleInputChange: handleImageInput, uploading: uploadingImage } = useImageUpload({
    maxSizeMB: 5,
    onSuccess: (dataUrl) => {
      setAvatarUrl(dataUrl);
    },
  });
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    website: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        facebook: user.socialLinks?.facebook || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || '',
      });
      setAvatarUrl(user.avatarUrl);
      
      // Load user events
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    try {
      const userEvents = await getUserEvents(user.id);
      setEvents(userEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const currentUser = await getUser(user.id);
      if (currentUser) {
        const updatedUser: UserType = {
          ...currentUser,
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          avatarUrl: avatarUrl,
          socialLinks: {
            instagram: formData.instagram || undefined,
            twitter: formData.twitter || undefined,
            facebook: formData.facebook || undefined,
            linkedin: formData.linkedin || undefined,
            website: formData.website || undefined,
          },
        };
        await update('users', updatedUser);
        refreshUser?.();
        setEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        facebook: user.socialLinks?.facebook || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || '',
      });
      setAvatarUrl(user.avatarUrl);
    }
    setEditing(false);
  };

  const completedEvents = events.filter(e => e.status === 'completed').length;
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Unknown';

  const hasSocialLinks = formData.instagram || formData.twitter || formData.facebook || formData.linkedin || formData.website;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Your public profile and social presence</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Cover Banner */}
        <div className="h-32 md:h-40 bg-gradient-to-br from-purple via-coral to-gold" />
        
        <CardContent className="relative pt-0">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="relative">
              <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-xl">
                <AvatarImage src={avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple to-coral text-cream text-3xl md:text-4xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageInput}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 md:pt-20 space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Province"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold">{user?.name || 'Your Name'}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    {formData.location && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <User className="w-3 h-3" />
                      Event Planner
                    </Badge>
                  </div>
                </div>
                {formData.bio && (
                  <p className="text-foreground/80 max-w-2xl">{formData.bio}</p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-muted-foreground">Events Planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-coral" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedEvents}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{memberSince}</p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Links
          </CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter / X
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          ) : (
            <>
              {hasSocialLinks ? (
                <div className="flex flex-wrap gap-3">
                  {formData.instagram && (
                    <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <span className="text-sm">Instagram</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {formData.twitter && (
                    <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Twitter</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {formData.facebook && (
                    <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Facebook</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {formData.linkedin && (
                    <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span className="text-sm">LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Globe className="w-5 h-5 text-teal" />
                      <span className="text-sm">Website</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No social links added yet. Click "Edit Profile" to add your links.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel Buttons */}
      {editing && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="btn-primary gap-2">
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}