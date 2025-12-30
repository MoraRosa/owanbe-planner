import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats, Event } from "@/types/event";
import { getDashboardStats, getEvents, getBookings, seedSampleData } from "@/lib/storage";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    seedSampleData();
    setStats(getDashboardStats());
    setRecentEvents(getEvents().slice(0, 5));
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  if (!stats) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

  const statCards = [
    { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-primary bg-primary/10" },
    { label: "Total Bookings", value: stats.totalBookings, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Pending Bookings", value: stats.pendingBookings, icon: Users, color: "text-accent bg-accent/10" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-coral bg-coral/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Dashboard</h2>
        <Link to="/admin/events/new">
          <Button className="btn-gold gap-2"><Plus className="w-4 h-4" />Create Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Recent Events</h3>
          <Link to="/admin/events" className="text-primary text-sm flex items-center gap-1">View All<ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="space-y-3">
          {recentEvents.map((event) => (
            <Link key={event.id} to={`/admin/events/${event.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <img src={event.imageUrl} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                <p className="text-sm text-muted-foreground">{event.bookedCount}/{event.capacity} booked</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
