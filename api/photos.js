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
        // Get all resources from the vsco_photos folder
        const result = await cloudinary.search
            .expression('folder:vsco_photos')
            .sort_by([['created_at', 'desc']])
            .max_results(30) // Limit to 30 most recent photos
            .execute();

        console.log('Cloudinary search result:', result);

        // Transform Cloudinary response to match our frontend interface
        const photos = result.resources.map(resource => ({
            id: resource.asset_id || resource.public_id,
            filename: resource.public_id,
            original_name: resource.filename || 'uploaded_image',
            url: resource.secure_url,
            thumbnail_url: resource.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto/'),
            grid_url: resource.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,g_auto,q_auto,f_auto/'),
            large_url: resource.secure_url.replace('/upload/', '/upload/w_800,h_800,c_fill,g_auto,q_auto,f_auto/'),
            uploaded_at: resource.created_at,
            size: resource.bytes || 0,
            width: resource.width || 0,
            height: resource.height || 0,
            format: resource.format || '',
            cloudinary_id: resource.public_id
        }));

        res.status(200).json({ photos });
    } catch (error) {
        console.error('Failed to fetch photos:', error);
        res.status(500).json({
            error: 'Failed to fetch photos',
            photos: [] // Return empty array as fallback
        });
    }
} 