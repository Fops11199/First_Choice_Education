import React, { useState, useEffect } from 'react';
import { Search, Book, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import SEO from '../components/SEO';

const SubjectsPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>(user?.level || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, levelRes, enrolRes] = await Promise.all([
          api.get('/content/subjects'),
          api.get('/content/levels'),
          user?.role === 'student' ? api.get('/students/me/enrollments') : Promise.resolve({ data: [] })
        ]);
        setSubjects(subRes.data);
        setLevels(levelRes.data);
        
        // If user has a level, use it, otherwise use the first level found
        if (user?.level) {
          setSelectedLevel(user.level);
        } else if (levelRes.data.length > 0) {
          setSelectedLevel(levelRes.data[0].name);
        }

        if (user?.role === 'student') {
          setEnrollments(enrolRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault(); // Prevent navigation
    if (user?.role !== 'student') return;
    
    setEnrollingId(subjectId);
    try {
      await api.post('/students/me/enrollments', { subject_id: subjectId });
      // Refresh enrollments
      const enrolRes = await api.get('/students/me/enrollments');
      setEnrollments(enrolRes.data);
    } catch (err) {
      console.error("Failed to enroll:", err);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize both strings to handle "O-Level" vs "O Level" vs "o-level"
    const normalize = (str: string) => (str || "").toLowerCase().replace(/-/g, " ").trim();
    const matchesLevel = normalize(sub.level_name) === normalize(selectedLevel);
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="pt-24 pb-16 main-container">
      <SEO 
        title={`${selectedLevel} Subjects`}
        description={`Explore our comprehensive archive of ${selectedLevel} GCE subjects with expert video solutions and past papers.`}
      />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-1 bg-primary rounded-full"></span>
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Subject Archive</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4">Your {selectedLevel} Subjects.</h1>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">Browse the complete archive of subjects for the selected GCE level.</p>
          
          {/* Level Toggle for Admins or users without a set level */}
          {(!user?.level || user.role === 'admin') && levels.length > 0 && (
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
              {levels.map((level) => (
                <button 
                  key={level.id}
                  onClick={() => setSelectedLevel(level.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedLevel === level.name ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none font-bold text-sm transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No subjects found in the database.</p>
          <p className="text-xs text-slate-400 mt-1">Admin needs to populate the subjects list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSubjects.map((sub, i) => {
            const isEnrolled = enrollments.some(e => e.subject_id === sub.id);
            const isStudent = user?.role === 'student';

            return (
              <Link 
                key={sub.id || i}
                to={`/subjects/${sub.id}/papers`}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`pattern-card flex flex-col group cursor-pointer p-6 h-full border ${isEnrolled ? 'border-primary/30 bg-primary/5' : 'border-slate-100'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Book className="w-5 h-5" />
                    </div>
                    {isStudent && isEnrolled && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-1 rounded-md">
                        Enrolled
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{sub.name}</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-6">{sub.papers?.length || 0} Solved Papers</p>
                  
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest group-hover:gap-3 transition-all">
                      View Papers <ArrowRight className="w-4 h-4" />
                    </div>
                    
                    {isStudent && !isEnrolled && (
                      <button 
                        onClick={(e) => handleEnroll(e, sub.id)}
                        disabled={enrollingId === sub.id}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
                      >
                        {enrollingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Book className="w-3.5 h-3.5" />}
                        Enroll Now
                      </button>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
