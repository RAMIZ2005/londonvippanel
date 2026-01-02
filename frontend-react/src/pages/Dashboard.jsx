import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Key, Smartphone, AlertTriangle, Activity } from 'lucide-react';

const Dashboard = () => {
    // Mock data for now until we have aggregated stats endpoint
    // In real app, fetch these from backend
    const [stats, setStats] = useState({
        totalLicenses: 0,
        activeDevices: 0,
        expiringSoon: 0,
        bannedLicenses: 0
    });

    useEffect(() => {
        // Fetch real data logic here
        // For now, we can fetch all licenses and calculate stats client-side (not efficient for large data but okay for start)
        const fetchData = async () => {
            try {
                const { data: licenses } = await api.get('/licenses');
                const total = licenses.length;
                const banned = licenses.filter(l => l.status === 'blocked').length;
                // Devices need separate fetch or included in license data. 
                // Assuming we just count licenses for now.
                setStats({
                    totalLicenses: total,
                    activeDevices: 0, // Placeholder
                    expiringSoon: 0, // Placeholder
                    bannedLicenses: banned
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Licenses', value: stats.totalLicenses, icon: Key, color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { title: 'Online Devices', value: stats.activeDevices, icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Expiring Soon', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { title: 'Banned Keys', value: stats.bannedLicenses, icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400 mt-1">System Overview & Statistics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-4 hover:border-primary-500/50 transition-colors cursor-default">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">License Usage</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{name: 'Mon', uv: 4000}, {name: 'Tue', uv: 3000}, {name: 'Wed', uv: 2000}, {name: 'Thu', uv: 2780}, {name: 'Fri', uv: 1890}]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#13131f', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="uv" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Device Activity</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{name: 'Mon', uv: 4000}, {name: 'Tue', uv: 3000}, {name: 'Wed', uv: 2000}, {name: 'Thu', uv: 2780}, {name: 'Fri', uv: 1890}]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#13131f', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
