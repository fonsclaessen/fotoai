import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// POST: Full sync of albums folder → database
export async function POST() {
    try {
        const albumsDir = path.join(process.cwd(), 'public', 'albums');

        if (!fs.existsSync(albumsDir)) {
            return NextResponse.json(
                { error: 'Albums folder not found' },
                { status: 404 }
            );
        }

        // Find admin user as owner for new albums
        let adminUser = await prisma.user.findFirst({
            where: { isAdmin: true },
        });
        if (!adminUser) {
            adminUser = await prisma.user.findFirst();
        }
        if (!adminUser) {
            return NextResponse.json(
                { error: 'No user found to assign albums to' },
                { status: 400 }
            );
        }

        // 1. Read all folders on disk
        const entries = fs.readdirSync(albumsDir, { withFileTypes: true });
        const folderNames = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name);

        // 2. Get all albums from DB
        const existingAlbums = await prisma.album.findMany({
            select: { id: true, folderName: true },
        });
        const existingFolderMap = new Map<string, string>(
            existingAlbums.map((a: { id: string; folderName: string }) => [a.folderName, a.id])
        );
        const diskFolderSet = new Set(folderNames);

        // 3. Create new albums for folders not in DB
        const newFolders = folderNames.filter((f) => !existingFolderMap.has(f));
        const createdAlbums = [];
        for (const folderName of newFolders) {
            const album = await prisma.album.create({
                data: {
                    title: folderName,
                    folderName,
                    userId: adminUser.id,
                    date: new Date(),
                },
            });
            createdAlbums.push(album);
            existingFolderMap.set(folderName, album.id);
        }

        // 4. Delete albums whose folder no longer exists
        const removedAlbums = existingAlbums.filter(
            (a: { id: string; folderName: string }) => !diskFolderSet.has(a.folderName)
        );
        if (removedAlbums.length > 0) {
            // Cascade delete takes care of photos and comments
            await prisma.album.deleteMany({
                where: { id: { in: removedAlbums.map((a: { id: string }) => a.id) } },
            });
        }

        // 5. Sync photos for all remaining albums
        const allAlbums = await prisma.album.findMany({
            include: {
                photos: { select: { id: true, filename: true } },
            },
        });

        let totalPhotosAdded = 0;
        let totalPhotosRemoved = 0;

        for (const album of allAlbums) {
            const folderPath = path.join(albumsDir, album.folderName);
            if (!fs.existsSync(folderPath)) continue;

            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter((file) => {
                const ext = path.extname(file).toLowerCase();
                if (file.toLowerCase() === 'cover.jpg') return false;
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
            const imageFilesSet = new Set(imageFiles);
            const existingFilenames = new Set(album.photos.map((p: { filename: string }) => p.filename));

            // Remove photos no longer on disk
            const photosToDelete = album.photos
                .filter((p: { filename: string }) => !imageFilesSet.has(p.filename))
                .map((p: { id: string }) => p.id);

            if (photosToDelete.length > 0) {
                await prisma.photo.deleteMany({
                    where: { id: { in: photosToDelete } },
                });
                totalPhotosRemoved += photosToDelete.length;
            }

            // Add new photos
            const newPhotos = imageFiles
                .filter((filename) => !existingFilenames.has(filename))
                .map((filename) => ({
                    filename,
                    path: `/albums/${album.folderName}/${filename}`,
                    title: filename.replace(/\.[^/.]+$/, ''),
                    albumId: album.id,
                }));

            if (newPhotos.length > 0) {
                await prisma.photo.createMany({ data: newPhotos });
                totalPhotosAdded += newPhotos.length;
            }
        }

        return NextResponse.json({
            albumsCreated: createdAlbums.length,
            albumsRemoved: removedAlbums.length,
            photosAdded: totalPhotosAdded,
            photosRemoved: totalPhotosRemoved,
            totalAlbums: allAlbums.length - removedAlbums.length + createdAlbums.length,
            newAlbumNames: createdAlbums.map((a) => a.folderName),
            removedAlbumNames: removedAlbums.map((a: { folderName: string }) => a.folderName),
        });
    } catch (error) {
        console.error('Error syncing all albums:', error);
        return NextResponse.json(
            { error: 'Failed to sync albums' },
            { status: 500 }
        );
    }
}
