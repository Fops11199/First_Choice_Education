import { motion } from 'framer-motion';
import { BookOpen, Shield, Zap, Users, GraduationCap, PlayCircle, Heart } from 'lucide-react';
import SEO from '../components/SEO';

const AboutPage = () => {
  const features = [
    {
      icon: <PlayCircle className="w-6 h-6" />,
      title: "Expert Video Solutions",
      desc: "Every past paper comes with a detailed video walkthrough by top examiners."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Content",
      desc: "Our solutions are peer-reviewed and follow the official GCE marking schemes."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Subject Communities",
      desc: "Join dedicated groups for each subject to discuss questions and share resources."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Access",
      desc: "Study anywhere, anytime on any device. Your progress is always synced."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <SEO 
        title="About Our Mission"
        description="Learn how First Choice Education is revolutionizing GCE preparation in Cameroon through expert video solutions and subject communities."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
          >
            <BookOpen className="w-4 h-4" /> About First Choice Education
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
          >
            The Future of GCE Preparation in Cameroon.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium leading-relaxed"
          >
            First Choice Education is more than just a platform; it's a mission to democratize quality education for every GCE candidate across the nation.
          </motion.p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                alt="Students studying" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">5,000+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">Empowering Students with Better Resources.</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              We started with a simple observation: students spend more time searching for answers than actually learning. We've compiled 15 years of past papers and worked with top teachers to record step-by-step video solutions that explain the "how" and "why" behind every answer.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 p-1 rounded-full"><Heart className="w-3.5 h-3.5 text-primary" /></div>
                <span className="text-sm font-bold text-slate-700">Founded by teachers, built for students.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 p-1 rounded-full"><Heart className="w-3.5 h-3.5 text-primary" /></div>
                <span className="text-sm font-bold text-slate-700">Supporting both Ordinary and Advanced levels.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 p-1 rounded-full"><Heart className="w-3.5 h-3.5 text-primary" /></div>
                <span className="text-sm font-bold text-slate-700">Active community of peers and moderators.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-32">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                {f.icon}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-8 relative z-10">Start Your Success Story Today.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button className="bg-primary hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/20">
              Create Free Account
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/10 transition-all">
              Browse Subjects
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
