import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
            className={`w-4 h-4 ${i < rating ? 'fill-[#3a1f1d] text-[#3a1f1d]' : 'text-[#3a1f1d]/15'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Reviews
        </h2>
        <p className="text-sm text-[#3a1f1d]/60 mt-1">Moderate customer feedback and testimonials</p>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#3a1f1d]/8">
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Date</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Product</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Rating</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Comment</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Status</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a1f1d]/5">
              {reviews === undefined ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#3a1f1d]/40">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#3a1f1d]/40">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-[#FDFBF9] transition-colors group">
                    <td className="py-4 px-6 text-sm text-[#3a1f1d]/60">
                      {new Date(review._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-sm font-medium text-[#2C1816]">{review.userName}</span>
                        <p className="text-[10px] text-[#3a1f1d]/40 uppercase tracking-wide">Verified Client</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#3a1f1d]/70 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {review.productName}
                    </td>
                    <td className="py-4 px-6">
                      {renderStars(review.rating)}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-sm text-[#3a1f1d]/70 line-clamp-2 leading-relaxed">"{review.comment}"</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${review.status === 'hidden' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {review.status || 'approved'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(review._id, review.status || 'approved')}
                          className="h-8 w-8 p-0 text-[#3a1f1d]/30 hover:text-[#3a1f1d] hover:bg-transparent"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
