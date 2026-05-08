import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Loader2, ChevronDown } from 'lucide-react';
import api from '../api/api';
import SEO from '../components/SEO';

const LevelSelector = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelId, setSelectedLevelId] = useState('');

  useEffect(() => {
    api.get('/content/levels')
      .then(response => {
        setLevels(response.data);
        if (response.data.length > 0) {
          setSelectedLevelId(response.data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch levels:", err);
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (selectedLevelId) {
      navigate(`/subjects?level=${selectedLevelId}`);
    }
  };

  return (
    <div className="pt-24 pb-16 main-container">
      <SEO 
        title="Choose Your GCE Level"
        description="Select your GCE examination level to access specialized papers and solutions."
      />
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="w-8 h-1 bg-accent"></span>
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Select your path</span>
          <span className="w-8 h-1 bg-accent"></span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4">Select your study level.</h1>
        <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">Choose the GCE level you are currently preparing for to see relevant subjects.</p>
      </div>

      <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Levels...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Available GCE Levels</label>
              <div className="relative group">
                <select 
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  className="w-full pl-6 pr-12 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                  {levels.length === 0 && (
                    <>
                      <option value="o-level">Ordinary Level (O-Level)</option>
                      <option value="a-level">Advanced Level (A-Level)</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>

            <button 
              onClick={handleContinue}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              Start Learning <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Star className="w-5 h-5 fill-accent" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                Access over 1000+ solved past papers for your selected level.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <Link to="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
          Need help? Join the community <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default LevelSelector;
