import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single photo
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const photo = await prisma.photo.findUnique({
            where: { id },
            include: {
                album: true,
                comments: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!photo) {
            return NextResponse.json(
                { error: 'Photo not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(photo);
    } catch (error) {
        console.error('Error fetching photo:', error);
        return NextResponse.json(
            { error: 'Failed to fetch photo' },
            { status: 500 }
        );
    }
}

// PUT update photo
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { title } = await request.json();

        const photo = await prisma.photo.update({
            where: { id },
            data: { title },
        });

        return NextResponse.json(photo);
    } catch (error) {
        console.error('Error updating photo:', error);
        return NextResponse.json(
            { error: 'Failed to update photo' },
            { status: 500 }
        );
    }
}

// DELETE photo
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.photo.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting photo:', error);
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        );
    }
}
