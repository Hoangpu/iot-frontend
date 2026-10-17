import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = 'http://localhost:8080/ws';

/**
 * Custom hook quản lý WebSocket/SockJS + STOMP
 * Auto-reconnect khi mất kết nối
 */
export function useWebSocket(topics = []) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [reconnecting, setReconnecting] = useState(false);
  const clientRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(async () => {
    try {
      // Dynamic import SockJS and STOMP
      const SockJS = (await import('sockjs-client/dist/sockjs')).default;

      const socket = new SockJS(WS_URL);

      // Simple STOMP-like protocol over SockJS
      socket.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setReconnecting(false);

        // Subscribe to topics by sending SUBSCRIBE frames
        topics.forEach((topic) => {
          const subscribeFrame =
            'SUBSCRIBE\n' + 'id:sub-' + topic + '\n' + 'destination:' + topic + '\n\n\0';
          socket.send(
            'CONNECT\n' + 'accept-version:1.1,1.0\n' + 'heart-beat:10000,10000\n\n\0'
          );
        });
      };

      socket.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          // Parse STOMP frame
          const data = event.data;
          if (data.startsWith('CONNECTED')) {
            // After CONNECTED, subscribe to topics
            topics.forEach((topic) => {
              const frame =
                'SUBSCRIBE\n' +
                'id:sub-' + topic.replace(/\//g, '-') + '\n' +
                'destination:' + topic + '\n\n\0';
              socket.send(frame);
            });
            return;
          }

          if (data.startsWith('MESSAGE')) {
            const lines = data.split('\n');
            let destination = '';
            let bodyStart = false;
            let body = '';

            for (const line of lines) {
              if (line.startsWith('destination:')) {
                destination = line.substring('destination:'.length);
              }
              if (bodyStart) {
                body += line;
              }
              if (line === '') {
                bodyStart = true;
              }
            }

            // Remove null terminator
            body = body.replace(/\0/g, '');

            if (body && destination) {
              try {
                const parsed = JSON.parse(body);
                setMessages((prev) => ({
                  ...prev,
                  [destination]: parsed,
                }));
              } catch {
                // Not JSON
              }
            }
          }
        } catch (err) {
          console.warn('WebSocket message parse error:', err);
        }
      };

      socket.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        scheduleReconnect();
      };

      socket.onerror = () => {
        if (!mountedRef.current) return;
        setConnected(false);
      };

      clientRef.current = socket;
    } catch (err) {
      console.warn('WebSocket connection failed:', err.message);
      setConnected(false);
      scheduleReconnect();
    }
  }, [topics]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    setReconnecting(true);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (mountedRef.current) {
        connect();
      }
    }, 5000);
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (clientRef.current) {
        try {
          clientRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return { connected, messages, reconnecting };
}
