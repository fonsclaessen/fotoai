'use client';

import { Photo } from '@/data/albums';
import Image from 'next/image';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (index: number) => void;
    selectionMode?: boolean;
    selectedPhotos?: Set<string>;
    onToggleSelect?: (photoId: string) => void;
}

export default function PhotoGrid({
    photos,
    onPhotoClick,
    selectionMode = false,
    selectedPhotos = new Set(),
    onToggleSelect,
}: PhotoGridProps) {
    const handleClick = (photo: Photo, index: number) => {
        if (selectionMode && onToggleSelect) {
            onToggleSelect(photo.id);
        } else {
            onPhotoClick(index);
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {photos.map((photo, index) => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                    <div
                        key={photo.id}
                        className={`relative aspect-square overflow-hidden rounded-lg sm:rounded-xl cursor-pointer group ${selectionMode && isSelected ? 'ring-3 ring-primary-500 ring-offset-2' : ''
                            }`}
                        onClick={() => handleClick(photo, index)}
                    >
                        <Image
                            src={photo.thumbnail}
                            alt={photo.title}
                            fill
                            className={`object-cover transition-all duration-300 ${selectionMode
                                ? isSelected
                                    ? 'scale-95 brightness-90'
                                    : 'group-hover:scale-105'
                                : 'group-hover:scale-110'
                                }`}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            quality={50}
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOTRhM2I4Ii8+PC9zdmc+"
                        />

                        {/* Selection checkbox */}
                        {selectionMode && (
                            <div className="absolute top-2 left-2 z-10">
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'bg-black/30 border-white/80 group-hover:bg-black/50'
                                        }`}
                                >
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Hover overlay (only when not in selection mode) */}
                        {!selectionMode && (
                            <>
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
                            </>
                        )}

                        {/* Comment count badge */}
                        {!selectionMode && (photo.commentCount ?? 0) > 0 && (
                            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {photo.commentCount}
                            </div>
                        )}

                        {/* Selection overlay */}
                        {selectionMode && (
                            <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-primary-500/10' : 'bg-black/0 group-hover:bg-black/10'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
