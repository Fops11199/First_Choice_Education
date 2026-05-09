import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowRight, BookOpen, Loader2, ChevronLeft, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const SubjectPapersPage = () => {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      try {
        const [papersRes, enrolRes] = await Promise.all([
          api.get(`/content/subjects/${subjectId}/papers`),
          user?.role === 'student' ? api.get('/students/me/enrollments') : Promise.resolve({ data: [] })
        ]);
        
        setData(papersRes.data);
        
        if (user?.role === 'student') {
          const enrolled = enrolRes.data.some((e: any) => e.subject_id === subjectId);
          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(true); // Admins and tutors are always "enrolled"
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId, user]);

  useEffect(() => {
    if (data?.papers?.length > 0 && selectedYear === 'all') {
      const maxYear = Math.max(...data.papers.map((p: any) => p.year));
      setSelectedYear(maxYear);
    }
  }, [data]);

  const years = data ? Array.from(new Set(data.papers.map((p: any) => p.year))).sort((a: any, b: any) => b - a) as number[] : [];
  const filteredPapers = selectedYear === 'all' 
    ? (data?.papers || []) 
    : (data?.papers || []).filter((p: any) => p.year === selectedYear);

  const handleEnroll = async () => {
    if (!subjectId || user?.role !== 'student') return;
    setEnrolling(true);
    try {
      await api.post('/students/me/enrollments', { subject_id: subjectId });
      setIsEnrolled(true);
    } catch (err) {
      console.error("Failed to enroll:", err);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <p className="text-slate-500 font-bold mb-4">Subject not found.</p>
        <Link to="/subjects" className="btn-primary px-6 py-2 rounded-xl flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 main-container">
      <div className="mb-12">
        <Link to="/subjects" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Subjects
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-1 bg-primary rounded-full"></span>
              <span className="text-[10px] font-black tracking-widest text-primary uppercase">{data.level}</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">{data.subject_name}</h1>
          </div>
        </div>
        <p className="text-slate-500 max-w-2xl font-medium">
          Access all verified past papers and video solutions for {data.subject_name}. Select a paper to begin your revision.
        </p>
      </div>

      {/* Year Selector */}
      {data.papers.length > 0 && isEnrolled && (
        <div className="mb-8">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Year</p>
            <div className="relative group w-full md:w-64">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-200 hover:border-primary/30 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="all">ALL YEARS</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.papers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-deep-brown">No papers available yet</h3>
            <p className="text-sm text-slate-500">We are currently uploading content for this subject. Check back soon!</p>
          </div>
        ) : !isEnrolled ? (
          <div className="col-span-full py-16 px-6 text-center bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Enroll to Access Papers</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium leading-relaxed">
              You need to enroll in {data.subject_name} to access its past papers, video solutions, and PDF materials. Enrollment is free!
            </p>
            <button 
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full md:w-auto bg-slate-900 text-white py-4 px-10 rounded-lg inline-flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary transition-all active:scale-95"
            >
              {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
              {enrolling ? 'Enrolling...' : 'Enroll Now for Free'}
            </button>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">No papers found for {selectedYear}</h3>
            <p className="text-sm text-slate-500">Try selecting a different year.</p>
          </div>
        ) : (
          filteredPapers.map((paper: any, i: number) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/papers/${paper.id}`}>
                <div className="pattern-card group p-6 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-all">
                        {paper.year} - {paper.paper_type}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {paper.video_count} Videos
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {paper.pdf_count} PDFs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectPapersPage;
