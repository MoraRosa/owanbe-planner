import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Bell, Palette, Shield, CreditCard } from 'lucide-react';
import { update, getUser } from '@/lib/indexedDb';
import type { User as UserType } from '@/types/planner';

export default function VendorSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newInquiries, setNewInquiries] = useState(true);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    
    const prefs = localStorage.getItem('owambe_vendor_notification_prefs');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setEmailNotifications(parsed.emailNotifications ?? true);
      setNewInquiries(parsed.newInquiries ?? true);
      setBookingUpdates(parsed.bookingUpdates ?? true);
      setReviewAlerts(parsed.reviewAlerts ?? true);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const currentUser = await getUser(user.id);
      if (currentUser) {
        const updatedUser: UserType = {
          ...currentUser,
          name,
          phone,
        };
        await update('users', updatedUser);
        toast.success('Profile updated!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    const prefs = {
      emailNotifications,
      newInquiries,
      bookingUpdates,
      reviewAlerts,
    };
    localStorage.setItem('owambe_vendor_notification_prefs', JSON.stringify(prefs));
    toast.success('Preferences saved!');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <User className="w-5 h-5 text-teal" />
            </div>
            <div>
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={loading} className="btn-teal">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-coral" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Configure how you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Inquiries</p>
              <p className="text-sm text-muted-foreground">Alert when planners contact you</p>
            </div>
            <Switch checked={newInquiries} onCheckedChange={setNewInquiries} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Booking Updates</p>
              <p className="text-sm text-muted-foreground">Status changes on bookings</p>
            </div>
            <Switch checked={bookingUpdates} onCheckedChange={setBookingUpdates} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Review Alerts</p>
              <p className="text-sm text-muted-foreground">When clients leave reviews</p>
            </div>
            <Switch checked={reviewAlerts} onCheckedChange={setReviewAlerts} />
          </div>
          <Button onClick={handleSaveNotifications} variant="outline">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gold" />
            </div>
            <div>
              <CardTitle className="text-lg">Billing & Subscription</CardTitle>
              <CardDescription>Manage your plan and payments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-teal/20 bg-teal/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Free Plan</p>
                <p className="text-sm text-muted-foreground">Basic vendor features</p>
              </div>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Premium features include verified badge, priority listing, and analytics.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Protect your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
          <Separator />
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Mode:</strong> This is a demo application. Your data is stored locally 
              in your browser.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
