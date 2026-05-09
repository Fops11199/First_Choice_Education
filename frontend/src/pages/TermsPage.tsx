import { motion } from 'framer-motion';
import { Scale, Gavel, UserCheck, AlertTriangle, Copyright, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

const TermsPage = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using First Choice Education, you agree to be bound by these Terms of Service and all applicable laws in the Republic of Cameroon. If you do not agree, you are prohibited from using this service.",
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      title: "2. User Conduct",
      content: "Students are expected to use the platform for academic purposes only. Any attempt to scrape, reverse engineer, or disrupt the video delivery network will result in immediate account termination.",
      icon: <Gavel className="w-5 h-5" />
    },
    {
      title: "3. Intellectual Property",
      content: "All video solutions, past paper compilations, and designs are the exclusive property of First Choice Education. Users may not redistribute or sell any content from this platform.",
      icon: <Copyright className="w-5 h-5" />
    },
    {
      title: "4. Disclaimer of Warranty",
      content: "While we strive for 100% accuracy, our materials are provided 'as is'. We are not responsible for any examination results or academic outcomes linked to the use of our platform.",
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO title="Terms of Service" />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-12">
            {/* Header */}
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                <Scale className="w-3 h-3" /> Legal Agreement
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-slate-500 font-medium">Last Updated: May 2026</p>
            </div>

            <div className="space-y-10">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 leading-relaxed text-slate-600 font-medium italic">
                "Please read these terms carefully. They govern your use of the First Choice Education platform and its associated services."
              </div>

              {sections.map((section, i) => (
                <motion.section 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                  </div>
                  <p className="text-slate-600 leading-loose pl-13">
                    {section.content}
                  </p>
                </motion.section>
              ))}

              <div className="pt-10 border-t border-slate-100 space-y-6">
                <h3 className="text-xl font-black text-slate-900">User Obligations</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Maintain accurate profile info",
                    "Protect your account password",
                    "Respect community guidelines",
                    "Use content for personal study only"
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-slate-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-2xl text-white">
                <h4 className="text-lg font-black mb-4">Termination</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  We reserve the right to suspend accounts that violate these terms or engage in behavior detrimental to the student community.
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

