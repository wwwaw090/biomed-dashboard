
import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

interface NotificationsPanelProps {
  storage: ReturnType<typeof useStorage>;
}

export default function NotificationsPanel({ storage }: NotificationsPanelProps) {
  const { notifications, setNotifications, devices, ppmTasks } = storage;
  const [isOpen, setIsOpen] = useState(false);

  // Generate automated notifications
  useEffect(() => {
    const newNotifications: any[] = [];
    
    // Missing Documentation
    devices.forEach(d => {
      const missingDocs = Object.entries(d.checklist).filter(([_, v]) => !v);
      if (missingDocs.length > 0) {
        newNotifications.push({
          id: `docs-${d.id}`,
          title: 'Missing Documentation',
          message: `${d.name} has ${missingDocs.length} pending checklist items`,
          type: 'info',
          date: new Date().toISOString(),
          read: false
        });
      }
    });

    // Pending PPM
    ppmTasks.forEach(p => {
      if (p.status === 'Pending') {
        newNotifications.push({
          id: `ppm-${p.id}`,
          title: 'Scheduled PPM',
          message: `PPM for ${p.equipmentName} is scheduled for ${p.month}`,
          type: 'info',
          date: new Date().toISOString(),
          read: false
        });
      }
    });

    // Only add if not already present
    const existingIds = notifications.map(n => n.id);
    const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
    
    if (uniqueNew.length > 0) {
      setNotifications(prev => [...uniqueNew, ...prev]);
    }
  }, [devices, ppmTasks]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 hover:bg-slate-100 rounded-full transition-all relative"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <div className="flex gap-4">
                <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Mark all read</button>
                <button onClick={clearNotifications} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500">Clear</button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "px-5 py-4 border-b border-slate-50 flex gap-4 transition-colors",
                      n.read ? "opacity-60" : "bg-blue-50/30"
                    )}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {format(new Date(n.date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900">
                View notification history
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
