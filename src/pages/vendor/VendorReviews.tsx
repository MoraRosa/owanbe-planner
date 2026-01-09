import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  clientName: string;
  eventType: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  replied: boolean;
}

const demoReviews: Review[] = [
  {
    id: '1',
    clientName: 'Folake Adeyemi',
    eventType: 'Wedding',
    rating: 5,
    comment: 'Absolutely incredible service! The photos captured every special moment of our wedding day. Professional, punctual, and the final album exceeded all our expectations. Highly recommend!',
    date: '2025-12-01',
    helpful: 12,
    replied: true,
  },
  {
    id: '2',
    clientName: 'Chinedu Obi',
    eventType: 'Birthday Party',
    rating: 5,
    comment: 'Amazing work on my mother\'s 60th birthday celebration. The team was so professional and made everyone feel comfortable. The photos are beautiful!',
    date: '2025-11-15',
    helpful: 8,
    replied: false,
  },
  {
    id: '3',
    clientName: 'Aisha Mohammed',
    eventType: 'Naming Ceremony',
    rating: 4,
    comment: 'Great photos and very responsive communication. Only reason for 4 stars is the delivery took a bit longer than expected, but the quality was worth the wait.',
    date: '2025-10-20',
    helpful: 5,
    replied: true,
  },
];

export default function VendorReviews() {
  const [reviews] = useState<Review[]>(demoReviews);
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-gold fill-gold' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">See what clients are saying about your services</p>
      </div>

      {/* Rating Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-muted-foreground">{reviews.length} reviews</p>
            </div>

            <div className="mt-6 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-3 text-sm text-muted-foreground">{rating}</span>
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="w-8 text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Review Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-teal/5 border border-teal/20">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-5 h-5 text-teal" />
                  <span className="font-medium">Most Praised</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Professional</Badge>
                  <Badge variant="secondary">Quality</Badge>
                  <Badge variant="secondary">Punctual</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-gold" />
                  <span className="font-medium">5-Star Rate</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">All Reviews</h2>
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple to-coral text-cream">
                    {review.clientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{review.clientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <Badge variant="secondary" className="text-xs">
                          {review.eventType}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <p className="mt-3 text-muted-foreground">{review.comment}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </Button>
                    {!review.replied && (
                      <Button variant="ghost" size="sm" className="gap-1 text-teal">
                        <MessageSquare className="w-4 h-4" />
                        Reply
                      </Button>
                    )}
                    {review.replied && (
                      <Badge variant="outline" className="text-xs">Replied</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
