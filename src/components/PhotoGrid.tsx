'use client';

import { Photo } from '@/data/albums';
import Image from 'next/image';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {photos.map((photo, index) => (
                <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl cursor-pointer group"
                    onClick={() => onPhotoClick(index)}
                >
                    <Image
                        src={photo.thumbnail}
                        alt={photo.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-2">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
