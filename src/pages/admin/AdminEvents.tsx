import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event, getCategoryLabel } from "@/types/event";
import { getEvents, deleteEvent, seedSampleData } from "@/lib/storage";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    seedSampleData();
    setEvents(getEvents());
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteEvent(id);
      setEvents(getEvents());
      toast.success("Event deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Manage Events</h2>
        <Link to="/admin/events/new"><Button className="btn-gold gap-2"><Plus className="w-4 h-4" />Create Event</Button></Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Bookings</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={event.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium text-foreground">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{getCategoryLabel(event.category)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(event.date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.bookedCount}/{event.capacity}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/events/${event.id}`}><Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button></Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id, event.title)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
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
