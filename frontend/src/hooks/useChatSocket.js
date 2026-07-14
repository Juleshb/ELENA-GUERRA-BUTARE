import { useCallback, useEffect, useRef, useState } from 'react';
import { disconnectSocket, getSocket } from '../lib/socket';

export function useChatSocket({
  enabled,
  type,
  token,
  conversationId,
  onReply,
  onConversation,
  onConversationUpdate,
  onTyping,
}) {
  const callbacksRef = useRef({
    onReply,
    onConversation,
    onConversationUpdate,
    onTyping,
  });
  callbacksRef.current = {
    onReply,
    onConversation,
    onConversationUpdate,
    onTyping,
  };

  const [connected, setConnected] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled || !token) {
      setConnected(false);
      return undefined;
    }

    const socket = getSocket(token, type);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const handleReply = (data) => callbacksRef.current.onReply?.(data);
    const handleConversation = (data) => callbacksRef.current.onConversation?.(data);
    const handleUpdate = (data) => callbacksRef.current.onConversationUpdate?.(data);
    const handleTyping = (data) => callbacksRef.current.onTyping?.(data);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat:reply', handleReply);
    socket.on('chat:conversation', handleConversation);
    socket.on('chat:conversation:update', handleUpdate);
    socket.on('chat:typing', handleTyping);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:reply', handleReply);
      socket.off('chat:conversation', handleConversation);
      socket.off('chat:conversation:update', handleUpdate);
      socket.off('chat:typing', handleTyping);
    };
  }, [enabled, token, type]);

  useEffect(() => {
    if (!enabled || !token) return undefined;

    return () => {
      disconnectSocket();
      setConnected(false);
    };
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled || !token || !conversationId) return undefined;

    const socket = getSocket(token, type);
    socket.emit('join:conversation', conversationId);

    return () => {
      socket.emit('leave:conversation', conversationId);
    };
  }, [enabled, token, type, conversationId]);

  const emitTyping = useCallback(
    (typing) => {
      if (!conversationId || !token) return;
      const socket = getSocket(token, type);
      socket.emit('chat:typing', { conversationId, typing });
    },
    [conversationId, token, type]
  );

  const notifyTyping = useCallback(() => {
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
  }, [emitTyping]);

  useEffect(
    () => () => {
      clearTimeout(typingTimeoutRef.current);
    },
    []
  );

  return { connected, emitTyping, notifyTyping };
}
