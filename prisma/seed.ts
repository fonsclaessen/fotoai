import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin',
        },
    });
    console.log('✅ Created user:', user.email);

    // Create sample albums
    const albums = [
        {
            title: 'Vakantie Zomer 2025',
            description: 'Mooie herinneringen van onze strandvakantie',
            folderName: 'Album1',
            date: new Date('2025-07-15'),
        },
        {
            title: 'Verjaardagsfeest',
            description: 'Vieren met familie en vrienden',
            folderName: 'Album2',
            date: new Date('2025-05-20'),
        },
        {
            title: 'Bergwandeling',
            description: 'Avontuur in de Alpen',
            folderName: 'Album3',
            date: new Date('2025-04-10'),
        },
    ];

    for (const albumData of albums) {
        const album = await prisma.album.upsert({
            where: { folderName: albumData.folderName },
            update: albumData,
            create: {
                ...albumData,
                userId: user.id,
            },
        });
        console.log('✅ Created album:', album.title, `(${album.folderName})`);
    }

    console.log('🎉 Seeding complete!');
    console.log('');
    console.log('📂 Now add photos to the following folders:');
    console.log('   - public/albums/Album1/');
    console.log('   - public/albums/Album2/');
    console.log('   - public/albums/Album3/');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
