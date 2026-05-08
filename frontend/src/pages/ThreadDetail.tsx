import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Shield, Loader2, MoreVertical, Info, Users, Reply as ReplyIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const ThreadDetail = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null); // For quoting
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [inputBottom, setInputBottom] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchThreadData = async () => {
    try {
      const [threadRes, repliesRes] = await Promise.all([
        api.get(`/community/threads/${threadId}`),
        api.get(`/community/threads/${threadId}/replies`)
      ]);
      setThread(threadRes.data);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('Failed to fetch thread', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadData();
  }, [threadId]);

  // Keyboard-aware input offset (mobile)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setInputBottom(offset > 20 ? offset : 0);
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  useEffect(() => {
    if (replies.length > 0) {
      scrollToBottom();
    }
  }, [replies]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post(`/community/threads/${threadId}/replies`, {
        content: replyContent,
        parent_id: replyTo?.id || null
      });
      setReplies([...replies, res.data]);
      setReplyContent('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to post reply', err);
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Loading discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Main Chat View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100/10">
        {/* First Choice Education Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => thread.community_id ? navigate(`/community/group/${thread.community_id}`) : navigate('/community')}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-95 group"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner border border-primary/10 overflow-hidden">
                        {thread.author_name?.charAt(0) || <Users className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm font-black text-slate-900 line-clamp-1 leading-tight">{thread.title}</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{replies.length} Contributions</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
                >
                    <Info className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2 scroll-smooth custom-scrollbar">
            {/* Thread Header Hub */}
            <div className="flex justify-center mb-12">
                <div className="bg-white border border-slate-100 px-8 py-6 rounded-[2rem] shadow-sm max-w-lg text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Shield className="w-20 h-20 text-primary" />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Community Workspace</p>
                    <h2 className="text-xl font-black text-slate-900 leading-tight mb-4">{thread.title}</h2>
                    <div className="flex items-center justify-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
                    </div>
                </div>
            </div>

            {replies.map((reply, i) => {
                const isMe = reply.author_name === currentUser?.full_name;
                const showHeader = i === 0 || replies[i - 1].author_name !== reply.author_name;
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={reply.id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${showHeader ? 'mt-6' : 'mt-1'}`}
                    >
                        {showHeader && !isMe && (
                             <div className="flex items-center gap-2 mb-2 ml-2">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{reply.author_name}</span>
                                {reply.author_role !== 'student' && (
                                     <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                         reply.author_role === 'admin' ? 'bg-rose-500 text-white' : 'bg-primary text-white'
                                     }`}>
                                         {reply.author_role}
                                     </span>
                                )}
                             </div>
                        )}

                        <div className={`group relative max-w-[85%] px-4 py-3 rounded-2xl shadow-sm border transition-all ${
                            isMe 
                            ? 'bg-primary text-white border-primary-dark rounded-tr-none' 
                            : 'bg-white text-slate-700 border-slate-100 rounded-tl-none hover:border-primary/20'
                        }`}>
                            {/* Reply Context (Quoting) */}
                            {reply.parent_content && (
                                <div className={`mb-3 p-3 rounded-xl border-l-4 ${isMe ? 'bg-black/10 border-white/30' : 'bg-slate-50 border-primary/30'} flex flex-col`}>
                                    <span className={`text-[9px] font-black mb-1 ${isMe ? 'text-white/70' : 'text-primary'}`}>
                                      Replying to {reply.parent_author}
                                    </span>
                                    <p className={`text-[11px] italic line-clamp-2 leading-relaxed ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                                        "{reply.parent_content}"
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium leading-relaxed break-words">
                                    {reply.content}
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-1 opacity-50">
                                    <span className="text-[8px] font-bold uppercase">
                                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && <span className="text-[9px]">✓✓</span>}
                                </div>
                            </div>

                            {/* Reply Action Overlay (Always visible on mobile) */}
                            <button 
                                onClick={() => {
                                  setReplyTo(reply);
                                  // Find the textarea if possible or just rely on state
                                }}
                                className={`absolute top-0 bottom-0 ${isMe ? '-left-12' : '-right-12'} w-10 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary active:scale-90`}
                            >
                                <ReplyIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
            <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* First Choice Education Style Input Bar */}
        <footer className="bg-white p-4 md:p-6 shrink-0 border-t border-slate-100" style={{ paddingBottom: inputBottom > 0 ? `${inputBottom + 16}px` : undefined }}>
            <div className="max-w-4xl mx-auto">
                <AnimatePresence>
                    {replyTo && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 relative overflow-hidden shadow-sm"
                        >
                            <div className="w-1.5 h-full absolute left-0 top-0 bg-primary" />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Replying to {replyTo.author_name}</p>
                                <p className="text-xs text-slate-500 font-medium line-clamp-1 italic">"{replyTo.content}"</p>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-white rounded-xl transition-all">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handlePostReply} className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostReply(e);
                                }
                            }}
                            placeholder="Write your contribution..." 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none max-h-32 shadow-inner"
                            rows={1}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !replyContent.trim()}
                        className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform disabled:opacity-30"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-6 h-6 ml-0.5" />}
                    </button>
                </form>
            </div>
        </footer>
      </div>

      {/* Sidebar - Group Info */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 md:relative md:inset-auto md:w-80 bg-white shrink-0 z-[100] md:z-10 overflow-y-auto border-l border-slate-100"
          >
            <div className="p-8 space-y-10">
                <div className="flex flex-col items-center">
                    <button onClick={() => setShowSidebar(false)} className="self-start md:hidden mb-8 p-2 hover:bg-slate-50 rounded-xl">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-6 shadow-inner border border-primary/10">
                        <Users className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 text-center mb-1">{thread.title}</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Official Workspace</p>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic Origin</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary font-black">
                                {thread.author_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">{thread.author_name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{thread.author_role}</p>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                            This discussion started on {new Date(thread.created_at).toLocaleDateString()}.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Rules</h4>
                    <div className="space-y-4">
                        {['Academic focus only', 'Mutual respect required', 'No plagiarism help', 'Expert moderated session'].map((rule, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                                <p className="text-[11px] font-bold text-slate-600">{rule}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThreadDetail;
