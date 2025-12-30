import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Sparkles, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerLayout } from "@/components/CustomerLayout";
import { Event, getCategoryIcon, getCategoryLabel } from "@/types/event";
import { getEvent, saveBooking } from "@/lib/storage";
import { format } from "date-fns";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const eventData = getEvent(id);
      setEvent(eventData || null);
    }
    setLoading(false);
  }, [id]);

  const spotsLeft = event ? event.capacity - event.bookedCount : 0;
  const isSoldOut = spotsLeft <= 0;

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSubmitting(true);

    try {
      const booking = saveBooking({
        eventId: event.id,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        numberOfGuests: bookingData.numberOfGuests,
        totalAmount: event.price * bookingData.numberOfGuests,
        status: "pending",
        paymentStatus: event.price === 0 ? "paid" : "pending",
        specialRequests: bookingData.specialRequests,
      });

      toast.success("Booking Confirmed!", {
        description: `Your booking for ${event.title} has been received. Booking ID: ${booking.id.slice(0, 8)}`,
      });

      // Reset and close form
      setBookingData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        numberOfGuests: 1,
        specialRequests: "",
      });
      setShowBookingForm(false);

      // Refresh event data
      const updatedEvent = getEvent(event.id);
      if (updatedEvent) setEvent(updatedEvent);
    } catch {
      toast.error("Booking Failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!event) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Event Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This event may have been removed or the link is incorrect.
          </p>
          <Link to="/events">
            <Button className="btn-gold">Browse All Events</Button>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Hero Image */}
      <section className="container mx-auto px-4 py-6">
        <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-xl">{getCategoryIcon(event.category)}</span>
            <span className="font-medium">{getCategoryLabel(event.category)}</span>
          </div>

          {/* Share Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-6 right-6"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Date</h4>
                  <p className="text-muted-foreground">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Time</h4>
                  <p className="text-muted-foreground">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Venue</h4>
                  <p className="text-muted-foreground">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Capacity</h4>
                  <p className="text-muted-foreground">
                    {spotsLeft} of {event.capacity} spots available
                  </p>
                </div>
              </div>
            </div>

            {/* Dress Code */}
            {event.dressCode && (
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">Dress Code: </span>
                  <span className="text-muted-foreground">{event.dressCode}</span>
                </div>
              </div>
            )}

            {/* Highlights */}
            {event.highlights.length > 0 && (
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Event Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-elevated">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-1">
                  {formatPrice(event.price, event.currency)}
                </div>
                <p className="text-muted-foreground">per person</p>
              </div>

              {isSoldOut ? (
                <div className="text-center py-4">
                  <div className="text-xl font-semibold text-destructive mb-2">
                    Sold Out
                  </div>
                  <p className="text-muted-foreground text-sm">
                    This event has reached maximum capacity
                  </p>
                </div>
              ) : showBookingForm ? (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={bookingData.customerName}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, customerName: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={bookingData.customerEmail}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, customerEmail: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={bookingData.customerPhone}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, customerPhone: e.target.value })
                      }
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guests">Number of Guests *</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={spotsLeft}
                      required
                      value={bookingData.numberOfGuests}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          numberOfGuests: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: {spotsLeft} spots available
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="requests">Special Requests</Label>
                    <Textarea
                      id="requests"
                      value={bookingData.specialRequests}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, specialRequests: e.target.value })
                      }
                      placeholder="Dietary requirements, accessibility needs, etc."
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">
                        {formatPrice(event.price * bookingData.numberOfGuests, event.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowBookingForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-gold flex-1"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <Button
                    className="btn-gold w-full text-lg py-6 h-auto mb-4"
                    onClick={() => setShowBookingForm(true)}
                  >
                    Book Now
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {spotsLeft} spots remaining • Secure booking
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default EventDetails;
