'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface Photo {
    id: string;
    filename: string;
    path: string;
    title: string | null;
    albumId: string;
}

interface Album {
    id: string;
    title: string;
    folderName: string;
}

export default function AdminAlbumPage() {
    const params = useParams();
    const router = useRouter();
    const albumId = params.id as string;
    const [album, setAlbum] = useState<Album | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAlbum();
    }, [albumId]);

    async function fetchAlbum() {
        try {
            const response = await fetch(`/api/albums/${albumId}`);
            if (response.ok) {
                const data = await response.json();
                setAlbum(data);
                setPhotos(data.photos || []);
            }
        } catch (error) {
            console.error('Error fetching album:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function syncPhotos() {
        setIsSyncing(true);
        setMessage('');
        try {
            const response = await fetch(`/api/albums/${albumId}/sync`, {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                const parts = [];
                if (data.added > 0) parts.push(`${data.added} toegevoegd`);
                if (data.removed > 0) parts.push(`${data.removed} verwijderd`);
                if (parts.length === 0) parts.push('geen wijzigingen');
                setMessage(`✅ Sync voltooid: ${parts.join(', ')} (totaal: ${data.total})`);
                fetchAlbum(); // Refresh the list
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Error syncing photos');
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    }

    async function updatePhotoTitle(photoId: string) {
        try {
            const response = await fetch(`/api/photos/${photoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle }),
            });
            if (response.ok) {
                setPhotos(photos.map(p =>
                    p.id === photoId ? { ...p, title: editTitle } : p
                ));
                setEditingPhoto(null);
                setEditTitle('');
                setMessage('✅ Titel opgeslagen');
            }
        } catch (error) {
            setMessage('❌ Error saving title');
            console.error(error);
        }
    }

    if (isLoading) {
        return (
            <AdminProtectedRoute>
                <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
                    <Navbar />
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                </div>
            </AdminProtectedRoute>
        );
    }

    return (
        <AdminProtectedRoute>
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
                <Navbar />
                <main className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <Link
                                href="/admin"
                                className="text-sm text-primary-600 hover:text-primary-500 mb-2 inline-block"
                            >
                                ← Terug naar overzicht
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                                {album?.title || 'Album'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Folder: {album?.folderName} • {photos.length} foto&apos;s
                            </p>
                        </div>
                        <button
                            onClick={syncPhotos}
                            disabled={isSyncing}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                            {isSyncing ? 'Syncing...' : '🔄 Sync Foto\'s uit Folder'}
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className="mb-6 p-4 rounded-lg bg-white dark:bg-slate-800 shadow">
                            <p className="text-slate-700 dark:text-slate-300">{message}</p>
                        </div>
                    )}

                    {/* Photos List */}
                    {photos.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                Geen foto&apos;s gevonden in de database.
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                Plaats foto&apos;s in <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">public/albums/{album?.folderName}/</code> en klik op &quot;Sync&quot;.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Preview</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Bestand</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Titel</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Acties</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {photos.map((photo) => (
                                        <tr key={photo.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <img
                                                    src={photo.path || `/albums/${album?.folderName}/${photo.filename}`}
                                                    alt={photo.title || photo.filename}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {photo.filename}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingPhoto === photo.id ? (
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full px-3 py-1 border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                                                        placeholder="Titel invoeren..."
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        {photo.title || <span className="text-slate-400 italic">Geen titel</span>}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingPhoto === photo.id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updatePhotoTitle(photo.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500"
                                                        >
                                                            Opslaan
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingPhoto(null);
                                                                setEditTitle('');
                                                            }}
                                                            className="px-3 py-1 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded hover:bg-slate-400"
                                                        >
                                                            Annuleren
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingPhoto(photo.id);
                                                            setEditTitle(photo.title || '');
                                                        }}
                                                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-500"
                                                    >
                                                        Bewerken
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </AdminProtectedRoute>
    );
}
