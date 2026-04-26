
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown,
  Trash2,
  Edit2
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { Device, Branch } from '../types';
import { cn } from '../utils/cn';

interface InstallationTrackerProps {
  storage: ReturnType<typeof useStorage>;
}

export default function InstallationTracker({ storage }: InstallationTrackerProps) {
  const { devices, setDevices } = storage;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<Branch | 'All'>('All');
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [formData, setFormData] = useState<Omit<Device, 'id' | 'status'>>({
    name: '',
    modelNumber: '',
    serialNumber: '',
    branch: 'Dammam',
    department: '',
    room: '',
    installationDate: new Date().toISOString().split('T')[0],
    checklist: {
      installationReport: false,
      sfdaApproval: false,
      ppmPlanAdded: false,
      warrantyStatus: false,
    },
    warrantyExpiry: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const status = Object.values(formData.checklist).every(v => v) ? 'Complete' : 
                   Object.values(formData.checklist).some(v => v) ? 'Attention' : 'Pending';

    if (editingDevice) {
      setDevices(devices.map(d => d.id === editingDevice.id ? { ...formData, id: d.id, status } : d));
    } else {
      const newDevice: Device = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        status
      };
      setDevices([newDevice, ...devices]);
    }
    setIsModalOpen(false);
    setEditingDevice(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      modelNumber: '',
      serialNumber: '',
      branch: 'Dammam',
      department: '',
      room: '',
      installationDate: new Date().toISOString().split('T')[0],
      checklist: {
        installationReport: false,
        sfdaApproval: false,
        ppmPlanAdded: false,
        warrantyStatus: false,
      },
      warrantyExpiry: ''
    });
  };

  const deleteDevice = (id: string) => {
    const deviceToDelete = devices.find(d => d.id === id);
    if (!deviceToDelete) return;

    if (confirm(`Are you sure you want to delete ${deviceToDelete.name}?`)) {
      setDevices(devices.filter(d => d.id !== id));
      // Also cleanup PPM tasks for this device name in this branch
      storage.setPpmTasks(storage.ppmTasks.filter((t: any) => 
        !(t.equipmentName === deviceToDelete.name && t.branch === deviceToDelete.branch)
      ));
    }
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.serialNumber && d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBranch = filterBranch === 'All' || d.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Medical Device Installations</h2>
          <p className="text-sm text-slate-500">Track and manage new equipment onboarding</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setEditingDevice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Add New Device
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or serial number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value as any)}
            >
              <option value="All">All Branches</option>
              <option value="Dammam">Dammam</option>
              <option value="Al Khobar">Al Khobar</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div key={device.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  device.branch === 'Dammam' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {device.branch}
                </span>
                <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingDevice(device);
                      setFormData(device);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-100 lg:bg-transparent hover:bg-slate-200 rounded-lg text-slate-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteDevice(device.id)}
                    className="p-1.5 bg-rose-50 lg:bg-transparent hover:bg-rose-100 rounded-lg text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 truncate">{device.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Model: {device.modelNumber}</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="text-slate-900 font-bold">{device.department} - {device.room}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Installation Checklist</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(device.checklist).map(([key, checked]) => (
                    <div key={key} className="flex items-center gap-2">
                      {checked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={cn(
                        "text-[11px] font-medium",
                        checked ? "text-slate-700" : "text-slate-400"
                      )}>
                        {key === 'sfdaApproval' ? 'SFDA Approval' : 
                         key === 'ppmPlanAdded' ? 'PPM Plan Added' : 
                         key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {device.warrantyExpiry && (
                <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  Warranty: <span className="text-slate-900">{device.warrantyExpiry}</span>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  device.status === 'Complete' ? 'bg-emerald-500' : 
                  device.status === 'Attention' ? 'bg-amber-500' : 'bg-slate-300'
                )} />
                <span className="text-xs font-bold text-slate-600">{device.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editingDevice ? 'Edit Device' : 'New Installation'}</h3>
                <p className="text-sm text-slate-500">Enter equipment details and documentation status</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Equipment Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="e.g. MRI Scanner"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Model Number</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Branch</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value as Branch})}
                  >
                    <option value="Dammam">Dammam</option>
                    <option value="Al Khobar">Al Khobar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Department</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="e.g. Radiology"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700">Onboarding Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(formData.checklist).map((key) => (
                    <label key={key} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:border-blue-200 transition-all">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={(formData.checklist as any)[key]}
                        onChange={(e) => setFormData({
                          ...formData,
                          checklist: { ...formData.checklist, [key]: e.target.checked }
                        })}
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
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
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  {editingDevice ? 'Update Device' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
