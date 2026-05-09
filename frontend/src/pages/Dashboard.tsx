import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { FileText, ArrowRight, BookOpen, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingMap, setEnrollingMap] = useState<{[key: string]: boolean}>({});
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'tutor') {
      return; // Handled by render redirect
    }

    const fetchDashboard = async () => {
      try {
        const [statsRes, levelsRes, enrolRes] = await Promise.all([
          api.get('/students/me/dashboard'),
          api.get('/content/levels'),
          api.get('/students/me/enrollments'),
          api.post('/students/me/streak/ping'),
        ]);
        setDashboardStats(statsRes.data);
        setLevels(levelsRes.data);
        setEnrollments(enrolRes.data);
        
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

  const handleEnroll = async (subjectId: string) => {
    setEnrollingMap(prev => ({ ...prev, [subjectId]: true }));
    try {
      await api.post('/students/me/enrollments', { subject_id: subjectId });
      const res = await api.get('/students/me/enrollments');
      setEnrollments(res.data);
      // Also update dashboard stats
      const statsRes = await api.get('/students/me/dashboard');
      setDashboardStats(statsRes.data);
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrollingMap(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const handleUnenroll = async (subjectId: string) => {
    setEnrollingMap(prev => ({ ...prev, [subjectId]: true }));
    try {
      await api.delete(`/students/me/enrollments/${subjectId}`);
      const res = await api.get('/students/me/enrollments');
      setEnrollments(res.data);
      const statsRes = await api.get('/students/me/dashboard');
      setDashboardStats(statsRes.data);
      setShowUnenrollConfirm(null);
    } catch (err) {
      console.error('Failed to unenroll:', err);
      alert('Failed to unenroll.');
    } finally {
      setEnrollingMap(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const filteredSubjects = subjects.filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()));


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
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Level:</p>
          <div className="relative group w-full sm:w-48">
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 hover:border-primary/30 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:rotate-180 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search subjects..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
        />
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
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => {
                const isEnrolled = enrollments.some(e => e.subject_id === subject.id);
                const isEnrolling = enrollingMap[subject.id];

                return (
                  <motion.div
                    key={subject.id}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-primary/30 transition-all shadow-[0_8px_30px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden group"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isEnrolled ? 'bg-primary' : 'bg-slate-200'} transform -translate-x-full group-hover:translate-x-0 transition-transform`}></div>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${isEnrolled ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-slate-50 text-slate-400'} flex items-center justify-center transition-colors shrink-0`}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-1">{subject.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {subject.papers?.length ?? 0} Papers Available
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Link to={`/subjects/${subject.id}/papers`} className="flex-1 bg-primary/5 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                          Access Papers <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button 
                          onClick={() => setShowUnenrollConfirm(subject.id)}
                          disabled={isEnrolling}
                          className="px-3 py-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Unenroll"
                        >
                          {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(subject.id)}
                        disabled={isEnrolling}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all mt-2"
                      >
                        {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-3 h-3" />} Enroll to Access
                      </button>
                    )}
                  </motion.div>
                );
              })
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

        </div>

      </div>

      {/* Unenroll Confirmation Modal */}
      <AnimatePresence>
          {showUnenrollConfirm && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                  <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                      onClick={() => setShowUnenrollConfirm(null)}
                  />
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white w-full max-w-sm rounded-3xl p-10 relative shadow-2xl border border-blue-50 z-10"
                  >
                      <div className="flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                              <AlertCircle className="w-10 h-10" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unenroll?</h2>
                          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
                              You'll lose quick access to this subject and its papers.
                          </p>
                          
                          <div className="flex flex-col w-full gap-4">
                              <button 
                                  onClick={() => handleUnenroll(showUnenrollConfirm)}
                                  className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                              >
                                  Confirm Unenroll
                              </button>
                              <button 
                                  onClick={() => setShowUnenrollConfirm(null)}
                                  className="w-full py-5 bg-white text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 border border-blue-50 transition-all"
                              >
                                  Keep Subject
                              </button>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
