import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, FileText, Trash2, Loader2, ExternalLink, X, Play, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      console.error("Failed to fetch papers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/papers', newPaper);
      setIsPaperModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add paper:", err);
      alert("Error adding paper.");
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
      alert("All materials updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating some materials. Please check your links.");
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
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      if (type === 'question') setIsUploadingQuestion(false);
      else setIsUploadingAnswer(false);
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!window.confirm("Delete this paper and all its associated videos/PDFs?")) return;
    try {
      await api.delete(`/admin/papers/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin_dashboard/subjects')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{subject?.name}</h1>
            <p className="text-sm text-slate-500">{subject?.level_name} • Management</p>
          </div>
        </div>
        <button 
          onClick={() => setIsPaperModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add Paper
        </button>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.length > 0 ? (
          papers.map((paper) => (
            <motion.div 
              key={paper.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleDeletePaper(paper.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{paper.year} {paper.paper_type}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{subject?.name}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">VIDEO SOLUTIONS</span>
                  <span className={paper.video_count > 0 ? "text-green-500" : "text-slate-300"}>
                    {paper.video_count} Added
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">PDF MATERIALS</span>
                  <span className={paper.pdf_count >= 2 ? "text-green-500" : "text-amber-500"}>
                    {paper.pdf_count}/2 Ready
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex gap-2">
                <button 
                  onClick={() => handleOpenContent(paper)}
                  className="flex-1 py-2 text-[11px] font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Edit Content
                </button>
                <Link 
                  to={`/paper/${paper.id}`}
                  target="_blank"
                  className="px-3 py-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border border-slate-200 border-dashed rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No papers yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start by adding the first examination year for this subject.</p>
            <button 
              onClick={() => setIsPaperModalOpen(true)}
              className="btn-primary py-2 px-6 text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Paper
            </button>
          </div>
        )}
      </div>

      {/* Add Paper Modal */}
      <AnimatePresence>
        {isPaperModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsPaperModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Add New Paper</h2>
              <p className="text-sm text-slate-500 mb-8">Select the year and type for this subject.</p>

              <form onSubmit={handleAddPaper} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year</label>
                  <input 
                    type="number" 
                    required
                    value={newPaper.year}
                    onChange={(e) => setNewPaper({ ...newPaper, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paper Type</label>
                  <select 
                    required
                    value={newPaper.paper_type}
                    onChange={(e) => setNewPaper({ ...newPaper, paper_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all font-semibold appearance-none"
                  >
                    <option value="Paper 1">Paper 1 (MCQs)</option>
                    <option value="Paper 2">Paper 2 (Structured)</option>
                    <option value="Paper 3">Paper 3 (Practicals)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsPaperModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Paper"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Content Modal (Video/PDFs) */}
      <AnimatePresence>
        {isContentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsContentModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Manage Materials</h2>
                  <p className="text-sm text-slate-500">{selectedPaper?.year} {selectedPaper?.paper_type}</p>
                </div>
                <button onClick={() => setIsContentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveMaterials} className="space-y-8">
                {/* YouTube Link */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-slate-800">YouTube Solution</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video ID or Link</label>
                    <input 
                      type="text" 
                      placeholder="e.g. dQw4w9WgXcQ"
                      value={contentForm.youtube_id}
                      onChange={(e) => setContentForm({ ...contentForm, youtube_id: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                {/* PDF Materials */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">PDF Materials</h3>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Paper URL</label>
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-primary cursor-pointer hover:underline">
                          <Upload className="w-3 h-3" />
                          {isUploadingQuestion ? "Uploading..." : "Upload File"}
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'question')}
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Link to question PDF"
                        value={contentForm.question_url}
                        onChange={(e) => setContentForm({ ...contentForm, question_url: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Answer / Marking Scheme URL</label>
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-primary cursor-pointer hover:underline">
                          <Upload className="w-3 h-3" />
                          {isUploadingAnswer ? "Uploading..." : "Upload File"}
                          <input 
                            type="file" 
                            accept="application/pdf" 
                            className="hidden" 
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'answer')}
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Link to answer PDF"
                        value={contentForm.answer_url}
                        onChange={(e) => setContentForm({ ...contentForm, answer_url: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save All Materials"}
                  </button>
                </div>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400 text-center">
                  Changes take effect immediately on the student-facing site.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPapers;
