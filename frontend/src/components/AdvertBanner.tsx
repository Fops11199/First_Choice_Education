import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import api from '../api/api';

interface Advert {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
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
      <div className="relative h-40 md:h-56 lg:h-64 w-full overflow-hidden rounded-2xl shadow-xl shadow-primary/5 border border-slate-100">
        <AnimatePresence mode="wait">
          <motion.a
            key={adverts[currentIndex].id}
            href={adverts[currentIndex].target_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 block cursor-pointer"
          >
            <img
              src={adverts[currentIndex].image_url}
              alt={adverts[currentIndex].title}
              className="w-full h-full object-cover"
            />
            {/* Overlay for better readability if needed, or just a subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
               <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest bg-primary/80 backdrop-blur-md px-4 py-2 rounded-xl">
                 Learn More <ExternalLink className="w-3 h-3" />
               </div>
            </div>
          </motion.a>
        </AnimatePresence>

        {/* Controls */}
        {adverts.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {adverts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
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
