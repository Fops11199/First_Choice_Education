import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { FileText, CheckCircle, Star, ArrowRight, BookOpen, Trophy, Flame, Loader2 } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 w-full">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Student Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}.</h1>
          <p className="text-slate-500 font-medium text-sm">Continuing GCE {user?.level || 'A-Level'} Preparation</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 rounded-xl px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Streak</p>
              <p className="text-xl font-bold text-deep-brown">{dashboardStats?.current_streak ?? 0} days</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-xl font-bold text-deep-brown">{dashboardStats?.papers_completed ?? 0} papers</p>
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
            <Link to="/subjects" className="text-primary font-bold text-sm hover:underline">
              Browse All
            </Link>
          </div>
          
          <div className="grid gap-4">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <motion.div
                  key={enrollment.enrollment_id}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/20 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-deep-brown mb-1">{enrollment.subject_name}</h3>
                      <p className="text-xs font-bold text-slate-400">Enrolled since {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link to={`/subjects/${enrollment.subject_id}/papers`} className="btn-primary py-2 px-6 text-sm inline-flex items-center gap-2">
                    View Papers <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="bg-white border border-slate-100 border-dashed rounded-2xl p-12 text-center">
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
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-deep-brown">Your Progress</h2>
          
          <div className="bg-deep-brown text-white rounded-2xl p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Summary</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-black">{dashboardStats?.enrolled_subjects ?? 0}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Subjects</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-black">{dashboardStats?.papers_completed ?? 0}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Solved</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-black">{dashboardStats?.current_streak ?? 0}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Streak</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-black">{dashboardStats?.badges_earned ?? 0}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Badges</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-deep-brown mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent fill-accent" />
              Community Tips
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
              "Focus on Biology Paper 2 from 2018. It covers 40% of the core topics for this year's session."
            </p>
            <button className="text-primary font-semibold text-sm hover:underline">Read more tips</button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
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
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm shadow-slate-200"
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
