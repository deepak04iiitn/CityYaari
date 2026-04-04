import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchUnreadMessageCount } from "../services/chat/chatService";
import { useAuth } from "./AuthContext";

const UnreadMsgContext = createContext({ unreadMsgCount: 0, refreshUnreadMsgCount: () => {} });

export function UnreadMsgProvider({ children }) {
  const { token } = useAuth();
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const c = await fetchUnreadMessageCount();
      setCount(c);
    } catch (_) {
      /* silent */
    }
  }, [token]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 30000);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  return (
    <UnreadMsgContext.Provider value={{ unreadMsgCount: count, setUnreadMsgCount: setCount, refreshUnreadMsgCount: refresh }}>
      {children}
    </UnreadMsgContext.Provider>
  );
}

export const useUnreadMsg = () => useContext(UnreadMsgContext);
