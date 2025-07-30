import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Disable body parsing for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.status(200).json({ message: "VSCO Clone API with Cloudinary" });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse the form data
        const form = new IncomingForm();
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const file = files.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the file path (formidable creates a temporary file)
        const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
        const originalName = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;

        // Upload to Cloudinary with transformations
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'vsco_photos',
            resource_type: 'image',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { dpr: 'auto', responsive: true }
            ],
            // Generate multiple sizes for responsive grid
            eager: [
                { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
                { width: 800, height: 800, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
                { width: 300, height: 300, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' }
            ]
        });

        // Create photo metadata
        const photoData = {
            id: Date.now().toString(),
            filename: result.public_id,
            original_name: originalName || 'uploaded_image',
            url: result.secure_url,
            // Grid-optimized URLs for different screen sizes
            thumbnail_url: result.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto/'),
            grid_url: result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,g_auto,q_auto,f_auto/'),
            large_url: result.secure_url.replace('/upload/', '/upload/w_800,h_800,c_fill,g_auto,q_auto,f_auto/'),
            uploaded_at: new Date().toISOString(),
            size: result.bytes || 0,
            width: result.width || 0,
            height: result.height || 0,
            format: result.format || '',
            cloudinary_id: result.public_id
        };

        res.status(200).json(photoData);
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ error: `Upload failed: ${error.message}` });
    }
} 