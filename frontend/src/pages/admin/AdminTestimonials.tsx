import { useState, useEffect } from 'react';
import api from '../../api/api';
import { Star, Check, Trash2, Loader2, ShieldCheck, User, Globe, Clock, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AdminTestimonials = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'live'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchReviews = async (status: 'pending' | 'live') => {
    setLoading(true);
    try {
      const isApproved = status === 'live';
      const res = await api.get(`/admin/reviews/all?approved=${isApproved}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      toast.error("Fetch Failed", { description: "Could not retrieve testimonials." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/reviews/${id}/approve`);
      toast.success("Review Approved", { description: "It is now visible on the landing page." });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      toast.error("Approval Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnapprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/reviews/${id}/unapprove`);
      toast.info("Review Hidden", { description: "Moved back to pending queue." });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      toast.error("Action Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget);
    try {
      await api.delete(`/admin/reviews/${deleteTarget}`);
      toast.success("Deleted permanently");
      setReviews(reviews.filter(r => r.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Header & Tabs */}
      <div className="px-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Testimonials Center</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {activeTab === 'pending' ? 'Curate new student feedback for public display.' : 'Manage feedback currently visible on the landing page.'}
          </p>
        </div>

        <div className="flex bg-blue-50/50 p-1 rounded-2xl border border-blue-100 self-start">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Clock className="w-4 h-4" /> Pending
                {activeTab === 'pending' && reviews.length > 0 && (
                    <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">{reviews.length}</span>
                )}
            </button>
            <button 
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'live' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Globe className="w-4 h-4" /> Live on Site
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-50 border-t-primary rounded-full animate-spin"></div>
            <Star className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 font-bold mt-6 uppercase tracking-widest text-[10px]">Updating Feed...</p>
        </div>
      ) : reviews.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-blue-50 border-dashed rounded-3xl p-24 text-center shadow-sm mx-4"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
            {activeTab === 'pending' ? <ShieldCheck className="w-12 h-12" /> : <Globe className="w-12 h-12 text-slate-300" />}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTab === 'pending' ? 'All Caught Up!' : 'No Live Reviews Yet'}</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            {activeTab === 'pending' 
                ? 'All student testimonials have been processed and verified.' 
                : 'Approved testimonials will appear here for management.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-white border border-blue-50 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-blue-100/20 transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-1.5 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium italic mb-10 leading-relaxed text-lg">
                    "{review.content}"
                  </p>
                </div>
                
                <div className="relative z-10 pt-8 border-t border-blue-50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                      {review.full_name?.charAt(0) || <User className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student Contributor</p>
                      <p className="text-sm font-bold text-slate-800">{review.full_name || 'Anonymous Student'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {activeTab === 'pending' ? (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleApprove(review.id)}
                            disabled={actionLoading === review.id}
                            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Approve
                        </motion.button>
                    ) : (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUnapprove(review.id)}
                            disabled={actionLoading === review.id}
                            className="flex-[2] py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-blue-50 hover:text-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-transparent hover:border-blue-100"
                        >
                            {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                            Take Offline
                        </motion.button>
                    )}
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-bold text-xs hover:bg-red-50 hover:text-red-500 border border-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteAction}
        isLoading={actionLoading === deleteTarget}
        title="Burn Testimonial?"
        message="Are you sure you want to permanently delete this student feedback? This action cannot be undone."
        confirmText="Yes, Burn It"
        cancelText="Keep Review"
        type="danger"
      />
    </div>
  );
};

export default AdminTestimonials;
