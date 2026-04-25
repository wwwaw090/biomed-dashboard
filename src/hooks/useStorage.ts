
import { useState, useEffect } from 'react';
import { Device, Quotation, MaintenanceRecord, PPMSchedule, DropdownOptions, Notification } from '../types';

export function useStorage() {
  const [cloudToken, setCloudToken] = useState<string>(() => localStorage.getItem('bio_gh_token') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('bio_devices');
    return saved ? JSON.parse(saved) : [];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('bio_quotations');
    return saved ? JSON.parse(saved) : [];
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('bio_maintenance');
    return saved ? JSON.parse(saved) : [];
  });

  const [ppmTasks, setPpmTasks] = useState<PPMSchedule[]>(() => {
    const saved = localStorage.getItem('bio_ppm');
    return saved ? JSON.parse(saved) : [];
  });

  const [options, setOptions] = useState<DropdownOptions>(() => {
    const saved = localStorage.getItem('bio_options');
    return saved ? JSON.parse(saved) : {
      equipment: ['MRI Scanner', 'CT Scanner', 'Patient Monitor', 'Ventilator'],
      departments: ['Radiology', 'ICU', 'ER', 'Surgery'],
      rooms: ['Room 101', 'Room 102', 'Room 201'],
      companies: ['GE Healthcare', 'Siemens Healthineers', 'Philips'],
      engineers: ['Engineer A', 'Engineer B']
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('bio_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const triggerCloudSync = async () => {
    if (!cloudToken || isSyncing) return;
    setIsSyncing(true);
    const data = { devices, quotations, maintenance, ppmTasks, options };
    await (await import('../utils/githubSync')).syncToGitHub(cloudToken, data);
    setIsSyncing(false);
  };

  // Auto-sync effect: Triggers whenever data changes
  useEffect(() => {
    if (!cloudToken) return;
    
    const timeoutId = setTimeout(() => {
      triggerCloudSync();
    }, 3000); // Wait 3 seconds after last change before auto-syncing

    return () => clearTimeout(timeoutId);
  }, [devices, quotations, maintenance, ppmTasks, options]);

  const loadFromCloud = async (token: string) => {
    setIsSyncing(true);
    const data = await (await import('../utils/githubSync')).fetchFromGitHub(token);
    if (data) {
      if (data.devices) setDevices(data.devices);
      if (data.quotations) setQuotations(data.quotations);
      if (data.maintenance) setMaintenance(data.maintenance);
      if (data.ppmTasks) setPpmTasks(data.ppmTasks);
      if (data.options) setOptions(data.options);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    localStorage.setItem('bio_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('bio_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('bio_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('bio_ppm', JSON.stringify(ppmTasks));
  }, [ppmTasks]);

  useEffect(() => {
    localStorage.setItem('bio_options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('bio_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bio_gh_token', cloudToken);
  }, [cloudToken]);

  return {
    devices, setDevices,
    quotations, setQuotations,
    maintenance, setMaintenance,
    ppmTasks, setPpmTasks,
    options, setOptions,
    notifications, setNotifications,
    cloudToken, setCloudToken,
    isSyncing, triggerCloudSync,
    loadFromCloud
  };
}
