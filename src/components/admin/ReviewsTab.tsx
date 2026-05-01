import React from 'react';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';

interface ReviewsTabProps {
  reviews: any[];
  updateReviewStatus: any;
  deleteReview: any;
}

export const ReviewsTab = ({
  reviews,
  updateReviewStatus,
  deleteReview,
}: ReviewsTabProps) => {

  const handleToggleStatus = async (reviewId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'approved' : 'hidden';
    toast.promise(updateReviewStatus({ reviewId: reviewId as any, status: newStatus }), {
      loading: 'Updating visibility...',
      success: `Review ${newStatus === 'approved' ? 'visible' : 'hidden'}`,
      error: 'Failed to update visibility',
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this review?")) {
      toast.promise(deleteReview({ reviewId: reviewId as any }), {
        loading: 'Deleting review...',
        success: 'Review deleted',
        error: 'Failed to delete review',
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? 'fill-[#3a1f1d] text-[#3a1f1d]' : 'text-[#3a1f1d]/20'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <header className="mb-16">
        <h1 className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Review Moderation
        </h1>
        <p className="text-[16px] tracking-[0.01em] text-[#504443] max-w-xl" style={{ fontFamily: "'Jost', sans-serif" }}>
          Manage client feedback and storefront visibility. Ensure only the most authentic and elegant testimonials grace your atelier.
        </p>
      </header>

      {/* Reviews Table */}
      <div className="border border-[#3a1f1d]/10 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/10 hover:bg-transparent">
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Date</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Client</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Product</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Rating</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Comment</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14" style={{ fontFamily: "'Jost', sans-serif" }}>Status</TableHead>
              <TableHead className="font-semibold tracking-[0.15em] text-[#504443] uppercase text-[11px] h-14 text-right" style={{ fontFamily: "'Jost', sans-serif" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[13px] text-[#504443] italic">Syncing reviews...</TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-[13px] text-[#504443] italic">No reviews found.</TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#faf9f7] transition-colors group">
                  <TableCell className="text-[13px] py-6" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {new Date(review._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[15px] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>{review.userName}</span>
                      <span className="text-[10px] text-[#504443] tracking-wider uppercase">Verified Client</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[15px] font-normal italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {review.productName}
                  </TableCell>
                  <TableCell>
                    {renderStars(review.rating)}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-[14px] text-[#504443] line-clamp-2 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                      "{review.comment}"
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-semibold tracking-[0.15em] uppercase px-2 py-1 ${review.status === 'hidden' ? 'bg-red-50 text-red-700/70' : 'bg-green-50 text-green-700/70'}`} style={{ fontFamily: "'Jost', sans-serif" }}>
                      {review.status || 'approved'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(review._id, review.status || 'approved')}
                        className="h-8 w-8 p-0 text-[#3a1f1d]/40 hover:text-[#3a1f1d] hover:bg-transparent"
                      >
                        {review.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review._id)}
                        className="h-8 w-8 p-0 text-red-700/30 hover:text-red-700 hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
