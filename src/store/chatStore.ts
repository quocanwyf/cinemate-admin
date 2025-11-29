import { create } from "zustand";
import { Conversation, Message, TypingData } from "@/types/chat";

interface ChatState {
  // State
  conversations: Conversation[];
  selectedConversationId: string | null;
  isConnected: boolean;
  typingUsers: Record<string, TypingData>;
  messages: Message[]; // ✅ THÊM: Messages của conversation đang chọn
  isLoadingMessages: boolean; // ✅ THÊM: Loading state

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversationId: (id: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setMessages: (messages: Message[]) => void; // ✅ THÊM
  setIsLoadingMessages: (loading: boolean) => void; // ✅ THÊM

  addMessage: (message: Message) => void;
  updateTyping: (data: TypingData) => void;

  // Computed
  getSelectedConversation: () => Conversation | undefined;
  getUnreadCount: (conversationId: string) => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversationId: null,
  isConnected: false,
  typingUsers: {},
  messages: [], // ✅ THÊM
  isLoadingMessages: false, // ✅ THÊM

  // Setters
  setConversations: (conversations) => set({ conversations }),

  setSelectedConversationId: (id) => set({ selectedConversationId: id }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  // ✅ THÊM: Set messages khi chọn conversation
  setMessages: (messages) => set({ messages }),

  // ✅ THÊM: Set loading state
  setIsLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

  // Add message và tự động cập nhật conversations + messages
  addMessage: (message) =>
    set((state) => {
      // ✅ Update conversations list
      const conversations = state.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), message],
            lastMessageAt: message.createdAt,
          };
        }
        return conv;
      });

      conversations.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );

      // ✅ Nếu message thuộc conversation đang mở → thêm vào messages
      const updatedMessages =
        message.conversationId === state.selectedConversationId
          ? [...state.messages, message]
          : state.messages;

      return { conversations, messages: updatedMessages };
    }),

  // Update typing indicator
  updateTyping: (data) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [data.conversationId]: data,
      },
    })),

  // Computed: Lấy conversation đang được chọn
  getSelectedConversation: () => {
    const { conversations, selectedConversationId } = get();
    return conversations.find((c) => c.id === selectedConversationId);
  },

  // Computed: Đếm số tin chưa đọc của conversation
  getUnreadCount: (conversationId) => {
    const { conversations } = get();
    const conv = conversations.find((c) => c.id === conversationId);

    if (!conv || !conv.messages) return 0;

    return conv.messages.filter(
      (msg) => msg.senderType === "USER" && !msg.isRead
    ).length;
  },
}));
