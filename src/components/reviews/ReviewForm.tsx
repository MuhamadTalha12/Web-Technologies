import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface ReviewFormProps {
  bookingId: string;
  serviceId: string;
  providerId: string;
  customerId: string;
  onSuccess: () => void;
}

export function ReviewForm({ bookingId, serviceId, providerId, customerId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: bookingId,
          service_id: serviceId,
          provider_id: providerId,
          customer_id: customerId,
          rating,
          comment: comment || null,
        }),
      });

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback.',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-muted/50 rounded-xl"
    >
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Review
          </>
        )}
      </Button>
    </motion.form>
  );
}
