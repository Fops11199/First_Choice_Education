import { useState, useEffect } from 'react';
import { Search, Building2, MapPin, ArrowRight, ChevronDown, GraduationCap, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const REGIONS = [
  'All Regions', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const UniversitiesPage = () => {
  const { user } = useAuth();
  const [adverts, setAdverts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  
  useEffect(() => {
    // Default to user's region if available
    if (user?.region) {
      setSelectedRegion(user.region);
    }
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adverts/');
      setAdverts(res.data);
    } catch (err) {
      console.error("Failed to fetch universities:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdverts = adverts.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ad.description && ad.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = selectedRegion === "All Regions" || 
                          (ad.available_regions && ad.available_regions.includes(selectedRegion));
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-10 lg:p-16 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-black uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" /> University Showcase
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Explore your future <span className="text-primary">Campus.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Discover top universities and professional schools across Cameroon. Find the right program that matches your GCE aspirations.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by name, program or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold placeholder:text-slate-300"
            />
          </div>
          <div className="relative group min-w-[220px]">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full pl-14 pr-12 py-5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/10 rounded-full" />
              <div className="w-20 h-20 border-4 border-t-primary rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Institutions...</p>
          </div>
        ) : filteredAdverts.length === 0 ? (
          <div className="bg-white rounded-3xl py-32 text-center border border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Building2 className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No matching institutions</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your search or region filters to find what you're looking for.</p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedRegion("All Regions");}}
              className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
            >
              Clear Filters <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAdverts.map((ad, idx) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  to={`/universities/${ad.id}`}
                  className="block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="relative h-60 overflow-hidden">
                    {ad.image_url ? (
                      <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Building2 className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                        {ad.institution_type || 'Institution'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{ad.title}</h3>
                      <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> {ad.location || 'Location varies'}
                      </p>
                    </div>

                    <p className="text-slate-600 text-sm font-medium line-clamp-2 leading-relaxed">
                      {ad.description || 'Learn more about this institution, its programs, and how to apply for the next academic year.'}
                    </p>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {ad.available_regions ? ad.available_regions.split(',').slice(0, 2).map((r: string) => (
                          <span key={r} className="px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tight">
                            {r.trim()}
                          </span>
                        )) : <span className="text-[10px] text-slate-300 italic">Global Reach</span>}
                        {ad.available_regions?.split(',').length > 2 && (
                          <span className="px-2.5 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black">
                            +{ad.available_regions.split(',').length - 2}
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;
