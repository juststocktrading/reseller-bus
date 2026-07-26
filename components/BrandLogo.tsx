import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  href?: string | null;
  className?: string;
  /** Intrinsic height used for Next Image sizing (aspect ~6.5:1) */
  height?: number;
  priority?: boolean;
};

export default function BrandLogo({
  href = '/',
  className = 'h-9',
  height = 36,
  priority = false,
}: BrandLogoProps) {
  const width = Math.round(height * 6.5);

  const image = (
    <Image
      src="/images/logo.jpg"
      alt="Reseller Bus"
      width={width}
      height={height}
      priority={priority}
      className="h-full w-auto max-w-full object-contain object-left"
    />
  );

  const wrapperClass = `inline-flex items-center shrink-0 min-w-0 ${className}`.trim();

  if (!href) {
    return <span className={wrapperClass}>{image}</span>;
  }

  return (
    <Link href={href} className={wrapperClass} aria-label="Reseller Bus home">
      {image}
    </Link>
  );
}
