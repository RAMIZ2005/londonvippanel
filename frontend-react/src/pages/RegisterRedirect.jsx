import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const RegisterRedirect = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[100px]" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                    <Send className="w-8 h-8" />
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-3">Registration Disabled</h1>
                <p className="text-gray-400 mb-8">
                    This is a private owner-only system. To purchase admin access, please contact the owner directly on Telegram.
                </p>

                <a 
                    href="https://t.me/ramizcc1k_b9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#229ED9] hover:bg-[#1f91c6] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-[#229ED9]/20 flex items-center justify-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    Contact @ramizcc1k_b9
                </a>
                
                <div className="mt-6">
                    <a href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">
                        Back to Login
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterRedirect;
