import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';

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
        <div className="relative bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
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
            className="flex items-center justify-center"
          >
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </motion.div>
          
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
      </div>

      {/* Message and Progress */}
      <div className="mt-20 text-center">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          First Choice Education
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          sponsored by Apostle JOHN CHi
        </p>
        
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
