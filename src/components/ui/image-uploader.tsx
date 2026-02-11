"use client";

import Image from "next/image";
import {
  type ChangeEventHandler,
  type DragEventHandler,
  useState,
} from "react";
import { Icon } from "@/components/ui/icon";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type UploadedFile = {
  id: string;
  url: string;
  key: string;
  name: string;
};

type ImageUploaderProps = {
  endpoint:
    | "profileImage"
    | "headerCarousel"
    | "albumMedia"
    | "timelineEventImage";
  finalSpaceId: string;
  albumId?: string;
  maxFiles?: number;
  existingFiles?: UploadedFile[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileId: string) => void;
  className?: string;
  variant?: "default" | "compact" | "avatar";
};

export function ImageUploader({
  endpoint,
  finalSpaceId,
  albumId,
  maxFiles = 1,
  existingFiles = [],
  onUploadComplete,
  onFileRemove,
  className,
  variant = "default",
}: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { startUpload } = useUploadThing(endpoint, {
    headers: {
      "x-final-space-id": finalSpaceId,
      ...(albumId && { "x-album-id": albumId }),
    },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress(0);
      setError(null);

      const newFiles = res.map((file) => ({
        id: file.serverData.mediaId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
      }));

      setFiles((prev) => {
        const updated = [...prev, ...newFiles].slice(0, maxFiles);
        return updated;
      });

      onUploadComplete?.(newFiles);
    },
    onUploadError: (err) => {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleDrop: DragEventHandler<HTMLElement> = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (files.length >= maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (droppedFiles.length === 0) {
      setError("Please upload image files only");
      return;
    }

    const remainingSlots = maxFiles - files.length;
    const filesToUpload = droppedFiles.slice(0, remainingSlots);

    setIsUploading(true);
    setError(null);
    await startUpload(filesToUpload);
  };

  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    if (files.length >= maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    const remainingSlots = maxFiles - files.length;
    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    setIsUploading(true);
    setError(null);
    await startUpload(filesToUpload);

    // Reset input
    e.target.value = "";
  };

  const handleRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onFileRemove?.(fileId);
  };

  const canUpload = files.length < maxFiles;

  if (variant === "compact") {
    return (
      <label
        className={cn(
          "flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-60",
          !canUpload && "hidden",
          className
        )}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-1">
            <Icon
              className="size-6 animate-spin text-muted-foreground"
              icon="mdi:loading"
            />
            <span className="text-muted-foreground text-xs">
              {uploadProgress}%
            </span>
          </div>
        ) : (
          <Icon className="size-6 text-muted-foreground" icon="mdi:plus" />
        )}
        <input
          accept="image/*"
          className="sr-only"
          disabled={isUploading || !canUpload}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          type="file"
        />
        {error && (
          <p className="absolute -bottom-5 left-0 text-destructive text-xs">
            {error}
          </p>
        )}
      </label>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("relative inline-block", className)}>
        <div className="relative size-24 overflow-hidden rounded-full border-2 border-muted-foreground/25 border-dashed bg-muted">
          {files[0] ? (
            <>
              <Image
                alt="Profile"
                className="object-cover"
                fill
                src={files[0].url}
              />
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                onClick={() => handleRemove(files[0].id)}
                type="button"
              >
                <Icon className="size-6 text-white" icon="mdi:close" />
              </button>
            </>
          ) : (
            <label
              className={cn(
                "flex size-full cursor-pointer items-center justify-center transition-colors hover:bg-muted/80",
                isUploading && "cursor-wait"
              )}
            >
              {isUploading ? (
                <Icon
                  className="size-8 animate-spin text-muted-foreground"
                  icon="mdi:loading"
                />
              ) : (
                <Icon
                  className="size-8 text-muted-foreground"
                  icon="mdi:camera-plus"
                />
              )}
              <input
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                onChange={handleFileSelect}
                type="file"
              />
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-center text-destructive text-xs">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      {canUpload && (
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isUploading && "pointer-events-none opacity-60"
          )}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Icon
                className="mx-auto size-10 animate-pulse text-muted-foreground"
                icon="mdi:cloud-upload"
              />
              <div className="space-y-1">
                <p className="font-medium text-sm">Uploading...</p>
                <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  {uploadProgress}%
                </p>
              </div>
            </div>
          ) : (
            <>
              <Icon
                className="mx-auto mb-3 size-10 text-muted-foreground"
                icon="mdi:cloud-upload-outline"
              />
              <p className="mb-1 font-medium text-sm">
                Drag and drop image here
              </p>
              <p className="mb-3 text-muted-foreground text-xs">
                or click to browse
              </p>
              <label className="cursor-pointer">
                <span className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 font-medium text-sm ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground">
                  <Icon className="size-4" icon="mdi:upload" />
                  Choose Files
                </span>
                <input
                  accept="image/*"
                  className="sr-only"
                  multiple={maxFiles > 1}
                  onChange={handleFileSelect}
                  type="file"
                />
              </label>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <Icon className="size-4 shrink-0" icon="mdi:alert-circle" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file) => (
            <div
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              key={file.id}
            >
              <Image
                alt={file.name}
                className="object-cover"
                fill
                src={file.url}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleRemove(file.id)}
                  type="button"
                >
                  <Icon className="size-5" icon="mdi:delete" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count indicator */}
      {maxFiles > 1 && (
        <p className="text-center text-muted-foreground text-xs">
          {files.length} / {maxFiles} images
        </p>
      )}
    </div>
  );
}
