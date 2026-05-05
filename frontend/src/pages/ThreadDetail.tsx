import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Send, User, Shield, GraduationCap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const ThreadDetail = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post(`/community/threads/${threadId}/replies`, {
        content: replyContent
      });
      setReplies([...replies, res.data]);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to post reply', err);
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Thread not found</h2>
        <Link to="/community" className="text-primary hover:underline mt-4 inline-block">Back to Community</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/community" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" /> Back to Forum
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-8">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/5 px-2 py-1 rounded-md">
              {thread.category}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date(thread.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{thread.title}</h1>
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Started by Student</p>
              <p className="text-xs text-slate-500 font-medium">Community Member</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/30 p-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Replies ({replies.length})
          </h3>

          <div className="space-y-6">
            {replies.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">No replies yet. Be the first to join the conversation!</p>
            ) : (
              replies.map((reply, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={reply.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {reply.author_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {reply.author_name || 'Anonymous Student'}
                        {reply.author_role === 'admin' && <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1"><Shield className="w-2 h-2" /> ADMIN</span>}
                        {reply.author_role === 'tutor' && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1"><GraduationCap className="w-2 h-2" /> TUTOR</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{reply.content}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {user && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <form onSubmit={handlePostReply} className="relative">
              <textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts or answer the question..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-16 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[100px] font-medium"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;
