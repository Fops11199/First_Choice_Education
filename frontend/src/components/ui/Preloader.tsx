import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

const messages = [
  "Sharpening the pencils...",
  "Preparing your success story...",
  "Opening the library...",
  "Gathering the past papers...",
  "Consulting the tutors...",
  "Powering up your study hub..."
];

const Preloader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6"
    >
      <div className="relative">
        {/* Decorative Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 -m-8 border-2 border-primary/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 -m-16 border border-slate-100 rounded-full"
        />

        {/* Central Icon Animation */}
        <div className="relative bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/30">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <BookOpen className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-primary-light" />
          </motion.div>
        </div>
      </div>

      {/* Message and Progress */}
      <div className="mt-20 text-center">
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-3">
          First Choice Education
        </h2>
        
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]"
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Modern Progress Bar */}
        <div className="mt-8 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="h-full bg-primary rounded-full shadow-lg shadow-primary/20"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
