import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, FileText, TrendingUp, PlayCircle, Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    total_subjects: 0,
    total_papers: 0,
    total_videos: 0
  });
  const [recentSubjects, setRecentSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, subjectsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/recent-subjects')
        ]);
        setStats(statsRes.data);
        setRecentSubjects(subjectsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-primary overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-lg shadow-primary/20"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <p className="text-primary-light font-bold text-sm tracking-widest uppercase mb-3">Administrator Portal</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
            Manage the First Choice Education Platform
          </h1>
          <p className="text-blue-100 mb-8 max-w-lg leading-relaxed">
            Welcome back to the control center. Here you can oversee subjects, moderate forum threads, and manage student accounts to ensure the best learning experience.
          </p>
          <Link to="/admin_dashboard/subjects" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Add New Content
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.total_students.toLocaleString()} icon={<Users className="w-6 h-6" />} color="bg-blue-500" trend="Active users" />
        <StatCard title="Active Subjects" value={stats.total_subjects.toLocaleString()} icon={<BookOpen className="w-6 h-6" />} color="bg-indigo-500" trend="In database" />
        <StatCard title="Solved Papers" value={stats.total_papers.toLocaleString()} icon={<FileText className="w-6 h-6" />} color="bg-purple-500" trend="Verified files" />
        <StatCard title="Video Solutions" value={stats.total_videos.toLocaleString()} icon={<PlayCircle className="w-6 h-6" />} color="bg-pink-500" trend="HD content" />
      </div>

      {/* Recent Activity & Management Areas */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recently Added Subjects</h2>
            <Link to="/admin_dashboard/subjects" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {recentSubjects.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Subject Name</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Papers</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubjects.map((subject) => (
                    <RecentSubjectRow 
                      key={subject.id}
                      id={subject.id}
                      name={subject.name} 
                      level={subject.level} 
                      papers={subject.paper_count} 
                      onEdit={() => navigate(`/admin_dashboard/subjects/${subject.id}/papers`)}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 font-semibold">
                No subjects found. Start by adding one.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Platform Health</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-8 border-slate-50 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-l-transparent transform rotate-45"></div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900">98%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Signups</p>
                    <p className="text-xs font-semibold text-slate-500">Last 7 days</p>
                  </div>
                </div>
                <p className="text-sm font-black text-green-500">+245</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Video Views</p>
                    <p className="text-xs font-semibold text-slate-500">Last 24 hours</p>
                  </div>
                </div>
                <p className="text-sm font-black text-blue-500">12.4k</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{trend}</span>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
  </motion.div>
);

const RecentSubjectRow = ({ id, name, level, papers, onEdit }: any) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="font-bold text-slate-700">{name}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
        level === 'A-Level' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {level}
      </span>
    </td>
    <td className="px-6 py-4 font-semibold text-slate-600">{papers} files</td>
    <td className="px-6 py-4 text-right">
      <button 
        onClick={onEdit}
        className="text-sm font-bold text-primary hover:text-primary-light transition-colors"
      >
        Edit
      </button>
    </td>
  </tr>
);

export default AdminDashboard;
