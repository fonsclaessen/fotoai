'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push('/albums');
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--neu-base)' }}>
            <div className="neu-circle p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        </div>
    );
}
