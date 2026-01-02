import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle, XCircle, Trash2, Power } from 'lucide-react';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
    const [createLoading, setCreateLoading] = useState(false);

    const fetchAdmins = async () => {
        try {
            const { data } = await api.get('/auth/admins');
            setAdmins(data);
        } catch (error) {
            toast.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/auth/admins', newAdmin);
            toast.success('Admin created successfully');
            setNewAdmin({ username: '', password: '' });
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
        try {
            await api.patch(`/auth/admins/${id}/status`, { status: newStatus });
            toast.success(`Admin ${newStatus} successfully`);
            fetchAdmins();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            await api.delete(`/auth/admins/${id}`);
            toast.success('Admin deleted successfully');
            fetchAdmins();
        } catch (error) {
            toast.error('Failed to delete admin');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Admin Management</h2>
                    <p className="text-gray-400 mt-1">Create and manage system administrators</p>
                </div>
            </div>

            {/* Create Admin Form */}
            <div className="card">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    Create New Admin
                </h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Username</label>
                        <input
                            type="text"
                            value={newAdmin.username}
                            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                            className="input-field"
                            placeholder="Admin username"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            className="input-field"
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={createLoading}
                        className="btn-primary w-full h-[42px] flex items-center justify-center gap-2"
                    >
                        {createLoading ? 'Creating...' : 'Create Admin'}
                    </button>
                </form>
            </div>

            {/* Admins List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-dark-700 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Username</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Created At</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
                            ) : admins.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No admins found</td></tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-dark-700/50 transition-colors">
                                        <td className="p-4 text-white font-medium flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-gray-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            {admin.username}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                admin.status === 'enabled' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {admin.status === 'enabled' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleToggleStatus(admin.id, admin.status)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    admin.status === 'enabled' 
                                                    ? 'text-orange-400 hover:bg-orange-500/10' 
                                                    : 'text-emerald-400 hover:bg-emerald-500/10'
                                                }`}
                                                title={admin.status === 'enabled' ? 'Disable' : 'Enable'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
