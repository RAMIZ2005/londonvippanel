import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Key, Smartphone, Clock, Shield, Search, Copy, Check } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const LicenseManagement = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state
    const [newLicense, setNewLicense] = useState({
        max_devices: 1,
        days_valid: 30,
        is_lifetime: false,
        allowed_package_name: ''
    });

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const response = await api.get('/licenses');
            setLicenses(response.data);
        } catch (error) {
            console.error('Error fetching licenses:', error);
            toast.error('Failed to load licenses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            // Calculate expire_at based on days_valid if not lifetime
            let payload = {
                max_devices: parseInt(newLicense.max_devices),
                is_lifetime: newLicense.is_lifetime,
                allowed_package_name: newLicense.allowed_package_name || null
            };

            if (!newLicense.is_lifetime) {
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + parseInt(newLicense.days_valid));
                payload.expire_at = expirationDate.toISOString();
            }

            await api.post('/licenses', payload);
            toast.success('License generated successfully');
            setNewLicense({ max_devices: 1, days_valid: 30, is_lifetime: false, allowed_package_name: '' });
            setShowCreateModal(false);
            fetchLicenses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate license');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this license?')) return;
        
        try {
            await api.delete(`/licenses/${id}`);
            toast.success('License deleted successfully');
            setLicenses(licenses.filter(l => l.id !== id));
        } catch (error) {
            toast.error('Failed to delete license');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('License key copied!');
    };

    const filteredLicenses = licenses.filter(license => 
        license.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (license.allowed_package_name && license.allowed_package_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">License Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Generate License
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search license keys or package names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Generate New License</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Max Devices</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newLicense.max_devices}
                                    onChange={(e) => setNewLicense({...newLicense, max_devices: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="is_lifetime"
                                    checked={newLicense.is_lifetime}
                                    onChange={(e) => setNewLicense({...newLicense, is_lifetime: e.target.checked})}
                                    className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-slate-900"
                                />
                                <label htmlFor="is_lifetime" className="text-sm font-medium text-white">Lifetime License</label>
                            </div>

                            {!newLicense.is_lifetime && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newLicense.days_valid}
                                        onChange={(e) => setNewLicense({...newLicense, days_valid: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Allowed Package Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="com.example.app"
                                    value={newLicense.allowed_package_name}
                                    onChange={(e) => setNewLicense({...newLicense, allowed_package_name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to allow any package</p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {createLoading ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* License List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredLicenses.map((license) => (
                        <motion.div
                            key={license.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 px-3 py-1 rounded-lg font-mono text-primary-400 border border-primary-500/20 flex items-center gap-2">
                                            <Key className="w-4 h-4" />
                                            {license.license_key}
                                            <button 
                                                onClick={() => copyToClipboard(license.license_key)}
                                                className="hover:text-white transition-colors"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            license.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {license.status.toUpperCase()}
                                        </span>
                                        {license.is_lifetime && (
                                            <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-xs font-medium border border-purple-500/20">
                                                LIFETIME
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Smartphone className="w-4 h-4 text-slate-500" />
                                            <span>Max Devices: {license.max_devices}</span>
                                        </div>
                                        {!license.is_lifetime && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                <span>Expires: {new Date(license.expire_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {license.allowed_package_name && (
                                            <div className="flex items-center gap-1">
                                                <Shield className="w-4 h-4 text-slate-500" />
                                                <span className="font-mono">{license.allowed_package_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleDelete(license.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        title="Delete License"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredLicenses.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No licenses found. Generate one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LicenseManagement;
