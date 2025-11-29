"use client";

import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "6xl";
}

export function Modal({ title, children, onClose, size = "md" }: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "6xl": "max-w-6xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses} w-full max-h-[90vh] overflow-hidden`}
      >
        {title && ( // ← Chỉ hiển thị header nếu có title
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-blue-600 to-blue-700">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
