/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
        ],
        // Cache optimized images for 1 year (photos never change)
        minimumCacheTTL: 31536000,
        // Smaller sizes for efficient thumbnails
        imageSizes: [64, 128, 256, 384],
        // Device sizes for responsive images
        deviceSizes: [640, 750, 828, 1080, 1200],
    },
};

export default nextConfig;
