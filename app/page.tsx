"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Camera, Plus, Aperture } from "lucide-react";
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
  blob_id?: string;
}

// Optimized helper function to get image dimensions with caching
const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    img.onload = () => {
      resolve({
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 400,
      });
      cleanup();
    };

    img.onerror = () => {
      // Fallback dimensions if image can't be loaded
      resolve({ width: 400, height: 400 });
      cleanup();
    };

    img.src = url;
  });
};

// Memoized photo card component for better performance
const PhotoCard = React.memo(
  ({
    photo,
    onDelete,
    index,
    isMobile,
  }: {
    photo: Photo;
    onDelete: (id: string) => void;
    index: number;
    isMobile: boolean;
  }) => {
    if (isMobile) {
      return (
        <div className="photo-container relative bg-slate-800/50 border border-slate-600/30 overflow-hidden">
          <Image
            src={photo.grid_url || photo.url}
            alt={photo.original_name}
            width={photo.width || 400}
            height={photo.height || 400}
            className="w-full h-auto object-cover"
            sizes="100vw"
            quality={95}
            priority={index < 2}
            placeholder="empty"
          />
        </div>
      );
    }

    return (
      <div className="photo-container relative break-inside-avoid bg-slate-800/50 border border-slate-600/30 overflow-hidden mb-2 lg:mb-3">
        <Image
          src={photo.grid_url || photo.url}
          alt={photo.original_name}
          width={photo.width || 400}
          height={photo.height || 400}
          className="w-full h-auto object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          quality={95}
          priority={index < 6}
          placeholder="empty"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-slate-900/70 text-slate-300 border border-slate-600/50"
            onClick={() => onDelete(photo.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
);

PhotoCard.displayName = "PhotoCard";

export default function VSCOClone() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isUploadExpanded, setIsUploadExpanded] = useState(false);
  const { toast } = useToast();

  // Memoized mock photos to prevent unnecessary re-renders
  const mockPhotos = useMemo(
    () => [
      {
        id: "1",
        filename: "sample1.jpg",
        original_name: "Golden hour serenity.jpg",
        url: "/placeholder.svg?height=600&width=400",
        grid_url: "/placeholder.svg?height=600&width=400",
        thumbnail_url: "/placeholder.svg?height=300&width=200",
        uploaded_at: "2024-01-15T10:30:00.000Z",
        size: 1024000,
        width: 400,
        height: 600,
      },
      {
        id: "2",
        filename: "sample2.jpg",
        original_name: "Urban symphony.jpg",
        url: "/placeholder.svg?height=300&width=500",
        grid_url: "/placeholder.svg?height=300&width=500",
        thumbnail_url: "/placeholder.svg?height=150&width=250",
        uploaded_at: "2024-01-14T15:45:00.000Z",
        size: 2048000,
        width: 500,
        height: 300,
      },
      {
        id: "3",
        filename: "sample3.jpg",
        original_name: "Whispered dreams.jpg",
        url: "/placeholder.svg?height=500&width=400",
        grid_url: "/placeholder.svg?height=500&width=400",
        thumbnail_url: "/placeholder.svg?height=250&width=200",
        uploaded_at: "2024-01-13T08:20:00.000Z",
        size: 1536000,
        width: 400,
        height: 500,
      },
    ],
    []
  );

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized fetch photos function with better error handling
  const fetchPhotos = useCallback(async () => {
    if (!mounted) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch("/api/photos-blob", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        throw new Error("Backend not available");
      }
    } catch (error) {
      console.log("Backend not available, using mock data");
      setPhotos(mockPhotos);
    }
  }, [mounted, mockPhotos]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.url && photo.url.startsWith("blob:")) {
          URL.revokeObjectURL(photo.url);
        }
        if (photo.grid_url && photo.grid_url.startsWith("blob:")) {
          URL.revokeObjectURL(photo.grid_url);
        }
        if (photo.thumbnail_url && photo.thumbnail_url.startsWith("blob:")) {
          URL.revokeObjectURL(photo.thumbnail_url);
        }
      });
    };
  }, [photos]);

  // Handle file selection with validation
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        const isValidType = file.type.startsWith("image/");
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

        if (!isValidType) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid image file.`,
            variant: "destructive",
          });
          return false;
        }

        if (!isValidSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit.`,
            variant: "destructive",
          });
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setIsUploadExpanded(true);
      }
    },
    [toast]
  );

  // Optimized upload photos function with better error handling
  const uploadPhotos = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch("/api/upload-blob", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.json();
        } else {
          throw new Error("Upload failed");
        }
      });

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos((prev) => [...newPhotos, ...prev]);
      setSelectedFiles([]);
      setIsUploadExpanded(false);
      toast({
        title: "✨ Photos uploaded",
        description: `${selectedFiles.length} photos added to your gallery.`,
      });
    } catch (error) {
      // Fallback: create mock photo entries when backend isn't available
      console.log("Backend not available, creating mock uploads");

      const mockPhotos: Photo[] = await Promise.all(
        selectedFiles.map(async (file, index) => {
          // Get image dimensions
          const dimensions = await getImageDimensions(file);

          return {
            id: (Date.now() + index).toString(),
            filename: file.name,
            original_name: file.name,
            url: URL.createObjectURL(file),
            grid_url: URL.createObjectURL(file),
            thumbnail_url: URL.createObjectURL(file),
            uploaded_at: new Date().toISOString(),
            size: file.size,
            width: dimensions.width,
            height: dimensions.height,
          };
        })
      );

      setPhotos((prev) => [...mockPhotos, ...prev]);
      setSelectedFiles([]);
      setIsUploadExpanded(false);
      toast({
        title: "✨ Photos uploaded",
        description: `${selectedFiles.length} photos added to your gallery.`,
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, toast]);

  // Optimized delete photo function
  const deletePhoto = useCallback(
    async (photoId: string) => {
      try {
        const photo = photos.find((p) => p.id === photoId);
        const blobId = photo?.blob_id || photo?.filename || photoId;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `/api/delete-blob?photoId=${encodeURIComponent(blobId)}`,
          {
            method: "DELETE",
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
          toast({
            title: "Photo deleted",
            description: "Your photo has been removed from the gallery.",
          });
        } else {
          throw new Error("Delete failed");
        }
      } catch (error) {
        // Fallback: remove from local state when backend isn't available
        console.log("Backend not available, removing from local state");
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
        toast({
          title: "Photo deleted",
          description: "Your photo has been removed locally.",
        });
      }
    },
    [photos, toast]
  );

  // Calculate total file size for display
  const totalFileSize = useMemo(() => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  }, [selectedFiles]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Aperture className="w-16 h-16 mx-auto mb-6 text-slate-400" />
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 sticky top-0 bg-slate-900 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-800">
                <Aperture className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-200">
                  Lumina
                </h1>
                <p className="text-xs text-slate-400 leading-none">
                  Visual Stories
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-12 safe-area-padding">
        {/* Backend Status */}
        <div className="mb-8">
          <BackendStatus />
        </div>

        {/* Minimalist Upload Section */}
        <div className="mb-8">
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-slate-700/80 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-slate-300" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-medium text-slate-200">
                    Add to gallery
                  </h2>
                  <p className="text-xs text-slate-400">Upload new photos</p>
                </div>
              </div>

              <div className="max-w-sm mx-auto">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 border border-slate-700/60 text-slate-400">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-normal">Choose photos</span>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-800/60 border border-slate-700/60">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 bg-slate-700/80 flex items-center justify-center">
                        <Camera className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-slate-300 text-xs">
                          {selectedFiles.length} file
                          {selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <p className="text-slate-500 text-xs">
                          {(totalFileSize / 1024 / 1024).toFixed(1)} MB total
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={uploadPhotos}
                        disabled={uploading}
                        size="sm"
                        className="flex-1 bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 text-xs"
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles([]);
                          setIsUploadExpanded(false);
                        }}
                        className="text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <div className="space-y-8 sm:space-y-12">
            {/* Mobile: Instagram-style feed */}
            <div className="block sm:hidden space-y-4">
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={deletePhoto}
                  index={index}
                  isMobile={true}
                />
              ))}
            </div>

            {/* Desktop: VSCO-style mosaic grid */}
            <div className="hidden sm:block">
              <div className="columns-2 lg:columns-3 xl:columns-4 gap-2 lg:gap-3 space-y-2 lg:space-y-3">
                {photos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={deletePhoto}
                    index={index}
                    isMobile={false}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 sm:py-32">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-800/50 border border-slate-600/30 flex items-center justify-center mx-auto mb-8">
              <Aperture className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-4">
              Your gallery awaits
            </h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Upload your first photos to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
