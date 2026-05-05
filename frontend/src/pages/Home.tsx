import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Book, Users, ArrowUpRight, GraduationCap, ShieldCheck, Heart, Star, Quote } from 'lucide-react';
import api from '../api/api';
import { Link } from 'react-router-dom';

const backgroundImages = [
  "/classroom.png",
  "/graduation.png",
  "https://images.unsplash.com/photo-1523050853064-80d1e9932d57?auto=format&fit=crop&q=80&w=2000" // Fallback graduation students
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/');
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section with Modern Glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        
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
          {/* Glassmorphic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-deep-brown/95 via-deep-brown/80 to-primary/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                <span className="text-xs font-bold tracking-widest text-white uppercase">Cameroon's #1 GCE Hub</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Master the GCE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">
                  The First Choice Way.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-medium">
                Expert video solutions for every past paper. Join thousands of students in the most trusted e-learning community in Cameroon.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary py-4 px-8 text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(206,32,41,0.4)]">
                  Start Learning Now
                </Link>
                <Link to="/levels" className="px-8 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  <Book className="w-5 h-5" />
                  Browse Papers
                </Link>
              </div>
            </motion.div>

            {/* Right Side - Floating Glass Cards */}
            <div className="hidden lg:block relative h-[500px]">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30">
                  <Play className="w-6 h-6 text-primary-light ml-1" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">1,000+ Videos</h3>
                <p className="text-slate-300 text-sm">Detailed step-by-step solutions by top Cameroonian examiners.</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-deep-brown bg-slate-300 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                      </div>
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <span className="text-accent font-bold text-xs">+5k</span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-xl mb-1">Active Forum</h3>
                <p className="text-slate-300 text-sm">Join the discussion and get unstuck.</p>
              </motion.div>
            </div>
            
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

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="py-24 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Student Success Stories</h2>
              <p className="text-slate-500 font-medium">Join thousands of students who have already transformed their GCE preparation.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={review.id} 
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-slate-50 opacity-50" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6 italic">"{review.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                      {review.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GCE Candidate</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
  <div className="relative group">
    {/* Glowing Blur Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Card Content */}
    <div className="relative h-full bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col z-10">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-2xl font-black text-deep-brown mb-3 tracking-tight">{title}</h3>
      <p className="text-base text-slate-600 leading-relaxed mb-8 flex-1">{desc}</p>
      <div className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all cursor-pointer mt-auto">
        Learn more <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export default Home;
