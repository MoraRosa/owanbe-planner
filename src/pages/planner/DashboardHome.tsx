import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Users, 
  Wallet, 
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { getUserEvents, getEventGuests, getEventBudgetCategories, getEventTransactions, initDB } from '@/lib/indexedDb';
import type { PlannerEvent, Guest, BudgetCategory, Transaction } from '@/types/planner';
import { getCategoryIcon, getCategoryLabel } from '@/types/planner';
import { format, differenceInDays, isPast } from 'date-fns';

interface EventWithStats extends PlannerEvent {
  guestCount: number;
  confirmedGuests: number;
  totalSpent: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalGuests: 0,
    confirmedGuests: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      await initDB();
      const userEvents = await getUserEvents(user.id);
      
      // Load stats for each event
      const eventsWithStats: EventWithStats[] = await Promise.all(
        userEvents.map(async (event) => {
          const guests = await getEventGuests(event.id);
          const transactions = await getEventTransactions(event.id);
          const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
          
          return {
            ...event,
            guestCount: guests.length,
            confirmedGuests: guests.filter(g => g.rsvpStatus === 'attending').length,
            totalSpent,
          };
        })
      );

      // Calculate totals
      const totalBudget = eventsWithStats.reduce((sum, e) => sum + e.totalBudget, 0);
      const totalSpent = eventsWithStats.reduce((sum, e) => sum + e.totalSpent, 0);
      const totalGuests = eventsWithStats.reduce((sum, e) => sum + e.guestCount, 0);
      const confirmedGuests = eventsWithStats.reduce((sum, e) => sum + e.confirmedGuests, 0);
      const upcomingEvents = eventsWithStats.filter(e => !isPast(new Date(e.date))).length;

      setStats({
        totalEvents: eventsWithStats.length,
        upcomingEvents,
        totalBudget,
        totalSpent,
        totalGuests,
        confirmedGuests,
      });

      // Sort by date, upcoming first
      eventsWithStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(eventsWithStats);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const getEventStatusColor = (event: PlannerEvent) => {
    if (event.status === 'completed') return 'bg-teal text-cream';
    if (event.status === 'cancelled') return 'bg-destructive/20 text-destructive';
    if (isPast(new Date(event.date))) return 'bg-muted text-muted-foreground';
    const daysUntil = differenceInDays(new Date(event.date), new Date());
    if (daysUntil <= 7) return 'bg-coral text-cream';
    if (daysUntil <= 30) return 'bg-gold text-foreground';
    return 'bg-purple/20 text-purple';
  };

  const getEventStatusLabel = (event: PlannerEvent) => {
    if (event.status === 'completed') return 'Completed';
    if (event.status === 'cancelled') return 'Cancelled';
    if (isPast(new Date(event.date))) return 'Past';
    const daysUntil = differenceInDays(new Date(event.date), new Date());
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `${daysUntil} days`;
    if (daysUntil <= 30) return `${daysUntil} days`;
    return format(new Date(event.date), 'MMM d');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-celebration">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {events.length === 0 
              ? "Ready to plan your next celebration?" 
              : `You have ${stats.upcomingEvents} upcoming ${stats.upcomingEvents === 1 ? 'event' : 'events'}`
            }
          </p>
        </div>
        <Link to="/dashboard/events/new">
          <Button className="btn-coral gap-2">
            <Plus className="w-5 h-5" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-celebration">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-celebration">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmedGuests}</p>
                <p className="text-sm text-muted-foreground">Guests Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-celebration">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-celebration">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-coral" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-sm text-muted-foreground">Spent So Far</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List or Empty State */}
      {events.length === 0 ? (
        <Card className="card-celebration">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple/20 to-coral/20 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">No events yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start planning your first owambe celebration! Create an event to manage vendors, 
              budget, and guest lists all in one place.
            </p>
            <Link to="/dashboard/events/new">
              <Button className="btn-coral gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">Your Events</h2>
            <Link to="/dashboard/events" className="text-sm text-coral hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((event) => (
              <Link key={event.id} to={`/dashboard/events/${event.id}`}>
                <Card className="card-celebration h-full hover:border-coral/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                        <CardTitle className="text-lg font-display line-clamp-1">
                          {event.title}
                        </CardTitle>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEventStatusColor(event)}`}>
                        {getEventStatusLabel(event)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.confirmedGuests}/{event.guestCount}
                      </span>
                    </div>

                    {/* Budget Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                          {Math.round((event.totalSpent / event.totalBudget) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(event.totalSpent / event.totalBudget) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatCurrency(event.totalSpent)}</span>
                        <span>{formatCurrency(event.totalBudget)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
