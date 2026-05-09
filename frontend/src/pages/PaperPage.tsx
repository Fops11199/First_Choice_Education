import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Send, FileText, Play, Reply as ReplyIcon, X,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// ── Configure PDF.js worker ──────────────────────────────────────────────────
// Using a reliable CDN for the worker to avoid local resolution issues in various environments
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ── PDF Viewer Component ─────────────────────────────────────────────────────
const PdfViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when URL changes (switching between Q & A papers)
  useEffect(() => {
    setPageNumber(1);
    setPdfError(false);
    setIsLoading(true);
  }, [url]);

  // Fit-to-width on first load and when scale changes
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setPdfError(false);
  };

  const onDocumentLoadError = () => {
    setIsLoading(false);
    setPdfError(true);
  };

  const goToPrev = () => setPageNumber(p => Math.max(1, p - 1));
  const goToNext = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomIn  = () => setScale(s => Math.min(2.5, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)));

  if (pdfError) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-4">
          <FileText className="w-12 h-12 opacity-20" />
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Preview Unavailable</p>
            <p className="text-[10px] font-bold text-slate-400">Rendering failed. Using browser viewer instead.</p>
          </div>
        </div>
        {/* Fallback to native browser PDF viewer via iframe */}
        <iframe 
          src={`${url}#toolbar=0&navpanes=0`} 
          className="absolute inset-0 w-full h-full border-none z-20 bg-white"
          title="PDF Fallback Viewer"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border-b border-slate-100 px-4 py-2 shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-black text-slate-500 min-w-[70px] text-center">
            {isLoading ? '...' : `${pageNumber} / ${numPages}`}
          </span>
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-black text-slate-500 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PDF Canvas Area ────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-slate-200 flex justify-center py-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading PDF...</p>
            </div>
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="flex flex-col items-center gap-4"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="shadow-xl"
            renderTextLayer={true}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* ── Swipe hint / bottom nav ──────────────────────────────────── */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-6 bg-white border-t border-slate-100 py-3 shrink-0">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {/* Dot indicators (max 7 dots) */}
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(numPages, 7) }, (_, i) => {
              const dotPage = numPages <= 7 ? i + 1 : Math.round((i / 6) * (numPages - 1)) + 1;
              const isActive = numPages <= 7 ? (pageNumber === dotPage) : (i === Math.round(((pageNumber - 1) / (numPages - 1)) * 6));
              return (
                <div
                  key={i}
                  className={`rounded-full transition-all ${isActive ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-slate-200'}`}
                />
              );
            })}
          </div>
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};


// ── Main PaperPage ────────────────────────────────────────────────────────────
const PaperPage = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paper, setPaper] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'paper' | 'discussion'>('paper');
  const [pdfType, setPdfType] = useState<'question' | 'answer'>('question');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputBottom, setInputBottom] = useState(0);

  // ── Keyboard-aware input offset (mobile) ─────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setInputBottom(offset > 20 ? offset : 0);
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  const fetchPaperAndComments = useCallback(async () => {
    try {
      const [paperRes, commentsRes] = await Promise.all([
        api.get(`/content/papers/${paperId}`),
        api.get(`/community/papers/${paperId}/comments`),
      ]);
      setPaper(paperRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error('Error fetching paper data:', err);
      toast.error('Failed to load paper workspace');
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  useEffect(() => {
    fetchPaperAndComments();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [fetchPaperAndComments]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [activeTab, comments.length]);

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    if (url.length === 11) return url;
    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const getPdfUrl = () => {
    if (!paper) return '';
    const target = paper.pdfs?.find((p: any) => p.pdf_type === pdfType) || paper.pdfs?.[0];
    const rawUrl = target?.file_url || paper.file_url;
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http')) return rawUrl;

    const apiBase = api.defaults.baseURL || '';
    let origin = apiBase.split('/api/v1')[0];

    const isLocalhostApi = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isRemoteAccess = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

    if (!origin || origin === '' || origin.startsWith('/') || (isLocalhostApi && isRemoteAccess)) {
      origin = `${window.location.protocol}//${window.location.hostname}:8080`;
    }

    return `${origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  };

  const getVideoId = () => extractYoutubeId(paper?.videos?.[0]?.youtube_id);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/community/papers/${paperId}/comments`, {
        content: newComment,
        parent_id: replyTo?.id || null
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      setReplyTo(null);
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <div className="w-14 h-14 border-4 border-blue-50 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Paper</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 z-[9999]">
        Paper not found
      </div>
    );
  }

  const currentPdfUrl = getPdfUrl();
  const videoId = getVideoId();

  return (
    <div className="fixed inset-0 flex flex-col bg-white z-[9999] overflow-hidden">
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 shrink-0 shadow-sm relative z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-all mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800 truncate leading-tight">
            {paper.year} · {paper.paper_type}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {paper.subject_name}
          </p>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Video Player Section */}
        {videoId ? (
          <div className="bg-black shrink-0 relative" style={{ aspectRatio: '16/9', maxHeight: '40vh' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Solution Video"
            />
          </div>
        ) : (
          <div className="h-12 bg-slate-50 shrink-0 flex items-center justify-center gap-3 border-b border-slate-100">
            <Play className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Video solution available</span>
          </div>
        )}

        {/* Primary Tabs */}
        <div className="flex items-center bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={() => setActiveTab('paper')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase tracking-widest relative transition-all ${
              activeTab === 'paper' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paper
            {activeTab === 'paper' && <motion.div layoutId="paperTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase tracking-widest relative transition-all ${
              activeTab === 'discussion' ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussion
            {comments.length > 0 && (
              <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">
                {comments.length}
              </span>
            )}
            {activeTab === 'discussion' && <motion.div layoutId="paperTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 relative overflow-hidden bg-slate-50">
          <AnimatePresence mode="wait">
            {activeTab === 'paper' ? (
              <motion.div
                key="paper-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Sub-selector for Question/Answer */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-center gap-3 shrink-0">
                  <button
                    onClick={() => setPdfType('question')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      pdfType === 'question' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Question Paper
                  </button>
                  <button
                    onClick={() => setPdfType('answer')}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      pdfType === 'answer' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Answer Key
                  </button>
                </div>

                {/* ── react-pdf Viewer ─────────────────────────── */}
                <div className="flex-1 relative overflow-hidden">
                  {currentPdfUrl ? (
                    <PdfViewer key={`${pdfType}-${currentPdfUrl}`} url={currentPdfUrl} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Document not available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="discussion-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute inset-0 flex flex-col bg-slate-50"
                style={{ paddingBottom: inputBottom }}
              >
                {/* Chat Container */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                  <div className="flex justify-center mb-8">
                    <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Discussion Hub</p>
                    </div>
                  </div>

                  {comments.map((comment, idx) => {
                    const isMe = comment.author_name === user?.full_name;
                    const showName = idx === 0 || comments[idx - 1].author_name !== comment.author_name;

                    return (
                      <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showName && !isMe && (
                          <div className="flex items-center gap-2 mb-1.5 ml-2">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{comment.author_name}</span>
                            {comment.author_role !== 'student' && (
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                comment.author_role === 'admin' ? 'bg-rose-500 text-white' : 'bg-primary text-white'
                              }`}>
                                {comment.author_role}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={`group relative max-w-[85%] px-4 py-3 rounded-2xl shadow-sm border transition-all ${
                          isMe
                          ? 'bg-primary text-white border-primary-dark rounded-tr-none'
                          : 'bg-white text-slate-700 border-slate-100 rounded-tl-none hover:border-primary/30'
                        }`}>
                          {comment.parent_content && (
                            <div className={`mb-2 p-2 rounded-lg border-l-4 ${isMe ? 'bg-black/10 border-white/30' : 'bg-slate-50 border-primary/30'} flex flex-col`}>
                              <span className={`text-[9px] font-black mb-1 ${isMe ? 'text-white/70' : 'text-primary'}`}>
                                {comment.parent_author}
                              </span>
                              <p className={`text-[10px] italic line-clamp-2 leading-relaxed ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                                "{comment.parent_content}"
                              </p>
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-relaxed break-words">
                              {comment.content}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-1 opacity-50">
                              <span className="text-[8px] font-bold uppercase">
                                {new Date(comment.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Reply button */}
                          <div className={`absolute top-0 ${isMe ? '-left-10' : '-right-10'} bottom-0 w-10 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity`}>
                            <button
                              onClick={() => {
                                setReplyTo(comment);
                                textareaRef.current?.focus();
                              }}
                              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors active:scale-95"
                            >
                              <ReplyIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} className="h-4" />
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white shrink-0 border-t border-slate-100">
                  <AnimatePresence>
                    {replyTo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 relative overflow-hidden"
                      >
                        <div className="w-1 h-full absolute left-0 top-0 bg-primary" />
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-primary uppercase mb-0.5">{replyTo.author_name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 italic">{replyTo.content}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-white rounded-lg">
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handlePostComment} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment(e);
                          }
                        }}
                        placeholder="Join the discussion..."
                        rows={1}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none max-h-32 scrollbar-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PaperPage;
