import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Store, 
  MapPin, 
  DollarSign, 
  Image as ImageIcon,
  Plus,
  X,
  CheckCircle,
  Save
} from 'lucide-react';
import { createVendor, updateVendor, getAllVendors, initDB } from '@/lib/indexedDb';
import { VENDOR_CATEGORIES, type VendorCategory, type Vendor } from '@/types/planner';

export default function VendorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const loadVendor = async () => {
      if (!user) return;
      await initDB();

      const allVendors = await getAllVendors();
      const myVendor = allVendors.find(v => v.userId === user.id);
      
      if (myVendor) {
        setVendor(myVendor);
        setBusinessName(myVendor.businessName);
        setDescription(myVendor.description);
        setLocation(myVendor.location);
        setCategories(myVendor.categories);
        setPriceMin(myVendor.priceRangeMin.toString());
        setPriceMax(myVendor.priceRangeMax.toString());
        setPortfolioImages(myVendor.portfolioImages);
      } else {
        // Pre-fill with user name
        setBusinessName(user.name || '');
      }
      
      setLoading(false);
    };

    loadVendor();
  }, [user]);

  const handleCategoryToggle = (category: VendorCategory) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    if (portfolioImages.includes(newImageUrl)) {
      toast.error('Image already added');
      return;
    }
    setPortfolioImages([...portfolioImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (url: string) => {
    setPortfolioImages(portfolioImages.filter(img => img !== url));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }

    if (categories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }

    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }

    setSaving(true);
    try {
      const vendorData = {
        userId: user.id,
        businessName: businessName.trim(),
        description: description.trim(),
        categories,
        priceRangeMin: Number(priceMin) || 0,
        priceRangeMax: Number(priceMax) || 0,
        currency: 'CAD',
        location: location.trim(),
        portfolioImages,
        rating: vendor?.rating || 0,
        reviewCount: vendor?.reviewCount || 0,
        verified: vendor?.verified || false,
      };

      if (vendor) {
        await updateVendor({ ...vendor, ...vendorData });
        toast.success('Profile updated successfully!');
      } else {
        const newVendor = await createVendor(vendorData);
        setVendor(newVendor);
        toast.success('Vendor profile created successfully!');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {vendor ? 'Edit Profile' : 'Create Vendor Profile'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {vendor 
              ? 'Update your business information to attract more clients'
              : 'Set up your profile to start receiving inquiries'
            }
          </p>
        </div>
        {vendor?.verified && (
          <Badge className="bg-teal/10 text-teal gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        )}
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-teal" />
            </div>
            <div>
              <CardTitle className="text-lg">Business Information</CardTitle>
              <CardDescription>Tell planners about your business</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell planners what makes your services special..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Toronto, ON"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Categories *</CardTitle>
          <CardDescription>Select all services you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VENDOR_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  categories.includes(cat.value)
                    ? 'border-teal bg-teal/5'
                    : 'border-border hover:border-teal/50'
                }`}
              >
                <Checkbox
                  checked={categories.includes(cat.value)}
                  onCheckedChange={() => handleCategoryToggle(cat.value)}
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <div>
              <CardTitle className="text-lg">Pricing Range</CardTitle>
              <CardDescription>Give planners an idea of your rates (CAD)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">Minimum Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="priceMin"
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">Maximum Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="priceMax"
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-coral" />
            </div>
            <div>
              <CardTitle className="text-lg">Portfolio</CardTitle>
              <CardDescription>Showcase your best work with images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add image URL */}
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <Button onClick={handleAddImage} variant="outline" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Image gallery */}
          {portfolioImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolioImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img 
                    src={url} 
                    alt={`Portfolio ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400';
                    }}
                  />
                  <button
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No portfolio images yet</p>
              <p className="text-sm">Add image URLs to showcase your work</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="btn-teal gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : vendor ? 'Save Changes' : 'Create Profile'}
        </Button>
      </div>
    </div>
  );
}
