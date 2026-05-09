import { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Save, 
  X,
  AlertCircle,
  Check,
  Undo2,
  History,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Level {
  id: string;
  name: string;
  is_deleted?: boolean;
  deleted_at?: string;
}

const AdminLevels = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [isPermanent, setIsPermanent] = useState(false);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/levels?trash=${activeTab === 'trash'}`);
      setLevels(res.data);
    } catch (err) {
      console.error('Failed to fetch levels', err);
      toast.error("Fetch Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [activeTab]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setActionLoading('adding');
    try {
      const res = await api.post('/admin/levels', { name: newName });
      setLevels([...levels, res.data]);
      setNewName('');
      setIsAdding(false);
      toast.success("Level Created", { description: `${res.data.name} has been added.` });
    } catch (err) {
      toast.error("Creation Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setActionLoading(id);
    try {
      const res = await api.put(`/admin/levels/${id}`, { name: editName });
      setLevels(levels.map(l => l.id === id ? res.data : l));
      setEditingId(null);
      toast.success("Level Updated");
    } catch (err) {
      toast.error("Update Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string, permanent: boolean = false) => {
    setIsPermanent(permanent);
    setDeleteTarget({ id, name });
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    
    setActionLoading(id);
    try {
      if (isPermanent) {
        await api.delete(`/admin/levels/${id}/permanent`);
        toast.success("Permanently Deleted");
      } else {
        await api.delete(`/admin/levels/${id}`);
        toast.success("Moved to Trash", { description: "You have 48 hours to retrieve it." });
      }
      setLevels(levels.filter(l => l.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/admin/levels/${id}/restore`);
      setLevels(levels.filter(l => l.id !== id));
      toast.success("Level Restored");
    } catch (err) {
      toast.error("Restore Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getRemainingTime = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 48 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const startEditing = (level: Level) => {
    setEditingId(level.id);
    setEditName(level.name);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            Educational Levels
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage the GCE levels (e.g., O-Level, A-Level) available for students.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab('trash')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'trash' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Trash
            </button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Level
          </button>
        </div>
      </div>

      {/* Add New Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 p-8 bg-white border-2 border-primary/10 rounded-3xl shadow-xl shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Level Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. O-Level, Advanced Level, JCE..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div className="flex items-center sm:items-end gap-2 pt-2 sm:pt-6">
                <button 
                  onClick={handleAdd}
                  disabled={actionLoading === 'adding' || !newName.trim()}
                  className="flex-1 sm:flex-none p-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading === 'adding' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 sm:flex-none p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold mt-6 uppercase tracking-widest text-[10px]">Loading Levels...</p>
          </div>
        ) : levels.length === 0 ? (
          <div className="bg-white border-2 border-slate-50 border-dashed rounded-3xl p-24 text-center">
            <Layers className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Levels Defined</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-8">
              Start by creating your first educational level to organize subjects.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {levels.map((level) => (
              <motion.div
                key={level.id}
                layout
                className={`bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/20 hover:shadow-md transition-all ${editingId === level.id ? 'ring-2 ring-primary border-transparent' : ''}`}
              >
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner transition-colors ${editingId === level.id ? 'bg-primary text-white' : 'bg-slate-50 text-primary'}`}>
                    {level.name.charAt(0)}
                  </div>
                  
                  {editingId === level.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(level.id)}
                    />
                  ) : (
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Level Title</p>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">{level.name}</h3>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'trash' ? (
                    <>
                      <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
                        <Timer className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                          {level.deleted_at ? getRemainingTime(level.deleted_at) : "Unknown"}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRestore(level.id)}
                        disabled={actionLoading === level.id}
                        className="p-3 bg-green-50 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                        title="Restore Level"
                      >
                        {actionLoading === level.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(level.id, level.name, true)}
                        disabled={actionLoading === level.id}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : editingId === level.id ? (
                    <>
                      <button 
                        onClick={() => handleUpdate(level.id)}
                        disabled={actionLoading === level.id || !editName.trim()}
                        className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                      >
                        {actionLoading === level.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEditing(level)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(level.id, level.name)}
                        disabled={actionLoading === level.id}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        {actionLoading === level.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className={`mx-4 p-8 border rounded-3xl flex gap-6 items-start transition-colors ${activeTab === 'trash' ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 ${activeTab === 'trash' ? 'text-red-500' : 'text-primary'}`}>
          {activeTab === 'trash' ? <History className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-1 tracking-tight">
            {activeTab === 'trash' ? 'Trash Retention' : 'Management Tip'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {activeTab === 'trash' 
              ? 'Levels here are invisible to students. They will be permanently purged after 48 hours if not restored.' 
              : 'Levels are the highest category in your curriculum. Deleting a level will move it to the Trash for 48 hours before permanent removal.'
            }
            {activeTab === 'active' && <span className="font-bold text-primary"> Deleting a level hides all linked content.</span>}
          </p>
        </div>
      </div>

      {/* Custom Deletion Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteAction}
        isLoading={actionLoading === deleteTarget?.id}
        title={isPermanent ? "Destroy Permanently?" : "Move to Trash?"}
        message={isPermanent 
          ? `Are you sure you want to PERMANENTLY delete "${deleteTarget?.name}"? This will also purge all linked subjects and papers from the database forever.`
          : `Move "${deleteTarget?.name}" to the trash? It will be hidden from students but can be restored within 48 hours.`}
        confirmText={isPermanent ? "Yes, Delete Forever" : "Move to Trash"}
        cancelText={isPermanent ? "Keep in Trash" : "Keep Level"}
        type="danger"
      />
    </div>
  );
};

export default AdminLevels;
