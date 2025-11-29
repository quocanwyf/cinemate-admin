/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, FormEvent } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSocketInstance } from "@/hooks/useSocketInstance";
import { adminApi } from "@/lib/api";
import Image from "next/image";

interface AttachmentPreview {
  type: "image" | "file";
  url: string;
  fileName: string;
  fileSize: number;
  localUrl?: string; // For image preview
}

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { selectedConversationId } = useChatStore();
  const socket = useSocketInstance();

  // ========== HANDLERS ==========

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn! Tối đa 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // ✅ Upload to server
      const uploadedFile = await adminApi.uploadChatFile(file);

      // ✅ Create preview
      const preview: AttachmentPreview = {
        ...uploadedFile,
        localUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      };

      setAttachment(preview);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload thất bại! Vui lòng thử lại");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = () => {
    if (attachment?.localUrl) {
      URL.revokeObjectURL(attachment.localUrl);
    }
    setAttachment(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedConversationId) {
      alert("Vui lòng chọn cuộc trò chuyện");
      return;
    }

    if (!message.trim() && !attachment) {
      return; // Nothing to send
    }

    if (!socket?.connected) {
      alert("Mất kết nối! Vui lòng reload trang");
      return;
    }

    setIsSending(true);

    try {
      // ✅ Prepare payload
      const payload: any = {
        conversationId: selectedConversationId,
        content: message.trim() || (attachment ? attachment.fileName : ""),
      };

      if (attachment) {
        payload.attachments = {
          type: attachment.type,
          url: attachment.url,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
        };
      }

      // ✅ Emit to socket
      socket.emit("sendMessage", payload, (response: any) => {
        if (response?.success) {
          console.log("✅ Message sent:", response.message);
        } else {
          console.error("❌ Send failed:", response?.error);
          alert("Gửi tin thất bại: " + response?.error);
        }
      });

      // ✅ Clear form
      setMessage("");
      handleRemoveAttachment();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("Lỗi khi gửi tin nhắn!");
    } finally {
      setIsSending(false);
    }
  };

  // ========== AUTO-RESIZE TEXTAREA ==========

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // ========== RENDER ==========

  if (!selectedConversationId) {
    return null; // Don't show input if no conversation selected
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            {/* Preview */}
            {attachment.type === "image" && attachment.localUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                <Image
                  src={attachment.localUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.fileSize)}
              </p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="shrink-0 text-gray-400 hover:text-red-500 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          className="shrink-0 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Đính kèm file"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            // Ctrl/Cmd + Enter to send
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              handleSubmit(e);
            }
          }}
          placeholder="Nhập tin nhắn... (Ctrl+Enter để gửi)"
          disabled={isSending}
          className="flex-1 text-black resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={1}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !attachment) || isSending}
          className="shrink-0 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-2">
        Nhấn Ctrl+Enter để gửi nhanh • Hỗ trợ: ảnh, PDF, Word (tối đa 10MB)
      </p>
    </div>
  );
}

// ========== UTILITY FUNCTION ==========

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
