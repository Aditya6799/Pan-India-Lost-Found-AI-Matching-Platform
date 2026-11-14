"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  publicId: string;
}

export interface ImageUploadProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  className = "",
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]); // names of files currently uploading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external value changes
  React.useEffect(() => {
    setImages(value);
  }, [value]);

  const updateImages = useCallback(
    (newImages: UploadedImage[]) => {
      setImages(newImages);
      if (onChange) {
        onChange(newImages);
      }
    },
    [onChange]
  );

  const validateAndUploadFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);

    if (images.length + files.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} images. (Currently have ${images.length})`);
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const filesToUpload: File[] = [];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not supported. Please upload JPEG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMB}MB file size limit.`);
        return;
      }
      filesToUpload.push(file);
    }

    const uploadedResults: UploadedImage[] = [];

    for (const file of filesToUpload) {
      setUploadingFiles((prev) => [...prev, file.name]);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await res.json();
        if (data.url && data.publicId) {
          uploadedResults.push({ url: data.url, publicId: data.publicId });
        }
      } catch (err) {
        console.error("Upload error:", err);
        setErrorMessage(`Failed to upload ${file.name}. Please try again.`);
      } finally {
        setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      }
    }

    if (uploadedResults.length > 0) {
      updateImages([...images, ...uploadedResults]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUploadFiles(e.target.files);
    }
    // reset input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    updateImages(updated);
  };

  const canUploadMore = images.length < maxFiles;

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* DRAG & DROP AREA */}
      {canUploadMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
            isDragging
              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
              : "border-neutral-300 bg-neutral-50/60 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h4 className="mt-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Click to upload or drag &amp; drop photos
          </h4>
          <p className="mt-1 text-xs text-neutral-500">
            JPEG, PNG, or WebP (max {maxSizeMB}MB each, up to {maxFiles} images)
          </p>

          <span className="mt-2 text-[11px] font-medium text-neutral-400">
            {images.length} of {maxFiles} uploaded
          </span>
        </div>
      )}

      {/* ERROR MESSAGE BANNER */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* UPLOADING PROGRESS INDICATOR */}
      {uploadingFiles.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <span>Uploading {uploadingFiles.length} file(s)...</span>
        </div>
      )}

      {/* PREVIEW GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.publicId || index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-800"
            >
              <Image
                src={img.url}
                alt={`Uploaded photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Primary badge for first photo */}
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
