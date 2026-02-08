'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
}

interface CommentsPanelProps {
    photoId: string;
    onCommentCountChange?: (count: number) => void;
}

export default function CommentsPanel({ photoId, onCommentCountChange }: CommentsPanelProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const INITIAL_LIMIT = 3;

    const fetchComments = useCallback(async (limit: number, offset: number, append: boolean = false) => {
        try {
            const res = await fetch(`/api/photos/${photoId}/comments?limit=${limit}&offset=${offset}`);
            if (!res.ok) return;
            const data = await res.json();

            if (append) {
                setComments(prev => [...prev, ...data.comments]);
            } else {
                setComments(data.comments);
            }
            setTotal(data.total);
            setHasMore(data.hasMore);
            onCommentCountChange?.(data.total);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    }, [photoId, onCommentCountChange]);

    useEffect(() => {
        setComments([]);
        setLoading(true);
        fetchComments(INITIAL_LIMIT, 0);
    }, [photoId, fetchComments]);

    const handleLoadMore = () => {
        fetchComments(10, comments.length, true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/photos/${photoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment, userId: user.id }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments(prev => [comment, ...prev]);
                setTotal(prev => prev + 1);
                setNewComment('');
                onCommentCountChange?.(total + 1);
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Zojuist';
        if (minutes < 60) return `${minutes} min geleden`;
        if (hours < 24) return `${hours} uur geleden`;
        if (days < 7) return `${days} ${days === 1 ? 'dag' : 'dagen'} geleden`;
        return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-white/90 font-medium text-sm">
                    💬 Reacties {total > 0 && <span className="text-white/50">({total})</span>}
                </h3>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-8">
                        Nog geen reacties
                    </p>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <div key={comment.id} className="group">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white/80 text-sm font-medium shrink-0">
                                        {comment.user.name}
                                    </span>
                                    <span className="text-white/30 text-xs">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm mt-0.5 leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        ))}

                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                className="text-blue-400 hover:text-blue-300 text-sm w-full text-center py-2 transition-colors"
                            >
                                Toon alle {total} reacties
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Schrijf een reactie..."
                            className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? '...' : '→'}
                        </button>
                    </form>
                ) : (
                    <p className="text-white/40 text-sm text-center">
                        Log in om te reageren
                    </p>
                )}
            </div>
        </div>
    );
}
