import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

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

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(photoId);

        if (result.result === 'ok') {
            res.status(200).json({ message: 'Photo deleted successfully', result });
        } else {
            res.status(404).json({ error: 'Photo not found or already deleted' });
        }
    } catch (error) {
        console.error('Delete failed:', error);
        res.status(500).json({ error: `Delete failed: ${error.message}` });
    }
} 