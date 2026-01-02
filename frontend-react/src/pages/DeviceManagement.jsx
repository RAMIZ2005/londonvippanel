import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Trash2, Search, Calendar, Globe, Cpu } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const DeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/devices');
            setDevices(response.data);
        } catch (error) {
            console.error('Error fetching devices:', error);
            toast.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to unbind this device? It will be removed from the license.')) return;
        
        try {
            await api.delete(`/devices/${id}`);
            toast.success('Device unbound successfully');
            setDevices(devices.filter(d => d.id !== id));
        } catch (error) {
            toast.error('Failed to unbind device');
        }
    };

    const filteredDevices = devices.filter(device => 
        device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (device.license_key && device.license_key.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">Device Management</h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by Device ID, Model, or License Key..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Device List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredDevices.map((device) => (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg text-primary-400 border border-primary-500/20">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{device.model || 'Unknown Device'}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{device.device_id}</p>
                                        </div>
                                        <span className="ml-auto md:ml-0 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            Android {device.android_version || 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-slate-500" />
                                            <span>{device.manufacturer || 'Unknown Mfg'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-slate-500" />
                                            <span className="font-mono">{device.ip_address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span>Last seen: {new Date(device.last_check_in).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-medium">License:</span>
                                            <span className="font-mono text-primary-400">{device.license_key}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-4">
                                    <button
                                        onClick={() => handleDelete(device.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                                        title="Unbind Device"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span className="md:hidden">Unbind Device</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredDevices.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No devices found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceManagement;
