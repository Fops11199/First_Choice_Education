import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, TrendingUp, Search, Plus, ArrowUpRight, MessageCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CommunityPage = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Thread Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community/threads');
      setThreads(res.data);
    } catch (err) {
      console.error('Failed to fetch threads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/community/threads', newThread);
      setThreads([res.data, ...threads]);
      setIsModalOpen(false);
      setNewThread({ title: '', category: 'General' });
      // Navigate to the new thread
      navigate(`/community/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create thread', err);
      alert('Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Student Forum</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-4">Learn together.</h1>
          <p className="text-base text-slate-600">Connect with thousands of students across Cameroon. Ask questions and succeed together.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2.5 px-8 text-sm rounded-xl whitespace-nowrap shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Start Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm">
            <Search className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-700 text-sm" 
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/community/${thread.id}`)}
                  className="bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 cursor-pointer p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-primary transition-colors">{thread.title}</h3>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-primary uppercase tracking-widest text-[9px] bg-primary/5 px-2 py-0.5 rounded">{thread.category}</span>
                        <span className="text-slate-400 font-medium">{new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <p className="text-lg font-black text-slate-900 leading-none mb-0.5">{thread.reply_count || 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Replies</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-deep-brown mb-2">The Community is waking up</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">Be the first to start a discussion about a paper, study tips, or GCE updates.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-primary font-bold hover:underline"
              >
                + Start the first thread
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <TrendingUp className="w-8 h-8 text-accent mb-6" />
              <h3 className="text-xl font-black mb-4 tracking-tight">Trending Topics</h3>
              <ul className="space-y-4">
                {['2024 Timetable', 'Registration Deadlines', 'Study Groups'].map(topic => (
                  <li key={topic} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-slate-400 font-bold text-sm group-hover:text-accent transition-all uppercase tracking-widest">#{topic}</span>
                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Users className="w-5 h-5 text-primary" />
              Community Stats
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">150k+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Members</p>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">45k+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions Solved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Thread Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Start Discussion</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateThread} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject or Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Help with Biology Paper 1 2023"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select 
                    value={newThread.category}
                    onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="General">General Discussion</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English">English Language</option>
                    <option value="GCE Updates">GCE Updates</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Discussion"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
