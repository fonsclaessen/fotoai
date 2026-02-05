import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET album by ID with photos
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                photos: {
                    orderBy: { filename: 'asc' },
                },
            },
        });

        if (!album) {
            return NextResponse.json(
                { error: 'Album not found' },
                { status: 404 }
            );
        }

        // If no photos in DB, scan the folder
        let photos = album.photos;
        if (photos.length === 0) {
            const folderPath = path.join(process.cwd(), 'public', 'albums', album.folderName);

            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                const imageFiles = files.filter((file) => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                });

                // Return photos from folder (not yet in DB)
                photos = imageFiles.map((filename, index) => ({
                    id: `temp-${index}`,
                    filename,
                    path: `/albums/${album.folderName}/${filename}`,
                    title: filename.replace(/\.[^/.]+$/, ''),
                    width: null,
                    height: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    albumId: album.id,
                }));
            }
        }

        return NextResponse.json({
            ...album,
            photos: photos.map((photo) => ({
                id: photo.id,
                filename: photo.filename,
                src: photo.path.startsWith('/') ? photo.path : `/albums/${album.folderName}/${photo.filename}`,
                thumbnail: photo.path.startsWith('/') ? photo.path : `/albums/${album.folderName}/${photo.filename}`,
                title: photo.title || photo.filename,
                width: photo.width || 1200,
                height: photo.height || 800,
            })),
        });
    } catch (error) {
        console.error('Error fetching album:', error);
        return NextResponse.json(
            { error: 'Failed to fetch album' },
            { status: 500 }
        );
    }
}

// PUT update album
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { title, description, date } = await request.json();

        const album = await prisma.album.update({
            where: { id },
            data: {
                title,
                description,
                date: date ? new Date(date) : undefined,
            },
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error('Error updating album:', error);
        return NextResponse.json(
            { error: 'Failed to update album' },
            { status: 500 }
        );
    }
}

// DELETE album
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.album.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting album:', error);
        return NextResponse.json(
            { error: 'Failed to delete album' },
            { status: 500 }
        );
    }
}
