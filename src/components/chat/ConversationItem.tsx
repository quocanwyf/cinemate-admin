/* eslint-disable @next/next/no-img-element */
import { Conversation } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
}: Props) => {
  const messages = conversation.messages || [];
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-500"
            : "hover:bg-gray-50"
        }
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
          {conversation.user.avatar_url ? (
            <img
              src={conversation.user.avatar_url}
              alt={conversation.user.display_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-gray-600">
              {conversation.user.display_name[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.user.display_name}
            </h3>
          </div>

          <p className="text-sm text-gray-500 truncate">
            {lastMessage?.content || "No messages yet"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
            addSuffix: true,
            locale: vi,
          })}
        </span>

        <span
          className={`
          px-2 py-0.5 rounded-full text-xs font-medium
          ${
            conversation.status === "OPEN"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }
        `}
        >
          {conversation.status}
        </span>
      </div>
    </div>
  );
};
