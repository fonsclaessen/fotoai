'use client';

import { Photo } from '@/data/albums';
import Image from 'next/image';
import { useEffect, useCallback } from 'react';

interface LightboxProps {
    photos: Photo[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export default function Lightbox({
    photos,
    currentIndex,
    onClose,
    onPrev,
    onNext,
}: LightboxProps) {
    const currentPhoto = photos[currentIndex];

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    onPrev();
                    break;
                case 'ArrowRight':
                    onNext();
                    break;
            }
        },
        [onClose, onPrev, onNext]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [handleKeyDown]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 lightbox-overlay"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
                <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            {/* Navigation - Previous */}
            <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
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
            </button>

            {/* Navigation - Next */}
            <button
                onClick={onNext}
                disabled={currentIndex === photos.length - 1}
                className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            {/* Image */}
            <div className="relative w-full h-full max-w-6xl max-h-[85vh] m-4 sm:m-8">
                <Image
                    src={currentPhoto.src}
                    alt={currentPhoto.title}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                />
            </div>

            {/* Counter and title */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/90 text-sm sm:text-base mb-1">
                    {currentPhoto.title}
                </p>
                <p className="text-white/60 text-xs sm:text-sm">
                    {currentIndex + 1} / {photos.length}
                </p>
            </div>
        </div>
    );
}
