'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AIAdvisor() {
    const [marketAlert, setMarketAlert] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkMarket();
    }, []);

    const checkMarket = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/market/alert');
            setMarketAlert(response.data);
        } catch (error) {
            console.error("Failed to fetch market alert", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            {/* Dynamic Market Alert */}
            {loading ? (
                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg animate-pulse flex gap-3">
                    <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-full"></div>
                    </div>
                </div>
            ) : marketAlert && marketAlert.alert ? (
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex gap-3 items-start"
                >
                    <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-sm font-semibold text-red-300">Market Alert</h4>
                        <p className="text-xs text-gray-400">{marketAlert.message}</p>
                        <p className="text-xs text-red-200 mt-1 font-medium">Recommendation: {marketAlert.recommendation}</p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex gap-3 items-start"
                >
                    <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-sm font-semibold text-emerald-300">Market Stable</h4>
                        <p className="text-xs text-gray-400">No major risks detected. automated SIPs continuing as scheduled.</p>
                    </div>
                </motion.div>
            )}

            {/* Static Opportunity (can be dynamic later) */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3 items-start"
            >
                <TrendingUp className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div>
                    <h4 className="text-sm font-semibold text-blue-300">Smart Rebalancing</h4>
                    <p className="text-xs text-gray-400">Gold is up 5%. Consider booking profits and moving to Debt.</p>
                </div>
            </motion.div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm text-gray-400">Current Allocation</h4>
                    <button onClick={checkMarket} title="Refresh Analysis">
                        <RefreshCw size={12} className={`text-gray-500 hover:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[40%]" title="Equity"></div>
                    <div className="h-full bg-yellow-500 w-[30%]" title="Gold"></div>
                    <div className="h-full bg-blue-500 w-[20%]" title="Debt"></div>
                    <div className="h-full bg-purple-500 w-[10%]" title="Crypto"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                    <span>Equity</span>
                    <span>Gold</span>
                    <span>Debt</span>
                    <span>Crypto</span>
                </div>
            </div>
        </div>
    );
}
