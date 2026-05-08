import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Loader2, ExternalLink, Image as ImageIcon, Link as LinkIcon, MoveUp, MoveDown } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'sonner';

interface Advert {
  id: string;
  title: str;
  image_url: string;
  target_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const AdminAdverts = () => {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '',
    is_active: true,
    display_order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    try {
      const res = await api.get('/adverts/admin/all');
      setAdverts(res.data);
    } catch (err) {
      toast.error('Failed to fetch adverts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAdvert) {
        await api.put(`/adverts/admin/${editingAdvert.id}`, formData);
        toast.success('Advert updated successfully');
      } else {
        await api.post('/adverts/admin', formData);
        toast.success('Advert created successfully');
      }
      setShowModal(false);
      setEditingAdvert(null);
      setFormData({ title: '', image_url: '', target_url: '', is_active: true, display_order: 0 });
      fetchAdverts();
    } catch (err) {
      toast.error('Failed to save advert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this advert?')) return;
    try {
      await api.delete(`/adverts/admin/${id}`);
      toast.success('Advert deleted');
      fetchAdverts();
    } catch (err) {
      toast.error('Failed to delete advert');
    }
  };

  const toggleStatus = async (advert: Advert) => {
    try {
      await api.put(`/adverts/admin/${advert.id}`, { is_active: !advert.is_active });
      fetchAdverts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">University Adverts</h1>
          <p className="text-slate-500 text-sm font-bold">Manage the slider banners on the student dashboard</p>
        </div>
        <button
          onClick={() => {
            setEditingAdvert(null);
            setFormData({ title: '', image_url: '', target_url: '', is_active: true, display_order: adverts.length });
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Advert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adverts.map((advert) => (
          <div key={advert.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="relative h-40 bg-slate-100">
              <img
                src={advert.image_url}
                alt={advert.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')}
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggleStatus(advert)}
                  className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                    advert.is_active ? 'bg-green-500/80 text-white' : 'bg-slate-500/80 text-white'
                  }`}
                >
                  {advert.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 line-clamp-1">{advert.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate max-w-[200px]">{advert.target_url}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAdvert(advert);
                      setFormData({
                        title: advert.title,
                        image_url: advert.image_url,
                        target_url: advert.target_url,
                        is_active: advert.is_active,
                        display_order: advert.display_order
                      });
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(advert.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Order: {advert.display_order}
                </div>
              </div>
            </div>
          </div>
        ))}

        {adverts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No adverts yet</h3>
            <p className="text-slate-500 text-sm">Add your first university promotion to display it on the dashboard.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white">
              <h2 className="text-xl font-black">{editingAdvert ? 'Edit Advert' : 'New Advert'}</h2>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Configure Promotion Banner</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  placeholder="e.g. University of Buea Banner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                <input
                  required
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target URL</label>
                <input
                  required
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  placeholder="https://ubuea.cm/apply"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <div className="flex items-center gap-4 h-[46px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-primary rounded border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAdvert ? 'Save Changes' : 'Create Advert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdverts;
