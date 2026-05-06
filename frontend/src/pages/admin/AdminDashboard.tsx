import { useState, useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Users, BookOpen, FileText, TrendingUp, PlayCircle, Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

// 🔢 Animated Counter Component (Triggered when in view)
const AnimatedCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration: duration,
                ease: "easeOut",
                onUpdate: (latest) => setDisplayValue(Math.floor(latest))
            });
            return () => controls.stop();
        }
    }, [value, duration, isInView]);

    return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 0,
    total_subjects: 0,
    total_papers: 0,
    total_videos: 0,
    new_signups_week: 0,
    student_trend: "...",
    efficiency: 0,
    resource_trend: "..."
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner - Using Tints, no deep shades */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-gradient-to-br from-blue-500 via-primary to-blue-400 overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-primary/10"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-white/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Administrator Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-[1.2]">
            Platform <br />
            <span className="opacity-90">Management Hub</span>
          </h1>
          <p className="text-white/80 mb-10 text-lg leading-relaxed font-medium">
            Seamlessly oversee your educational ecosystem. Track performance, manage resources, and scale your impact from one central command center.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin_dashboard/subjects" className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/5">
              <Plus className="w-5 h-5" /> Add New Content
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.total_students} icon={<Users className="w-6 h-6" />} color="from-blue-400 to-blue-500" trend={stats.student_trend} />
        <StatCard title="Active Subjects" value={stats.total_subjects} icon={<BookOpen className="w-6 h-6" />} color="from-blue-500 to-blue-600" trend="Active" />
        <StatCard title="Solved Papers" value={stats.total_papers} icon={<FileText className="w-6 h-6" />} color="from-primary to-blue-400" trend={stats.resource_trend} />
        <StatCard title="Video Solutions" value={stats.total_videos} icon={<PlayCircle className="w-6 h-6" />} color="from-blue-400 to-primary" trend="Live" />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="xl:col-span-2 space-y-6 min-w-0"
        >
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Recent Content</h2>
              <p className="text-sm font-medium text-slate-400">Latest subjects added to the platform</p>
            </div>
            <Link to="/admin_dashboard/subjects" className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-all">
              View Directory <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-blue-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-50">
              {recentSubjects.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-blue-50/30 text-blue-400 font-bold uppercase text-[10px] tracking-[0.15em] border-b border-blue-50">
                    <tr>
                      <th className="px-8 py-5">Subject Details</th>
                      <th className="px-8 py-5">GCE Level</th>
                      <th className="px-8 py-5">Resources</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
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
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-200">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-semibold text-lg mb-2">No subjects found</p>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">Start building your educational library by adding your first subject.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Platform Health Sidebar */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
        >
          <div className="px-2">
            <h2 className="text-2xl font-bold text-slate-800">Platform Health</h2>
            <p className="text-sm font-medium text-slate-400">Live system status and metrics</p>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-100/20 p-8 space-y-10 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="relative flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Modern Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-blue-50/50"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 552.92 }}
                    whileInView={{ strokeDashoffset: 552.92 * (1 - stats.efficiency / 100) }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    viewport={{ once: true }}
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={552.92}
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-slate-800 tracking-tight">
                    <AnimatedCounter value={stats.efficiency} />
                    <span className="text-2xl opacity-50">%</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Video Coverage</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-blue-50">
              <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 group/item hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center group-hover/item:scale-110 transition-transform shadow-sm">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">New Students</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Past 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    +<AnimatedCounter value={stats.new_signups_week} />
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 group/item hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center group-hover/item:scale-110 transition-transform shadow-sm">
                    <PlayCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">Video Base</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total solutions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    <AnimatedCounter value={stats.total_videos} />
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">System Status</p>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                    All core services are operational. Automated backups complete.
                </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="relative group bg-white rounded-[2rem] border border-blue-50 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-200/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-8">
      <div className={`bg-gradient-to-br ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-wider">{trend}</span>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-4xl font-bold text-slate-800 tracking-tight">
        <AnimatedCounter value={value} />
      </h3>
    </div>
    
    <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-t-full bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
  </motion.div>
);

const RecentSubjectRow = ({ name, level, papers, onEdit }: any) => (
  <tr className="hover:bg-blue-50/20 transition-all group">
    <td className="px-8 py-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-base leading-tight mb-0.5">{name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added recently</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-6">
      <span className={`text-[10px] font-bold px-4 py-1.5 rounded-lg border uppercase tracking-[0.1em] ${
        level === 'A-Level' 
          ? 'bg-blue-50 text-primary border-blue-100' 
          : 'bg-white text-primary border-blue-100'
      }`}>
        {level}
      </span>
    </td>
    <td className="px-8 py-6">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-md bg-blue-50/50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-blue-400">
              PDF
            </div>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-500 ml-2">{papers} Files</span>
      </div>
    </td>
    <td className="px-8 py-6 text-right">
      <button 
        onClick={onEdit}
        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-primary/10"
      >
        Manage
      </button>
    </td>
  </tr>
);

export default AdminDashboard;
