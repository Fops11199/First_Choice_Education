import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Edit2, Trash2, Loader2, FileText, ChevronRight, ArrowUpRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../api/api';

const AdminSubjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', level_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedLevelId]);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/levels');
      setLevels(res.data);
    } catch (err) {
      console.error("Failed to fetch levels:", err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = selectedLevelId !== 'all' ? { level_id: selectedLevelId } : {};
      const res = await api.get('/admin/subjects', { params });
      setSubjects(res.data);
    } catch (err) {
      toast.error("Fetch Failed", { description: "Could not retrieve subjects." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ 
      name: '', 
      level_id: selectedLevelId !== 'all' ? selectedLevelId : '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: any) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, level_id: subject.level_id });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.level_id) return;
    
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/admin/subjects/${editingSubject.id}`, formData);
        toast.success("Subject Updated");
      } else {
        await api.post('/admin/subjects', formData);
        toast.success("Subject Published");
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.response?.data?.detail || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? All associated papers will be affected.`)) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      toast.success("Subject Removed");
      fetchSubjects();
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  const filteredSubjects = subjects.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Subject Directory</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Organize and manage the GCE library.</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-primary hover:bg-blue-500 text-white flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-semibold text-sm shadow-xl shadow-primary/10 transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Subject
        </motion.button>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 space-y-6">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Filter className="w-3 h-3" /> Select GCE Level
          </p>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <button
              onClick={() => setSelectedLevelId('all')}
              className={`whitespace-nowrap px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest border transition-all ${
                selectedLevelId === 'all' 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-white text-slate-400 border-blue-50 hover:border-primary/30 hover:text-primary'
              }`}
            >
              All Levels
            </button>
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevelId(level.id)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest border transition-all ${
                  selectedLevelId === level.id 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white text-slate-400 border-blue-50 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search for a subject (e.g. Mathematics)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-blue-50 rounded-[2rem] text-base font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-50 text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-widest">
            {filteredSubjects.length} Found
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="px-4">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-6 text-slate-400 font-semibold text-sm uppercase tracking-widest">Loading Subject Base...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-blue-50">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-200">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No subjects matched your search</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Try a different name or clear your level filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSubjects.map((sub) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={sub.id}
                  className="bg-white border border-blue-50 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{sub.name}</h3>
                        <span className="text-[10px] font-bold text-primary bg-blue-50/50 px-3 py-1 rounded-lg uppercase tracking-wider">
                          {sub.level_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(sub)} className="p-3 text-slate-300 hover:text-primary hover:bg-blue-50 rounded-xl transition-all">
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(sub.id, sub.name)} className="p-3 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-blue-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-semibold">{sub.papers?.length || 0} Solved Papers</span>
                        </div>
                        <button 
                            onClick={() => navigate(`/admin_dashboard/subjects/${sub.id}/papers`)}
                            className="flex items-center gap-2 text-primary font-bold text-xs hover:gap-3 transition-all"
                        >
                            Manage Content <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-blue-50 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner">
                  <BookOpen className="w-8 h-8" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">{editingSubject ? "Update Subject" : "New Subject"}</h2>
                <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">Expand the educational directory by adding a new subject.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Subject Title</label>
                    <input 
                      type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Physics"
                      className="w-full px-6 py-4 bg-blue-50/20 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Level Category</label>
                    <div className="relative">
                        <select 
                            required value={formData.level_id} onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                            className="w-full px-6 py-4 bg-blue-50/20 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary appearance-none cursor-pointer font-semibold text-slate-700"
                        >
                            <option value="">Select Level</option>
                            {levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 w-5 h-5 text-blue-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-all">Discard</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{editingSubject ? "Save Changes" : "Create Subject"} <ArrowUpRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubjects;
