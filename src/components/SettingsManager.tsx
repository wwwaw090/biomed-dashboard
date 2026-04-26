
import React from 'react';
import { 
  Download, 
  Upload, 
  Cloud, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { cn } from '../utils/cn';

interface SettingsManagerProps {
  storage: ReturnType<typeof useStorage>;
}

export default function SettingsManager({ storage }: SettingsManagerProps) {
  const { options, setOptions, devices, setDevices, maintenance, quotations, ppmTasks } = storage;

  return (
    <div className="space-y-6">
      {/* Cloud Sync Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Cloud className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Auto-Sync via GitHub</h2>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Sync your data across all devices for free using a private GitHub Gist. 
              Changes will be saved to your GitHub account and pulled automatically on other devices.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => storage.triggerCloudSync()}
                disabled={!storage.cloudToken || storage.isSyncing}
                className="flex items-center gap-2 bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("w-5 h-5", storage.isSyncing && "animate-spin")} />
                {storage.isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <a 
                href="https://github.com/settings/tokens/new?description=BioMedSync&scopes=gist" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold underline decoration-white/30"
              >
                Get GitHub Token <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-indigo-200">GitHub Access Token</label>
            <input 
              type="password" 
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 ring-white/50 outline-none transition-all"
              value={storage.cloudToken}
              onChange={(e) => {
                storage.setCloudToken(e.target.value);
                if (e.target.value.length > 30) {
                  storage.loadFromCloud(e.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Manual Backup</h2>
          <p className="text-sm text-slate-500">Manage data via local files</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const data = { 
                options, 
                devices, 
                maintenance, 
                quotations, 
                ppmTasks,
                lastSync: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `BioMed_Backup_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Download className="w-5 h-5" /> Export All Data
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-200">
            <Upload className="w-5 h-5" /> Import/Sync Data
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data.options) setOptions(data.options);
                    if (data.devices) setDevices(data.devices);
                    if (data.maintenance) storage.setMaintenance(data.maintenance);
                    if (data.quotations) storage.setQuotations(data.quotations);
                    if (data.ppmTasks) storage.setPpmTasks(data.ppmTasks);
                    alert('Portal updated successfully from backup!');
                  } catch (err) {
                    alert('Failed to parse JSON file');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
