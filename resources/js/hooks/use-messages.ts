import { useState, useEffect, useRef, useMemo } from 'react';

interface Message {
    id: number;
    body: string;
    user: {
        id: number;
        name: string;
    };
    created_at: string;
    created_at_human?: string;
}

export function useMessages(roomId: number, initialMessages: Message[]) {
    // Ensure initialMessages is always an array
    const safeInitialMessages = useMemo(() => {
        return Array.isArray(initialMessages) ? initialMessages : [];
    }, [initialMessages]);

    // Sort initial messages by created_at to ensure proper order (memoized)
    const sortedInitialMessages = useMemo(() => {
        return [...safeInitialMessages].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
        );
    }, [safeInitialMessages]);

    // Use refs to track the previous roomId and initialMessages array
    // Initialize with null so the first render always syncs from props
    const prevRoomIdRef = useRef<number | null>(null);
    const prevInitialMessagesRef = useRef<Message[] | null>(null);

    // Initialize state directly from sorted messages (not lazy - runs on every mount/update)
    const [messages, setMessages] = useState<Message[]>(sortedInitialMessages);

    // Reset messages when room changes or when initialMessages change (page refresh)
    // This is a valid use case for setState in effect - syncing props to state
    useEffect(() => {
        const isFirstRender = prevRoomIdRef.current === null;
        const roomChanged = !isFirstRender && prevRoomIdRef.current !== roomId;

        const prevMessages = prevInitialMessagesRef.current;
        const messagesChanged =
            isFirstRender ||
            prevMessages === null ||
            prevMessages.length !== sortedInitialMessages.length ||
            sortedInitialMessages.some((msg, idx) => {
                const prev = prevMessages[idx];
                return !prev || prev.id !== msg.id;
            });

        if (roomChanged || messagesChanged) {
            prevRoomIdRef.current = roomId;
            prevInitialMessagesRef.current = sortedInitialMessages;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMessages(sortedInitialMessages);
        }
    }, [roomId, sortedInitialMessages]);

    useEffect(() => {
        if (!window.Echo) {
            console.warn(
                'Laravel Echo not initialized. WebSocket messages will not be received.',
            );
            return;
        }

        const channel = window.Echo.join(`room.${roomId}`);

        channel.listen('.message.sent', (data: Message) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m.id === data.id)) {
                    return prev;
                }
                return [...prev, data];
            });
        });

        return () => {
            if (window.Echo) {
                window.Echo.leave(`room.${roomId}`);
            }
        };
    }, [roomId]);

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    return { messages, addMessage, setMessages };
}
