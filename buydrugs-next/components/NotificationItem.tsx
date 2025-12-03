"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar: { src?: string; alt?: string; initials?: string };
  name: string;
  message: string;
  time: string;
  onAccept?: () => void;
  onDeny?: () => void;
  onMenuAction?: (action: "mark-read" | "mute" | "delete") => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  avatar,
  name,
  message,
  time,
  onAccept,
  onDeny,
  onMenuAction,
  className,
  ...rest
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-5 py-4 transition-colors hover:bg-[var(--surface-app-strong)]",
        className
      )}
      {...rest}
    >
      <Avatar {...avatar} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {name}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{message}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="success" size="sm" onClick={onAccept}>
            <CheckIcon />
            Accept
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeny}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <CloseIcon />
            Deny
          </Button>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-start gap-2">
        <span className="text-xs font-medium text-[var(--text-tertiary)]">
          {time}
        </span>
        <button
          ref={triggerRef}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]"
        >
          <KebabIcon />
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-2 top-10 z-20 min-w-[160px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-elevated)] shadow-[var(--shadow-2)]"
        >
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            onClick={() => {
              onMenuAction?.("mark-read");
              setMenuOpen(false);
            }}
          >
            Mark as read
          </button>
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            onClick={() => {
              onMenuAction?.("mute");
              setMenuOpen(false);
            }}
          >
            Mute
          </button>
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-danger)] hover:bg-[var(--surface-muted)]"
            onClick={() => {
              onMenuAction?.("delete");
              setMenuOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const KebabIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

