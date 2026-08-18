import { useState } from "react";

export default function Avatar({
  src,
  alt = "Avatar",
  name = "",
  size = "md",
  className = "",
  ...props
}) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg font-semibold",
    "2xl": "h-24 w-24 text-2xl font-bold",
  };

  const shape = `${sizes[size] ?? sizes.md} shrink-0 rounded-full ring-1 ring-white/8`;
  const initial = (name || alt || "U").trim()[0]?.toUpperCase() ?? "U";

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${shape} object-cover ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${shape} flex items-center justify-center bg-[var(--odyssey-accent-subtle)] font-semibold text-[var(--odyssey-accent)] ${className}`}
      {...props}
    >
      {initial}
    </div>
  );
}
