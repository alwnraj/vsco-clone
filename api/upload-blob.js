import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';

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
        return res.status(200).json({ message: "VSCO Clone API with Vercel Blob" });
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

        // Get the file details
        const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
        const originalName = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
        const mimetype = Array.isArray(file) ? file[0].mimetype : file.mimetype;

        // Read the file
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(filePath);

        // Generate unique filename
        const timestamp = Date.now();
        const extension = originalName.split('.').pop() || 'jpg';
        const fileName = `vsco-photos/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(fileName, fileBuffer, {
            access: 'public',
            contentType: mimetype,
        });

        // Create photo metadata
        const photoData = {
            id: timestamp.toString(),
            filename: fileName,
            original_name: originalName || 'uploaded_image',
            url: blob.url,
            // Create thumbnail and grid URLs by adding transformation params
            thumbnail_url: blob.url,
            grid_url: blob.url,
            large_url: blob.url,
            uploaded_at: new Date().toISOString(),
            size: fileBuffer.length,
            width: 0, // Vercel Blob doesn't provide dimensions
            height: 0,
            format: extension,
            blob_id: fileName
        };

        res.status(200).json(photoData);
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ error: `Upload failed: ${error.message}` });
    }
} 