'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';

const schema = z.object({
    gold: z.coerce.number().min(0).default(0),
    fd: z.coerce.number().min(0).default(0),
    stocks: z.coerce.number().min(0).default(0),
    crypto: z.coerce.number().min(0).default(0),
});

export default function PortfolioStep() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { gold: 0, fd: 0, stocks: 0, crypto: 0 }
    });

    useEffect(() => {
        const saved = localStorage.getItem('onboardingData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.investments) {
                setValue('gold', data.investments.gold || 0);
                setValue('fd', data.investments.fd || 0);
                setValue('stocks', data.investments.stocks || 0);
                setValue('crypto', data.investments.crypto || 0);
            }
        }
    }, [setValue]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const current = JSON.parse(localStorage.getItem('onboardingData') || '{}');
            const existingProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

            // Calculate Cost of Living
            let costOfLiving = 25000;
            try {
                const colResponse = await api.post('/predict-col', { pincode: current.pincode });
                costOfLiving = colResponse.data?.estimated_cost || 25000;
            } catch (e) {
                console.error("COL Error defaulting", e);
            }

            const finalData = {
                ...existingProfile,
                ...current,
                costOfLiving,
                investments: data,
                customExpenses: []
            };

            localStorage.setItem('userProfile', JSON.stringify(finalData));
            await api.post('/api/user/save', finalData);

            router.push('/twin-building');
        } catch (error) {
            console.error("Submission error", error);
            router.push('/twin-building');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <span className="text-emerald-400 text-xs font-bold tracking-wider">STEP 5 OF 5</span>
                    <h1 className="text-2xl font-bold mt-2">Your Portfolio</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Gold</label>
                            <input type="number" {...register('gold')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">FD / Debt</label>
                            <input type="number" {...register('fd')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Stocks / MFs</label>
                            <input type="number" {...register('stocks')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">Crypto</label>
                            <input type="number" {...register('crypto')} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3" />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button type="button" onClick={() => router.back()} className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                            Back
                        </button>
                        <button type="submit" disabled={loading} className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-colors disabled:opacity-50">
                            {loading ? 'Creating Twin...' : 'Finish Setup'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
