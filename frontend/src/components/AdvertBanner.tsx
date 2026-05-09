import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/api';

interface Advert {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  institution_type?: string;
}

const AdvertBanner = () => {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const res = await api.get('/adverts/');
        setAdverts(res.data);
      } catch (err) {
        console.error('Failed to fetch adverts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdverts();
  }, []);

  useEffect(() => {
    if (adverts.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [adverts, currentIndex, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % adverts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + adverts.length) % adverts.length);
  };

  if (loading) return null;
  if (adverts.length === 0) return null;

  return (
    <div 
      className="relative w-full mb-10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
         <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
           <Building2 className="w-3 h-3" /> Featured Institutions
         </h2>
         <Link to="/universities" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 group/link">
           View All <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
         </Link>
      </div>

      <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden rounded-[32px] shadow-xl shadow-primary/5 border border-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={adverts[currentIndex].id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Link to={`/universities/${adverts[currentIndex].id}`} className="block w-full h-full relative">
              <img
                src={adverts[currentIndex].image_url}
                alt={adverts[currentIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex flex-col justify-end p-8 lg:p-10">
                <div className="space-y-2 max-w-lg transform group-hover:translate-y-[-8px] transition-transform duration-500">
                   <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                     {adverts[currentIndex].institution_type || 'Institution'}
                   </span>
                   <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                     {adverts[currentIndex].title}
                   </h3>
                   <p className="text-white/60 text-xs font-bold flex items-center gap-2">
                     Click to explore programs and campus details <ArrowRight className="w-4 h-4" />
                   </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {adverts.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); handlePrev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 border border-white/10 flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleNext(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 border border-white/10 flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute top-6 right-8 flex gap-2">
              {adverts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvertBanner;
