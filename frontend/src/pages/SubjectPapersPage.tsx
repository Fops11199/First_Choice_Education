import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowRight, BookOpen, Loader2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const SubjectPapersPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, enrolRes] = await Promise.all([
          api.get(`/content/subjects/${id}/papers`),
          user?.role === 'student' ? api.get('/students/me/enrollments') : Promise.resolve({ data: [] })
        ]);
        
        setData(papersRes.data);
        
        if (user?.role === 'student') {
          const enrolled = enrolRes.data.some((e: any) => e.subject_id === id);
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
  }, [id, user]);

  const handleEnroll = async () => {
    if (!id || user?.role !== 'student') return;
    setEnrolling(true);
    try {
      await api.post('/students/me/enrollments', { subject_id: id });
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
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="w-4 h-1 bg-accent"></span>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">{data.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-deep-brown">{data.subject_name}</h1>
          </div>
        </div>
        <p className="text-slate-500 max-w-2xl font-medium">
          Access all verified past papers and video solutions for {data.subject_name}. Select a paper to begin your revision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.papers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-deep-brown">No papers available yet</h3>
            <p className="text-sm text-slate-500">We are currently uploading content for this subject. Check back soon!</p>
          </div>
        ) : !isEnrolled ? (
          <div className="col-span-full py-16 px-6 text-center bg-slate-50 rounded-3xl border border-slate-200 shadow-inner max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6 shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-deep-brown mb-3">Enroll to Access Papers</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              You need to enroll in {data.subject_name} to access its past papers, video solutions, and PDF materials. Enrollment is free!
            </p>
            <button 
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary py-3 px-8 rounded-xl inline-flex items-center gap-2 text-lg font-bold shadow-lg shadow-primary/20"
            >
              {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
              {enrolling ? 'Enrolling...' : 'Enroll Now for Free'}
            </button>
          </div>
        ) : (
          data.papers.map((paper: any, i: number) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/paper/${paper.id}`}>
                <div className="pattern-card group p-6 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-deep-brown group-hover:text-primary transition-all">
                        {paper.year} - {paper.paper_type}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          {paper.video_count} Videos
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          {paper.pdf_count} PDFs
                        </span>
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
