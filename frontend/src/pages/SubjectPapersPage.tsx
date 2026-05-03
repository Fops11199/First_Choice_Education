import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowRight, BookOpen, Loader2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';

const SubjectPapersPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await api.get(`/content/subjects/${id}/papers`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, [id]);

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
