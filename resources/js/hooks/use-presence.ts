import { useState, useEffect } from 'react';

interface PresenceUser {
    id: number;
    name: string;
    avatar?: string | null;
}

export function usePresence(roomId: number, currentUserId?: number) {
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const [allMembers, setAllMembers] = useState<PresenceUser[]>([]);

    useEffect(() => {
        if (!window.Echo) {
            console.warn(
                'Laravel Echo not initialized. Presence will not work.',
            );
            return;
        }

        window.Echo.join(`room.${roomId}`)
            .here((users: PresenceUser[]) => {
                const userIds = new Set(users.map((u) => u.id));
                // If current user is provided and tab is hidden, remove them from online set
                if (
                    currentUserId &&
                    document.hidden &&
                    userIds.has(currentUserId)
                ) {
                    userIds.delete(currentUserId);
                }
                setOnlineUsers(userIds);
                setAllMembers(users);
            })
            .joining((user: PresenceUser) => {
                // Don't add current user if tab is hidden
                if (
                    currentUserId &&
                    user.id === currentUserId &&
                    document.hidden
                ) {
                    return;
                }
                setOnlineUsers((prev) => new Set([...prev, user.id]));
                setAllMembers((prev) => {
                    if (prev.some((u) => u.id === user.id)) {
                        return prev;
                    }
                    return [...prev, user];
                });
            })
            .leaving((user: PresenceUser) => {
                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    next.delete(user.id);
                    return next;
                });
                setAllMembers((prev) => prev.filter((u) => u.id !== user.id));
            })
            .error((error: any) => {});

        return () => {
            if (window.Echo) {
                window.Echo.leave(`room.${roomId}`);
            }
        };
    }, [roomId, currentUserId]);

    // Handle browser focus/blur using Page Visibility API
    useEffect(() => {
        if (!currentUserId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab lost focus - remove current user from online set
                setOnlineUsers((prev) => {
                    const next = new Set(prev);
                    next.delete(currentUserId);
                    return next;
                });
            } else {
                // Tab regained focus - add current user back to online set if they're in the room
                setOnlineUsers((prev) => {
                    // Check if user is still a member of the room
                    const isMember = allMembers.some(
                        (m) => m.id === currentUserId,
                    );
                    if (isMember) {
                        return new Set([...prev, currentUserId]);
                    }
                    return prev;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also handle window blur/focus as fallback
        const handleBlur = () => {
            if (document.hidden) {
                handleVisibilityChange();
            }
        };

        const handleFocus = () => {
            if (!document.hidden) {
                handleVisibilityChange();
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentUserId, allMembers]);

    return { onlineUsers, allMembers };
}
