import { Vendor, getVendorCategoryLabel, getVendorCategoryIcon } from '@/types/planner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, BadgeCheck, MessageCircle } from 'lucide-react';

interface VendorCardProps {
  vendor: Vendor;
  onContact: (vendor: Vendor) => void;
  onViewDetails: (vendor: Vendor) => void;
}

const VendorCard = ({ vendor, onContact, onViewDetails }: VendorCardProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: vendor.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const accentColors = ['coral', 'teal', 'purple', 'gold'];
  const accentColor = accentColors[Math.abs(vendor.businessName.length) % accentColors.length];

  return (
    <Card 
      className={`card-celebration overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-${accentColor}/50`}
      onClick={() => onViewDetails(vendor)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={vendor.portfolioImages[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'}
          alt={vendor.businessName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {vendor.verified && (
          <div className="absolute top-3 right-3 bg-teal text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </div>
        )}
        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          {vendor.rating.toFixed(1)}
          <span className="text-white/70 text-xs">({vendor.reviewCount})</span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Business Name */}
        <h3 className="font-display font-semibold text-lg mb-1 text-foreground line-clamp-1">
          {vendor.businessName}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {vendor.location}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {vendor.categories.slice(0, 3).map((category) => (
            <Badge 
              key={category} 
              variant="secondary"
              className="text-xs bg-purple/10 text-purple border-purple/20"
            >
              {getVendorCategoryIcon(category)} {getVendorCategoryLabel(category)}
            </Badge>
          ))}
          {vendor.categories.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{vendor.categories.length - 3}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {vendor.description}
        </p>

        {/* Price Range */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-0.5">Starting from</p>
          <p className="font-display font-bold text-lg text-coral">
            {formatPrice(vendor.priceRangeMin)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-purple/30 text-purple hover:bg-purple/10"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(vendor);
            }}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 btn-coral gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onContact(vendor);
            }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
