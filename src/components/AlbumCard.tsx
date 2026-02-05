'use client';

import { useState } from 'react';
import { Album } from '@/data/albums';
import Image from 'next/image';
import Link from 'next/link';

interface AlbumCardProps {
    album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
    const [imageError, setImageError] = useState(false);
    const hasValidCover = album.coverImage && !imageError;

    return (
        <Link href={`/albums/${album.id}`}>
            <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-slate-700 dark:to-slate-600">
                    {hasValidCover ? (
                        <Image
                            src={album.coverImage}
                            alt={album.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-16 h-16 text-primary-300 dark:text-slate-500"
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
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-800">
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
                            {album.photoCount} photos
                        </span>
                    </div>
                </div>
                <div className="p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white mb-1 line-clamp-1">
                        {album.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {album.description}
                    </p>
                    <div className="flex items-center text-xs text-slate-400 dark:text-slate-500">
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
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            </div>
        </Link>
    );
}
