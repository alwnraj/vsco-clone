import { list } from '@vercel/blob';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // List all blobs in the vsco-photos folder
        const { blobs } = await list({
            prefix: 'vsco-photos/',
            limit: 30 // Limit to 30 most recent photos
        });

        // Transform blob response to match our frontend interface
        const photos = blobs
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)) // Sort by upload date, newest first
            .map(blob => {
                // Extract timestamp from filename for ID
                const filename = blob.pathname.split('/').pop();
                const timestampMatch = filename.match(/^(\d+)-/);
                const id = timestampMatch ? timestampMatch[1] : blob.pathname;

                return {
                    id: id,
                    filename: blob.pathname,
                    original_name: filename || 'uploaded_image',
                    url: blob.url,
                    thumbnail_url: blob.url,
                    grid_url: blob.url,
                    large_url: blob.url,
                    uploaded_at: blob.uploadedAt,
                    size: blob.size || 0,
                    width: 0,
                    height: 0,
                    format: blob.pathname.split('.').pop() || '',
                    blob_id: blob.pathname
                };
            });

        res.status(200).json({ photos });
    } catch (error) {
        console.error('Failed to fetch photos:', error);
        res.status(500).json({
            error: 'Failed to fetch photos',
            photos: [] // Return empty array as fallback
        });
    }
} 