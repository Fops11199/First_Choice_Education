import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Shield, GraduationCap, Loader2, MoreVertical, Info, Users, Reply as ReplyIcon, X } from 'lucide-react';
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
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-slate-50/30">
      {/* Main Chat View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100">
        {/* Chat Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-5">
                <button 
                    onClick={() => thread.community_id ? navigate(`/community/group/${thread.community_id}`) : navigate('/community')}
                    className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all active:scale-95 group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-slate-900 line-clamp-1 leading-none mb-1">{thread.title}</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{replies.length} Responses</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`p-3 rounded-xl transition-all md:hidden ${showSidebar ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-400'}`}
                >
                    <Info className="w-6 h-6" />
                </button>
                <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-95">
                    <MoreVertical className="w-6 h-6" />
                </button>
            </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth custom-scrollbar">
            {/* Thread Originating Message/Header */}
            <div className="max-w-3xl mx-auto w-full mb-12">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageCircle className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">
                            Thread Creator
                        </span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(thread.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{thread.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                            {thread.author_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">{thread.author_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{thread.author_role}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Replies */}
            <div className="max-w-3xl mx-auto w-full space-y-4">
                {replies.map((reply, i) => {
                    const isMe = reply.author_name === currentUser?.full_name;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={reply.id} 
                            className={`flex items-end gap-3 group/msg ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {!isMe && (
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm shrink-0 mb-1">
                                    {reply.author_name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <div className="flex items-center gap-2 mb-1.5 ml-2">
                                        <p className="text-[10px] font-black text-slate-900">{reply.author_name}</p>
                                        {reply.author_role === 'admin' && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest">Admin</span>}
                                        {reply.author_role === 'tutor' && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest">Tutor</span>}
                                    </div>
                                )}
                                
                                <div className="relative group/bubble">
                                    {/* Quote View in Bubble */}
                                    {reply.parent_content && (
                                        <div className={`mb-1 p-3 rounded-2xl text-[11px] border-l-4 border-primary/40 leading-relaxed font-medium ${
                                            isMe ? 'bg-white/10 text-white/80' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            <p className="font-black uppercase tracking-widest text-[8px] mb-1 opacity-70">
                                                Replying to {reply.parent_author}
                                            </p>
                                            <p className="line-clamp-2 italic">"{reply.parent_content}"</p>
                                        </div>
                                    )}

                                    <div className={`p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm border ${
                                        isMe 
                                        ? 'bg-primary text-white border-primary rounded-br-none shadow-primary/20' 
                                        : 'bg-white text-slate-600 border-slate-100 rounded-bl-none shadow-slate-100/50'
                                    }`}>
                                        {reply.content}
                                    </div>

                                    {/* Quick Reply Button on Hover */}
                                    <button 
                                        onClick={() => setReplyTo(reply)}
                                        className={`absolute top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg border border-slate-50 text-slate-400 hover:text-primary transition-all opacity-0 scale-50 group-hover/bubble:opacity-100 group-hover/bubble:scale-100 ${
                                            isMe ? '-left-12' : '-right-12'
                                        }`}
                                    >
                                        <ReplyIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className={`text-[9px] font-bold text-slate-300 mt-1.5 px-2 uppercase tracking-widest`}>
                                    {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Chat Input Container */}
        <footer className="bg-white border-t border-slate-100 p-4 md:p-6 shrink-0 relative z-30">
            <div className="max-w-3xl mx-auto">
                <AnimatePresence>
                    {replyTo && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-3 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-start gap-4 relative overflow-hidden"
                        >
                            <div className="w-1 h-full absolute left-0 top-0 bg-primary/40" />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Replying to {replyTo.author_name}</p>
                                <p className="text-xs text-slate-500 font-medium line-clamp-1 italic">"{replyTo.content}"</p>
                            </div>
                            <button 
                                onClick={() => setReplyTo(null)}
                                className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handlePostReply} className="relative flex items-center gap-3">
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
                            placeholder="Write your response..." 
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-5 px-6 pr-16 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all min-h-[64px] max-h-32 font-medium shadow-inner resize-none"
                            rows={1}
                        />
                        <div className="absolute right-2.5 bottom-2.5">
                             <button 
                                type="submit"
                                disabled={isSubmitting || !replyContent.trim()}
                                className="w-11 h-11 bg-primary text-white rounded-2xl shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:bg-primary-dark hover:scale-105 active:scale-90 transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center group"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </form>
                <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <span>Encrypted Chat</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
                    <span>First Choice Community</span>
                </div>
            </div>
        </footer>
      </div>

      {/* Sidebar - Thread Info */}
      <aside className={`w-full md:w-80 bg-white shrink-0 overflow-y-auto transition-all duration-300 z-10 ${
        showSidebar ? 'h-full fixed inset-0 md:relative' : 'hidden md:block'
      }`}>
        <div className="p-8 space-y-10">
            {showSidebar && (
                <button onClick={() => setShowSidebar(false)} className="md:hidden text-primary font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Chat
                </button>
            )}

            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Discussion Info
                </h4>
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Exam Group</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O-Level Prep</p>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                        This discussion is monitored by our tutors to ensure educational quality.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Community Rules
                </h4>
                <div className="space-y-4">
                    {[
                        'Stay focused on the topic',
                        'Be helpful and polite',
                        'Report inappropriate content',
                        'No exam cheating help'
                    ].map((rule, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                            <p className="text-[11px] font-bold text-slate-600">{rule}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-10 border-t border-slate-50 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Verified Session
                </div>
            </div>
        </div>
      </aside>
    </div>
  );
};

export default ThreadDetail;
