import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event, getCategoryIcon, getCategoryLabel } from "@/types/event";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const spotsLeft = event.capacity - event.bookedCount;
  const isSoldOut = spotsLeft <= 0;
  const isLowStock = spotsLeft > 0 && spotsLeft <= 10;

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link 
      to={`/events/${event.id}`}
      className={`group block card-celebration overflow-hidden ${featured ? 'md:flex' : ''}`}
    >
      <div className={`relative overflow-hidden ${featured ? 'md:w-2/5' : 'aspect-[4/3]'}`}>
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span>{getCategoryIcon(event.category)}</span>
          <span className="text-sm font-medium">{getCategoryLabel(event.category)}</span>
        </div>

        {/* Status Badge */}
        {isSoldOut ? (
          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-semibold animate-pulse">
            Only {spotsLeft} left!
          </div>
        ) : null}

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-lg shadow-gold">
          {formatPrice(event.price, event.currency)}
        </div>
      </div>

      <div className={`p-6 ${featured ? 'md:w-3/5 md:flex md:flex-col md:justify-center' : ''}`}>
        <h3 className={`font-display font-bold text-foreground group-hover:text-primary transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {event.title}
        </h3>

        <p className={`mt-2 text-muted-foreground line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`}>
          {event.description}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>{event.venue}, {event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-accent" />
            <span>{spotsLeft} spots available</span>
          </div>
        </div>

        {event.dressCode && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Dress Code: {event.dressCode}</span>
          </div>
        )}

        {featured && (
          <Button className="mt-6 btn-gold w-fit">
            View Details & Book
          </Button>
        )}
      </div>
    </Link>
  );
}
