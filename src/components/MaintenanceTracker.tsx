
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  MapPin,
  FileText,
  XCircle
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { MaintenanceRecord, Branch } from '../types';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

interface MaintenanceTrackerProps {
  storage: ReturnType<typeof useStorage>;
}

export default function MaintenanceTracker({ storage }: MaintenanceTrackerProps) {
  const { maintenance, setMaintenance, options } = storage;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const [formData, setFormData] = useState<Omit<MaintenanceRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    branch: 'Dammam',
    department: '',
    room: '',
    equipmentName: '',
    description: '',
    status: 'In Progress',
    priority: 'Medium',
    serviceReport: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-fill branch/department/room from device
    const device = storage.devices.find((d: any) => d.name === formData.equipmentName);
    const finalData = {
      ...formData,
      branch: device?.branch || formData.branch,
      department: device?.department || formData.department,
      room: device?.room || formData.room
    };

    if (editingRecord) {
      setMaintenance(maintenance.map(m => m.id === editingRecord.id ? { ...finalData, id: m.id } : m));
    } else {
      const newRecord: MaintenanceRecord = {
        ...finalData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setMaintenance([newRecord, ...maintenance]);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      branch: 'Dammam',
      department: '',
      room: '',
      equipmentName: '',
      description: '',
      status: 'In Progress',
      priority: 'Medium',
      serviceReport: false
    });
  };

  const deleteRecord = (id: string) => {
    if (confirm('Delete this maintenance record?')) {
      setMaintenance(maintenance.filter(m => m.id !== id));
    }
  };

  const filteredMaintenance = maintenance.filter(m => 
    m.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Corrective Maintenance</h2>
          <p className="text-sm text-slate-500">Track and manage equipment breakdowns</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
        >
          <Plus className="w-5 h-5" />
          Log Breakdown
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by equipment or issue description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMaintenance.map((record) => (
          <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
            <div className={cn(
              "w-2 md:w-auto md:min-w-[8px]",
              record.priority === 'Critical' ? 'bg-red-500' : 
              record.priority === 'High' ? 'bg-orange-500' : 
              record.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'
            )} />
            
            <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getPriorityColor(record.priority)
                      )}>
                        {record.priority}
                      </span>
                      <span className="text-xs font-medium text-slate-400">#{record.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{record.equipmentName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" /> {record.status}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{record.description}"
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {record.branch} • {record.department} ({record.room})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Report: {record.serviceReport ? (
                      <span className="text-emerald-600 font-bold">Attached</span>
                    ) : (
                      <span className="text-rose-500 font-bold">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:border-l border-slate-100 md:pl-6 flex flex-row md:flex-col justify-between md:justify-center gap-2">
                <button 
                  onClick={() => {
                    setEditingRecord(record);
                    setFormData(record);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => deleteRecord(record.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                {record.status === 'In Progress' && (
                  <button 
                    onClick={() => {
                      setMaintenance(maintenance.map(m => m.id === record.id ? { ...m, status: 'Completed' } : m));
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingRecord ? 'Edit CM Record' : 'Log New Breakdown'}</h3>
                <p className="text-sm text-slate-500">Provide details about the equipment failure</p>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
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
                {/* Branch, Department, and Room are auto-filled from device selection */}
                <div className="col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Branch</p>
                    <p className="text-sm font-bold text-blue-900">{storage.devices.find((d: any) => d.name === formData.equipmentName)?.branch || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Department</p>
                    <p className="text-sm font-bold text-blue-900">{storage.devices.find((d: any) => d.name === formData.equipmentName)?.department || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Room</p>
                    <p className="text-sm font-bold text-blue-900">{storage.devices.find((d: any) => d.name === formData.equipmentName)?.room || '---'}</p>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Problem Description</label>
                  <textarea 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]"
                    required
                    placeholder="Describe the issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <input 
                    type="checkbox"
                    id="serviceReport"
                    className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    checked={formData.serviceReport}
                    onChange={(e) => setFormData({...formData, serviceReport: e.target.checked})}
                  />
                  <label htmlFor="serviceReport" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Service Report Received
                  </label>
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
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                >
                  {editingRecord ? 'Update Record' : 'Log Breakdown'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
