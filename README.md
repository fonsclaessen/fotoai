# Photo Albums

A modern, responsive photo album application built with Next.js, TypeScript, Tailwind CSS, and Prisma with SQLite.

## Features

- **User Authentication** - Registration and login with secure password hashing (bcrypt)
- **Album Browser** - Beautiful grid view of all photo albums with cover images
- **Photo Gallery** - Responsive photo grid with smooth animations
- **Lightbox Viewer** - Full-screen photo viewing with keyboard navigation (← → Esc)
- **Local Photo Storage** - Photos stored in numbered folders (Album1, Album2, etc.)
- **Database** - SQLite database with Prisma ORM for users, albums, photos, and comments
- **Responsive Design** - Optimized layouts for mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: bcryptjs for password hashing
- **Images**: Next.js Image component with automatic optimization

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Initialize database (creates SQLite database with tables)
npx prisma migrate dev

# Seed database with demo user and albums
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Demo Login

After seeding the database:
- **Email:** admin@example.com
- **Password:** admin123

Or register a new account on the login page.

## Adding Photos

1. Place your photos in numbered folders under `public/albums/`:
   ```
   public/albums/
   ├── Album1/
   │   ├── photo1.jpg
   │   ├── photo2.jpg
   │   └── ...
   ├── Album2/
   │   └── ...
   └── Album3/
       └── ...
   ```

2. Create albums in the database that reference these folders (use `folderName` field)

3. The API automatically scans folders for images (.jpg, .jpeg, .png, .gif, .webp)

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema (User, Album, Photo, Comment)
│   ├── seed.ts             # Database seeding script
│   └── dev.db              # SQLite database file
├── public/
│   └── albums/             # Photo storage folders
│       ├── Album1/
│       ├── Album2/
│       └── ...
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Login & register endpoints
│   │   │   └── albums/     # Album & photo endpoints
│   │   ├── login/          # Login/register page
│   │   └── albums/         # Album pages
│   ├── components/         # React components
│   ├── context/            # Auth context
│   ├── lib/
│   │   └── prisma.ts       # Prisma client singleton
│   └── data/
│       └── albums.ts       # Fallback sample data
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed the database

## Database Management

```bash
# Open database GUI
npm run db:studio

# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/albums` | Get all albums |
| POST | `/api/albums` | Create new album |
| GET | `/api/albums/[id]` | Get album with photos |
| PUT | `/api/albums/[id]` | Update album |
| DELETE | `/api/albums/[id]` | Delete album |
| POST | `/api/albums/[id]/sync` | Sync photos from folder to database |

## Customization

### Adding Real Albums

Replace the sample data in `src/data/albums.ts` with your actual album data and API calls.

### Authentication

The current auth is simulated. To add real authentication:
1. Update `AuthContext.tsx` with your auth provider (e.g., NextAuth.js, Firebase)
2. Add proper credential validation
3. Implement secure session management

## License

MIT
