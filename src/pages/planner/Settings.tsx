import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Bell, Palette, Shield, Camera } from 'lucide-react';
import { update, getUser } from '@/lib/indexedDb';
import type { User as UserType } from '@/types/planner';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rsvpAlerts, setRsvpAlerts] = useState(true);
  const [vendorMessages, setVendorMessages] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  
  // Theme preferences
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    
    // Load saved preferences
    const prefs = localStorage.getItem('owambe_notification_prefs');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setEmailNotifications(parsed.emailNotifications ?? true);
      setRsvpAlerts(parsed.rsvpAlerts ?? true);
      setVendorMessages(parsed.vendorMessages ?? true);
      setBudgetAlerts(parsed.budgetAlerts ?? true);
    }
    
    const theme = localStorage.getItem('owambe_theme');
    setDarkMode(theme === 'dark');
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
        toast.success('Profile updated successfully!');
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
      rsvpAlerts,
      vendorMessages,
      budgetAlerts,
    };
    localStorage.setItem('owambe_notification_prefs', JSON.stringify(prefs));
    toast.success('Notification preferences saved!');
  };

  const handleToggleTheme = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('owambe_theme', enabled ? 'dark' : 'light');
    // In a real app, this would toggle the actual theme
    toast.success(`Theme set to ${enabled ? 'dark' : 'light'} mode`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
              <User className="w-5 h-5 text-purple" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple to-coral text-cream text-2xl">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          <Separator />

          {/* Form fields */}
          <div className="grid gap-4">
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
          </div>

          <Button onClick={handleSaveProfile} disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Profile'}
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
              <p className="font-medium">RSVP Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when guests respond</p>
            </div>
            <Switch checked={rsvpAlerts} onCheckedChange={setRsvpAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Vendor Messages</p>
              <p className="text-sm text-muted-foreground">Notifications for new vendor messages</p>
            </div>
            <Switch checked={vendorMessages} onCheckedChange={setVendorMessages} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">Warnings when nearing budget limits</p>
            </div>
            <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
          </div>

          <Button onClick={handleSaveNotifications} variant="outline">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-teal" />
            </div>
            <div>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark color theme</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleToggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
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
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
          <Separator />
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Mode:</strong> This is a demo application. Your data is stored locally 
              in your browser and not on any server. Password changes are simulated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
