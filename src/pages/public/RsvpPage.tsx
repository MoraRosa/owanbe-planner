import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { initDB, getEvent, getEventGuests, updateGuest, getById } from '@/lib/indexedDb';
import type { PlannerEvent, Guest } from '@/types/planner';
import { getCategoryIcon, getCategoryLabel } from '@/types/planner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, MapPin, Clock, UserCheck, UserX, HelpCircle,
  PartyPopper, Heart, Check
} from 'lucide-react';
import { format } from 'date-fns';

type RsvpStatus = 'attending' | 'not_attending' | 'maybe';

export default function RsvpPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get('guest');
  
  const [event, setEvent] = useState<PlannerEvent | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('attending');
  const [plusOnes, setPlusOnes] = useState('0');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId, guestToken]);

  const loadData = async () => {
    if (!eventId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      await initDB();
      const eventData = await getEvent(eventId);
      
      if (!eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setEvent(eventData);
      
      // If guest token provided, load guest data
      if (guestToken) {
        const guestData = await getById<Guest>('guests', guestToken);
        if (guestData && guestData.eventId === eventId) {
          setGuest(guestData);
          setGuestName(guestData.name);
          setGuestEmail(guestData.email || '');
          setPlusOnes(guestData.plusOnes.toString());
          setDietaryNotes(guestData.dietaryNotes || '');
          if (guestData.rsvpStatus !== 'pending') {
            setRsvpStatus(guestData.rsvpStatus as RsvpStatus);
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading RSVP data:', error);
      setNotFound(true);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!guestName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (guest) {
        // Update existing guest
        await updateGuest({
          ...guest,
          name: guestName.trim(),
          email: guestEmail.trim() || undefined,
          rsvpStatus,
          plusOnes: parseInt(plusOnes) || 0,
          dietaryNotes: dietaryNotes.trim() || undefined,
          rsvpAt: new Date().toISOString(),
        });
      } else {
        // Create new guest (for public RSVP without invitation)
        const { createGuest } = await import('@/lib/indexedDb');
        await createGuest({
          eventId: eventId!,
          name: guestName.trim(),
          email: guestEmail.trim() || undefined,
          rsvpStatus,
          plusOnes: parseInt(plusOnes) || 0,
          dietaryNotes: dietaryNotes.trim() || undefined,
        });
      }
      
      setSubmitted(true);
      toast({ title: 'Thank you for your response!' });
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({ title: 'Error submitting RSVP. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-display text-foreground mb-2">Event Not Found</h1>
            <p className="text-muted-foreground">
              This invitation link appears to be invalid or the event no longer exists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            {rsvpStatus === 'attending' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">We Can't Wait to See You!</h1>
                <p className="text-muted-foreground mb-4">
                  Thank you for confirming your attendance to <span className="font-semibold text-foreground">{event?.title}</span>.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{event?.date ? format(new Date(event.date), 'EEEE, MMMM d, yyyy') : 'Date TBA'}</span>
                  </div>
                  {event?.time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event?.venue && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>
              </>
            ) : rsvpStatus === 'not_attending' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">We'll Miss You!</h1>
                <p className="text-muted-foreground">
                  Thank you for letting us know. We hope to see you at future celebrations!
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">Thanks for Your Response!</h1>
                <p className="text-muted-foreground">
                  We understand you're not sure yet. Please update your RSVP when you know!
                </p>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setSubmitted(false)}
            >
              Update My Response
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">{getCategoryIcon(event!.category)}</div>
          <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">{event?.title}</h1>
          <p className="text-muted-foreground text-lg">{getCategoryLabel(event!.category)}</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {event?.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBA'}
                  </p>
                </div>
              </div>
              
              {event?.time && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{event.time}</p>
                  </div>
                </div>
              )}
              
              {event?.venue && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium text-foreground">{event.venue}</p>
                  </div>
                </div>
              )}
            </div>
            
            {event?.description && (
              <p className="mt-4 text-muted-foreground border-t border-border pt-4">
                {event.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* RSVP Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>RSVP</CardTitle>
            <CardDescription>
              {guest 
                ? `Hi ${guest.name}! Please confirm your attendance.`
                : "Please let us know if you'll be joining us."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional - for event updates and reminders
              </p>
            </div>

            {/* RSVP Status */}
            <div>
              <Label className="mb-3 block">Will you be attending?</Label>
              <RadioGroup 
                value={rsvpStatus} 
                onValueChange={(value) => setRsvpStatus(value as RsvpStatus)}
                className="grid grid-cols-1 gap-3"
              >
                <label 
                  htmlFor="attending"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    rsvpStatus === 'attending' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-border hover:border-green-500/50'
                  }`}
                >
                  <RadioGroupItem value="attending" id="attending" />
                  <UserCheck className={`h-5 w-5 ${rsvpStatus === 'attending' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-foreground">Yes, I'll be there!</p>
                    <p className="text-sm text-muted-foreground">Count me in for the celebration</p>
                  </div>
                </label>

                <label 
                  htmlFor="not_attending"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    rsvpStatus === 'not_attending' 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-border hover:border-red-500/50'
                  }`}
                >
                  <RadioGroupItem value="not_attending" id="not_attending" />
                  <UserX className={`h-5 w-5 ${rsvpStatus === 'not_attending' ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-foreground">Sorry, I can't make it</p>
                    <p className="text-sm text-muted-foreground">I won't be able to attend</p>
                  </div>
                </label>

                <label 
                  htmlFor="maybe"
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    rsvpStatus === 'maybe' 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-border hover:border-yellow-500/50'
                  }`}
                >
                  <RadioGroupItem value="maybe" id="maybe" />
                  <HelpCircle className={`h-5 w-5 ${rsvpStatus === 'maybe' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-foreground">Not sure yet</p>
                    <p className="text-sm text-muted-foreground">I'll confirm later</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Plus Ones - only show if attending */}
            {rsvpStatus === 'attending' && (
              <>
                <div>
                  <Label htmlFor="plusOnes">Number of Additional Guests</Label>
                  <Input
                    id="plusOnes"
                    type="number"
                    min="0"
                    max="10"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(e.target.value)}
                    className="mt-1 w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How many people are you bringing with you?
                  </p>
                </div>

                <div>
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <Textarea
                    id="dietary"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="Any allergies or dietary restrictions we should know about?"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit RSVP
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>Powered by Owambe Planner</p>
        </div>
      </div>
    </div>
  );
}