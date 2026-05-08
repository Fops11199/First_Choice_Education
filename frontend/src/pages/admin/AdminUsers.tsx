import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { User, Shield, GraduationCap, Search, UserPlus, Loader2, RefreshCw, Trash2, ChevronRight, ArrowUpRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [roleConfirm, setRoleConfirm] = useState<{id: string, name: string, role: string} | null>(null);
  
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'tutor' });
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users' + (filterRole !== 'all' ? `?role=${filterRole}` : ''));
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error("Fetch Failed", { description: "Could not synchronize the user directory." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const handleRoleChange = async () => {
    if (!roleConfirm) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${roleConfirm.id}/role`, { role: roleConfirm.role });
      toast.success("Privileges Updated", { 
        description: `${roleConfirm.name} is now a ${roleConfirm.role}.` 
      });
      setRoleConfirm(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Update Failed", { 
        description: err.response?.data?.detail || "You cannot change your own admin role." 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${deleteConfirm.id}`);
      toast.success("User Revoked", { 
        description: `${deleteConfirm.name} has been removed from the system.` 
      });
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Revocation Failed", { 
        description: err.response?.data?.detail || "Could not delete user." 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/admin/users', newUser);
      toast.success("Identity Provisioned", { 
        description: `${newUser.full_name} has been granted access.` 
      });
      setIsModalOpen(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'tutor' });
      fetchUsers();
    } catch (err: any) {
      toast.error("Provisioning Failed", { 
        description: err.response?.data?.detail || "Could not create user." 
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Directory</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Manage system access and monitor student activity.</p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-500 text-white flex items-center gap-2 py-4 px-8 rounded-2xl font-semibold text-sm shadow-xl shadow-primary/10 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Create Privileged User
        </motion.button>
      </div>

      <div className="bg-white border border-blue-50 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-blue-50 flex flex-col xl:flex-row items-center justify-between gap-6 bg-blue-50/10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-blue-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-blue-100 shadow-sm">
              {['all', 'student', 'tutor', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filterRole === role 
                      ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                      : 'text-slate-400 hover:text-primary hover:bg-blue-50/50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            
            <button 
              onClick={fetchUsers} 
              className="p-3.5 bg-white border border-blue-100 rounded-2xl text-blue-300 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-50">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-blue-50/20 text-blue-400 font-bold uppercase text-[10px] tracking-[0.15em] border-b border-blue-50">
              <tr>
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Authority Level</th>
                <th className="px-8 py-5">System Status</th>
                <th className="px-8 py-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <User className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-slate-400 font-semibold mt-6">Synchronizing users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-blue-100">
                      <Search className="w-10 h-10" />
                    </div>
                    <p className="text-slate-800 font-semibold text-xl mb-2">No users identified</p>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto">Adjust your filters to identify specific accounts.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={u.id} 
                    className="hover:bg-blue-50/10 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-semibold text-lg group-hover:scale-110 transition-transform shadow-sm">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-base leading-tight mb-0.5">{u.full_name}</p>
                          <p className="text-xs font-medium text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'admin' ? 'bg-blue-50 text-primary border-blue-100 shadow-sm' :
                        u.role === 'tutor' ? 'bg-blue-50/50 text-blue-500 border-blue-100 shadow-sm' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> :
                         u.role === 'tutor' ? <GraduationCap className="w-3.5 h-3.5" /> :
                         <User className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {u.is_active ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active System</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deactivated</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="relative group/select">
                          <select 
                            value={u.role}
                            onChange={(e) => setRoleConfirm({id: u.id, name: u.full_name, role: e.target.value})}
                            className="bg-blue-50/50 border border-blue-100 text-slate-600 text-xs rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 px-4 py-2.5 font-bold uppercase tracking-wider cursor-pointer hover:bg-white transition-all appearance-none pr-10"
                          >
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-blue-300 pointer-events-none group-hover/select:text-primary transition-colors" />
                        </div>
                        <button 
                          onClick={() => setDeleteConfirm({id: u.id, name: u.full_name})}
                          className="p-3 text-slate-300 hover:text-red-400 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Creation Modals */}
      <AnimatePresence>
        {/* Create User Modal */}
        {isModalOpen && (
          <ModalWrapper onClose={() => setIsModalOpen(false)}>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Privileged Account</h2>
              <p className="text-base font-medium text-slate-500 mb-10">Provision a new administrator or tutor account.</p>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <InputGroup label="Legal Full Name" value={newUser.full_name} onChange={(v: string) => setNewUser({...newUser, full_name: v})} />
                <InputGroup label="Email Identifier" type="email" value={newUser.email} onChange={(v: string) => setNewUser({...newUser, email: v})} />
                <InputGroup label="Security Password" type="password" value={newUser.password} onChange={(v: string) => setNewUser({...newUser, password: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Designated Role</label>
                  <div className="relative">
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="tutor">Tutor (Content Manager)</option>
                      <option value="admin">Admin (Full Access)</option>
                    </select>
                    <ChevronRight className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-blue-300 pointer-events-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-semibold text-slate-400 hover:text-slate-600 rounded-2xl transition-all">Discard</button>
                  <button type="submit" disabled={createLoading} className="flex-[2] py-4 text-sm font-semibold bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                    {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authorize User <ArrowUpRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            </div>
          </ModalWrapper>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <ModalWrapper onClose={() => setDeleteConfirm(null)}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Revoke Access?</h2>
              <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest leading-relaxed mb-10">
                You are about to permanently delete <span className="text-slate-800">{deleteConfirm.name}</span>. This action cannot be undone.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleDeleteUser} disabled={actionLoading} className="w-full py-4 bg-red-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-red-400/20 hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Revocation"}
                </button>
                <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-white text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 border border-slate-100 transition-all">Keep User</button>
              </div>
            </div>
          </ModalWrapper>
        )}

        {/* Role Change Confirmation Modal */}
        {roleConfirm && (
          <ModalWrapper onClose={() => setRoleConfirm(null)}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-primary rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Elevate Privileges?</h2>
              <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest leading-relaxed mb-10">
                Changing <span className="text-slate-800">{roleConfirm.name}</span> to <span className="text-primary font-bold">{roleConfirm.role.toUpperCase()}</span> status.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleRoleChange} disabled={actionLoading} className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Authorize Role Change"}
                </button>
                <button onClick={() => setRoleConfirm(null)} className="w-full py-4 bg-white text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 border border-slate-100 transition-all">Discard Changes</button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const ModalWrapper = ({ children, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl overflow-hidden border border-blue-50">
      {children}
    </motion.div>
  </div>
);

const InputGroup = ({ label, type = "text", value, onChange }: { label: string, type?: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-6 py-4 bg-blue-50/20 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-slate-700" />
  </div>
);

export default AdminUsers;
