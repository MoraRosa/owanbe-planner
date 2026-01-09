import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  User,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  eventName: string;
  clientName: string;
  date: string;
  time: string;
  location: string;
  service: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Demo data
const demoBookings: Booking[] = [
  {
    id: '1',
    eventName: 'Adebayo Wedding Ceremony',
    clientName: 'Tunde Adebayo',
    date: '2026-01-25',
    time: '2:00 PM',
    location: 'Hamilton Convention Centre',
    service: 'Full Event Photography',
    amount: 2500,
    status: 'confirmed',
  },
  {
    id: '2',
    eventName: 'Okonkwo 50th Birthday',
    clientName: 'Chidi Okonkwo',
    date: '2026-02-14',
    time: '6:00 PM',
    location: 'Toronto Banquet Hall',
    service: 'Half Day Coverage',
    amount: 1500,
    status: 'pending',
  },
  {
    id: '3',
    eventName: 'Baby Dedication Ceremony',
    clientName: 'Folake Johnson',
    date: '2025-12-15',
    time: '11:00 AM',
    location: 'Grace Chapel, Mississauga',
    service: 'Ceremony Only',
    amount: 800,
    status: 'completed',
  },
];

export default function VendorBookings() {
  const [bookings] = useState<Booking[]>(demoBookings);
  const [activeTab, setActiveTab] = useState('upcoming');

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-gold/10 text-gold',
      confirmed: 'bg-teal/10 text-teal',
      completed: 'bg-purple/10 text-purple',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const filteredBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeTab) {
      case 'upcoming':
        return bookingDate >= today && b.status !== 'cancelled';
      case 'pending':
        return b.status === 'pending';
      case 'past':
        return bookingDate < today || b.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your event bookings and requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'No pending requests at the moment'
                    : 'Bookings will appear here when clients book your services'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Date badge */}
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple/10 to-coral/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-muted-foreground uppercase">
                          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold">
                          {new Date(booking.date).getDate()}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.eventName}</h3>
                            <p className="text-sm text-muted-foreground">{booking.service}</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-4 h-4" />
                            {booking.clientName}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {booking.location}
                          </div>
                          <div className="flex items-center gap-1 font-semibold">
                            <DollarSign className="w-4 h-4 text-gold" />
                            ${booking.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {booking.status === 'pending' && (
                          <>
                            <Button size="sm" className="btn-teal gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <XCircle className="w-4 h-4" />
                              Decline
                            </Button>
                          </>
                        )}
                        <Button asChild size="sm" variant="outline" className="gap-1">
                          <Link to="/vendor/messages">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
