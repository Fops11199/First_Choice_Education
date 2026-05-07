import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, GraduationCap, ArrowRight, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import SEO from '../components/SEO';

const LevelSelector = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/content/levels')
      .then(response => {
        setLevels(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch levels:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-16 main-container">
      <SEO 
        title="Choose Your GCE Level"
        description="Select between GCE Ordinary Level (O-Level) or Advanced Level (A-Level) to access specialized papers and solutions."
      />
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="w-8 h-1 bg-accent"></span>
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Select your path</span>
          <span className="w-8 h-1 bg-accent"></span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4">Choose your level.</h1>
        <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">Access specialized papers and solutions for your specific GCE examination level.</p>
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

      <div className="mt-12 md:mt-16 pattern-card max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">Not sure where to start?</h4>
            <p className="text-slate-500 text-xs font-medium">Join the community and ask for guidance from experts.</p>
          </div>
        </div>
        <Link to="/community" className="w-full md:w-auto bg-slate-900 text-white px-6 py-3.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-900/10">
          Visit Community Forum <ArrowRight className="w-4 h-4" />
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
    <div className={`${color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{subtitle}</span>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">{desc}</p>
    </div>
    <Link to={link} className="w-full bg-slate-900 text-white py-4 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-900/10">
      Browse {title} <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

export default LevelSelector;
