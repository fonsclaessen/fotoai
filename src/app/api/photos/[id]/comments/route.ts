import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET comments for a photo (with pagination)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const comments = await prisma.comment.findMany({
            where: { photoId: id },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        const total = await prisma.comment.count({ where: { photoId: id } });

        return NextResponse.json({
            comments: comments.map((c: { id: string; content: string; createdAt: Date; user: { id: string; name: string } }) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                user: { id: c.user.id, name: c.user.name },
            })),
            total,
            hasMore: offset + limit < total,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { content, userId } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Comment cannot be empty' },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                photoId: id,
                userId,
            },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        return NextResponse.json({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            user: { id: comment.user.id, name: comment.user.name },
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}
