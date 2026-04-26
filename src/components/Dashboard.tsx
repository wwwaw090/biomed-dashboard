
import { 
  Activity, 
  Package, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { useStorage } from '../hooks/useStorage';
import { View } from '../App';

interface DashboardProps {
  storage: ReturnType<typeof useStorage>;
  setActiveView: (view: View) => void;
}

export default function Dashboard({ storage, setActiveView }: DashboardProps) {
  const { devices, maintenance, ppmTasks } = storage;

  const stats = [
    { 
      label: 'Total Assets', 
      value: devices.length, 
      icon: Package, 
      color: 'bg-blue-500', 
      view: 'installations' as View,
      trend: '+2 this month',
      isPositive: true
    },
    { 
      label: 'Active CM', 
      value: maintenance.filter(m => m.status === 'In Progress').length, 
      icon: Activity, 
      color: 'bg-orange-500', 
      view: 'maintenance' as View,
      trend: '3 high priority',
      isPositive: false
    },
    { 
      label: 'Pending PPM', 
      value: ppmTasks.filter(p => p.status === 'Pending').length, 
      icon: Calendar, 
      color: 'bg-indigo-500', 
      view: 'ppm' as View,
      trend: 'Planned schedule',
      isPositive: true
    },
    { 
      label: 'Completed PPM', 
      value: ppmTasks.filter(p => p.status === 'Completed').length, 
      icon: AlertTriangle, 
      color: 'bg-emerald-500', 
      view: 'ppm' as View,
      trend: 'This period',
      isPositive: true
    },
  ];


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-500 text-sm">Welcome back! Here's what's happening today at Dar As Sihha.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setActiveView(stat.view)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color + " p-3 rounded-xl text-white"}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Maintenance Activities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Maintenance</h3>
            <button 
              onClick={() => setActiveView('maintenance')}
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {maintenance.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No recent activities</div>
            ) : (
              maintenance.slice(0, 4).map((record) => (
                <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`p-2 rounded-lg ${
                    record.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                    record.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{record.equipmentName}</p>
                    <p className="text-sm text-slate-500">{record.branch} • {record.department}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{format(new Date(record.date), 'MMM d')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Pending Schedules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ppmTasks.filter(p => p.status === 'Pending').slice(0, 6).map(task => (
            <div key={task.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Upcoming PPM</p>
                <p className="text-xs text-blue-700">{task.equipmentName}</p>
                <p className="text-xs font-bold text-blue-900 mt-1">Month: {task.month}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
