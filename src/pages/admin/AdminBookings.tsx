import { useEffect, useState } from "react";
import { Booking, Event } from "@/types/event";
import { getBookings, getEvent, updateBooking, seedSampleData } from "@/lib/storage";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<(Booking & { event?: Event })[]>([]);

  useEffect(() => {
    seedSampleData();
    const allBookings = getBookings().map(b => ({ ...b, event: getEvent(b.eventId) }));
    setBookings(allBookings);
  }, []);

  const handleStatusChange = (id: string, status: Booking['status']) => {
    updateBooking(id, { status });
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    toast.success(`Booking ${status}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Manage Bookings</h2>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Guests</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No bookings yet</td></tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{booking.customerName}</div>
                    <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{booking.event?.title || 'Unknown'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{booking.numberOfGuests}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-accent/20 text-accent' : booking.status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {booking.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => handleStatusChange(booking.id, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(booking.id, 'cancelled')}>Cancel</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
