import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET all albums
export async function GET() {
    try {
        const albums = await prisma.album.findMany({
            include: {
                _count: {
                    select: { photos: true },
                },
            },
            orderBy: { date: 'desc' },
        });

        // Map albums with photo count
        const albumsWithCount = albums.map((album) => {
            // Check if cover.jpg exists in the folder
            let coverImage = album.coverImage;
            if (!coverImage) {
                const coverPath = path.join(process.cwd(), 'public', 'albums', album.folderName, 'cover.jpg');
                if (fs.existsSync(coverPath)) {
                    coverImage = `/albums/${encodeURIComponent(album.folderName)}/cover.jpg`;
                }
            }

            return {
                id: album.id,
                title: album.title,
                description: album.description,
                coverImage, // null if no cover exists
                folderName: album.folderName,
                photoCount: album._count.photos,
                date: album.date.toISOString(),
            };
        });

        return NextResponse.json(albumsWithCount);
    } catch (error) {
        console.error('Error fetching albums:', error);
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        );
    }
}

// POST create new album
export async function POST(request: NextRequest) {
    try {
        const { title, description, folderName, date } = await request.json();

        // Verify the folder exists
        const folderPath = path.join(process.cwd(), 'albums', folderName);
        if (!fs.existsSync(folderPath)) {
            // Create the folder if it doesn't exist
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Find admin user or first user as owner
        let adminUser = await prisma.user.findFirst({
            where: { isAdmin: true },
        });
        if (!adminUser) {
            adminUser = await prisma.user.findFirst();
        }
        if (!adminUser) {
            return NextResponse.json(
                { error: 'No user found to assign album to' },
                { status: 400 }
            );
        }

        const album = await prisma.album.create({
            data: {
                title,
                description,
                folderName,
                userId: adminUser.id,
                date: date ? new Date(date) : new Date(),
            },
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error('Error creating album:', error);
        return NextResponse.json(
            { error: 'Failed to create album' },
            { status: 500 }
        );
    }
}
