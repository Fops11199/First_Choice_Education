import { useState, useEffect } from 'react';
import { Search, Plus, Building2, Edit2, Trash2, Loader2, Image as ImageIcon, ExternalLink, Globe, MapPin, Phone, Mail, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../api/api';
import ConfirmModal from '../../components/ui/ConfirmModal';

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const INSTITUTION_TYPES = [
  'University', 'Professional School', 'Technical Institute', 'Higher Institute', 'Others'
];

const AdminAdverts = () => {
  const [adverts, setAdverts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    location: '',
    institution_type: 'University',
    available_regions: [] as string[],
    programs: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
    display_order: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adverts/admin/all');
      setAdverts(res.data);
    } catch (err) {
      toast.error("Fetch Failed", { description: "Could not retrieve universities." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAdvert(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      target_url: '',
      location: '',
      institution_type: 'University',
      available_regions: [],
      programs: '',
      contact_email: '',
      contact_phone: '',
      is_active: true,
      display_order: adverts.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (advert: any) => {
    setEditingAdvert(advert);
    setFormData({
      title: advert.title || '',
      description: advert.description || '',
      image_url: advert.image_url || '',
      target_url: advert.target_url || '',
      location: advert.location || '',
      institution_type: advert.institution_type || 'University',
      available_regions: advert.available_regions ? advert.available_regions.split(',').map((r: string) => r.trim()) : [],
      programs: advert.programs || '',
      contact_email: advert.contact_email || '',
      contact_phone: advert.contact_phone || '',
      is_active: advert.is_active,
      display_order: advert.display_order || 0
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingAdvert?.id) {
        if (!editingAdvert?.id) toast.info("Save basic info first before uploading image.");
        return;
    }
    
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await api.post(`/adverts/admin/${editingAdvert.id}/image`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: res.data.image_url }));
      toast.success("Image Uploaded");
    } catch (err) {
      toast.error("Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        available_regions: formData.available_regions.join(', ')
      };

      if (editingAdvert) {
        await api.put(`/adverts/admin/${editingAdvert.id}`, payload);
        toast.success("University Updated");
      } else {
        const res = await api.post('/adverts/admin', payload);
        setEditingAdvert(res.data); // Allow image upload after creation
        toast.success("University Created");
      }
      setIsModalOpen(false);
      fetchAdverts();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.response?.data?.detail || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/adverts/admin/${deleteTarget.id}`);
      toast.success("University Removed");
      fetchAdverts();
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      available_regions: prev.available_regions.includes(region)
        ? prev.available_regions.filter(r => r !== region)
        : [...prev.available_regions, region]
    }));
  };

  const filteredAdverts = adverts.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Universities & Ads
          </h1>
          <p className="text-slate-500 font-medium">Manage showcase institutions and dashboard advertisements.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Institution
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search institutions by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-medium"
          />
        </div>
      </div>

      {/* Adverts Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Institutions...</p>
        </div>
      ) : filteredAdverts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No institutions found</h3>
          <p className="text-slate-400 text-sm">Start by adding a new university or showcase ad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdverts.map((ad) => (
            <motion.div 
              key={ad.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                    ad.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {ad.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{ad.institution_type || 'Institution'}</p>
                  <h3 className="text-xl font-black text-slate-900 truncate">{ad.title}</h3>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {ad.location || 'No location set'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ad.available_regions ? ad.available_regions.split(',').slice(0, 3).map((r: string) => (
                    <span key={r} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-tight border border-slate-100">
                      {r.trim()}
                    </span>
                  )) : <span className="text-[10px] text-slate-300 italic">No regions set</span>}
                  {ad.available_regions?.split(',').length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[9px] font-bold tracking-tight">
                      +{ad.available_regions.split(',').length - 3} more
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEdit(ad)}
                      className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget({ id: ad.id, title: ad.title })}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {ad.target_url && (
                    <a 
                      href={ad.target_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
              <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl relative shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{editingAdvert ? 'Edit Institution' : 'New Institution'}</h2>
                    <p className="text-sm text-slate-500 font-medium">Fill in the details to showcase this school.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Institution Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. University of Buea"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</label>
                        <select 
                          value={formData.institution_type}
                          onChange={(e) => setFormData({...formData, institution_type: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 appearance-none"
                        >
                          {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Order</label>
                        <input 
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Location / Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="e.g. Molyko, Buea, Southwest"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">External Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="url"
                          value={formData.target_url}
                          onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                          placeholder="https://www.example.edu"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Media & Regions */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Banner Image</label>
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4">
                        {formData.image_url ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200">
                             <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                             <button 
                               type="button"
                               onClick={() => setFormData({...formData, image_url: ''})}
                               className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                              {isUploading ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-slate-700">Upload Banner Image</p>
                               <p className="text-[10px] text-slate-400 font-medium">Recommended: 1200x600px (JPG/PNG)</p>
                            </div>
                            <label className="inline-block cursor-pointer px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl font-bold text-xs hover:bg-primary/5 transition-all shadow-sm">
                               Browse Files
                               <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading || !editingAdvert} />
                            </label>
                            {!editingAdvert && <p className="text-[9px] text-orange-500 font-black uppercase italic">Create institution first to enable upload</p>}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Regions</label>
                       <div className="grid grid-cols-2 gap-2">
                          {REGIONS.map(region => (
                            <button
                              key={region}
                              type="button"
                              onClick={() => toggleRegion(region)}
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.available_regions.includes(region)
                                  ? 'bg-primary/5 border-primary text-primary'
                                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                formData.available_regions.includes(region) ? 'bg-primary border-primary text-white' : 'border-slate-300'
                              }`}>
                                {formData.available_regions.includes(region) && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              {region}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Description / About Institution</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter a detailed description about the university, its mission, and history..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Offered Programs & Specialties</label>
                    <textarea 
                      rows={3}
                      value={formData.programs}
                      onChange={(e) => setFormData({...formData, programs: e.target.value})}
                      placeholder="e.g. Medicine, Law, Engineering, Social Sciences..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                          placeholder="admissions@example.edu"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                          placeholder="+237 6XX XXX XXX"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-3xl">
                   <button
                     type="button"
                     onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                     className={`w-14 h-8 rounded-full transition-all relative ${formData.is_active ? 'bg-primary' : 'bg-slate-300'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                   </button>
                   <div>
                     <p className="text-sm font-black text-slate-800">Public Visibility</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                       {formData.is_active ? 'Visible on student dashboard' : 'Hidden from students'}
                     </p>
                   </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-50 bg-white shrink-0 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingAdvert ? 'Save Changes' : 'Publish Institution')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Institution?"
        message={`Are you sure you want to remove ${deleteTarget?.title}? This institution will no longer be visible to students.`}
        confirmText="Yes, Remove"
      />
    </div>
  );
};

export default AdminAdverts;
