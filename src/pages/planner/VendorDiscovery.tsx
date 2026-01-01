import { useState, useEffect } from 'react';
import { Vendor, VendorCategory, VENDOR_CATEGORIES, getVendorCategoryIcon } from '@/types/planner';
import { getAllVendors, seedDemoData, createMessage } from '@/lib/indexedDb';
import { useAuth } from '@/hooks/useAuth';
import VendorCard from '@/components/VendorCard';
import VendorDetailModal from '@/components/VendorDetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Store, X } from 'lucide-react';

const VendorDiscovery = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<VendorCategory[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        // Seed demo data if needed
        await seedDemoData();
        const allVendors = await getAllVendors();
        setVendors(allVendors);
        setFilteredVendors(allVendors);
      } catch (error) {
        console.error('Failed to load vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  // Filter vendors
  useEffect(() => {
    let result = vendors;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.businessName.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((v) =>
        v.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    setFilteredVendors(result);
  }, [searchQuery, selectedCategories, vendors]);

  const toggleCategory = (category: VendorCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const handleContact = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleSendMessage = async (vendor: Vendor, content: string) => {
    if (!user) return;
    
    await createMessage({
      senderId: user.id,
      receiverId: vendor.userId,
      content,
      read: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Find <span className="text-gradient-celebration">Vendors</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover amazing vendors for your celebration
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="w-4 h-4" />
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name, service, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-purple/20 focus:border-purple"
            />
          </div>
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? 'bg-purple/10 border-purple text-purple' : 'border-purple/20'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {selectedCategories.length > 0 && (
              <Badge className="bg-coral text-white ml-1">
                {selectedCategories.length}
              </Badge>
            )}
          </Button>
          {/* Clear Filters */}
          {(searchQuery || selectedCategories.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">Filter by category</p>
            <div className="flex flex-wrap gap-2">
              {VENDOR_CATEGORIES.map((category) => (
                <Button
                  key={category.value}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCategory(category.value)}
                  className={`gap-1.5 transition-all ${
                    selectedCategories.includes(category.value)
                      ? 'bg-purple text-white border-purple hover:bg-purple/90'
                      : 'border-purple/20 hover:border-purple/50'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vendor Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-purple/10 flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-purple" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={clearFilters} variant="outline" className="border-purple/30">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onContact={handleContact}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        vendor={selectedVendor}
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default VendorDiscovery;
