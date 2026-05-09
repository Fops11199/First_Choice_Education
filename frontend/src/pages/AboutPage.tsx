import { motion } from 'framer-motion';
import { Users, Zap, Award, Star } from 'lucide-react';
import SEO from '../components/SEO';
import logo from '../assets/logo.png';

const AboutPage = () => {
  const milestones = [
    { year: "2025", event: "Curriculum development and digitization of GCE past papers." },
    { year: "2026", event: "Formation of First Choice Education and visionary partnership with Apostle JOHN CHi." },
    { year: "2026", event: "Official platform launch providing academic access to all 10 regions." },
    { year: "2026", event: "Achieving our first milestone of empowering thousands of Cameroonian students." }
  ];

  const values = [
    {
      title: "Academic Excellence",
      desc: "We prioritize the accuracy of our solutions, ensuring every video walkthrough follows the official GCE marking guide.",
      icon: <Award className="w-7 h-7" />
    },
    {
      title: "Inclusivity",
      desc: "Our platform is optimized for low-bandwidth usage, making it accessible even in remote areas of the country.",
      icon: <Users className="w-7 h-7" />
    },
    {
      title: "Innovation",
      desc: "We leverage modern technology to simplify complex concepts, making learning interactive and engaging.",
      icon: <Zap className="w-7 h-7" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Our Story & Mission"
        description="Learn about First Choice Education, Cameroon's leading GCE preparation platform sponsored by Apostle JOHN CHi."
      />
      
      {/* Premium Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 mb-12"
          >
            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-100">
               <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
            </div>
            <div className="space-y-2">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                Founded in Cameroon
              </span>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Empowering the next <br />
                <span className="text-primary italic">Generation of Leaders.</span>
              </h1>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            First Choice Education is Cameroon's premier digital learning platform, dedicated to providing high-quality GCE preparation resources to every student, regardless of their location or background.
          </motion.p>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-amber-800 uppercase tracking-widest">Visionary Sponsorship</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight">
            A Mission Supported by <br />
            <span className="text-primary underline decoration-primary/20 underline-offset-8">Apostle JOHN CHi</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-loose">
            Through the visionary support of Apostle JOHN CHi, First Choice Education has been able to reach thousands of students across the 10 regions of Cameroon. Our shared goal is to ensure that quality education is not a luxury, but a standard accessible to all who seek knowledge and excellence.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {values.map((v, i) => (
              <div key={i} className="space-y-6 p-10 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900">{v.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black">Our Journey</h2>
            <p className="text-slate-400 font-medium">Years of dedication to Cameroonian students.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                <span className="text-5xl font-black text-white/10 absolute top-4 right-6">{m.year}</span>
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-1 h-px bg-primary" />
                  <h4 className="text-xl font-black text-primary">{m.year}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 text-center bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <h2 className="text-4xl font-black text-slate-900 italic">"Education is the most powerful weapon which you can use to change the world."</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <img 
                   key={i}
                   src={`https://i.pravatar.cc/150?u=${i}`} 
                   className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                   alt="User"
                 />
               ))}
             </div>
             <p className="text-slate-500 font-bold">Join 5,000+ students on their path to success.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

