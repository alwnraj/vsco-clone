"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Upload,
  X,
  Camera,
  Grid3X3,
  Heart,
  MessageCircle,
  Share,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { BackendStatus } from "@/components/backend-status";

interface Photo {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url?: string;
  grid_url?: string;
  large_url?: string;
  uploaded_at: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  cloudinary_id?: string;
}

export default function VSCOClone() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch photos from API with fallback
  const fetchPhotos = useCallback(async () => {
    if (!mounted) return;

    try {
      // Try to fetch from the API endpoint
      const response = await fetch("/api/photos");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        throw new Error("Backend not available");
      }
    } catch (error) {
      console.log("Backend not available, using mock data");
      // Fallback to mock data when backend isn't running
      const mockPhotos: Photo[] = [
        {
          id: "1",
          filename: "sample1.jpg",
          original_name: "Beautiful sunset.jpg",
          url: "/placeholder.svg?height=400&width=400",
          grid_url: "/placeholder.svg?height=400&width=400",
          thumbnail_url: "/placeholder.svg?height=300&width=300",
          uploaded_at: "2024-01-15T10:30:00.000Z",
          size: 1024000,
        },
        {
          id: "2",
          filename: "sample2.jpg",
          original_name: "City lights.jpg",
          url: "/placeholder.svg?height=400&width=400",
          grid_url: "/placeholder.svg?height=400&width=400",
          thumbnail_url: "/placeholder.svg?height=300&width=300",
          uploaded_at: "2024-01-14T15:45:00.000Z",
          size: 2048000,
        },
        {
          id: "3",
          filename: "sample3.jpg",
          original_name: "Ocean waves.jpg",
          url: "/placeholder.svg?height=400&width=400",
          grid_url: "/placeholder.svg?height=400&width=400",
          thumbnail_url: "/placeholder.svg?height=300&width=300",
          uploaded_at: "2024-01-13T08:20:00.000Z",
          size: 1536000,
        },
      ];
      setPhotos(mockPhotos);
    }
  }, [mounted]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload photo with fallback
  const uploadPhoto = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPhoto = await response.json();
        setPhotos((prev) => [newPhoto, ...prev]);
        setSelectedFile(null);
        toast({
          title: "Photo uploaded successfully!",
          description: "Your photo has been uploaded to Cloudinary.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      // Fallback: create a mock photo entry when backend isn't available
      console.log("Backend not available, creating mock upload");
      const mockPhoto: Photo = {
        id: Date.now().toString(),
        filename: selectedFile.name,
        original_name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
        grid_url: URL.createObjectURL(selectedFile),
        thumbnail_url: URL.createObjectURL(selectedFile),
        uploaded_at: new Date().toISOString(),
        size: selectedFile.size,
      };

      setPhotos((prev) => [mockPhoto, ...prev]);
      setSelectedFile(null);
      toast({
        title: "Photo uploaded (demo mode)!",
        description:
          "Your photo has been added to your collection. Start the backend for full functionality.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete photo with fallback
  const deletePhoto = async (photoId: string) => {
    try {
      // Find the photo to get the cloudinary_id
      const photo = photos.find((p) => p.id === photoId);
      const cloudinaryId = photo?.cloudinary_id || photo?.filename || photoId;

      const response = await fetch(
        `/api/delete?photoId=${encodeURIComponent(cloudinaryId)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
        toast({
          title: "Photo deleted",
          description: "Your photo has been removed from Cloudinary.",
        });
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      // Fallback: remove from local state when backend isn't available
      console.log("Backend not available, removing from local state");
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      toast({
        title: "Photo deleted (demo mode)",
        description: "Your photo has been removed locally.",
      });
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-8 h-8" />
              <h1 className="text-2xl font-light tracking-wide">VSCO</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Upload className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 safe-area-padding">
        {/* Backend Status */}
        <BackendStatus />

        {/* Upload Section */}
        <Card className="p-8 mb-12 border-dashed border-2 border-gray-200 bg-gray-50/50 upload-area">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-light mb-2">Share your moment</h2>
            <p className="text-gray-600 mb-6">
              Upload a photo from your iPhone gallery
            </p>

            <div className="flex flex-col items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="max-w-xs mobile-touch-target"
              />

              {selectedFile && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedFile.name}
                  </span>
                  <Button
                    onClick={uploadPhoto}
                    disabled={uploading}
                    className="bg-black hover:bg-gray-800"
                  >
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* VSCO-Style Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2 photo-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden bg-gray-100 grid-item-hover"
              >
                <Image
                  src={photo.grid_url || photo.url}
                  alt={photo.original_name}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-102"
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  priority={index < 6} // Load first 6 images with priority
                />

                {/* Hover overlay with interaction icons */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-red-500/30 h-8 w-8"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Date overlay on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-light">
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-light text-gray-600 mb-2">
              No photos yet
            </h3>
            <p className="text-gray-500">
              Upload your first photo to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
