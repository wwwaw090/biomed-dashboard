
import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  TrendingDown, 
  Phone,
  User,
  Building2,
  Calendar,
  XCircle
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { Quotation } from '../types';
import { cn } from '../utils/cn';

interface QuotationManagerProps {
  storage: ReturnType<typeof useStorage>;
}

export default function QuotationManager({ storage }: QuotationManagerProps) {
  const { quotations, setQuotations, options } = storage;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);

  const [formData, setFormData] = useState<Omit<Quotation, 'id'>>({
    equipmentName: '',
    modelNumber: '',
    companyName: '',
    engineerName: '',
    engineerMobile: '',
    price: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuote) {
      setQuotations(quotations.map(q => q.id === editingQuote.id ? { ...formData, id: q.id } : q));
    } else {
      const newQuote: Quotation = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setQuotations([newQuote, ...quotations]);
    }
    setIsModalOpen(false);
    setEditingQuote(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      equipmentName: '',
      modelNumber: '',
      companyName: '',
      engineerName: '',
      engineerMobile: '',
      price: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
  };

  const deleteQuote = (id: string) => {
    if (confirm('Delete this quotation?')) {
      setQuotations(quotations.filter(q => q.id !== id));
    }
  };

  // Group quotes by equipment name to facilitate comparison
  const groupedQuotes = useMemo(() => {
    const groups: Record<string, Quotation[]> = {};
    quotations.forEach(q => {
      const key = q.equipmentName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [quotations]);

  const getBestPrice = (quotes: Quotation[]) => {
    return Math.min(...quotes.map(q => q.price));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Quotation Management</h2>
          <p className="text-sm text-slate-500">Track and compare vendor offers</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setEditingQuote(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Add Quotation
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search equipment or company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedQuotes).map(([equipment, quotes]) => {
          const bestPrice = getBestPrice(quotes);
          return (
            <div key={equipment} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="font-bold text-lg text-slate-800">{equipment}</h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                  {quotes.length} Quotes
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    className={cn(
                      "bg-white rounded-2xl border transition-all overflow-hidden relative group",
                      quote.status === 'Approved' ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200",
                      quote.price === bestPrice && quotes.length > 1 ? "shadow-md shadow-emerald-100" : "shadow-sm"
                    )}
                  >
                    {quote.price === bestPrice && quotes.length > 1 && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> BEST PRICE
                      </div>
                    )}

                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Building2 className="w-4 h-4 text-slate-600" />
                        </div>
                        <h4 className="font-bold text-slate-900">{quote.companyName}</h4>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quote Price</p>
                          <p className="text-2xl font-black text-slate-900">SAR {quote.price.toLocaleString()}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          quote.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          quote.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {quote.status}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{quote.engineerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{quote.engineerMobile}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{quote.date}</span>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingQuote(quote);
                            setFormData(quote);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-white rounded-lg text-slate-600 border border-transparent hover:border-slate-200 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteQuote(quote.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 border border-transparent hover:border-rose-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {quote.status !== 'Approved' && (
                          <button 
                            onClick={() => {
                              const updated = quotations.map(q => {
                                if (q.id === quote.id) return { ...q, status: 'Approved' };
                                // Auto-reject others for same equipment
                                if (q.equipmentName === quote.equipmentName && q.modelNumber === quote.modelNumber) return { ...q, status: 'Rejected' };
                                return q;
                              });
                              setQuotations(updated as Quotation[]);
                            }}
                            className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingQuote ? 'Edit Quotation' : 'Add New Quotation'}</h3>
                <p className="text-sm text-slate-500">Enter vendor offer details</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Equipment Name</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({...formData, equipmentName: e.target.value})}
                  >
                    <option value="">Select Equipment</option>
                    {storage.devices.map((d: any) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.modelNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Price (SAR)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  >
                    <option value="">Select Company</option>
                    {options.companies.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Date</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Engineer Name</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    value={formData.engineerName}
                    onChange={(e) => setFormData({...formData, engineerName: e.target.value})}
                  >
                    <option value="">Select Engineer</option>
                    {options.engineers.map(eng => (
                      <option key={eng} value={eng}>{eng}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Engineer Mobile</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    value={formData.engineerMobile}
                    onChange={(e) => setFormData({...formData, engineerMobile: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  {editingQuote ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
