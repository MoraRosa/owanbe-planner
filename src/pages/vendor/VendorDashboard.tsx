import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getAllVendors, getUserMessages, initDB } from '@/lib/indexedDb';
import { 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Star,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Store
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vendor, Message } from '@/types/planner';

interface DashboardStats {
  profileViews: number;
  totalInquiries: number;
  pendingBookings: number;
  completedBookings: number;
  averageRating: number;
  reviewCount: number;
  thisMonthRevenue: number;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    totalInquiries: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    reviewCount: 0,
    thisMonthRevenue: 0,
  });
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;
      await initDB();

      // Find vendor profile for this user
      const allVendors = await getAllVendors();
      const myVendor = allVendors.find(v => v.userId === user.id);
      setVendor(myVendor || null);

      // Get messages
      const messages = await getUserMessages(user.id);
      setRecentMessages(messages.slice(0, 5));

      // Simulated stats (in a real app, these would come from the database)
      setStats({
        profileViews: myVendor ? Math.floor(Math.random() * 500) + 100 : 0,
        totalInquiries: messages.length,
        pendingBookings: Math.floor(Math.random() * 5),
        completedBookings: Math.floor(Math.random() * 20) + 5,
        averageRating: myVendor?.rating || 0,
        reviewCount: myVendor?.reviewCount || 0,
        thisMonthRevenue: Math.floor(Math.random() * 10000) + 2000,
      });

      setLoading(false);
    };

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'Vendor'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's how your business is performing
          </p>
        </div>
        {!vendor && (
          <Button asChild className="btn-teal">
            <Link to="/vendor/profile">
              Complete Your Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      {/* Alert for incomplete profile */}
      {!vendor && (
        <Card className="border-coral/30 bg-coral/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-coral" />
              </div>
              <div>
                <h3 className="font-semibold">Complete Your Vendor Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Set up your business profile to start receiving inquiries from event planners.
                  Add your services, pricing, and portfolio to get discovered.
                </p>
                <Button asChild variant="link" className="px-0 mt-2 text-coral">
                  <Link to="/vendor/profile">Set up profile →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{stats.profileViews}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-teal" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-coral" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stats.pendingBookings} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <Star className="w-5 h-5 text-gold fill-gold" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-gold" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stats.reviewCount} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${stats.thisMonthRevenue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Inquiries</CardTitle>
                <CardDescription>Messages from event planners</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vendor/messages">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Inquiries from planners will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-purple/10 flex items-center justify-center text-sm font-medium">
                      P
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.content.slice(0, 50)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!msg.read && <Badge variant="secondary" className="bg-coral/10 text-coral">New</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled events</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vendor/bookings">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.pendingBookings === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No upcoming bookings</p>
                <p className="text-sm">Confirmed events will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sample booking items */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple/20 to-coral/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Adebayo Wedding</p>
                    <p className="text-sm text-muted-foreground">Jan 25, 2026 • Hamilton</p>
                  </div>
                  <Badge className="bg-teal/10 text-teal">Confirmed</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold/20 to-coral/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Okonkwo Birthday</p>
                    <p className="text-sm text-muted-foreground">Feb 14, 2026 • Toronto</p>
                  </div>
                  <Badge className="bg-gold/10 text-gold">Pending</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/vendor/profile">
                <Store className="w-5 h-5" />
                <span>Edit Profile</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/vendor/services">
                <TrendingUp className="w-5 h-5" />
                <span>Manage Services</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/vendor/messages">
                <MessageSquare className="w-5 h-5" />
                <span>View Messages</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/vendor/analytics">
                <CheckCircle className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
