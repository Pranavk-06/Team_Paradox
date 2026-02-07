'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingEntry() {
    const router = useRouter();
    useEffect(() => {
        router.push('/onboarding/role');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            <span className="animate-pulse">Loading Onboarding...</span>
        </div>
    );
}
