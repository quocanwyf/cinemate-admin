/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";

// Enum cho loại người gửi
export enum SenderType {
  USER = "USER",
  ADMIN = "ADMIN",
}

// Enum cho trạng thái conversation
export enum ConversationStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

// Interface cho User
export interface User {
  email: ReactNode;
  id: string;
  display_name: string;
  avatar_url: string | null;
}

// Interface cho Admin
export interface Admin {
  id: string;
  full_name: string | null;
  email: string;
}

// Interface cho Message
export interface Message {
  attachments: any;
  id: string;
  content: string;
  conversationId: string;
  userId: string | null;
  adminId: string | null;
  senderType: SenderType;
  isRead: boolean;
  createdAt: string; // ISO date string
  user?: User;
  admin?: Admin;
}

// Interface cho Conversation
export interface Conversation {
  id: string;
  userId: string;
  status: ConversationStatus;
  lastMessageAt: string;
  createdAt: string;
  messages: Message[];
  user: User;
}

// Interface cho typing event
export interface TypingData {
  senderType: string;
  conversationId: string;
  isTyping: boolean;
  display_name: string;
}

// Interface cho send message acknowledgment
export interface SendMessageAck {
  success: boolean;
  message?: Message;
  error?: string;
}
