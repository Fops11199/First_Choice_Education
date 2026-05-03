import React, { useState } from 'react';
import { MessageSquare, Users, TrendingUp, Search, Plus, ArrowUpRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CommunityPage = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Eventually fetch from /api/v1/community/threads
    setThreads([]);
    setLoading(false);
  }, []);

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
        
        <button className="btn-primary py-2.5 px-8 text-sm rounded-lg whitespace-nowrap">
          <Plus className="w-4 h-4" /> Start Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 mb-6 shadow-sm">
            <Search className="text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search discussions..." className="flex-1 bg-transparent border-none focus:outline-none font-semibold text-sm" />
          </div>

          {threads.length > 0 ? (
            threads.map((thread, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="pattern-card flex items-center justify-between gap-4 cursor-pointer p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-deep-brown mb-0.5">{thread.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="text-primary uppercase tracking-widest text-[9px]">{thread.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span>By {thread.author}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-lg font-bold text-deep-brown leading-none mb-0.5">{thread.replies}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Replies</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-deep-brown mb-2">The Community is waking up</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Be the first to start a discussion about a paper, study tips, or GCE updates.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-deep-brown text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <TrendingUp className="w-6 h-6 text-accent mb-4" />
              <h3 className="text-lg font-bold mb-3">Trending Topics</h3>
              <ul className="space-y-3">
                {['2024 Timetable', 'Registration Deadlines', 'Study Groups'].map(topic => (
                  <li key={topic} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-white/60 font-semibold text-sm hover:text-accent transition-all">#{topic}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-accent" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-deep-brown mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-deep-brown">150k+</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Members</p>
              </div>
              <div className="h-px bg-primary/10"></div>
              <div>
                <p className="text-2xl font-bold text-deep-brown">45k+</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Solved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
