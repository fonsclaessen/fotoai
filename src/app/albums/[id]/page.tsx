'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import JSZip from 'jszip';
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
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);

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

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedPhotos(new Set());
    };

    const togglePhotoSelect = useCallback((photoId: string) => {
        setSelectedPhotos((prev) => {
            const next = new Set(prev);
            if (next.has(photoId)) {
                next.delete(photoId);
            } else {
                next.add(photoId);
            }
            return next;
        });
    }, []);

    const selectAll = () => {
        if (selectedPhotos.size === photos.length) {
            setSelectedPhotos(new Set());
        } else {
            setSelectedPhotos(new Set(photos.map((p) => p.id)));
        }
    };

    const downloadSelected = async () => {
        const selected = photos.filter((p) => selectedPhotos.has(p.id));
        if (selected.length === 0) return;

        setIsDownloading(true);
        try {
            const zip = new JSZip();

            // Download all photos and add to ZIP
            for (const photo of selected) {
                const response = await fetch(photo.src);
                const blob = await response.blob();
                // Extract filename from src
                const filename = photo.src.split('/').pop() || `${photo.title}.jpg`;
                zip.file(filename, blob);
            }

            // Generate ZIP and download
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${album?.title || 'photos'}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCommentCountChange = useCallback((photoId: string, count: number) => {
        setPhotos(prev => prev.map(p =>
            p.id === photoId ? { ...p, commentCount: count } : p
        ));
    }, []);

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

                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {selectionMode && (
                                <>
                                    <button
                                        onClick={selectAll}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                                    >
                                        {selectedPhotos.size === photos.length ? 'Deselecteer alles' : 'Selecteer alles'}
                                    </button>
                                    <span className="text-sm text-slate-400 dark:text-slate-500">
                                        {selectedPhotos.size > 0 && `${selectedPhotos.size} geselecteerd`}
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={toggleSelectionMode}
                            className={`p-2 rounded-lg transition-colors ${selectionMode
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            title={selectionMode ? 'Annuleer selectie' : 'Selecteer foto\'s'}
                        >
                            {selectionMode ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Photo Grid */}
                    {photos.length > 0 ? (
                        <PhotoGrid
                            photos={photos}
                            onPhotoClick={openLightbox}
                            selectionMode={selectionMode}
                            selectedPhotos={selectedPhotos}
                            onToggleSelect={togglePhotoSelect}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    )}
                </main>

                {/* Floating download bar */}
                {selectionMode && selectedPhotos.size > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 px-4 py-3 sm:py-4">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                                {selectedPhotos.size} foto{selectedPhotos.size !== 1 ? '\'s' : ''} geselecteerd
                            </span>
                            <button
                                onClick={downloadSelected}
                                disabled={isDownloading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Downloaden...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Lightbox */}
                {lightboxIndex !== null && (
                    <Lightbox
                        photos={photos}
                        currentIndex={lightboxIndex}
                        onClose={closeLightbox}
                        onPrev={goToPrevious}
                        onNext={goToNext}
                        onCommentCountChange={handleCommentCountChange}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
