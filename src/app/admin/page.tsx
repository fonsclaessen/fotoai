'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Album {
    id: string;
    title: string;
    description: string | null;
    folderName: string;
    photoCount: number;
    date: string;
}

export default function AdminPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const response = await fetch('/api/albums');
                if (response.ok) {
                    const data = await response.json();
                    setAlbums(data);
                }
            } catch (error) {
                console.error('Error fetching albums:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAlbums();
    }, []);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
                <Navbar />
                <main className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                                Admin - Albums Beheren
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Beheer foto titels en beschrijvingen
                            </p>
                        </div>
                        <Link
                            href="/albums"
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                        >
                            ← Terug naar Albums
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : albums.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-slate-500 dark:text-slate-400">
                                Geen albums gevonden. Voeg albums toe via Prisma Studio.
                            </p>
                            <code className="block mt-4 text-sm bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded">
                                npm run db:studio
                            </code>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Album</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Folder</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Foto&apos;s</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Acties</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {albums.map((album) => (
                                        <tr key={album.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">{album.title}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{album.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    {album.folderName}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {album.photoCount} foto&apos;s
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/albums/${album.id}`}
                                                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500"
                                                >
                                                    Foto&apos;s Beheren
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            📖 Hoe werkt het?
                        </h2>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Plaats foto&apos;s in <code className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">public/albums/Album1/</code> (of Album2, Album3, etc.)</li>
                            <li>Klik op &quot;Foto&apos;s Beheren&quot; bij het juiste album</li>
                            <li>Klik op &quot;Sync Foto&apos;s uit Folder&quot; om de foto&apos;s in de database te importeren</li>
                            <li>Klik op &quot;Bewerken&quot; om een titel toe te voegen aan een foto</li>
                        </ol>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
