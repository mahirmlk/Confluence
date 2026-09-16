import React from "react";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: string[];
  size?: number;
}

/**
 * Overlapping avatar stack in the MagicUI avatar-circles style,
 * vendored dependency-free (no clsx/cva) with the same props API.
 */
export function AvatarCircles({ className = "", numPeople, avatarUrls, size = 40 }: AvatarCirclesProps) {
  const dim = `${size}px`;
  return (
    <div className={`z-10 flex -space-x-3 ${className}`}>
      {avatarUrls.map((url, index) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={url}
          src={url}
          width={size}
          height={size}
          alt={`Visitor avatar ${index + 1}`}
          loading="lazy"
          className="rounded-full ring-2 ring-white"
          style={{ width: dim, height: dim }}
        />
      ))}
      {(numPeople ?? 0) > 0 && (
        <span
          className="font-mono flex items-center justify-center rounded-full bg-[#151515] text-center text-[11px] font-semibold text-white ring-2 ring-white"
          style={{ width: dim, height: dim }}
        >
          +{numPeople}
        </span>
      )}
    </div>
  );
}
