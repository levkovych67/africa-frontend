"use client";

import { useState, type ComponentProps } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

type FadeImageProps = ComponentProps<typeof Image> & { alt: string };

export function FadeImage({ className, onLoad, alt, ...props }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      className={cn(
        "transition-opacity duration-500 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={(e) => {
        setLoaded(true);
        if (typeof onLoad === "function") {
          (onLoad as (e: React.SyntheticEvent<HTMLImageElement>) => void)(e);
        }
      }}
    />
  );
}
