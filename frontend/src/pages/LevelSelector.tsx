import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, GraduationCap, ArrowRight, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LevelSelector = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/content/levels')
      .then(res => res.json())
      .then(data => {
        setLevels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch levels:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="w-8 h-1 bg-accent"></span>
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Select your path</span>
          <span className="w-8 h-1 bg-accent"></span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-4">Choose your level.</h1>
        <p className="text-lg text-slate-600">Access specialized papers and solutions for your specific GCE examination level.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : levels.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Fallback to static if no levels in DB yet, or show empty state */}
          <LevelCard 
            title="Ordinary Level"
            subtitle="GCE O-Level"
            desc="Access 500+ solved papers across all subjects for Form 5 students."
            icon={<Book className="w-8 h-8 text-white" />}
            color="bg-primary"
            link="/subjects?level=o-level"
          />
          <LevelCard 
            title="Advanced Level"
            subtitle="GCE A-Level"
            desc="Access 700+ deep-dive solutions for Upper Sixth students."
            icon={<GraduationCap className="w-8 h-8 text-white" />}
            color="bg-primary-light"
            link="/subjects?level=a-level"
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {levels.map((level) => (
            <LevelCard 
              key={level.id}
              title={level.name}
              subtitle={`GCE ${level.name}`}
              desc={`Explore all available ${level.name} subjects and solved past papers.`}
              icon={level.name.includes("O") ? <Book className="w-8 h-8 text-white" /> : <GraduationCap className="w-8 h-8 text-white" />}
              color={level.name.includes("O") ? "bg-primary" : "bg-primary-light"}
              link={`/subjects?level=${level.id}`}
            />
          ))}
        </div>
      )}

      <div className="mt-16 pattern-card max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-base font-bold text-deep-brown">Not sure where to start?</h4>
            <p className="text-slate-500 text-sm">Join the community and ask for guidance.</p>
          </div>
        </div>
        <Link to="/community" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest text-xs">
          Visit Forum <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const LevelCard = ({ title, subtitle, desc, icon, color, link }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="pattern-card group cursor-pointer h-full flex flex-col p-8"
  >
    <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">{subtitle}</span>
      <h2 className="text-2xl font-bold text-deep-brown mb-3">{title}</h2>
      <p className="text-slate-600 text-sm leading-relaxed mb-6">{desc}</p>
    </div>
    <Link to={link} className="btn-primary w-full py-3 text-sm text-center">
      Browse Subjects
    </Link>
  </motion.div>
);

export default LevelSelector;
