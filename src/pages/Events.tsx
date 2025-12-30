import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/CustomerLayout";
import { EventCard } from "@/components/EventCard";
import { Event, EVENT_CATEGORIES, EventCategory } from "@/types/event";
import { getEvents, seedSampleData } from "@/lib/storage";

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">(
    (searchParams.get("category") as EventCategory) || "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    seedSampleData();
    const allEvents = getEvents();
    const upcoming = allEvents.filter(e => e.status === 'upcoming');
    setEvents(upcoming);
    setFilteredEvents(upcoming);
  }, []);

  useEffect(() => {
    let filtered = events;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: EventCategory | "all") => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-purple/10 via-coral/5 to-teal/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover <span className="text-coral">Amazing</span> Events
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find your next celebration from weddings to owambe parties
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple" />
              <Input
                type="text"
                placeholder="Search events, venues, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg bg-card border-2 border-purple/20 focus:border-purple"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-coral"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {/* Category Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-8`}>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => handleCategoryChange("all")}
              className={selectedCategory === "all" ? "btn-purple" : "border-purple/30 hover:bg-purple/10"}
            >
              All Events
            </Button>
            {EVENT_CATEGORIES.map((category, index) => {
              const colors = ['btn-coral', 'btn-gold', 'btn-purple', 'bg-teal text-white', 'btn-coral'];
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category.value)}
                  className={selectedCategory === category.value ? colors[index % colors.length] : "border-teal/30 hover:bg-teal/10"}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> events
          </p>
        </div>

        {/* Event Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              No Events Found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button onClick={() => { setSearchQuery(""); handleCategoryChange("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>
    </CustomerLayout>
  );
};

export default Events;
