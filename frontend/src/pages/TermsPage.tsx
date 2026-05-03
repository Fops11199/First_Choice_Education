

const TermsPage = () => {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-1 bg-primary"></span>
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Legal</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-deep-brown mb-8">Terms of Service</h1>
      
      <div className="prose prose-sm text-slate-600 leading-relaxed space-y-6">
        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using First Choice Education, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on First Choice Education for personal, non-commercial transitory viewing only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">3. Disclaimer</h2>
          <p>
            The materials on First Choice Education are provided on an 'as is' basis. We make no warranties, expressed or implied.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">4. Termination</h2>
          <p>We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
