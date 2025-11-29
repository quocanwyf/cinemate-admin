/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useChatStore } from "@/store/chatStore";
import { ConversationItem } from "./ConversationItem";
import { useState } from "react";
import { ConversationStatus } from "@/types/chat";

export const ConversationList = () => {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    getUnreadCount,
  } = useChatStore();

  const [statusFilter, setStatusFilter] = useState<ConversationStatus>(
    ConversationStatus.OPEN
  );

  // ✅ ADD: Debug log
  console.log("🔍 Conversations in store:", conversations);

  const filteredConversations = conversations.filter(
    (conv) => conv.status === statusFilter
  );

  console.log("🔍 Filtered conversations:", filteredConversations);

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations found
        <br />
        <small>Total in store: {conversations.length}</small> {/* ✅ ADD */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="border-b p-4">{/* ...existing filter UI... */}</div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedConversationId}
            onClick={() => setSelectedConversationId(conv.id)}
          />
        ))}
      </div>
    </div>
  );
};
