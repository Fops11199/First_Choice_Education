import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, MessageSquare, Shield, UserPlus, 
    Check, X, Search, Loader2, ArrowLeft, 
    Plus, Filter, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const CommunityGroupPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [community, setCommunity] = useState<any>(null);
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discussions'); // discussions, members, admin
    
    // Create Thread State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Admin States
    const [joinRequests, setJoinRequests] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [commRes, threadsRes] = await Promise.all([
                api.get(`/community/`),
                api.get(`/community/${id}/threads`)
            ]);
            
            const foundComm = commRes.data.find((c: any) => c.id === id);
            setCommunity(foundComm);
            setThreads(threadsRes.data);

            if (foundComm?.creator_id === currentUser?.id) {
                const reqRes = await api.get(`/community/${id}/requests`);
                setJoinRequests(reqRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch community data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThreadTitle.trim()) return;
        setIsCreating(true);
        try {
            const res = await api.post('/community/threads', {
                community_id: id,
                title: newThreadTitle
            });
            setThreads([res.data, ...threads]);
            setShowCreateModal(false);
            setNewThreadTitle('');
            navigate(`/community/thread/${res.data.id}`);
        } catch (err) {
            console.error('Failed to create thread', err);
            alert('Failed to create thread. Make sure you are a member.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await api.post(`/community/${id}/approve/${userId}`);
            setJoinRequests(joinRequests.filter(r => r.user_id !== userId));
        } catch (err) {
            alert('Failed to approve');
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Syncing Hub</p>
                </div>
            </div>
        );
    }

    if (!community) {
        return <div className="h-full flex items-center justify-center p-8 text-slate-400 font-bold uppercase tracking-widest">Community not found</div>;
    }

    const isAdmin = community.creator_id === currentUser?.id;

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden bg-white">
            {/* Left Sidebar - Group Context (Desktop Only) */}
            <aside className="w-80 bg-slate-50 border-r border-slate-100 hidden lg:flex flex-col shrink-0 relative z-20">
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <button 
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest mb-10 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Community Hub
                    </button>

                    <div className="mb-10">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm border border-slate-100 mb-6">
                            <Users className="w-8 h-8" />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 mb-2 leading-tight">{community.name}</h1>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Active Workspace</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Description</h4>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                {community.description || "A place for collective learning and exam preparation."}
                            </p>
                        </div>

                        <div className="pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                                    {community.is_private ? 'Private' : 'Public'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members</span>
                                <span className="text-[10px] font-black text-slate-900">{community.member_count} active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-4 h-4 text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Security Protocol</p>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed mb-6">
                            This community is encrypted and moderated. Follow our code of conduct at all times.
                         </p>
                         <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            View Rules
                         </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                {/* 🌟 New & Improved Floating Header Hub */}
                <header className="px-6 md:px-10 pt-6 pb-2 shrink-0 bg-white z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{community.name}</h2>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeTab} Section</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary text-white p-3 md:px-8 md:py-4 rounded-2xl md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Start Topic</span>
                        </button>
                    </div>

                    {/* Elevated Tab Navigation Bar */}
                    <div className="bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-100 flex items-center shadow-sm">
                        {[
                            { id: 'discussions', label: 'Feed Hub', icon: MessageSquare },
                            { id: 'members', label: 'Active Members', icon: Users },
                            ...(isAdmin ? [{ id: 'admin', label: 'Admin Tools', icon: Shield }] : [])
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-[1.2rem] transition-all relative ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-primary shadow-sm border border-slate-200/50' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="tabGlow"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary/20 blur-sm"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-white">
                    <AnimatePresence mode="wait">
                        {activeTab === 'discussions' && (
                            <motion.div 
                                key="discussions"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="max-w-4xl mx-auto space-y-6"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Filter className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sort: Latest Activity</span>
                                    </div>
                                    <div className="relative group">
                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                         <input 
                                            type="text" 
                                            placeholder="Search topics..."
                                            className="bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold focus:outline-none focus:border-primary transition-all w-48 md:w-64"
                                         />
                                    </div>
                                </div>

                                {threads.length === 0 ? (
                                    <div className="text-center py-24 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <h4 className="text-lg font-black text-slate-900 mb-2">Workspace is Quiet</h4>
                                        <p className="text-slate-400 font-medium mb-10 text-sm">Post a question to start the momentum.</p>
                                        <button 
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-primary text-white py-4 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                        >
                                            Initialize Discussion
                                        </button>
                                    </div>
                                ) : (
                                    threads.map((thread, i) => (
                                        <motion.div
                                            key={thread.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => navigate(`/community/thread/${thread.id}`)}
                                            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all cursor-pointer group flex items-start gap-8 relative overflow-hidden"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] shrink-0 flex items-center justify-center text-slate-300 font-black text-xl group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all shadow-inner">
                                                {thread.author_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                                                        {thread.author_role}
                                                    </span>
                                                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Posted {new Date(thread.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors mb-5 leading-snug">
                                                    {thread.title}
                                                </h4>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{thread.reply_count || 0} Replies</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        <Users className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{thread.author_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all self-center">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'admin' && (
                            <motion.div 
                                key="admin"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="max-w-4xl mx-auto space-y-12"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                                <UserPlus className="w-7 h-7 text-primary" />
                                                Membership Queue
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage pending access requests</p>
                                        </div>
                                        <div className="bg-primary/5 text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                            {joinRequests.length} Waiting
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {joinRequests.length === 0 ? (
                                            <div className="col-span-full py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Queue is currently empty</p>
                                            </div>
                                        ) : (
                                            joinRequests.map(req => (
                                                <div key={req.user_id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                                                            {req.full_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900">{req.full_name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level: O-Level Student</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => handleApprove(req.user_id)} className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Create Thread Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
                        >
                            <div className="absolute -top-12 -right-12 p-8 opacity-5">
                                <Plus className="w-64 h-64 text-primary" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Open Discussion</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-12">Submit a new topic to the community feed</p>
                            
                            <form onSubmit={handleCreateThread} className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Topic Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        autoFocus
                                        value={newThreadTitle}
                                        onChange={(e) => setNewThreadTitle(e.target.value)}
                                        placeholder="What should we talk about?"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 px-8 text-base font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isCreating || !newThreadTitle.trim()}
                                        className="flex-1 py-5 bg-primary text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publish Discussion"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityGroupPage;
