import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Search, Plus, Loader2, X, Lock, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CommunityPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Community Modal (Onboarding)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ 
    name: '', 
    description: '', 
    category: 'General',
    is_private: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community/');
      setCommunities(res.data);
    } catch (err) {
      console.error('Failed to fetch communities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/community/', newCommunity);
      setCommunities([res.data, ...communities]);
      setIsModalOpen(false);
      setNewCommunity({ name: '', description: '', category: 'General', is_private: false });
      // Navigate to the new community group
      navigate(`/community/group/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create community', err);
      alert('Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Study Spaces</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-4">Your Learning Hub.</h1>
          <p className="text-base text-slate-600">Join specialized study groups or create your own private circle to learn with friends.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-3 px-8 text-sm rounded-2xl whitespace-nowrap shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Community
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm ring-1 ring-slate-100">
            <Search className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search communities by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-700 text-sm" 
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunities.map((community) => (
                <motion.div
                  key={community.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/community/group/${community.id}`)}
                  className="bg-white border border-slate-100 rounded-3xl cursor-pointer p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    {community.is_private ? (
                      <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                        <Globe className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{community.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed">
                      {community.description || "A space for students to collaborate and share resources."}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">
                        {community.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {community.member_count} Members
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-[2.5rem] p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-deep-brown mb-2">No communities found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">Try a different search or be the pioneer and create your own study space!</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-primary font-bold hover:underline flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Create the first community
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <Shield className="w-8 h-8 text-accent mb-6" />
              <h3 className="text-xl font-black mb-4 tracking-tight">Privileges</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Public groups are open for all to browse.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Private groups require Admin approval to join.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Creators have full moderation control.</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Mathematics', 'Physics', 'Biology', 'Chemistry', 'GCE Updates'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer hover:border-primary hover:text-primary transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Community Modal (Onboarding) */}
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
              className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create Community</h2>
                <p className="text-sm text-slate-500 font-medium">Define your study space and invite collaborators.</p>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Physics Masters"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700 appearance-none shadow-inner"
                    >
                      <option value="General">General</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="GCE Updates">GCE Updates</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Tell everyone what this space is about..."
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-700 resize-none shadow-inner"
                  />
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors ${newCommunity.is_private ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {newCommunity.is_private ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Privacy Setting</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {newCommunity.is_private ? "Private - Only members can see" : "Public - Anyone can see"}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setNewCommunity({ ...newCommunity, is_private: !newCommunity.is_private })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${newCommunity.is_private ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newCommunity.is_private ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 text-sm font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Plus className="w-5 h-5" />
                        Establish Community
                      </>
                    )}
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
