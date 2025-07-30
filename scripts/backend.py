from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import uuid
from typing import List
import json
from datetime import datetime
import cloudinary
import cloudinary.uploader
from PIL import Image
import io

app = FastAPI(title="VSCO Clone API")

# Configure Cloudinary (you'll need to set these environment variables)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "your_cloud_name"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "your_api_key"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "your_api_secret"),
    secure=True
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage for photo metadata
photos_db = []

@app.get("/")
async def root():
    return {"message": "VSCO Clone API with Cloudinary"}

@app.post("/api/upload")
async def upload_photo(file: UploadFile = File(...)):
    """Upload a photo to Cloudinary and return photo metadata"""
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    try:
        content = await file.read()
        
        # Generate unique public_id for Cloudinary
        public_id = f"vsco_photos/{uuid.uuid4()}"
        
        # Upload to Cloudinary with transformations for grid layout
        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            # Optimize for web delivery
            transformation=[
                {"quality": "auto", "fetch_format": "auto"},
                {"dpr": "auto", "responsive": True}
            ],
            # Generate multiple sizes for responsive grid
            eager=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "auto", "quality": "auto", "fetch_format": "auto"},
                {"width": 800, "height": 800, "crop": "fill", "gravity": "auto", "quality": "auto", "fetch_format": "auto"},
                {"width": 300, "height": 300, "crop": "fill", "gravity": "auto", "quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        # Create photo metadata
        photo_data = {
            "id": str(uuid.uuid4()),
            "filename": result['public_id'],
            "original_name": file.filename,
            "url": result['secure_url'],
            # Grid-optimized URLs for different screen sizes
            "thumbnail_url": result['secure_url'].replace('/upload/', '/upload/w_300,h_300,c_fill,g_auto,q_auto,f_auto/'),
            "grid_url": result['secure_url'].replace('/upload/', '/upload/w_400,h_400,c_fill,g_auto,q_auto,f_auto/'),
            "large_url": result['secure_url'].replace('/upload/', '/upload/w_800,h_800,c_fill,g_auto,q_auto,f_auto/'),
            "uploaded_at": datetime.now().isoformat(),
            "size": result.get('bytes', 0),
            "width": result.get('width', 0),
            "height": result.get('height', 0),
            "format": result.get('format', ''),
            "cloudinary_id": result['public_id']
        }
        
        # Store in memory (in production, use a real database)
        photos_db.append(photo_data)
        
        return JSONResponse(content=photo_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/api/photos")
async def get_photos():
    """Get all uploaded photos"""
    return {"photos": photos_db}

@app.delete("/api/photos/{photo_id}")
async def delete_photo(photo_id: str):
    """Delete a photo by ID"""
    global photos_db
    
    # Find photo
    photo = next((p for p in photos_db if p["id"] == photo_id), None)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Delete from Cloudinary
    try:
        cloudinary.uploader.destroy(photo["cloudinary_id"])
    except Exception as e:
        print(f"Failed to delete from Cloudinary: {e}")
    
    # Remove from database
    photos_db = [p for p in photos_db if p["id"] != photo_id]
    
    return {"message": "Photo deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
