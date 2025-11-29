"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { adminApi } from "@/lib/api";
import { Message, SenderType } from "@/types/chat";
import Image from "next/image";

export default function MessageList() {
  const {
    messages,
    selectedConversationId,
    isLoadingMessages,
    setMessages,
    setIsLoadingMessages,
    typingUsers,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Load messages khi chọn conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await adminApi.getConversationMessages(
          selectedConversationId
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversationId, setMessages, setIsLoadingMessages]);

  // ✅ Auto scroll khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === RENDER STATES ===

  if (!selectedConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      </div>
    );
  }

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <p>Chưa có tin nhắn nào</p>
          <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện</p>
        </div>
      </div>
    );
  }

  // === RENDER MESSAGES ===

  const typingData = typingUsers[selectedConversationId];
  const isUserTyping = typingData?.isTyping && typingData.senderType === "USER";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isUserTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

// ========== MESSAGE ITEM COMPONENT (WITH ATTACHMENT SUPPORT) ==========

interface AttachmentData {
  type: "image" | "file";
  url: string;
  fileName: string;
  fileSize: number;
}

function MessageItem({ message }: { message: Message }) {
  const isAdmin = message.senderType === SenderType.ADMIN;

  // ✅ Parse attachments từ JSON
  const attachment: AttachmentData | null = message.attachments
    ? typeof message.attachments === "string"
      ? JSON.parse(message.attachments)
      : message.attachments
    : null;

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[70%] rounded-2xl overflow-hidden shadow-sm
          ${
            isAdmin
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          }
        `}
      >
        {/* Sender Name (chỉ hiện với USER) */}
        {!isAdmin && message.user && (
          <div className="px-4 pt-2">
            <p className="text-xs font-semibold text-gray-600">
              {message.user.display_name}
            </p>
          </div>
        )}

        {/* ========== ATTACHMENT (nếu có) ========== */}
        {attachment && (
          <div className="px-4 pt-2">
            {attachment.type === "image" ? (
              // ✅ Hiển thị ảnh
              <div className="relative w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                <Image
                  src={attachment.url}
                  alt={attachment.fileName}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(attachment.url, "_blank")}
                />
              </div>
            ) : (
              // ✅ Hiển thị file download
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-3 p-3 rounded-lg mb-2 transition
                  ${
                    isAdmin
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                `}
              >
                {/* File Icon */}
                <div
                  className={`
                    shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${isAdmin ? "bg-blue-800" : "bg-gray-300"}
                  `}
                >
                  <svg
                    className={`w-6 h-6 ${
                      isAdmin ? "text-white" : "text-gray-700"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isAdmin ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {attachment.fileName}
                  </p>
                  <p
                    className={`text-xs ${
                      isAdmin ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>

                {/* Download Icon */}
                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isAdmin ? "text-white" : "text-gray-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* ========== MESSAGE CONTENT ========== */}
        {message.content && (
          <div className="px-4 py-2">
            <p className="text-sm whitespace-pre-wrap wrap-break-words">
              {message.content}
            </p>
          </div>
        )}

        {/* ========== TIMESTAMP ========== */}
        <div className="px-4 pb-2">
          <span
            className={`text-xs ${isAdmin ? "text-blue-100" : "text-gray-400"}`}
          >
            {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
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
