import React from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsTab() {
  const reviews = useQuery(api.reviews.getAll);
  const products = useQuery(api.products.getAll);
  const updateStatus = useMutation(api.reviews.updateStatus);
  const deleteReview = useMutation(api.reviews.deleteReview);

  if (reviews === undefined || products === undefined) {
    return (
      <div className="p-8 font-sans space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-surface-variant/30 animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: Doc<"reviews">) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const pendingCount = reviews.filter((r: Doc<"reviews">) => r.status === "pending").length;

  const getProductName = (productId: string) => {
    const product = products.find((p: Doc<"products">) => p._id === productId);
    return product?.name || "Unknown Product";
  };

  const handleApprove = async (reviewId: Id<"reviews">) => {
    try {
      await updateStatus({ reviewId, status: "approved" });
      toast.success("Review approved");
    } catch { toast.error("Failed to update review"); }
  };

  const handleReject = async (reviewId: Id<"reviews">) => {
    try {
      await updateStatus({ reviewId, status: "rejected" });
      toast.success("Review rejected");
    } catch { toast.error("Failed to update review"); }
  };

  const handleDelete = async (reviewId: Id<"reviews">) => {
    try {
      await deleteReview({ reviewId });
      toast.success("Review deleted");
    } catch { toast.error("Failed to delete review"); }
  };

  return (
    <div className="p-8 font-sans text-on-surface h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Customer Reviews</h2>
          <p className="text-sm text-on-surface-variant">Manage feedback, testimonials, and client sentiments.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-6">
          {pendingCount > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-serif text-amber-600">{pendingCount}</span>
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Pending</span>
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-2xl font-serif text-primary flex items-center gap-2">{avgRating} <Star className="w-5 h-5 fill-primary text-primary" /></span>
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Average Rating</span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center">
          <Star className="w-10 h-10 text-outline mx-auto mb-4" />
          <h3 className="font-serif text-xl text-primary italic mb-2">No reviews yet</h3>
          <p className="text-sm text-on-surface-variant">Customer reviews will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: Doc<"reviews">) => (
            <div key={review._id} className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
              <div className="md:w-64 shrink-0 flex flex-col gap-2">
                <span className="font-sans font-medium text-primary">{review.userId?.slice(0, 12) || "Anonymous"}</span>
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary' : 'fill-none opacity-30'}`} />
                  ))}
                </div>
                <span className="text-xs text-on-surface-variant">{new Date(review._creationTime).toLocaleDateString()}</span>
                <span className="text-[10px] uppercase font-label tracking-wide text-primary bg-surface-container/30 px-2 py-1 mt-2 inline-block w-fit">
                  {getProductName(review.productId)}
                </span>
                <span className={`text-[10px] uppercase font-label tracking-wide px-2 py-1 mt-1 inline-block w-fit ${
                  review.status === 'approved' ? 'bg-green-50 text-green-700' :
                  review.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  'bg-red-950/20 text-red-500'
                }`}>
                  {review.status}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col">
                <p className="font-serif text-primary italic leading-relaxed mb-4">"{review.comment}"</p>
                
                <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-3">
                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(review._id)}
                        className="text-xs font-label uppercase tracking-widest px-4 py-2 bg-primary text-surface hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(review._id)}
                        className="text-xs font-label uppercase tracking-widest px-4 py-2 border border-outline-variant text-primary hover:bg-surface-container/50 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDelete(review._id)}
                    className="text-xs font-label uppercase tracking-widest px-4 py-2 text-red-600 border border-red-900/30 hover:bg-red-950/20 transition-colors flex items-center gap-2 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
