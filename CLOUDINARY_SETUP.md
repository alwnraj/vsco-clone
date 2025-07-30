# 📸 Cloudinary Setup Guide for VSCO Clone

## Quick Setup Steps

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (25GB storage + 25GB bandwidth)
3. Verify your email

### 2. Get Your Credentials
1. Go to your Cloudinary Dashboard
2. Copy these values from the "Account Details" section:
   - **Cloud Name** (e.g., `dxample123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcDefGhIjKlMnOpQrStUvWxYz123456`)

### 3. Set Environment Variables

#### Option A: Create `.env` file (Recommended)
Create a `.env` file in your project root:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### Option B: Set in Terminal (Temporary)
```bash
export CLOUDINARY_CLOUD_NAME=your_cloud_name_here
export CLOUDINARY_API_KEY=your_api_key_here
export CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Start the Backend
```bash
python scripts/backend.py
```

### 6. Start the Frontend
```bash
npm run dev
```

## 🎯 Perfect for iPhone Photos

Your grid is now optimized for iPhone photo uploads:

### Grid Features
- **Square thumbnails**: All photos display as perfect squares
- **3-column layout**: Looks great on mobile and desktop
- **Auto-cropping**: Cloudinary automatically crops to fit
- **Smart gravity**: Focuses on important parts of the image
- **Multiple sizes**: 300px, 400px, 800px variants
- **WebP/AVIF**: Automatic modern format delivery
- **CDN delivery**: Fast loading worldwide

### Upload Optimizations
- **Auto-quality**: Cloudinary optimizes file size
- **Format detection**: Supports HEIC/HEIF from iPhone
- **Responsive delivery**: Right size for each device
- **Instant thumbnails**: Generated on upload

## 🚀 What's Included

- ✅ Cloudinary integration with transformations
- ✅ VSCO-style square grid layout
- ✅ iPhone camera integration (`capture="environment"`)
- ✅ Optimized for mobile viewing
- ✅ Automatic image compression
- ✅ Multiple image sizes for responsiveness
- ✅ CDN delivery for fast loading
- ✅ Modern image formats (WebP, AVIF)

## 📱 Testing on iPhone

1. Open the app on your iPhone
2. Tap "Choose File" → "Photo Library" or "Camera"
3. Select/take a photo
4. Upload and see it appear in the perfect grid!

## 💰 Free Tier Limits

- **Storage**: 25GB (thousands of photos)
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Admin API calls**: 2,000/month

Perfect for personal use and development! 🎉 