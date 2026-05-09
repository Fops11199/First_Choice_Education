import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPage = () => {
  const sections = [
    {
      title: "1. Information Collection",
      content: "We collect information that identifies, relates to, describes, or could reasonably be linked with a particular student or device. This includes your name, email address, region, school (optional), and academic level provided during registration.",
      icon: <Eye className="w-5 h-5" />
    },
    {
      title: "2. How We Use Data",
      content: "Your data is used to provide academic services, personalize your dashboard, manage advertisements for relevant universities, and improve our video delivery network. We do not sell your personal data to third parties.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "3. Data Security",
      content: "We implement industry-standard encryption and security protocols to protect your information. Our database is hosted in secure data centers with restricted access.",
      icon: <Lock className="w-5 h-5" />
    },
    {
      title: "4. Third-Party Links",
      content: "Our platform may contain links to external university websites. First Choice Education is not responsible for the privacy practices or content of these third-party sites.",
      icon: <Globe className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO title="Privacy Policy" />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-12">
            {/* Header */}
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <Shield className="w-3 h-3" /> Secure & Private
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 font-medium">Last Updated: May 2026</p>
            </div>

            <div className="space-y-10">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 leading-relaxed text-slate-600 font-medium italic">
                "At First Choice Education, we respect your privacy and are committed to protecting the personal data of our student community."
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
                <h3 className="text-xl font-black text-slate-900">Your Rights</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Right to access your data",
                    "Right to correct information",
                    "Right to account deletion",
                    "Right to data portability"
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-900 rounded-2xl text-white">
                <h4 className="text-lg font-black mb-4">Questions?</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  If you have any questions regarding this policy or how your data is handled, please reach out to our privacy officer.
                </p>
                <a href="mailto:privacy@firstchoice.cm" className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all">
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

