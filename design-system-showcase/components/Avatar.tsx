import Image from "next/image";
import React from "react";
import { cn } from "@/lib/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  initials?: string;
  tone?: "neutral" | "brand";
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  initials,
  tone = "neutral",
  className,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ring-2 ring-[var(--surface-elevated)]",
        sizeClasses[size],
        tone === "brand"
          ? "bg-[rgba(89,71,255,0.16)] text-[var(--text-brand)]"
          : "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
        className
      )}
      {...rest}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          fill
          sizes="(max-width: 768px) 40px, 56px"
          className="object-cover"
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
};

interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt?: string; initials?: string; tone?: "neutral" | "brand" }>;
  maxVisible?: number;
  size?: AvatarSize;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  maxVisible = 5,
  size = "sm",
}) => {
  const visible = avatars.slice(0, maxVisible);
  const remaining = avatars.length - maxVisible;

  return (
    <div className="flex -space-x-2.5">
      {visible.map((avatar, index) => (
        <Avatar key={index} {...avatar} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] font-medium text-[var(--text-secondary)]",
            sizeClasses[size],
            "text-xs"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

