# Photo Albums - Docker Deployment

## Quick Start

### 1. Op je VPS

```bash
# Clone de repository
git clone https://github.com/fonsclaessen/fotoai.git
cd fotoai

# Start de applicatie
docker-compose up -d
```

De applicatie draait nu op `http://your-vps-ip:3000`

### 2. Login gegevens

- Email: `admin@example.com`
- Password: `admin123`

## Belangrijke Folders

```
./data/              # Database (SQLite) - wordt automatisch aangemaakt
./public/albums/     # Foto's - plaats hier je album folders
```

## Album Folders Toevoegen

```bash
# Maak een nieuwe album folder
mkdir -p public/albums/MyAlbum

# Kopieer foto's naar de folder
cp /pad/naar/fotos/* public/albums/MyAlbum/

# Optioneel: voeg een cover.jpg toe
cp cover.jpg public/albums/MyAlbum/cover.jpg
```

## Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs bekijken
docker-compose logs -f

# Herstart
docker-compose restart

# Rebuild (na code wijzigingen)
docker-compose up -d --build
```

## Admin Interface

Ga naar `/admin` om:
- Album titels te wijzigen
- Foto titels te bewerken
- Foto's te synchroniseren uit folders

## Database Backup

```bash
# Backup maken
cp data/db.sqlite data/db.sqlite.backup

# Restore
cp data/db.sqlite.backup data/db.sqlite
docker-compose restart
```

## Port Wijzigen

Bewerk `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Externe port:3000
```

## Troubleshooting

### Container start niet
```bash
docker-compose logs app
```

### Foto's niet zichtbaar
```bash
# Controleer of de folder bestaat
ls -la public/albums/

# Synchroniseer via admin interface
# Ga naar /admin → selecteer album → "Sync Photos"
```

### Database reset
```bash
docker-compose down
rm -rf data/
docker-compose up -d
```
