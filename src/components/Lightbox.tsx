'use client';

import { Photo } from '@/data/albums';
import Image from 'next/image';
import { useEffect, useCallback, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import CommentsPanel from './CommentsPanel';

interface LightboxProps {
    photos: Photo[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    onCommentCountChange?: (photoId: string, count: number) => void;
}

export default function Lightbox({
    photos,
    currentIndex,
    onClose,
    onPrev,
    onNext,
    onCommentCountChange,
}: LightboxProps) {
    const currentPhoto = photos[currentIndex];
    const [showComments, setShowComments] = useState(false);

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

    const handleCommentCountChange = useCallback((count: number) => {
        onCommentCountChange?.(currentPhoto.id, count);
    }, [currentPhoto.id, onCommentCountChange]);

    // Swipe handlers
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (currentIndex < photos.length - 1) onNext();
        },
        onSwipedRight: () => {
            if (currentIndex > 0) onPrev();
        },
        trackMouse: false,
        trackTouch: true,
        preventScrollOnSwipe: true,
        delta: 30,
    });

    return (
        <div className="fixed inset-0 z-50 flex flex-col" {...swipeHandlers}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95" />

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0">
                <div className="text-white/60 text-sm">
                    {currentIndex + 1} / {photos.length}
                </div>
                <div className="text-white/90 text-sm truncate mx-4">
                    {currentPhoto.title}
                </div>
                <div className="flex items-center gap-2">
                    {/* Toggle comments button (visible on mobile) */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="md:hidden p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors relative"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {(currentPhoto.commentCount ?? 0) > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {currentPhoto.commentCount}
                            </span>
                        )}
                    </button>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row min-h-0">
                {/* Photo area with navigation */}
                <div className="relative flex-1 flex items-center justify-center min-h-0">
                    {/* Navigation - Previous */}
                    <button
                        onClick={onPrev}
                        disabled={currentIndex === 0}
                        className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Navigation - Next */}
                    <button
                        onClick={onNext}
                        disabled={currentIndex === photos.length - 1}
                        className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Image */}
                    <div className="relative w-full h-full m-4 sm:m-8">
                        <Image
                            src={currentPhoto.src}
                            alt={currentPhoto.title}
                            fill
                            className="object-contain"
                            priority
                            sizes="(min-width: 768px) calc(100vw - 352px), 100vw"
                        />
                    </div>
                </div>

                {/* Comments panel - Desktop: side panel, Mobile: slide-up overlay */}
                <div
                    className={`
                        md:relative md:w-80 md:shrink-0 md:border-l md:border-white/10 md:bg-black/50 md:block
                        ${showComments
                            ? 'fixed inset-x-0 bottom-0 h-[60vh] bg-black/95 border-t border-white/10 z-20 animate-in slide-in-from-bottom duration-200'
                            : 'hidden md:block'
                        }
                    `}
                >
                    {/* Mobile close bar */}
                    <div className="md:hidden flex justify-center py-2">
                        <button
                            onClick={() => setShowComments(false)}
                            className="w-10 h-1 bg-white/30 rounded-full"
                        />
                    </div>
                    <CommentsPanel
                        photoId={currentPhoto.id}
                        onCommentCountChange={handleCommentCountChange}
                    />
                </div>
            </div>
        </div>
    );
}
