import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewSectionProps {
  productId: Id<"products">;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const reviews = useQuery(api.reviews.getByProduct, { productId });
  const addReview = useMutation(api.reviews.addReview);
  const { isLoaded, isSignedIn, user } = useUser();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addReview({ productId, rating, comment });
      toast.success("Review submitted and is pending approval.");
      setComment("");
      setRating(5);
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
    : 0;

  return (
    <section className="pt-24 border-t border-surface-variant mb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h2 className="font-serif text-3xl md:text-5xl text-primary italic mb-4">Client Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-primary' : 'fill-none opacity-30'}`} />
              ))}
            </div>
            <span className="font-label text-sm tracking-widest text-primary">
              {reviews?.length || 0} {reviews?.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>
        
        {isSignedIn ? (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="font-label text-[11px] tracking-[0.2em] uppercase px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-surface transition-colors"
          >
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        ) : (
          <p className="font-sans text-sm text-on-surface-variant italic">
            Sign in to leave a review.
          </p>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-16 bg-surface-container/30 p-8 border border-outline-variant/50 overflow-hidden"
          >
            <h3 className="font-serif text-2xl text-primary mb-6">Your Experience</h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="font-label text-[10px] tracking-widest uppercase text-outline mr-4">Rating:</span>
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star className={`w-6 h-6 transition-colors ${i < rating ? 'fill-primary text-primary' : 'text-outline-variant'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about the quality, fit, and design..."
              className="w-full bg-surface border border-outline-variant p-4 font-sans text-primary placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors min-h-[120px] mb-6 resize-y"
              required
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="font-label text-[11px] tracking-[0.2em] uppercase px-8 py-4 bg-primary text-surface hover:bg-surface-tint transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        {reviews === undefined ? (
          <div className="font-sans text-sm text-on-surface-variant animate-pulse">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="font-sans text-on-surface-variant py-12 text-center border border-dashed border-outline-variant/50">
            No reviews yet. Be the first to share your experience with this piece.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {reviews.map((review) => (
              <div key={review._id} className="border-t border-surface-variant pt-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-serif text-lg text-primary">{review.userFirstName} {review.userLastName}</span>
                    <span className="font-sans text-xs text-on-surface-variant">
                      {new Date(review._creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-primary' : 'fill-none opacity-30'}`} />
                    ))}
                  </div>
                </div>
                <p className="font-sans text-on-surface-variant leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
