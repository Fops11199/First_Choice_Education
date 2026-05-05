import { useState, useEffect } from 'react';
import api from '../../api/api';
import { Star, Check, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTestimonials = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin/pending');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/reviews/admin/${id}/approve`);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      console.error('Approve failed', err);
      alert('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete/reject this review?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/reviews/admin/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Testimonials Management</h1>
        <p className="text-slate-500 font-medium">Review and approve student testimonials for the landing page.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-deep-brown mb-2">No pending reviews</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">All student testimonials have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium italic mb-6 leading-relaxed">"{review.content}"</p>
                </div>
                
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        U
                      </div>
                      <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">User ID: {review.user_id.substring(0,8)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      {actionLoading === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
