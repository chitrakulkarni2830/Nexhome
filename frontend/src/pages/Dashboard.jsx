import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevices } from '../context/DeviceContext';
import { CORE_SERVICE_URL, INGESTION_SERVICE_URL } from '../config';

const Dashboard = () => {
  const { token } = useAuth();
  const { devices, setDevices } = useDevices();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add device form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('light');
  const [addingDevice, setAddingDevice] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [token]);

  // Real-time telemetry integration via SSE
  useEffect(() => {
    const eventSource = new EventSource(`${INGESTION_SERVICE_URL}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'connected') {
          console.log('Connected to real-time telemetry stream');
          return;
        }
        
        // Update the specific device's state dynamically
        if (data.device_id && data.metrics) {
          setDevices(prevDevices => 
            prevDevices.map(device => {
              if (device.id === data.device_id) {
                // If it has temperature metrics, show it, otherwise show a general string
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
    };

    return () => {
      eventSource.close();
    };
  }, [setDevices]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
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
      // Optimistic update
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
        // Revert on failure
        throw new Error('Failed to update device state');
      }
    } catch (err) {
      setError(err.message);
      fetchDevices(); // Reload actual state
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
      setError(err.message);
    }
  }

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'light': return '💡';
      case 'thermostat': return '🌡️';
      case 'lock': return '🔒';
      default: return '🔌';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]">Loading devices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Home</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Device'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Device</h2>
          <form onSubmit={handleAddDevice} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
              <input
                type="text"
                required
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Living Room Lamp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="light">Light</option>
                <option value="thermostat">Thermostat</option>
                <option value="lock">Smart Lock</option>
                <option value="plug">Smart Plug</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addingDevice}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {addingDevice ? 'Adding...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No devices found. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <div key={device.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
              <button 
                onClick={() => handleDeleteDevice(device.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete device"
              >
                ✕
              </button>
              
              <div className="flex justify-between items-start mb-6">
                <div className="text-4xl">{getDeviceIcon(device.type)}</div>
                <div 
                  onClick={() => handleToggleDevice(device.id, device.is_on)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${device.is_on ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${device.is_on ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-800">{device.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{device.type}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full font-medium ${device.is_on ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {device.is_on ? 'ON' : 'OFF'}
                  </span>
                  {device.state_value && (
                    <span className="text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                      {device.state_value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
