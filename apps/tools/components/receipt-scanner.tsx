"use client";

import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { useRef } from "react";

export function ReceiptScanner({
  onFile,
  loading,
}: {
  onFile: (file: File) => void;
  loading: boolean;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Scanning receipt...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display text-lg">Scan your receipt</p>
            <p className="text-sm text-muted-foreground mt-1">
              Take a photo or pick from gallery
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => cameraRef.current?.click()}>
              <Camera className="w-4 h-4 mr-1.5" />
              Camera
            </Button>
            <Button variant="outline" onClick={() => galleryRef.current?.click()}>
              <ImagePlus className="w-4 h-4 mr-1.5" />
              Gallery
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
