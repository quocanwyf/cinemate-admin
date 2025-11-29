import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/lib/socket";
import { useMemo } from "react";

export const useSocketInstance = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const socket = useMemo(() => {
    if (!accessToken) return null;
    return getSocket(accessToken);
  }, [accessToken]);

  return socket;
};
