'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="neu-raised sticky top-0 z-40 rounded-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/albums" className="flex items-center space-x-2">
                        <div className="neu-circle p-2">
                            <svg
                                className="w-6 h-6 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                            PhotoAlbums
                        </span>
                    </Link>

                    {user && (
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {user.isAdmin && (
                                <Link
                                    href="/admin"
                                    className="neu-btn px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                                >
                                    ⚙️ Admin
                                </Link>
                            )}
                            <span className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
                                Welcome, <span className="font-medium">{user.name}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="neu-btn px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
