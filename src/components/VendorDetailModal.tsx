import { useState } from 'react';
import { Vendor, getVendorCategoryLabel, getVendorCategoryIcon } from '@/types/planner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapPin, BadgeCheck, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface VendorDetailModalProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (vendor: Vendor, message: string) => void;
}

const VendorDetailModal = ({ vendor, isOpen, onClose, onSendMessage }: VendorDetailModalProps) => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');

  if (!vendor) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: vendor.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    onSendMessage(vendor, message);
    setMessage('');
    setShowMessageForm(false);
    toast.success('Message sent to ' + vendor.businessName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {vendor.businessName}
            {vendor.verified && (
              <Badge className="bg-teal text-white gap-1">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Image Gallery */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-4">
          <img
            src={vendor.portfolioImages[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'}
            alt={vendor.businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-gold text-gold" />
            {vendor.rating.toFixed(1)}
            <span className="text-white/70">({vendor.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Location & Categories */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {vendor.location}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vendor.categories.map((category) => (
              <Badge 
                key={category} 
                variant="secondary"
                className="bg-purple/10 text-purple border-purple/20"
              >
                {getVendorCategoryIcon(category)} {getVendorCategoryLabel(category)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="font-display font-semibold mb-2">About</h4>
          <p className="text-muted-foreground">{vendor.description}</p>
        </div>

        {/* Price Range */}
        <div className="bg-gradient-to-r from-coral/10 to-gold/10 rounded-xl p-4 mb-6">
          <h4 className="font-display font-semibold mb-2">Price Range</h4>
          <p className="text-2xl font-bold text-coral">
            {formatPrice(vendor.priceRangeMin)} - {formatPrice(vendor.priceRangeMax)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Final price depends on event size and requirements
          </p>
        </div>

        {/* Message Form */}
        {showMessageForm ? (
          <div className="border border-purple/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-semibold">Send a Message</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowMessageForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder={`Hi ${vendor.businessName}, I'm interested in your services for my upcoming event...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-3 min-h-[100px] border-purple/20"
            />
            <Button onClick={handleSendMessage} className="w-full btn-coral gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setShowMessageForm(true)} 
            className="w-full btn-coral gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Contact {vendor.businessName}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailModal;
