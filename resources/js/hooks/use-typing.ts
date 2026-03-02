import { useState, useEffect, useRef } from 'react';

interface TypingUser {
    id: number;
    name: string;
}

export function useTyping(roomId: number, currentUserId: number) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const typingTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.join(`room.${roomId}`);

        // Listen for whisper typing events
        channel.listenForWhisper(
            'typing',
            (data: { name: string; is_typing?: boolean }) => {
                // Create a temporary user object from the whisper data
                // Note: whispers don't include user ID, so we'll use name as identifier
                const typingUser: TypingUser = {
                    id: 0, // Will be set based on name matching
                    name: data.name,
                };

                // Find user by name (we'll need to match against current users)
                // For now, we'll use name as the identifier
                const userKey = data.name;

                if (data.is_typing === false) {
                    // Stop typing
                    setTypingUsers((prev) =>
                        prev.filter((u) => u.name !== data.name),
                    );
                    const timeout = typingTimeouts.current.get(userKey);
                    if (timeout) {
                        clearTimeout(timeout);
                        typingTimeouts.current.delete(userKey);
                    }
                } else {
                    // Start typing
                    setTypingUsers((prev) => {
                        if (prev.some((u) => u.name === data.name)) {
                            return prev;
                        }
                        return [...prev, typingUser];
                    });

                    // Clear existing timeout
                    const existingTimeout = typingTimeouts.current.get(userKey);
                    if (existingTimeout) {
                        clearTimeout(existingTimeout);
                    }

                    // Set timeout to remove typing indicator
                    const timeout = setTimeout(() => {
                        setTypingUsers((prev) =>
                            prev.filter((u) => u.name !== data.name),
                        );
                        typingTimeouts.current.delete(userKey);
                    }, 3000);

                    typingTimeouts.current.set(userKey, timeout);
                }
            },
        );

        return () => {
            // Clear all timeouts
            typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
            typingTimeouts.current.clear();
            if (window.Echo) {
                window.Echo.leave(`room.${roomId}`);
            }
        };
    }, [roomId, currentUserId]);

    return typingUsers;
}
