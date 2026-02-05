'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sampleAlbums, generatePhotosForAlbum, Photo, Album } from '@/data/albums';
import PhotoGrid from '@/components/PhotoGrid';
import Lightbox from '@/components/Lightbox';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AlbumDetailPage() {
    const params = useParams();
    const albumId = params.id as string;
    const [album, setAlbum] = useState<Album | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAlbum() {
            try {
                const response = await fetch(`/api/albums/${albumId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAlbum({
                        id: data.id,
                        title: data.title,
                        description: data.description || '',
                        coverImage: data.coverImage,
                        photoCount: data.photos?.length || 0,
                        date: data.date,
                    });
                    setPhotos(data.photos || []);
                } else {
                    // Fall back to sample data
                    const sampleAlbum = sampleAlbums.find((a) => a.id === albumId);
                    if (sampleAlbum) {
                        setAlbum(sampleAlbum);
                        setPhotos(generatePhotosForAlbum(sampleAlbum.id, sampleAlbum.photoCount));
                    }
                }
            } catch (error) {
                console.error('Error fetching album:', error);
                // Fall back to sample data
                const sampleAlbum = sampleAlbums.find((a) => a.id === albumId);
                if (sampleAlbum) {
                    setAlbum(sampleAlbum);
                    setPhotos(generatePhotosForAlbum(sampleAlbum.id, sampleAlbum.photoCount));
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchAlbum();
    }, [albumId]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const goToPrevious = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    };

    const goToNext = () => {
        if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <Navbar />
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!album) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <Navbar />
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
                                Album not found
                            </h2>
                            <Link
                                href="/albums"
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                ← Back to albums
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 sm:mb-8">
                        <Link
                            href="/albums"
                            className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Albums
                        </Link>
                    </nav>

                    {/* Album Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2">
                            {album.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
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
                                {photos.length} photos
                            </span>
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                {new Date(album.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <p className="mt-3 text-slate-600 dark:text-slate-300">
                            {album.description}
                        </p>
                    </div>

                    {/* Photo Grid */}
                    {photos.length > 0 ? (
                        <PhotoGrid photos={photos} onPhotoClick={openLightbox} />
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    )}
                </main>

                {/* Lightbox */}
                {lightboxIndex !== null && (
                    <Lightbox
                        photos={photos}
                        currentIndex={lightboxIndex}
                        onClose={closeLightbox}
                        onPrev={goToPrevious}
                        onNext={goToNext}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
