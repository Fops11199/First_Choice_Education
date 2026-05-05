import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, MessageSquare, Star, ArrowRight, Loader2, Bell } from 'lucide-react';

import api from '../../api/api';

const TutorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ subjects: 0, threads: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, we would fetch tutor-specific stats here
    const fetchTutorData = async () => {
      try {
        const subjectsRes = await api.get('/content/subjects');
        const threadsRes = await api.get('/community/threads');
        
        // Mock notification count for now
        setStats({
          subjects: subjectsRes.data.length,
          threads: threadsRes.data.length,
          notifications: 3
        });
      } catch (err) {
        console.error('Failed to fetch tutor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Tutor Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Tutor'}.</h1>
          <p className="text-slate-500 font-medium text-sm">Manage your subjects and engage with students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stat Cards */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Subjects</p>
            <p className="text-2xl font-black text-slate-900">{stats.subjects}</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Threads</p>
            <p className="text-2xl font-black text-slate-900">{stats.threads}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notifications</p>
            <p className="text-2xl font-black text-slate-900">{stats.notifications}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-deep-brown mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent fill-accent" /> Quick Actions
          </h2>
          <div className="space-y-4">
            <Link to="/subjects" className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Browse Subjects</h3>
                  <p className="text-xs text-slate-500">View and manage subject content.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
            </Link>
            
            <Link to="/community" className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Community Discussions</h3>
                  <p className="text-xs text-slate-500">Answer student questions and pin messages.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
