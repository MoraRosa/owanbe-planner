import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/CustomerLayout";
import { EventCard } from "@/components/EventCard";
import { Event, EVENT_CATEGORIES } from "@/types/event";
import { getEvents, seedSampleData } from "@/lib/storage";

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);

  useEffect(() => {
    seedSampleData();
    const allEvents = getEvents();
    const upcoming = allEvents.filter(e => e.status === 'upcoming');
    setFeaturedEvent(upcoming[0] || null);
    setEvents(upcoming.slice(1, 4));
  }, []);

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-muted" />
        <div className="absolute inset-0 bg-pattern-ankara opacity-50" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Experience Nigerian Celebrations</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Where Every Event{" "}
              <span className="text-gradient-gold">Becomes a Celebration</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              From elegant weddings to vibrant owambe parties, discover and book 
              the most spectacular events across Nigeria. Let the celebration begin!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/events">
                <Button className="btn-gold text-lg px-8 py-6 h-auto">
                  Explore Events
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" className="text-lg px-8 py-6 h-auto border-2">
                  Host Your Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Calendar, value: "500+", label: "Events Hosted" },
              { icon: Users, value: "50K+", label: "Happy Guests" },
              { icon: Star, value: "4.9", label: "Average Rating" },
              { icon: Sparkles, value: "100%", label: "Jollof Quality" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-border shadow-soft animate-fade-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Featured Event
              </h2>
              <p className="text-muted-foreground mt-2">Don't miss out on this spectacular celebration</p>
            </div>
          </div>
          <EventCard event={featuredEvent} featured />
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Upcoming Events
              </h2>
              <p className="text-muted-foreground mt-2">Discover celebrations near you</p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-primary">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div 
                key={event.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/events">
              <Button variant="outline" className="w-full">
                View All Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Event Categories */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Celebrate Every Occasion
            </h2>
            <p className="text-muted-foreground mt-2">From intimate gatherings to grand celebrations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EVENT_CATEGORIES.slice(0, 5).map((category, index) => (
              <Link 
                key={category.value}
                to={`/events?category=${category.value}`}
                className="bg-card rounded-xl p-6 text-center border border-border hover:border-primary hover:shadow-gold transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sidebar via-sidebar to-accent/30 p-8 md:p-16 text-center">
          <div className="absolute inset-0 bg-pattern-ankara opacity-10" />
          
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-sidebar-foreground mb-4">
              Ready to Host Your Own{" "}
              <span className="text-primary">Celebration?</span>
            </h2>
            <p className="text-sidebar-foreground/70 text-lg max-w-2xl mx-auto mb-8">
              Join Nigeria's premier event platform and create unforgettable experiences. 
              From planning to execution, we've got you covered.
            </p>
            <Link to="/admin">
              <Button className="btn-gold text-lg px-10 py-6 h-auto">
                Get Started Today
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default Index;
