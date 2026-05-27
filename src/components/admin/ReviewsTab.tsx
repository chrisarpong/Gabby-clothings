import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

const mockReviews = [
  { id: 1, author: "Eleanor Vance", rating: 5, product: "Midnight Atelier Campaign Noir", date: "2 days ago", comment: "Absolutely exquisite tailoring. The fabric quality is beyond my expectations, and the fit is perfection. I will definitely be returning for my winter wardrobe.", status: "published" },
  { id: 2, author: "Theodora Crain", rating: 4, product: "Ivory Shadows Collection", date: "1 week ago", comment: "Beautiful styling and decent material. There was a slight delay in shipping, but the customer service was incredibly communicative.", status: "published" },
  { id: 3, author: "Luke Crain", rating: 5, product: "Heritage Kaftan", date: "2 weeks ago", comment: "A true piece of art. The attention to detail on the embroidery is stunning.", status: "pending" }
];

export default function ReviewsTab() {
  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Customer Reviews</h2>
          <p className="text-sm text-on-surface-variant">Manage feedback, testimonials, and client sentiments.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-2xl font-serif text-primary flex items-center gap-2">4.8 <Star className="w-5 h-5 fill-primary text-primary" /></span>
             <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Average Rating</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="bg-white border border-outline-variant/30 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
            <div className="md:w-64 shrink-0 flex flex-col gap-2">
               <span className="font-sans font-medium text-primary">{review.author}</span>
               <div className="flex text-primary">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary' : 'fill-none opacity-30'}`} />
                 ))}
               </div>
               <span className="text-xs text-on-surface-variant">{review.date}</span>
               <span className="text-[10px] uppercase font-label tracking-wide text-primary bg-surface-container/30 px-2 py-1 mt-2 inline-block w-fit">
                 {review.product}
               </span>
            </div>
            
            <div className="flex-1 flex flex-col">
              <p className="font-serif text-primary italic leading-relaxed mb-4">"{review.comment}"</p>
              
              <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-3">
                {review.status === 'pending' && (
                  <button className="text-xs font-label uppercase tracking-widest px-4 py-2 bg-primary text-surface hover:bg-primary/90 transition-colors">
                    Approve
                  </button>
                )}
                 <button className="text-xs font-label uppercase tracking-widest px-4 py-2 border border-outline-variant hover:bg-surface-container/30 transition-colors text-primary flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Reply
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
