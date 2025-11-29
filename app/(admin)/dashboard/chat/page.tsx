"use client";

import { ConversationList } from "@/components/chat/ConversationList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput"; // ✅ Import mới
import { useChatStore } from "@/store/chatStore";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/authStore";
import { adminApi } from "@/lib/api";
import { useEffect } from "react";

export default function ChatPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { setConversations, selectedConversationId, getSelectedConversation } =
    useChatStore();

  useSocket(accessToken);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await adminApi.getConversations("OPEN");
        setConversations(response.data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    loadConversations();
  }, [setConversations]);

  const selectedConv = getSelectedConversation();

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4">
      {/* Left: Conversation List */}
      <div className="w-80 bg-white rounded-lg shadow overflow-hidden">
        <ConversationList />
      </div>

      {/* Right: Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
        {/* Header */}
        {selectedConversationId && selectedConv && (
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedConv.user.display_name}
            </h2>
            <p className="text-sm text-gray-500">{selectedConv.user.email}</p>
          </div>
        )}
        {/* Messages */}
        <MessageList />
        {/* Input */}
        <MessageInput />
      </div>
    </div>
  );
}
