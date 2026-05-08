import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { FileText, CheckCircle, Star, ArrowRight, BookOpen, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import AdvertBanner from '../components/AdvertBanner';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Review state
  const [review, setReview] = useState({ rating: 5, content: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [canShowReview, setCanShowReview] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'tutor') {
      return; // Handled by render redirect
    }

    const fetchDashboard = async () => {
      try {
        const [statsRes, levelsRes] = await Promise.all([
          api.get('/students/me/dashboard'),
          api.get('/content/levels'),
          api.post('/students/me/streak/ping'),
        ]);
        setDashboardStats(statsRes.data);
        setLevels(levelsRes.data);
        
        // Auto-select user's level or first level
        if (levelsRes.data.length > 0) {
          const userLevel = levelsRes.data.find((l: any) => l.name === user?.level);
          setSelectedLevelId(userLevel?.id || levelsRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    // Show review form after 2 minutes to prevent spam
    const timer = setTimeout(() => setCanShowReview(true), 120000);
    return () => clearTimeout(timer);
  }, [user]);

  // Fetch subjects when level changes
  useEffect(() => {
    if (!selectedLevelId) return;
    
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await api.get(`/content/subjects?level_id=${selectedLevelId}`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedLevelId]);

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
    <div className="main-container">
      {/* Adverts Banner */}
      <AdvertBanner />

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
        
        <div className="flex flex-wrap gap-3 items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Change Level:</p>
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevelId(level.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                selectedLevelId === level.id
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-primary/30'
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Subjects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingSubjects ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-xl"></div>
              ))
            ) : subjects.length > 0 ? (
              subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-primary/30 transition-all shadow-[0_8px_30px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-1">{subject.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {subject.paper_count || 0} Papers Available
                      </p>
                    </div>
                  </div>
                  <Link to={`/subjects/${subject.id}/papers`} className="w-full bg-primary/5 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                    Access Papers <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-100 border-dashed rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-deep-brown mb-2">No subjects found</h3>
                <p className="text-slate-500 text-sm mx-auto">No subjects have been added to this level yet.</p>
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


          {canShowReview && (
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
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
