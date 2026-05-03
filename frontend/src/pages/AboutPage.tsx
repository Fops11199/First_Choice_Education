import { Trophy, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="w-8 h-1 bg-primary"></span>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Our Story</span>
          <span className="w-8 h-1 bg-primary"></span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-deep-brown mb-6">Democratizing GCE Excellence.</h1>
        <p className="text-base text-slate-600 leading-relaxed">
          First Choice Education was born from a simple mission: to ensure every student in Cameroon, regardless of their location, has access to world-class exam preparation materials.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative">
          <div className="aspect-square bg-primary/5 rounded-3xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
              alt="Students collaborating" 
              className="w-full h-full object-cover mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block">
            <p className="text-3xl font-bold text-primary mb-1">100%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free for Basic Access</p>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-deep-brown">Built by Teachers, <br />Powered by Community.</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our content is developed by the most experienced GCE examiners in the country. We don't just provide answers; we provide the pedagogical path to understanding.
          </p>
          <div className="space-y-4 pt-4">
            <ValueItem icon={<Trophy className="w-4 h-4" />} title="Proven Results" desc="94% of our active users report significant grade improvement." />
            <ValueItem icon={<Heart className="w-4 h-4" />} title="Student First" desc="Designed to work on low-bandwidth connections across Cameroon." />
          </div>
        </div>
      </div>
    </div>
  );
};

const ValueItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-deep-brown mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default AboutPage;
