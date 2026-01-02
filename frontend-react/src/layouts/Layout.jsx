import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Shield, Key, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/licenses', label: 'Licenses', icon: Key },
        { path: '/devices', label: 'Devices', icon: Smartphone },
        ...(user?.role === 'owner' ? [
            { path: '/admins', label: 'Admin Management', icon: Users }
        ] : []),
    ];

    return (
        <div className="min-h-screen bg-dark-900 flex text-gray-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col fixed h-full z-20">
                <div className="p-6 flex items-center gap-3 border-b border-dark-700">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Londonvip</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Panel</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive 
                                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-dark-700">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                 {/* Background Glow */}
                 <div className="absolute top-0 left-0 w-full h-96 bg-primary-500/5 blur-[100px] pointer-events-none" />
                 
                 <div className="relative z-10 max-w-7xl mx-auto">
                    <Outlet />
                 </div>
            </main>
        </div>
    );
};

export default Layout;
