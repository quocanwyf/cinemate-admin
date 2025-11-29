/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useChatStore } from "@/store/chatStore";
import { Message, TypingData } from "@/types/chat";
import toast from "react-hot-toast";

export const useSocket = (token: string | null) => {
  const { setIsConnected, addMessage, updateTyping } = useChatStore();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    const socket = getSocket(token);

    // === LISTENERS ===

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("newMessage", (message: Message) => {
      console.log("📩 New message received:", message);
      addMessage(message);

      if (message.senderType === "USER") {
        if (document.hidden) {
          toast(`New message from ${message.user?.display_name}`, {
            icon: "💬",
          });
        }
      }
    });

    socket.on("typing", (data: TypingData) => {
      console.log("⌨️ Typing event:", data);
      updateTyping(data);

      setTimeout(() => {
        updateTyping({ ...data, isTyping: false });
      }, 3000);
    });

    socket.on("error", (error: any) => {
      console.error("❌ Socket error:", error);
      toast.error("Connection error");
    });

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [token]);
};
