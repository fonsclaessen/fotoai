import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Sync photos from folder to database
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const album = await prisma.album.findUnique({
            where: { id },
        });

        if (!album) {
            return NextResponse.json(
                { error: 'Album not found' },
                { status: 404 }
            );
        }

        const folderPath = path.join(process.cwd(), 'public', 'albums', album.folderName);

        if (!fs.existsSync(folderPath)) {
            return NextResponse.json(
                { error: 'Album folder not found' },
                { status: 404 }
            );
        }

        const files = fs.readdirSync(folderPath);
        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            // Exclude cover.jpg from photo list
            if (file.toLowerCase() === 'cover.jpg') return false;
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
        const imageFilesSet = new Set(imageFiles);

        // Get existing photos
        const existingPhotos = await prisma.photo.findMany({
            where: { albumId: id },
            select: { id: true, filename: true },
        });
        const existingFilenames = new Set(existingPhotos.map((p) => p.filename));

        // Find photos to delete (in DB but not in folder)
        const photosToDelete = existingPhotos
            .filter((p) => !imageFilesSet.has(p.filename))
            .map((p) => p.id);

        // Delete removed photos from database
        if (photosToDelete.length > 0) {
            await prisma.photo.deleteMany({
                where: { id: { in: photosToDelete } },
            });
        }

        // Add new photos
        const newPhotos = imageFiles
            .filter((filename) => !existingFilenames.has(filename))
            .map((filename) => ({
                filename,
                path: `/albums/${album.folderName}/${filename}`,
                title: filename.replace(/\.[^/.]+$/, ''),
                albumId: id,
            }));

        if (newPhotos.length > 0) {
            await prisma.photo.createMany({
                data: newPhotos,
            });
        }

        return NextResponse.json({
            added: newPhotos.length,
            removed: photosToDelete.length,
            total: imageFiles.length,
        });
    } catch (error) {
        console.error('Error syncing photos:', error);
        return NextResponse.json(
            { error: 'Failed to sync photos' },
            { status: 500 }
        );
    }
}

// Also allow GET for easier testing
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    return POST(request, context);
}
