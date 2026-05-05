import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronRight, PlayCircle, MessageCircle, FileText, CheckCircle, ZoomIn, ZoomOut, Download, Pin, Shield, GraduationCap, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import api from "../api/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
      active ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

const PaperPage = () => {
  const { id } = useParams();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'discuss'>('pdf');
  const [pdfType, setPdfType] = useState<'question' | 'answer'>('question');
  
  const { user } = useAuth();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await api.get(`/content/papers/${id}`);
        const data = response.data;
        
        // Find question and answer PDFs
        const questionPdf = data.pdfs?.find((p: any) => p.pdf_type === 'question')?.file_url;
        const answerPdf = data.pdfs?.find((p: any) => p.pdf_type === 'answer')?.file_url;
        
        // Find first video
        const video = data.videos?.[0];
        const videoUrl = video ? `https://www.youtube.com/embed/${video.youtube_id}` : null;
        
        // Parse timestamps if they exist
        let timestamps = [];
        if (video && video.timestamps) {
          try {
            timestamps = JSON.parse(video.timestamps);
          } catch (e) {
            console.error("Failed to parse timestamps", e);
          }
        }

        setPaper({
          title: `${data.subject} ${data.year} ${data.paper_type}`,
          level: `GCE ${data.level}`,
          videoUrl,
          questionPdf,
          answerPdf,
          timestamps
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching paper:", err);
        setError("Could not load paper. Please try again later.");
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/community/papers/${id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    if (id) {
      fetchPaper();
      fetchComments();
    }
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await api.post('/students/me/progress', { 
        paper_id: id, 
        status: 'completed' 
      });
      setIsCompleted(true);
      alert("Paper marked as completed! Your progress has been updated.");
    } catch (err) {
      console.error("Failed to mark as completed:", err);
      alert("Failed to update progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !id) return;
    setIsPosting(true);
    try {
      const payload: any = { content: newComment };
      if (replyTo) {
        payload.parent_id = replyTo.id;
      }
      const res = await api.post(`/community/papers/${id}/comments`, payload);
      // Add the new comment to the list instantly
      setComments(prev => [...prev, res.data]);
      setNewComment(""); // clear input
      setReplyTo(null); // clear reply state
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handlePin = async (commentId: string) => {
    try {
      const res = await api.put(`/community/papers/${id}/comments/${commentId}/pin`);
      setComments(prev => prev.map(c => c.id === commentId ? res.data : c));
    } catch (err) {
      console.error("Error pinning comment:", err);
      alert("Failed to pin comment.");
    }
  };

  // Group comments into a tree
  const rootComments = comments.filter(c => !c.parent_id);
  // Sort roots: pinned first, then by date
  rootComments.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  const getReplies = (parentId: string) => {
    return comments.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    const canPin = user?.role === 'admin' || user?.role === 'tutor';

    return (
      <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs">
          {comment.author_initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-900">{comment.author_name}</span>
            {comment.author_role === 'admin' && (
              <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            {comment.author_role === 'tutor' && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Tutor
              </span>
            )}
            {comment.is_pinned && (
              <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            <span className="text-slate-400 text-xs">{comment.created_at}</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setReplyTo({ id: comment.id, name: comment.author_name })}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Reply
            </button>
            {canPin && !isReply && (
              <button 
                onClick={() => handlePin(comment.id)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <Pin className="w-3 h-3" /> {comment.is_pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>

          {/* Render Replies */}
          {replies.length > 0 && (
            <div className="border-l-2 border-slate-100 pl-4">
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4 text-center">
        <div>
          <h2 className="text-2xl font-bold text-deep-brown mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error || "Paper not found."}</p>
          <Link to="/dashboard" className="btn-primary py-2 px-6">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <nav className="flex items-center text-[10px] font-bold tracking-widest text-slate-400 mb-3 uppercase">
              <Link to="/dashboard" className="hover:text-primary transition-colors">Portal</Link>
              <ChevronRight className="w-3 h-3 mx-2" />
              <span className="text-deep-brown">{paper.title}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-deep-brown">{paper.title}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md py-0.5 px-2 text-[10px]">Solved</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 text-xs border-slate-200">
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="gap-2 text-xs px-6 shadow-sm"
              onClick={handleComplete}
              disabled={isCompleting || isCompleted}
            >
              {isCompleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              {isCompleted ? "Completed" : "Complete"}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs - Desktop & Mobile combined logic */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl mb-6 w-fit shadow-sm">
          {[
            { id: 'video', icon: PlayCircle, label: 'Video Solution' },
            { id: 'pdf', icon: FileText, label: 'Paper View' },
            { id: 'discuss', icon: MessageCircle, label: 'Discussion' }
          ].map((tab) => (
            <TabButton 
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              icon={<tab.icon className="w-4 h-4" />}
              label={tab.label}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Viewer */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'video' && (
              <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
                <iframe 
                  src={paper.videoUrl} 
                  title="Video player" 
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {activeTab === 'pdf' && (
              <Card className="overflow-hidden flex flex-col border-slate-200 shadow-sm rounded-2xl">
                <div className="p-2.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setPdfType('question')}
                      className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${pdfType === 'question' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Questions
                    </button>
                    <button 
                      onClick={() => setPdfType('answer')}
                      className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${pdfType === 'answer' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Answers
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-100 rounded-md"><ZoomOut className="w-4 h-4 text-slate-500" /></button>
                    <span className="text-[10px] font-bold text-slate-400 w-10 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1.5 hover:bg-slate-100 rounded-md"><ZoomIn className="w-4 h-4 text-slate-500" /></button>
                  </div>
                </div>
                
                <div className="min-h-[600px] overflow-auto bg-slate-800 flex flex-col items-center p-6 relative">
                  <Document
                    file={pdfType === 'question' ? paper.questionPdf : paper.answerPdf}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="flex items-center justify-center h-full text-white font-bold py-20">Loading GCE Paper...</div>}
                    className="drop-shadow-2xl"
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                      className="bg-white"
                    />
                  </Document>

                  {numPages && (
                    <div className="mt-8 flex justify-center items-center gap-4 text-white pb-4">
                      <button 
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))} 
                        disabled={pageNumber <= 1}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-[11px] font-bold disabled:opacity-30 transition-colors"
                      >
                        Prev
                      </button>
                      <span className="text-[11px] font-bold">Page {pageNumber} of {numPages}</span>
                      <button 
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} 
                        disabled={pageNumber >= numPages}
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-[11px] font-bold disabled:opacity-30 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'discuss' && (
              <Card className="overflow-hidden flex flex-col border-slate-200 shadow-sm rounded-2xl min-h-[500px]">
                <div className="p-4 border-b border-slate-100 bg-white">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Community Discussion
                  </h3>
                </div>
                <div className="flex-1 p-6 space-y-6 max-h-[400px] overflow-y-auto">
                  {rootComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                      <p>No comments yet. Be the first to ask a question!</p>
                    </div>
                  ) : (
                    rootComments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-3">
                  {replyTo && (
                    <div className="flex items-center justify-between bg-primary/5 px-3 py-2 rounded-lg text-xs font-bold text-primary">
                      <span>Replying to {replyTo.name}</span>
                      <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                      placeholder={replyTo ? "Write a reply..." : "Add to discussion..."}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" 
                    />
                    <Button 
                      size="sm" 
                      className="px-6 text-xs"
                      onClick={handlePostComment}
                      isLoading={isPosting}
                      disabled={!newComment.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar / Extra Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-primary" />
                  Jump to Section
                </h3>
              </div>
              <CardContent className="p-2">
                {paper.timestamps.map((ts: { time: string; label: string }, idx: number) => (
                  <button key={idx} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-4 transition-colors group">
                    <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded text-[10px]">{ts.time}</span>
                    <span className="text-sm text-slate-700 group-hover:text-primary font-semibold">{ts.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Expert Insight</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                This paper focuses heavily on mechanics. Pay close attention to the energy conservation diagrams in section 3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperPage;

