"use client";

import { useEffect } from "react";

interface BackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  blur?: "none" | "sm" | "md" | "lg";
  opacity?: number;
}

export function Backdrop({
  isOpen,
  onClose,
  children,
  blur = "sm",
  opacity = 50,
}: BackdropProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const blurClass = {
    none: "",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  }[blur];

  return (
    <div
      className={`fixed inset-0 bg-black/${opacity} ${blurClass} flex items-center justify-center z-50 animate-in fade-in duration-200`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
