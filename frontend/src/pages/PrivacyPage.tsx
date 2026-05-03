

const PrivacyPage = () => {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-1 bg-primary"></span>
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Legal</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-deep-brown mb-8">Privacy Policy</h1>
      
      <div className="prose prose-sm text-slate-600 leading-relaxed space-y-6">
        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, such as your name, email address, and educational level.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including personalize your learning experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">3. Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-deep-brown mb-3">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at help@firstchoice.cm.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
