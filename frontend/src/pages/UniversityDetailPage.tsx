import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, Mail, Globe, ArrowLeft, 
  GraduationCap, Share2, 
  ExternalLink, BookOpen, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';

const UniversityDetailPage = () => {
  const { advertId } = useParams();
  const navigate = useNavigate();
  const [advert, setAdvert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvert();
  }, [advertId]);

  const fetchAdvert = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/adverts/${advertId}`);
      setAdvert(res.data);
    } catch (err) {
      toast.error("Institution not found");
      navigate('/universities');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Institution Details...</p>
      </div>
    );
  }

  if (!advert) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Header / Hero */}
      <div className="relative h-[40vh] lg:h-[55vh] w-full overflow-hidden">
        {advert.image_url ? (
          <img 
            src={advert.image_url} 
            alt={advert.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <Building2 className="w-24 h-24 text-slate-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Navigation Actions */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
          <button 
            onClick={() => navigate(-1)}
            className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleShare}
               className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10"
             >
               <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-12 left-8 right-8 max-w-7xl mx-auto z-10">
          <div className="space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
              <GraduationCap className="w-4 h-4" /> {advert.institution_type || 'Institution'}
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-white tracking-tight leading-tight">
              {advert.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-sm lg:text-base">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> {advert.location || 'Cameroon'}
              </span>
              {advert.target_url && (
                <a href={advert.target_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Globe className="w-5 h-5 text-primary" /> {new URL(advert.target_url).hostname}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10 relative z-20 space-y-10">
        {/* About Section - Full Width */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100">
           <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
             <div className="w-1.5 h-8 bg-primary rounded-full" />
             About the Institution
           </h2>
           <div className="prose prose-slate max-w-none">
             <p className="text-slate-600 font-medium text-lg lg:text-xl leading-relaxed whitespace-pre-wrap">
               {advert.description || "Information about this institution is being updated. Check back soon for more details regarding their mission and background."}
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Programs Section */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100">
               <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                 <div className="w-1.5 h-8 bg-primary rounded-full" />
                 Specialties & Programs
               </h2>
               {advert.programs ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {advert.programs.split(',').map((prog: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary transition-all">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                           <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">{prog.trim()}</span>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-slate-50 rounded-2xl p-8 text-center">
                    <p className="text-slate-400 font-medium italic">Detailed programs list is not available for this entry.</p>
                 </div>
               )}
            </div>
          </div>

          {/* Right: Sidebar / Quick Actions */}
          <div className="space-y-8">
            {/* Contact Card */}
            <div className="bg-slate-900 rounded-3xl p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
               <h3 className="text-xl font-black mb-8">Contact & Apply</h3>
               <div className="space-y-6">
                 {advert.contact_email && (
                   <a href={`mailto:${advert.contact_email}`} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-primary group-hover:scale-110 transition-all">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/40 font-black uppercase tracking-widest">Email Address</p>
                        <p className="font-bold truncate text-sm lg:text-base">{advert.contact_email}</p>
                      </div>
                   </a>
                 )}
                 {advert.contact_phone && (
                   <a href={`tel:${advert.contact_phone}`} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-primary group-hover:scale-110 transition-all">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 font-black uppercase tracking-widest">Phone Number</p>
                        <p className="font-bold text-sm lg:text-base">{advert.contact_phone}</p>
                      </div>
                   </a>
                 )}
                 {!advert.contact_email && !advert.contact_phone && (
                   <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <p className="text-sm text-white/60 font-medium">No contact info available. Visit their website for more details.</p>
                   </div>
                 )}
                 
                 {advert.target_url && (
                   <a 
                     href={advert.target_url}
                     target="_blank"
                     rel="noreferrer"
                     className="block w-full py-5 bg-primary text-white rounded-2xl font-black text-center text-sm uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 mt-8"
                   >
                     Visit Website
                   </a>
                 )}
               </div>
            </div>

            {/* Regions Coverage */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100">
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-primary" /> Regional Coverage
               </h3>
               <div className="flex flex-wrap gap-2">
                 {advert.available_regions ? advert.available_regions.split(',').map((r: string) => (
                   <span key={r} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {r.trim()}
                   </span>
                 )) : (
                   <div className="w-full p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nationwide Availability</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Disclaimer */}
            <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100/50">
               <p className="text-[10px] text-amber-700/80 font-bold leading-relaxed uppercase tracking-widest">
                 Information displayed is provided by the institution or gathered from public records. Always verify admission requirements directly with the institution.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;
