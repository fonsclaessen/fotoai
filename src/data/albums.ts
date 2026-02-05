export interface Photo {
    id: string;
    src: string;
    thumbnail: string;
    title: string;
    width: number;
    height: number;
}

export interface Album {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    photoCount: number;
    date: string;
}

// Sample albums data - replace with real API data
export const sampleAlbums: Album[] = [
    {
        id: '1',
        title: 'Summer Vacation 2025',
        description: 'Beautiful memories from our beach trip',
        coverImage: 'https://picsum.photos/seed/album1/400/300',
        photoCount: 24,
        date: '2025-07-15',
    },
    {
        id: '2',
        title: 'Birthday Party',
        description: 'Celebrating with family and friends',
        coverImage: 'https://picsum.photos/seed/album2/400/300',
        photoCount: 36,
        date: '2025-05-20',
    },
    {
        id: '3',
        title: 'Mountain Hiking',
        description: 'Adventure in the Alps',
        coverImage: 'https://picsum.photos/seed/album3/400/300',
        photoCount: 48,
        date: '2025-04-10',
    },
    {
        id: '4',
        title: 'Wedding Ceremony',
        description: 'A beautiful day to remember',
        coverImage: 'https://picsum.photos/seed/album4/400/300',
        photoCount: 120,
        date: '2025-03-22',
    },
    {
        id: '5',
        title: 'City Photography',
        description: 'Urban exploration and architecture',
        coverImage: 'https://picsum.photos/seed/album5/400/300',
        photoCount: 56,
        date: '2025-02-14',
    },
    {
        id: '6',
        title: 'Nature Collection',
        description: 'Wildlife and landscape shots',
        coverImage: 'https://picsum.photos/seed/album6/400/300',
        photoCount: 88,
        date: '2025-01-08',
    },
    {
        id: '7',
        title: 'Family Reunion',
        description: 'Getting together after years',
        coverImage: 'https://picsum.photos/seed/album7/400/300',
        photoCount: 42,
        date: '2024-12-25',
    },
    {
        id: '8',
        title: 'Food Photography',
        description: 'Delicious dishes from around the world',
        coverImage: 'https://picsum.photos/seed/album8/400/300',
        photoCount: 65,
        date: '2024-11-30',
    },
];

// Generate sample photos for an album
export function generatePhotosForAlbum(albumId: string, count: number): Photo[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `${albumId}-${i + 1}`,
        src: `https://picsum.photos/seed/${albumId}-${i + 1}/1200/800`,
        thumbnail: `https://picsum.photos/seed/${albumId}-${i + 1}/400/300`,
        title: `Photo ${i + 1}`,
        width: 1200,
        height: 800,
    }));
}
