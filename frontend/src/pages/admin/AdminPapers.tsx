import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, FileText, Trash2, Loader2, ExternalLink, X, Play, Upload, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../api/api';

const AdminPapers = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<any>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [newPaper, setNewPaper] = useState({ year: new Date().getFullYear(), paper_type: 'Paper 1', subject_id: subjectId });
  
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  
  // Unified content state
  const [contentForm, setContentForm] = useState({
    year: new Date().getFullYear(),
    paper_type: 'Paper 1',
    youtube_id: '',
    question_url: '',
    answer_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingQuestion, setIsUploadingQuestion] = useState(false);
  const [isUploadingAnswer, setIsUploadingAnswer] = useState(false);

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, papersRes] = await Promise.all([
        api.get('/admin/subjects'),
        api.get(`/admin/papers?subject_id=${subjectId}`)
      ]);
      
      const currentSubject = subjectsRes.data.find((s: any) => s.id === subjectId);
      setSubject(currentSubject);
      setPapers(papersRes.data);
    } catch (err) {
      toast.error("Fetch Failed", { description: "Could not retrieve papers." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/papers', newPaper);
      toast.success("Paper Added Successfully");
      setIsPaperModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.response?.data?.detail || "Error adding paper." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContent = (paper: any) => {
    setSelectedPaper(paper);
    
    // Find existing content if any
    const youtubeId = paper.videos?.[0]?.youtube_id || '';
    const questionUrl = paper.pdfs?.find((p: any) => p.pdf_type === 'question')?.file_url || '';
    const answerUrl = paper.pdfs?.find((p: any) => p.pdf_type === 'answer')?.file_url || '';
    
    setContentForm({
      year: paper.year,
      paper_type: paper.paper_type,
      youtube_id: youtubeId,
      question_url: questionUrl,
      answer_url: answerUrl
    });
    
    setIsContentModalOpen(true);
  };

  const handleSaveMaterials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const promises = [];
      
      // Update Paper Details (Year/Type)
      promises.push(api.put(`/admin/papers/${selectedPaper.id}`, {
        year: contentForm.year,
        paper_type: contentForm.paper_type,
        subject_id: subjectId
      }));

      // Update Video if provided
      if (contentForm.youtube_id) {
        promises.push(api.post(`/admin/papers/${selectedPaper.id}/videos`, { 
          youtube_id: contentForm.youtube_id 
        }));
      }
      
      // Update Question PDF
      if (contentForm.question_url) {
        promises.push(api.post(`/admin/papers/${selectedPaper.id}/pdfs`, { 
          file_url: contentForm.question_url, 
          pdf_type: 'question' 
        }));
      }
      
      // Update Answer PDF
      if (contentForm.answer_url) {
        promises.push(api.post(`/admin/papers/${selectedPaper.id}/pdfs`, { 
          file_url: contentForm.answer_url, 
          pdf_type: 'answer' 
        }));
      }
      
      await Promise.all(promises);
      fetchData();
      setIsContentModalOpen(false);
      toast.success("Materials Updated", { description: "All content has been saved successfully." });
    } catch (err) {
      toast.error("Update Failed", { description: "Error updating some materials. Check links." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'question' | 'answer') => {
    if (type === 'question') setIsUploadingQuestion(true);
    else setIsUploadingAnswer(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response.data.url;
      if (type === 'question') {
        setContentForm(prev => ({ ...prev, question_url: fileUrl }));
      } else {
        setContentForm(prev => ({ ...prev, answer_url: fileUrl }));
      }
      toast.success("File Uploaded");
    } catch (err) {
      toast.error("Upload Failed", { description: "Failed to upload file." });
    } finally {
      if (type === 'question') setIsUploadingQuestion(false);
      else setIsUploadingAnswer(false);
    }
  };

  const handleDeletePaper = async (id: string, year: number) => {
    if (!window.confirm(`Delete ${year} paper and all its associated videos/PDFs?`)) return;
    try {
      await api.delete(`/admin/papers/${id}`);
      toast.success("Paper Removed");
      fetchData();
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-400 font-semibold text-sm uppercase tracking-widest">Loading Papers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/admin_dashboard/subjects')}
            className="p-3 bg-white border border-blue-50 rounded-2xl shadow-sm text-slate-400 hover:text-primary hover:border-primary/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{subject?.name}</h1>
              <span className="px-3 py-1 bg-blue-50 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                {subject?.level_name}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400">Manage exam papers and learning materials.</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsPaperModalOpen(true)}
          className="w-full md:w-auto bg-primary hover:bg-blue-500 text-white flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-semibold text-sm shadow-xl shadow-primary/10 transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Paper
        </motion.button>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {papers.length > 0 ? (
          papers.map((paper) => (
            <motion.div 
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-blue-50 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-300 group relative overflow-hidden flex flex-col"
            >
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={() => handleDeletePaper(paper.id, paper.year)}
                    className="p-3 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{subject?.name}</p>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">{paper.year} <span className="text-primary">{paper.paper_type}</span></h3>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Play className="w-3 h-3 text-primary" /> Video Solutions
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${paper.video_count > 0 ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                        {paper.video_count > 0 ? "ACTIVE" : "EMPTY"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-blue-50/50 rounded-full overflow-hidden">
                      <div className={`h-full bg-primary transition-all duration-1000 ${paper.video_count > 0 ? "w-full" : "w-0"}`}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-3 h-3 text-blue-500" /> PDF Materials
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${paper.pdf_count >= 2 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {paper.pdf_count}/2 READY
                      </span>
                    </div>
                    <div className="h-1.5 bg-blue-50/50 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${Math.min((paper.pdf_count / 2) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-blue-50/50">
                  <button 
                    onClick={() => handleOpenContent(paper)}
                    className="flex-1 py-3 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Manage
                  </button>
                  <Link 
                    to={`/papers/${paper.id}`}
                    target="_blank"
                    className="p-3 bg-white text-slate-400 rounded-xl hover:bg-blue-50 hover:text-primary border border-blue-50 hover:border-primary/20 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white border border-blue-50 border-dashed rounded-[3rem] shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-blue-200">
              <FileText className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No papers published yet</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-sm mx-auto">Build your examination library by adding the first year for this subject.</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaperModalOpen(true)}
              className="bg-primary hover:bg-blue-500 text-white py-4 px-10 rounded-2xl font-semibold text-sm shadow-xl shadow-primary/20 transition-all inline-flex items-center gap-3"
            >
              <Plus className="w-5 h-5" /> Add First Paper
            </motion.button>
          </div>
        )}
      </div>

      {/* Add Paper Modal */}
      <AnimatePresence>
        {isPaperModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsPaperModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-blue-50 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner">
                  <Plus className="w-8 h-8" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">New Paper</h2>
                <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">Configure the examination details for this entry.</p>

                <form onSubmit={handleAddPaper} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Examination Year</label>
                    <input 
                      type="number" required value={newPaper.year} onChange={(e) => setNewPaper({ ...newPaper, year: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 bg-blue-50/20 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Paper Category</label>
                    <div className="relative">
                      <select 
                        required value={newPaper.paper_type} onChange={(e) => setNewPaper({ ...newPaper, paper_type: e.target.value })}
                        className="w-full px-6 py-4 bg-blue-50/20 border border-blue-100 rounded-2xl focus:outline-none focus:border-primary appearance-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="Paper 1">Paper 1 (MCQs)</option>
                        <option value="Paper 2">Paper 2 (Structured)</option>
                        <option value="Paper 3">Paper 3 (Practicals)</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-300">
                        <ChevronLeft className="w-5 h-5 -rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsPaperModalOpen(false)} className="flex-1 py-4 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Entry"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Content Modal (Video/PDFs) */}
      <AnimatePresence>
        {isContentModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsContentModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-3xl shadow-2xl border border-blue-50 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100">
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-[1.2rem] flex items-center justify-center text-primary shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Material Command</h2>
                    <p className="text-sm font-medium text-slate-500">{selectedPaper?.year} • {selectedPaper?.paper_type} • {subject?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsContentModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Examination Year</label>
                  <input 
                    type="number" value={contentForm.year} onChange={(e) => setContentForm({ ...contentForm, year: parseInt(e.target.value) })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Paper Type</label>
                  <select 
                    value={contentForm.paper_type} onChange={(e) => setContentForm({ ...contentForm, paper_type: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary font-semibold text-slate-700 appearance-none"
                  >
                    <option value="Paper 1">Paper 1 (MCQs)</option>
                    <option value="Paper 2">Paper 2 (Structured)</option>
                    <option value="Paper 3">Paper 3 (Practicals)</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleSaveMaterials} className="space-y-8">
                {/* YouTube Link Section */}
                <div className="p-6 bg-blue-50/20 rounded-[2rem] border border-blue-50 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 text-primary/5 group-hover:text-primary/10 transition-colors">
                    <Play className="w-20 h-20 rotate-12" />
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Masterclass Video Solution</h3>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">YouTube Video ID or Link</label>
                    <div className="relative">
                      <input 
                        type="text" placeholder="e.g. dQw4w9WgXcQ" value={contentForm.youtube_id} onChange={(e) => setContentForm({ ...contentForm, youtube_id: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* PDF Materials Section */}
                <div className="p-6 bg-blue-50/20 rounded-[2rem] border border-blue-50 space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                    <FileText className="w-20 h-20 -rotate-12" />
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Upload className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Digital Documents</h3>
                  </div>
                  
                  <div className="grid gap-6 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Question Paper (PDF)</label>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                          {isUploadingQuestion ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {isUploadingQuestion ? "UPLOADING..." : "UPLOAD NEW"}
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'question')} />
                        </label>
                      </div>
                      <input 
                        type="text" placeholder="Public URL to question file" value={contentForm.question_url} onChange={(e) => setContentForm({ ...contentForm, question_url: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Marking Scheme (PDF)</label>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-primary-dark cursor-pointer transition-colors bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                          {isUploadingAnswer ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {isUploadingAnswer ? "UPLOADING..." : "UPLOAD NEW"}
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'answer')} />
                        </label>
                      </div>
                      <input 
                        type="text" placeholder="Public URL to solution file" value={contentForm.answer_url} onChange={(e) => setContentForm({ ...contentForm, answer_url: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Deploy All Materials <ArrowUpRight className="w-4 h-4" /></>}
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

export default AdminPapers;
