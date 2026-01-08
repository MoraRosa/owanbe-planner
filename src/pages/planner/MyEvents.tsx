import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, MapPin, Users, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { getUserEvents, deleteEvent, initDB } from '@/lib/indexedDb';
import type { PlannerEvent } from '@/types/planner';
import { getCategoryIcon, getCategoryLabel } from '@/types/planner';
import { format, isPast, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const loadEvents = async () => {
    if (!user) return;
    await initDB();
    const userEvents = await getUserEvents(user.id);
    userEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(userEvents);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    await deleteEvent(eventId);
    toast.success('Event deleted');
    loadEvents();
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') return !isPast(new Date(event.date));
    if (filter === 'past') return isPast(new Date(event.date));
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full bg-pattern-ankara" style={{ backgroundBlendMode: 'overlay', backgroundColor: 'hsl(35 30% 97% / 0.85)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your celebrations in one place
          </p>
        </div>
        <Link to="/dashboard/events/new">
          <Button className="btn-coral gap-2">
            <Plus className="w-5 h-5" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'past'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-purple' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="card-celebration">
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">
              {filter === 'all' ? 'No events yet' : `No ${filter} events`}
            </h2>
            <p className="text-muted-foreground mb-6">
              {filter === 'all' 
                ? 'Create your first celebration to get started!'
                : 'Try changing the filter to see more events.'
              }
            </p>
            {filter === 'all' && (
              <Link to="/dashboard/events/new">
                <Button className="btn-coral gap-2">
                  <Plus className="w-5 h-5" />
                  Create Event
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const daysUntil = differenceInDays(new Date(event.date), new Date());
            const isUpcoming = !isPast(new Date(event.date));

            return (
              <Card key={event.id} className="card-celebration relative group">
                {/* Cover Image */}
                {event.coverImageUrl && (
                  <div className="h-32 overflow-hidden rounded-t-xl">
                    <img 
                      src={event.coverImageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{getCategoryIcon(event.category)}</span>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-display line-clamp-1">
                          {event.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryLabel(event.category)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/events/${event.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-coral" />
                      <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <span className="w-4" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="font-semibold">{formatCurrency(event.totalBudget)}</span>
                    </div>
                    {isUpcoming && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysUntil <= 7 ? 'bg-coral text-cream' : 'bg-purple/20 text-purple'
                      }`}>
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </span>
                    )}
                  </div>

                  <Link to={`/dashboard/events/${event.id}`} className="block">
                    <Button variant="outline" className="w-full mt-2">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
