import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Book, Users, ArrowUpRight, GraduationCap, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const backgroundImages = [
  "/african_students_classroom_1777835183640.png",
  "/african_students_graduation_1777834681971.png",
  "https://images.unsplash.com/photo-1523050853064-80d1e9932d57?auto=format&fit=crop&q=80&w=2000" // Graduation students
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Image Slider */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={backgroundImages[currentImageIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Students learning"
            />
          </AnimatePresence>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/90 via-deep-brown/70 to-primary/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-1 bg-accent"></span>
                <span className="text-xs font-bold tracking-widest text-white uppercase">Cameroon's #1 GCE Hub</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
                Master the GCE. <br />
                <span className="text-primary-light">The First Choice Way.</span>
              </h1>
              
              <p className="text-lg text-slate-200 mb-8 max-w-xl leading-relaxed">
                Expert video solutions for every past paper. Join thousands of students in the most trusted e-learning community in Cameroon.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary py-3.5 px-8 text-base">
                  Start Learning Now
                </Link>
                <Link to="/levels" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Book className="w-4 h-4" />
                  Browse Papers
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div className="max-w-[200px]">
              <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-bold text-deep-brown">Verified Solutions</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">GCE Expert Approved</p>
            </div>
            <div className="max-w-[200px]">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-bold text-deep-brown">Student Community</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Learn Together</p>
            </div>
            <div className="max-w-[200px]">
              <Play className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-bold text-deep-brown">Video Lessons</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Step-by-step guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-brown mb-4">Built for your success.</h2>
            <p className="text-base text-slate-600">Simple tools designed for the way Cameroonian students study best.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Play className="w-6 h-6 text-primary" />}
              title="Expert Walkthroughs"
              desc="Understand the 'Why' with video solutions recorded by the best GCE teachers."
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6 text-primary" />}
              title="Full Paper Archive"
              desc="Access every GCE Ordinary and Advanced Level paper from the last 15 years."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Student Support"
              desc="Join thousands of students in our subject threads. Ask questions and share notes."
            />
          </div>
        </div>
      </section>

      {/* Community Callout */}
      <section className="bg-white py-16 md:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-primary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-deep-brown mb-4">The Community Hub.</h2>
              <p className="text-base text-slate-600 mb-6">
                Join the largest network of GCE students in Cameroon. Share resources, ask questions, and get help from expert moderators.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm text-deep-brown">Verified Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-cam-red" />
                  <span className="font-semibold text-sm text-deep-brown">Student-Centered</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto shrink-0">
              <Link to="/register" className="btn-primary w-full md:w-auto py-4 px-10">
                Join for Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="pattern-card flex flex-col group">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-deep-brown mb-3">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">{desc}</p>
    <div className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all cursor-pointer">
      Learn more <ArrowUpRight className="w-4 h-4" />
    </div>
  </div>
);

export default Home;
