'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                const result = await register(email, password, name);
                if (result.success) {
                    router.push('/albums');
                } else {
                    setError(result.error || 'Registration failed');
                }
            } else {
                const success = await login(email, password);
                if (success) {
                    router.push('/albums');
                } else {
                    setError('Invalid credentials. Please try again.');
                }
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--neu-base)' }}>
            <div className="w-full max-w-md relative">
                {/* Logo and title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 neu-circle mb-4">
                        <svg
                            className="w-10 h-10 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2">PhotoAlbums</h1>
                    <p className="text-slate-500">
                        {isRegister ? 'Create your account' : 'Sign in to access your memories'}
                    </p>
                </div>

                {/* Login/Register form */}
                <div className="neu-raised-lg p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={isRegister}
                                    className="w-full px-4 py-3 neu-input text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 neu-input text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                                className="w-full px-4 py-3 neu-input text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                placeholder={isRegister ? 'Choose a password (min 4 chars)' : 'Enter your password'}
                            />
                        </div>

                        {error && (
                            <div className="p-3 neu-inset-sm">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 neu-btn text-primary-700 dark:text-primary-400 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {isRegister ? 'Creating account...' : 'Signing in...'}
                                </span>
                            ) : (
                                isRegister ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Toggle between login and register */}
                    <div className="mt-6 pt-6 border-t border-slate-300/30 dark:border-slate-600/30">
                        <p className="text-center text-sm text-slate-500">
                            {isRegister ? (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(false);
                                            setError('');
                                        }}
                                        className="text-primary-600 hover:text-primary-500 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(true);
                                            setError('');
                                        }}
                                        className="text-primary-600 hover:text-primary-500 font-medium"
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-slate-400">
                    © 2025 PhotoAlbums. All rights reserved.
                </p>
            </div>
        </div>
    );
}
