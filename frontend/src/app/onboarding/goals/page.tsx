'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const GOAL_OPTIONS = [
    "Retirement", "Buy a House", "Travel the World", "Emergency Fund", "Debt Free", "Buy a Car", "Higher Education"
];

export default function GoalsStep() {
    const router = useRouter();
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('onboardingData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.financialGoals) setSelectedGoals(data.financialGoals);
        }
    }, []);

    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(prev => prev.filter(g => g !== goal));
        } else {
            if (selectedGoals.length < 3) {
                setSelectedGoals(prev => [...prev, goal]);
                setError('');
            }
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGoals.length === 0) {
            setError('Please select at least 1 goal');
            return;
        }

        const current = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        localStorage.setItem('onboardingData', JSON.stringify({ ...current, financialGoals: selectedGoals }));
        router.push('/onboarding/gate');
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <span className="text-emerald-400 text-xs font-bold tracking-wider">STEP 3 OF 5</span>
                    <h1 className="text-2xl font-bold mt-2">Your Dreams</h1>
                    <p className="text-gray-400 text-sm mt-2">Pick up to 3 priority goals</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {GOAL_OPTIONS.map(goal => (
                            <div
                                key={goal}
                                onClick={() => toggleGoal(goal)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all text-sm flex items-center gap-2 ${selectedGoals.includes(goal)
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                {selectedGoals.includes(goal) && <CheckCircle size={14} />}
                                {goal}
                            </div>
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div className="flex gap-4 mt-6">
                        <button type="button" onClick={() => router.back()} className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                            Back
                        </button>
                        <button type="submit" className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-colors">
                            Next: Review
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
