import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { CORE_SERVICE_URL, INGESTION_SERVICE_URL } from '../config';

const Dashboard = () => {
  const { token } = useAuth();
  const { devices, setDevices } = useDevices();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sseStatus, setSseStatus] = useState('connecting');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('light');
  const [addingDevice, setAddingDevice] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [token]);

  useEffect(() => {
    const eventSource = new EventSource(`${INGESTION_SERVICE_URL}/stream`);
    
    eventSource.onopen = () => {
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'connected') {
          setSseStatus('live');
          return;
        }
        
        if (data.device_id && data.metrics) {
          setDevices(prevDevices => 
            prevDevices.map(device => {
              if (device.id === data.device_id) {
                let newStateValue = device.state_value;
                if (data.metrics.temperature) {
                  newStateValue = `${data.metrics.temperature}°C`;
                } else if (data.metrics.power) {
                  newStateValue = `${data.metrics.power}W`;
                }
                
                return { ...device, state_value: newStateValue };
              }
              return device;
            })
          );
        }
      } catch (err) {
        console.error('Error parsing SSE data', err);
      }
    };
    
    eventSource.onerror = (err) => {
      console.error('SSE connection error', err);
      setSseStatus('error');
    };

    return () => {
      eventSource.close();
    };
  }, [setDevices]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${CORE_SERVICE_URL}/api/devices/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDevice = async (id, currentStatus) => {
    try {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, is_on: !currentStatus } : d));
      
      const res = await fetch(`${CORE_SERVICE_URL}/api/devices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_on: !currentStatus })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update device state');
      }
    } catch (err) {
      fetchDevices();
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setAddingDevice(true);
    try {
      const res = await fetch(`${CORE_SERVICE_URL}/api/devices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newDeviceName, type: newDeviceType })
      });
      if (!res.ok) throw new Error('Failed to add device');
      
      const newDevice = await res.json();
      setDevices(prev => [...prev, newDevice]);
      setShowAddForm(false);
      setNewDeviceName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingDevice(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to remove this device?")) return;
    
    try {
      const res = await fetch(`${CORE_SERVICE_URL}/api/devices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete device');
      
      setDevices(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'light': return (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
      case 'thermostat': return (
        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
      case 'lock': return (
        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
      default: return (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
  };

  const activeDevices = devices.filter(d => d.is_on).length;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
            <p className="mt-2 text-slate-600">Monitor and control your connected home.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {sseStatus === 'live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  sseStatus === 'live' ? 'bg-emerald-500' : sseStatus === 'error' ? 'bg-red-500' : 'bg-amber-400'
                }`}></span>
              </span>
              <span className="font-medium text-slate-700">
                {sseStatus === 'live' ? 'Live updates' : sseStatus === 'error' ? 'Disconnected' : 'Connecting...'}
              </span>
            </div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
            >
              {showAddForm ? 'Cancel' : '+ Add Device'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Devices</div>
          <div className="text-3xl font-bold text-slate-900">{loading ? '-' : devices.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Active Devices</div>
          <div className="text-3xl font-bold text-blue-600">{loading ? '-' : activeDevices}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">System Status</div>
          <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
            Online
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold">Unable to load your devices</h4>
              <p className="text-sm opacity-90 mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={fetchDevices} className="bg-white text-red-700 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors">
            Retry
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Register New Device</h2>
          <form onSubmit={handleAddDevice} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Name</label>
              <input
                type="text"
                required
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Living Room Lamp"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              >
                <option value="light">Smart Light</option>
                <option value="thermostat">Thermostat</option>
                <option value="lock">Smart Lock</option>
                <option value="plug">Smart Plug</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addingDevice}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {addingDevice ? 'Adding...' : 'Save Device'}
            </button>
          </form>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Your Devices</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-48 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                <div className="w-12 h-6 bg-slate-100 rounded-full"></div>
              </div>
              <div>
                <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : devices.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No devices yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Your connected devices will appear here once you add them to your account.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            Add your first device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {devices.map(device => (
            <div key={device.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
              <button 
                onClick={() => handleDeleteDevice(device.id)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Remove device"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${device.is_on ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  {getDeviceIcon(device.type)}
                </div>
                
                <button
                  onClick={() => handleToggleDevice(device.id, device.is_on)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    device.is_on ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={device.is_on}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      device.is_on ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-900 truncate pr-8" title={device.name}>{device.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-500 capitalize">{device.type}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-slate-600">Online</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-mono text-slate-400">ID: {device.id}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">State</span>
                  <span className={`text-sm font-bold ${device.is_on ? 'text-blue-600' : 'text-slate-500'}`}>
                    {device.is_on ? 'ON' : 'OFF'}
                  </span>
                </div>
                
                {device.state_value && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Value</span>
                    <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
                      {device.state_value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
