import { motion } from 'motion/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

export function ReviewsTab() {
  const reviews = useQuery(api.reviews.getAllReviewsAdmin) || [];
  const updateReviewStatus = useMutation(api.reviews.updateReviewStatus);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const handleStatusUpdate = async (id: any, status: string) => {
    try {
      await updateReviewStatus({ id, status });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Permanently remove this testimony?")) {
      try {
        await deleteReview({ id });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">Word of Mouth</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Testimony Feed</h1>
          </div>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="py-16 text-center text-espresso/50 border border-dashed border-espresso/20">
          <p className="font-serif text-xl italic mb-2">No testimonies yet.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((rev: any) => (
          <div key={rev._id} className="bg-white border border-espresso/10 p-10 flex flex-col justify-between shadow-none rounded-none relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/30">
              {new Date(rev._creationTime).toLocaleDateString()}
            </div>
            
            <div className="mb-4">
              <span className={`font-sans text-[8px] uppercase tracking-[0.3em] px-2 py-1 border ${rev.status === 'approved' ? 'border-emerald-900/20 text-emerald-900 bg-emerald-50' : rev.status === 'pending' ? 'border-amber-900/20 text-amber-900 bg-amber-50' : 'border-red-900/20 text-red-900 bg-red-50'}`}>
                {rev.status}
              </span>
            </div>

            <p className="font-serif italic text-2xl leading-relaxed text-espresso mt-4">
              "{rev.comment}"
            </p>
            
            <div className="mt-12 pt-6 border-t border-espresso/10 flex justify-between items-end">
              <div>
                <p className="font-serif text-lg tracking-wide">{rev.userName}</p>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/50 mt-1">Ref: {rev.productName}</p>
              </div>
              <div className="flex gap-4">
                {rev.status !== 'approved' && (
                  <button onClick={() => handleStatusUpdate(rev._id, 'approved')} className="text-emerald-900/40 hover:text-emerald-900 transition-colors" title="Approve"><CheckCircle strokeWidth={1} className="w-5 h-5" /></button>
                )}
                {rev.status !== 'rejected' && (
                   <button onClick={() => handleStatusUpdate(rev._id, 'rejected')} className="text-red-900/40 hover:text-red-900 transition-colors" title="Reject"><XCircle strokeWidth={1} className="w-5 h-5" /></button>
                )}
                <button onClick={() => handleDelete(rev._id)} className="text-espresso/10 hover:text-espresso transition-colors ml-2" title="Delete"><Trash2 strokeWidth={1} className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </motion.div>
  );
}
