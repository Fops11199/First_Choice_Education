import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { FileText, CheckCircle, Star, ArrowRight, BookOpen, Trophy, Flame, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review state
  const [review, setReview] = useState({ rating: 5, content: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'tutor') {
      return; // Handled by render redirect
    }

    const fetchDashboard = async () => {
      try {
        const [statsRes, enrollmentsRes] = await Promise.all([
          api.get('/students/me/dashboard'),
          api.get('/students/me/enrollments'),
          api.post('/students/me/streak/ping'),
        ]);
        setDashboardStats(statsRes.data);
        setEnrollments(enrollmentsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.content.trim()) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews/', review);
      setReviewSubmitted(true);
      setReview({ rating: 5, content: '' });
    } catch (err) {
      console.error('Failed to submit review', err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUnenroll = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to unenroll from this subject?')) return;
    try {
      await api.delete(`/students/me/enrollments/${subjectId}`);
      setEnrollments(prev => prev.filter(e => e.subject_id !== subjectId));
      // Refresh stats
      const statsRes = await api.get('/students/me/dashboard');
      setDashboardStats(statsRes.data);
    } catch (err) {
      console.error('Failed to unenroll', err);
      alert('Failed to unenroll. Please try again.');
    }
  };

  if (user?.role === 'admin') {
    return <Navigate to="/admin_dashboard" replace />;
  }
  
  if (user?.role === 'tutor') {
    return <Navigate to="/tutor_dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-primary rounded-full"></span>
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Student Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}.</h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm">Continuing GCE {user?.level || 'A-Level'} Preparation</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Flame className="w-6 h-6 fill-orange-500/20" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Study Streak</p>
              <p className="text-xl font-black text-slate-900">{dashboardStats?.current_streak ?? 0} <span className="text-xs font-bold text-slate-400">days</span></p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-6 h-6 fill-emerald-500/20" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-xl font-black text-slate-900">{dashboardStats?.papers_completed ?? 0} <span className="text-xs font-bold text-slate-400">papers</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Subjects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-deep-brown flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              My Enrolled Subjects
            </h2>
            <Link to="/subjects" className="text-primary font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
              Explore Subjects <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid gap-4">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <motion.div
                  key={enrollment.enrollment_id}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-primary/30 transition-all shadow-[0_8px_30px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{enrollment.subject_name}</h3>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Enrollment</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <Link to={`/subjects/${enrollment.subject_id}/papers`} className="w-full sm:w-auto bg-primary text-white py-3.5 px-8 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary/10">
                      Go to Class <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleUnenroll(enrollment.subject_id)}
                      className="text-[9px] font-bold text-slate-300 hover:text-rose-500 transition-colors uppercase tracking-[0.2em] py-2"
                    >
                      Unenroll from Subject
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white border border-slate-100 border-dashed rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-deep-brown mb-2">No subjects yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Browse subjects and enroll to start your preparation.</p>
                <Link to="/subjects" className="btn-primary py-2.5 px-8 inline-flex">Explore Subjects</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-accent" />
            Learning Stats
          </h2>
          
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-8 space-y-6 shadow-xl shadow-primary/10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Trophy className="w-32 h-32 text-accent" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live Summary</p>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{dashboardStats?.enrolled_subjects ?? 0}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Subjects</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{dashboardStats?.papers_completed ?? 0}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Solved</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-accent">{dashboardStats?.current_streak ?? 0}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Streak</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{dashboardStats?.badges_earned ?? 0}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Badges</p>
              </div>
            </div>
          </div>


          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-deep-brown mb-4">How are we doing?</h3>
            {reviewSubmitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">Thank you!</p>
                <p className="text-xs text-slate-500">Your review is being moderated.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${review.rating >= star ? 'text-accent fill-accent' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  placeholder="Share your experience..."
                  value={review.content}
                  onChange={(e) => setReview({ ...review, content: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[80px] font-medium"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-3.5 h-3.5 text-accent" />}
                  Submit Testimonial
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
