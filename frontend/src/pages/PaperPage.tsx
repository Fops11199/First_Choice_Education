import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MessageSquare, Shield, 
    Send, Loader2, Maximize2, Minimize2, 
    ChevronRight, ChevronLeft, GraduationCap, 
    MoreVertical, Info, FileText, Reply as ReplyIcon, X,
    Play, Layout, FileSearch, CheckCircle2,
    Eye, Monitor, Smartphone, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const PaperPage = () => {
    const { paperId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [paper, setPaper] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // View state
    const [viewMode, setViewMode] = useState<'split' | 'video' | 'pdf'>('split');
    const [pdfType, setPdfType] = useState<'question' | 'answer'>('question');
    const [showSidebar, setShowSidebar] = useState(false);
    
    // Chat state
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentsEndRef = useRef<null | HTMLDivElement>(null);

    const fetchPaperAndComments = async () => {
        try {
            const [paperRes, commentsRes] = await Promise.all([
                api.get(`/content/papers/${paperId}`),
                api.get(`/community/papers/${paperId}/comments`)
            ]);
            setPaper(paperRes.data);
            setComments(commentsRes.data);
            
            // Auto-adjust view mode based on device and availability
            if (window.innerWidth < 1024) {
                setViewMode('pdf');
            } else if (!paperRes.data.videos?.length) {
                setViewMode('pdf');
            }
        } catch (err) {
            console.error('Error fetching paper data:', err);
            toast.error("Failed to load workspace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaperAndComments();
        // Force the app to hide any global scrollbars and ensure we are on top
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [paperId]);

    const extractYoutubeId = (url: string) => {
        if (!url) return null;
        if (url.length === 11) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const getPdfUrl = () => {
        if (!paper) return "";
        const targetPdf = paper.pdfs?.find((p: any) => p.pdf_type === pdfType) || paper.pdfs?.[0];
        const rawUrl = targetPdf?.file_url || paper.file_url;
        
        if (!rawUrl) return "";
        
        let processedUrl = rawUrl;
        if (processedUrl.includes('localhost:8080')) {
            processedUrl = processedUrl.split('localhost:8080')[1];
        }

        if (processedUrl.startsWith('http')) return processedUrl;
        
        const apiBase = api.defaults.baseURL || "";
        let base = apiBase.split('/api/v1')[0];
        
        if (!base || base === "") {
            base = `${window.location.protocol}//${window.location.hostname}:8080`;
        }
        
        return `${base}${processedUrl}`;
    };

    const getVideoId = () => {
        const rawId = paper?.videos?.[0]?.youtube_id;
        return extractYoutubeId(rawId);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/community/papers/${paperId}/comments`, { content: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
            setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            toast.error("Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Study Engine</p>
            </div>
        );
    }

    if (!paper) {
        return <div className="fixed inset-0 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 z-[9999]">Document not found</div>;
    }

    const currentPdfUrl = getPdfUrl();
    const videoId = getVideoId();

    return (
        <div className="fixed inset-0 flex flex-col bg-white font-sans z-[9999] h-screen w-screen overflow-hidden">
            {/* 🖥️ Top Master Toolbar */}
            <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm md:text-base font-black text-slate-800 line-clamp-1 leading-tight">{paper.year} - {paper.paper_type}</h1>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                             <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {paper.subject_name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desktop Mode Switcher */}
                <div className="hidden lg:flex items-center bg-slate-100 p-1.5 rounded-[1.2rem] border border-slate-200">
                    <ModeButton active={viewMode === 'pdf'} onClick={() => setViewMode('pdf')} icon={<FileText className="w-4 h-4" />} label="Question" />
                    {videoId && (
                        <>
                            <ModeButton active={viewMode === 'split'} onClick={() => setViewMode('split')} icon={<Layout className="w-4 h-4" />} label="Dual Mode" />
                            <ModeButton active={viewMode === 'video'} onClick={() => setViewMode('video')} icon={<Play className="w-4 h-4" />} label="Solution" />
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                        <PdfTypeButton active={pdfType === 'question'} onClick={() => setPdfType('question')} label="Q" />
                        <PdfTypeButton active={pdfType === 'answer'} onClick={() => setPdfType('answer')} label="A" />
                    </div>
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2.5 rounded-xl transition-all ${showSidebar ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:text-primary'}`}
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* 📖 Workspace Content */}
            <main className="flex-1 flex overflow-hidden relative bg-slate-50">
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full">
                    
                    {/* PDF Pane */}
                    <motion.div 
                        initial={false}
                        animate={{ 
                            width: viewMode === 'pdf' ? '100%' : viewMode === 'video' ? '0%' : '50%',
                            opacity: viewMode === 'video' ? 0 : 1,
                            display: viewMode === 'video' ? 'none' : 'flex'
                        }}
                        className="h-full bg-white relative flex flex-col min-w-0"
                    >
                        <div className="flex-1 relative overflow-hidden">
                             <iframe 
                                key={`pdf-${pdfType}-${paperId}`}
                                src={`${currentPdfUrl}#toolbar=0&navpanes=0`} 
                                className="w-full h-full border-none"
                                title="GCE Paper"
                            />
                            {/* Floating Overlay for Mobile Clarity */}
                            <div className="absolute top-4 right-4 lg:hidden pointer-events-none">
                                <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{pdfType === 'question' ? 'Question Paper' : 'Marking Scheme'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Resizer Handle */}
                    {viewMode === 'split' && window.innerWidth >= 1024 && (
                        <div className="w-1 bg-slate-200" />
                    )}

                    {/* Video Pane */}
                    {videoId && (
                        <motion.div 
                            initial={false}
                            animate={{ 
                                width: viewMode === 'video' ? '100%' : viewMode === 'pdf' ? '0%' : '50%',
                                opacity: viewMode === 'pdf' ? 0 : 1,
                                display: viewMode === 'pdf' ? 'none' : 'flex'
                            }}
                            className="h-full bg-slate-900 relative flex flex-col"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-full h-full">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&autoplay=0`}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* 💬 Discussion Sidebar */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.aside 
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            className="absolute right-0 top-0 bottom-0 w-full md:w-[380px] bg-white border-l border-slate-100 shadow-2xl z-[60] flex flex-col"
                        >
                            <div className="h-16 md:h-20 border-b border-slate-50 flex items-center justify-between px-6 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Collaborative Feed</h3>
                                </div>
                                <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shadow-sm">
                                                {comment.author_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{comment.author_name}</span>
                                        </div>
                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed shadow-sm">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={commentsEndRef} />
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white">
                                <form onSubmit={handlePostComment} className="relative">
                                    <textarea 
                                        required
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 pr-14 text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none min-h-[56px]"
                                        rows={1}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting || !newComment.trim()}
                                        className="absolute right-2.5 bottom-2.5 w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center disabled:opacity-30"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* 📱 Mobile Navigation Bar - Fixed at the bottom of the fixed container */}
            <nav className="lg:hidden h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 shrink-0 z-[70] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <MobileTab 
                    active={viewMode === 'pdf'} 
                    onClick={() => setViewMode('pdf')} 
                    icon={<FileText className="w-5 h-5" />} 
                    label="PAPER" 
                />
                {videoId && (
                    <MobileTab 
                        active={viewMode === 'video'} 
                        onClick={() => setViewMode('video')} 
                        icon={<Video className="w-6 h-6" />} 
                        label="VIDEO SOLUTION" 
                        highlight
                    />
                )}
                <MobileTab 
                    active={showSidebar} 
                    onClick={() => setShowSidebar(!showSidebar)} 
                    icon={<MessageSquare className="w-5 h-5" />} 
                    label="DISCUSS" 
                />
            </nav>
        </div>
    );
};

// Internal Helper Components
const ModeButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const PdfTypeButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-9 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-400 hover:text-primary'
        }`}
    >
        {label}
    </button>
);

const MobileTab = ({ active, onClick, icon, label, highlight }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 px-4 transition-all ${
            active ? 'text-primary' : highlight ? 'text-blue-400' : 'text-slate-300'
        }`}
    >
        <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-primary/10' : highlight ? 'bg-blue-50' : ''}`}>
            {icon}
        </div>
        <span className={`text-[7px] font-black uppercase tracking-[0.1em] ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
);

export default PaperPage;
