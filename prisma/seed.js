const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: 'fonsclaessenbs@gmail.com' },
    });

    if (existingUser) {
        console.log('Admin user already exists, skipping...');
        return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Ruben123#', 10);
    const user = await prisma.user.create({
        data: {
            email: 'fonsclaessenbs@gmail.com',
            password: hashedPassword,
            name: 'Admin User',
            isAdmin: true,
        },
    });

    console.log('Created admin user:', user.email);

    // Create sample albums
    const album1 = await prisma.album.create({
        data: {
            title: 'Summer Vacation 2023',
            description: 'Beautiful memories from our summer trip',
            folderName: 'Album1',
            userId: user.id,
            date: new Date('2023-07-30'),
        },
    });

    const album2 = await prisma.album.create({
        data: {
            title: 'City Adventures',
            description: 'Exploring the urban landscape',
            folderName: 'Album2',
            userId: user.id,
            date: new Date('2023-08-30'),
        },
    });

    const album3 = await prisma.album.create({
        data: {
            title: 'Nature Photography',
            description: 'Capturing the beauty of nature',
            folderName: 'Album3',
            userId: user.id,
            date: new Date('2023-07-30'),
        },
    });

    console.log('Created albums:', album1.title, album2.title, album3.title);

    console.log('Database seeded successfully! 🌱');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
