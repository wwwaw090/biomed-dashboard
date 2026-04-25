
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  PlusCircle, 
  Wrench, 
  Calendar, 
  FileText, 
  Monitor,
  Search,
  Menu,
  ChevronRight
} from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import Dashboard from './components/Dashboard';
import InstallationTracker from './components/InstallationTracker';
import QuotationManager from './components/QuotationManager';
import MaintenanceTracker from './components/MaintenanceTracker';
import PPMManager from './components/PPMManager';
import SettingsManager from './components/SettingsManager';
import NotificationsPanel from './components/NotificationsPanel';
import { cn } from './utils/cn';

export type View = 'dashboard' | 'installations' | 'quotations' | 'maintenance' | 'ppm' | 'settings';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const storage = useStorage();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'installations', label: 'Installations', icon: PlusCircle },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'maintenance', label: 'Maintenance (CM)', icon: Wrench },
    { id: 'ppm', label: 'PPM Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard storage={storage} setActiveView={setActiveView} />;
      case 'installations': return <InstallationTracker storage={storage} />;
      case 'quotations': return <QuotationManager storage={storage} />;
      case 'maintenance': return <MaintenanceTracker storage={storage} />;
      case 'ppm': return <PPMManager storage={storage} />;
      case 'settings': return <SettingsManager storage={storage} />;
      default: return <Dashboard storage={storage} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">BioMed Portal</h1>
              <p className="text-xs text-slate-400">Dar As Sihha Medical</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  activeView === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                RA
              </div>
              <div>
                <p className="text-sm font-medium">Eng. Reem Alamer</p>
                <p className="text-xs text-slate-500 text-left">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeView.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-blue-500 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2"
              />
            </div>
            <NotificationsPanel storage={storage} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
