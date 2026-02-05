'use client';

import { useState, useEffect } from 'react';
import { sampleAlbums, Album } from '@/data/albums';
import AlbumCard from '@/components/AlbumCard';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const response = await fetch('/api/albums');
                if (response.ok) {
                    const data = await response.json();
                    // Use API data if available, otherwise fall back to sample data
                    setAlbums(data.length > 0 ? data : sampleAlbums);
                } else {
                    setAlbums(sampleAlbums);
                }
            } catch (error) {
                console.error('Error fetching albums:', error);
                setAlbums(sampleAlbums);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAlbums();
    }, []);

    const totalPhotos = albums.reduce((acc, album) => acc + album.photoCount, 0);
    const latestYear = albums[0]?.date ? new Date(albums[0].date).getFullYear() : new Date().getFullYear();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Header */}
                    <div className="mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-3">
                            Your Albums
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
                            Browse through your precious memories
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 sm:mb-12">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-600">{albums.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Albums</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-600">{totalPhotos}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Photos</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-600">{latestYear}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Latest Year</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-600">HD</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Photo Quality</p>
                        </div>
                    </div>

                    {/* Album Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : albums.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-slate-500 dark:text-slate-400 text-lg">No albums yet.</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                                Add folders with photos to public/albums/ and create albums in the database.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {albums.map((album) => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
