'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

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
    const [showNewForm, setShowNewForm] = useState(false);
    const [newAlbum, setNewAlbum] = useState({ title: '', folderName: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState('');
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

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

    useEffect(() => {
        fetchAlbums();
    }, []);

    async function createAlbum(e: React.FormEvent) {
        e.preventDefault();
        if (!newAlbum.title || !newAlbum.folderName) return;

        setIsCreating(true);
        setMessage('');
        try {
            const response = await fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAlbum),
            });
            if (response.ok) {
                setMessage('✅ Album aangemaakt! Ga naar "Foto\'s Beheren" om te syncen.');
                setNewAlbum({ title: '', folderName: '', description: '' });
                setShowNewForm(false);
                fetchAlbums();
            } else {
                const data = await response.json();
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Error creating album');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    }

    function handleEdit(album: Album) {
        setEditingAlbum({ ...album });
    }

    function handleCancelEdit() {
        setEditingAlbum(null);
    }

    async function handleSaveEdit() {
        if (!editingAlbum) return;

        setMessage('');
        try {
            const response = await fetch(`/api/albums/${editingAlbum.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingAlbum.title,
                    description: editingAlbum.description,
                }),
            });

            if (response.ok) {
                setMessage('✅ Album opgeslagen');
                setEditingAlbum(null);
                fetchAlbums();
            } else {
                const data = await response.json();
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Error saving album');
            console.error(error);
        }
    }

    async function syncAllAlbums() {
        setIsSyncing(true);
        setMessage('🔄 Albums synchroniseren...');
        try {
            const response = await fetch('/api/albums/sync-all', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                const parts = [];
                if (data.albumsCreated > 0) parts.push(`${data.albumsCreated} album(s) aangemaakt (${data.newAlbumNames.join(', ')})`);
                if (data.albumsRemoved > 0) parts.push(`${data.albumsRemoved} album(s) verwijderd (${data.removedAlbumNames.join(', ')})`);
                if (data.photosAdded > 0) parts.push(`${data.photosAdded} foto('s) toegevoegd`);
                if (data.photosRemoved > 0) parts.push(`${data.photosRemoved} foto('s) verwijderd`);
                if (parts.length === 0) parts.push('Alles is al gesynchroniseerd');
                setMessage(`✅ ${parts.join(' • ')} — Totaal: ${data.totalAlbums} albums`);
                fetchAlbums();
            } else {
                const data = await response.json();
                setMessage(`❌ Sync error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Sync mislukt');
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    }

    return (
        <AdminProtectedRoute>
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
                        <div className="flex gap-2">
                            <button
                                onClick={syncAllAlbums}
                                disabled={isSyncing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                            >
                                {isSyncing ? '🔄 Bezig...' : '🔄 Sync Alles'}
                            </button>
                            <button
                                onClick={() => setShowNewForm(!showNewForm)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
                            >
                                + Nieuw Album
                            </button>
                            <Link
                                href="/albums"
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                            >
                                ← Terug
                            </Link>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                            {message}
                        </div>
                    )}

                    {showNewForm && (
                        <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                Nieuw Album Aanmaken
                            </h2>
                            <form onSubmit={createAlbum} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Titel *
                                        </label>
                                        <input
                                            type="text"
                                            value={newAlbum.title}
                                            onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                                            placeholder="Vakantie 2025"
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Folder Naam * <span className="text-xs text-slate-500">(exact zoals in public/albums/)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newAlbum.folderName}
                                            onChange={(e) => setNewAlbum({ ...newAlbum, folderName: e.target.value })}
                                            placeholder="Album4"
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Beschrijving
                                    </label>
                                    <input
                                        type="text"
                                        value={newAlbum.description}
                                        onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                                        placeholder="Foto's van onze vakantie in Spanje"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50"
                                    >
                                        {isCreating ? 'Aanmaken...' : 'Album Aanmaken'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewForm(false)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                                    >
                                        Annuleren
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

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
                                                {editingAlbum?.id === album.id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={editingAlbum.title}
                                                            onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                                                            placeholder="Album titel"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editingAlbum.description || ''}
                                                            onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded dark:bg-slate-600 dark:border-slate-500 dark:text-white text-sm"
                                                            placeholder="Beschrijving"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-white">{album.title}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{album.description}</p>
                                                    </div>
                                                )}
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
                                                {editingAlbum?.id === album.id ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">
                                                            Opslaan
                                                        </button>
                                                        <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-300">
                                                            Annuleren
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(album)} className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-400">
                                                            Bewerken
                                                        </button>
                                                        <Link
                                                            href={`/admin/albums/${album.id}`}
                                                            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500"
                                                        >
                                                            Foto&apos;s Beheren
                                                        </Link>
                                                    </div>
                                                )}
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
        </AdminProtectedRoute>
    );
}
