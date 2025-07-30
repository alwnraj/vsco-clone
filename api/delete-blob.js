import { del } from '@vercel/blob';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { photoId } = req.query;

        if (!photoId) {
            return res.status(400).json({ error: 'Photo ID is required' });
        }

        // Delete from Vercel Blob
        await del(photoId);

        res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Delete failed:', error);
        res.status(500).json({ error: `Delete failed: ${error.message}` });
    }
} 