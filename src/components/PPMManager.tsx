
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { PPMSchedule, Branch } from '../types';
import { cn } from '../utils/cn';

const MONTHS = [
  'None', 'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PPMManager({ storage }: { storage: any }) {
  const { ppmTasks, setPpmTasks } = storage;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<PPMSchedule, 'id'>>({
    equipmentName: '',
    branch: 'Dammam',
    month: 'January',
    status: 'Pending'
  });

  const { devices } = storage;
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.month === 'None') {
      if (confirm(`Set month to 'None'? This will clear ALL PPM tasks for the ${formData.branch} branch.`)) {
        setPpmTasks(ppmTasks.filter((t: any) => t.branch !== formData.branch));
        setIsModalOpen(false);
        return;
      }
      return;
    }

    // Find all equipment currently registered in the selected branch
    const branchEquipment = devices.filter((d: any) => d.branch === formData.branch);
    
    if (branchEquipment.length === 0) {
      alert(`No equipment found in ${formData.branch} branch. Add devices in Installations first.`);
      return;
    }

    // Clear existing PPMs for this branch to avoid duplicates before adding new batch
    const filteredTasks = ppmTasks.filter((t: any) => t.branch !== formData.branch);

    const newSchedules = branchEquipment.map((device: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      equipmentName: device.name,
      branch: formData.branch,
      month: formData.month,
      status: 'Pending' as const
    }));

    setPpmTasks([...filteredTasks, ...newSchedules]);
    setIsModalOpen(false);
  };

  const deletePPM = (id: string) => {
    if (confirm('Delete this PPM schedule?')) {
      setPpmTasks(ppmTasks.filter((t: any) => t.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setPpmTasks(ppmTasks.map((t: any) => 
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">PPM Schedule</h2>
          <p className="text-sm text-slate-500">Monthly Branch Maintenance Planning</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ppmTasks.map((task: PPMSchedule) => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900">{task.equipmentName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">{task.branch}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {task.status}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-bold text-slate-900">{task.month}</span>
              </div>

              <div className="pt-4 border-t border-slate-50 flex gap-2">
                <button 
                  onClick={() => toggleStatus(task.id)}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    task.status === 'Completed' 
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" /> 
                  {task.status === 'Completed' ? 'Mark Pending' : 'Mark Done'}
                </button>
                <button 
                  onClick={() => deletePPM(task.id)}
                  className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {ppmTasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No PPM schedules added yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add PPM Schedule</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><XCircle className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Branch</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value as Branch})}
                  >
                    <option value="Dammam">Dammam</option>
                    <option value="Al Khobar">Al Khobar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Scheduled Month</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
