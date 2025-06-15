"use client";

import Image from "next/image";

interface GalleryImageProps {
  src: string;
  alt: string;
  sizes?: string;
}

export function GalleryImage({ src, alt, sizes }: GalleryImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover hover:scale-105 transition-transform cursor-pointer"
      sizes={sizes || "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
      onClick={() => window.open(src, '_blank')}
    />
  );
} 