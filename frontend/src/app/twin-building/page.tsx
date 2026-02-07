'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Cpu, TrendingUp, ShieldCheck } from 'lucide-react';

export default function TwinBuilding() {
    const router = useRouter();
    const [status, setStatus] = useState('Initializing...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (!profile) {
            router.push('/login');
            return;
        }

        const { isInvestor } = JSON.parse(profile);

        const steps = [
            { msg: 'Analyzing Spending Patterns...', time: 1000 },
            { msg: 'Projecting Inflation Impact...', time: 2000 },
            { msg: 'Simulating 4 Possible Futures...', time: 3000 },
            { msg: 'Assembling Digital Twin...', time: 4000 }
        ];

        steps.forEach(step => {
            setTimeout(() => setStatus(step.msg), step.time);
        });

        // Progress bar simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 80);

        // Redirect
        setTimeout(() => {
            if (isInvestor === 'no') {
                router.push('/learn-investing');
            } else {
                router.push('/dashboard');
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-4 border-blue-500 animate-spin-reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Bot size={48} className="text-emerald-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                    {status}
                </h1>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-1">
                        <Cpu size={20} className="text-blue-400" />
                        <span>AI Engine</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <TrendingUp size={20} className="text-emerald-400" />
                        <span>Market Data</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <ShieldCheck size={20} className="text-purple-400" />
                        <span>Security</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
