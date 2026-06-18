"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-10",
  md: "h-14",
  lg: "h-16",
  xl: "h-20",
} as const;

interface LogoProps {
  className?: string;
  size?: keyof typeof sizeClasses;
  href?: string | null;
  onClick?: () => void;
}

export function Logo({ className, size = "md", href = "/", onClick }: LogoProps) {
  const image = (
    <Image
      src="/inkfit-logo.png"
      alt="InkFit AI"
      width={320}
      height={96}
      className={cn("w-auto object-contain", sizeClasses[size], className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return image;
}
