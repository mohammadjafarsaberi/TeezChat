import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Users, Trash2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import { MessageComposer } from '@/components/chat/message-composer';
import { MessageList } from '@/components/chat/message-list';
import { UserList } from '@/components/chat/user-list';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useCsrfToken } from '@/hooks/use-csrf-token';
import { useMessages } from '@/hooks/use-messages';
import { usePresence } from '@/hooks/use-presence';
import { useTyping } from '@/hooks/use-typing';

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

interface Member {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

interface Room {
    id: number;
    name: string;
    created_by: {
        id: number;
        name: string;
    };
}

interface Props {
    room: Room;
    messages: Message[];
    members: Member[];
}

export default function RoomsShow({
    room,
    messages: initialMessages,
    members,
}: Props) {
    const { auth } = usePage().props;
    const currentUser = auth.user as {
        id: number;
        name: string;
        email: string;
    };
    const csrfToken = useCsrfToken(); // Get CSRF token from Inertia props
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isRoomClosed, setIsRoomClosed] = useState(false);

    // Ensure initialMessages is an array
    // This prop comes from Inertia and updates on page refresh/navigation
    // The useMessages hook will sync state when this prop changes
    // Handle both arrays and array-like objects (Laravel Collections)
    const safeInitialMessages = Array.isArray(initialMessages)
        ? initialMessages
        : initialMessages && typeof initialMessages === 'object' && 'length' in initialMessages
            ? Array.from(initialMessages as ArrayLike<unknown>)
            : [];
    const { messages, addMessage, setMessages } = useMessages(
        room.id,
        safeInitialMessages,
    );

    // Ensure messages is always an array and sorted by created_at
    const safeMessages = Array.isArray(messages)
        ? [...messages].sort(
              (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
          )
        : [];
    const typingUsers = useTyping(room.id, currentUser.id);
    const { onlineUsers, allMembers: presenceMembers } = usePresence(
        room.id,
        currentUser.id,
    );
    const [currentMembers, setCurrentMembers] = useState(members);
    const [memberCount, setMemberCount] = useState(members.length);

    const isCreator = room.created_by.id === currentUser.id;

    // Update members when presence members change
    useEffect(() => {
        if (presenceMembers.length > 0) {
            // Merge presence members with initial members, avoiding duplicates
            // Use presence members as the source of truth for avatar data
            const merged = [...members];
            presenceMembers.forEach((presenceMember) => {
                const existingIndex = merged.findIndex((m) => m.id === presenceMember.id);
                if (existingIndex >= 0) {
                    // Update existing member with avatar from presence (presence has the formatted URL)
                    merged[existingIndex] = {
                        ...merged[existingIndex],
                        avatar: presenceMember.avatar || merged[existingIndex].avatar,
                    };
                } else {
                    // Add new member from presence
                    merged.push({
                        id: presenceMember.id,
                        name: presenceMember.name,
                        email: '', // Email not available in presence
                        avatar: presenceMember.avatar || null,
                    });
                }
            });
            setCurrentMembers(merged);
            setMemberCount(merged.length);
        } else {
            // If no presence members yet, use initial members
            setCurrentMembers(members);
            setMemberCount(members.length);
        }
    }, [presenceMembers, members]);

    // Debug: Log Echo status
    useEffect(() => {
        console.log('Echo status:', {
            echoExists: !!window.Echo,
            roomId: room.id,
            initialMessagesCount: safeInitialMessages.length,
            currentMessagesCount: safeMessages.length,
        });
    }, [room.id, safeInitialMessages.length, safeMessages.length]);

    // Listen for room closure event on the presence channel
    // Join the channel and set up listener (Echo handles multiple joins to same channel)
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        // Join the channel (Echo will reuse the same channel instance if already joined)
        // We use the same pattern as use-messages.ts to ensure proper subscription
        const channel = window.Echo.join(`room.${room.id}`)
            .here(() => {
                // Channel subscribed and ready
            })
            .error((error: any) => {
                // Error joining channel
            });

        // Listen for room closure event
        // This listener will work because we're on the same channel
        // Only show popup to non-owners (owners are redirected via HTTP response)
        const listener = channel.listen('.room.closed', (data: { id: number; name: string }) => {
            // Only show popup to non-owners (owners are already redirected)
            if (!isCreator) {
                setIsRoomClosed(true);
            }
        });

        return () => {
            // Cleanup: Stop listening to the event
            // We don't leave the channel here because usePresence is still using it
            // The channel will be cleaned up when the component unmounts
            if (channel && typeof channel.stopListening === 'function') {
                channel.stopListening('.room.closed', listener);
            }
        };
    }, [room.id, isCreator]);


    const handleSendMessage = async (body: string) => {
        if (!body.trim()) return;

        // Use CSRF token from hook (always up-to-date from Inertia props)
        if (!csrfToken) {
            console.error('CSRF token not available');
            alert(
                'Security token missing. Please refresh the page and try again.',
            );
            return;
        }

        console.log('Sending message:', {
            roomId: room.id,
            body,
            csrfToken: csrfToken.substring(0, 10) + '...',
        });

        try {
            const url = `/rooms/${room.id}/messages`;
            console.log('Fetching URL:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ body }),
            });

            console.log('Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
            });

            if (response.ok) {
                const newMessage = await response.json();
                console.log('Message sent successfully:', newMessage);

                // Add message optimistically in case WebSocket is not connected
                // The WebSocket will also add it, but we check for duplicates
                if (!window.Echo) {
                    console.warn('Echo not available, adding message directly');
                    addMessage(newMessage);
                } else {
                    // Wait a bit to see if WebSocket delivers it, if not add it after 500ms
                    setTimeout(() => {
                        setMessages((prev) => {
                            if (!prev.some((m) => m.id === newMessage.id)) {
                                console.log(
                                    'WebSocket did not deliver message, adding directly',
                                );
                                return [...prev, newMessage];
                            }
                            return prev;
                        });
                    }, 500);
                }
            } else {
                let errorMessage = 'Failed to send message. Please try again.';
                let errorData = null;

                try {
                    const contentType = response.headers.get('content-type');
                    console.log('Error response content-type:', contentType);

                    if (
                        contentType &&
                        contentType.includes('application/json')
                    ) {
                        errorData = await response.json();
                        console.error('Error response data:', errorData);
                    } else {
                        const text = await response.text();
                        console.error('Error response text:', text);
                        errorData = {
                            message:
                                text ||
                                `HTTP ${response.status}: ${response.statusText}`,
                        };
                    }

                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    } else if (response.status === 403) {
                        errorMessage =
                            'You are not authorized to send messages in this room.';
                    } else if (response.status === 419) {
                        errorMessage =
                            'Session expired. Please refresh the page and try again.';
                    } else if (response.status === 422) {
                        errorMessage =
                            errorData?.errors?.body?.[0] || 'Invalid message.';
                    } else if (response.status === 401) {
                        errorMessage = 'Please log in again.';
                    } else if (response.status === 404) {
                        errorMessage = 'Room not found.';
                    } else if (response.status === 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                } catch (parseError) {
                    console.error(
                        'Failed to parse error response:',
                        parseError,
                    );
                    if (response.status === 403) {
                        errorMessage =
                            'You are not authorized to send messages in this room.';
                    } else if (response.status === 419) {
                        errorMessage =
                            'Session expired. Please refresh the page and try again.';
                    } else if (response.status === 401) {
                        errorMessage = 'Please log in again.';
                    } else {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }
                }

                console.error('Final error message:', errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Network/fetch error:', error);
            console.error('Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            alert(
                `Failed to send message: ${error instanceof Error ? error.message : 'Network error'}. Please check your connection and try again.`,
            );
        }
    };

    const handleLeaveRoom = async () => {
        if (isLeaving) return;

        setIsLeaving(true);
        try {
            const response = await fetch(`/rooms/${room.id}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                router.visit('/rooms');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(
                    errorData.message ||
                        'Failed to leave room. Please try again.',
                );
            }
        } catch (error) {
            console.error('Error leaving room:', error);
            alert('Failed to leave room. Please try again.');
        } finally {
            setIsLeaving(false);
            setIsExitDialogOpen(false);
        }
    };

    const handleDeleteRoom = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        router.delete(`/rooms/${room.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                router.visit('/rooms');
            },
            onError: (errors) => {
                console.error('Error deleting room:', errors);
                const errorMessage =
                    errors.message ||
                    'Failed to delete room. Please try again.';
                alert(errorMessage);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <>
            <Head title={`${room.name} - Teez Chat`} />
            <ChatLayout
                sidebar={
                    <UserList
                        users={currentMembers}
                        onlineUsers={onlineUsers}
                    />
                }
                main={
                    <div className="flex h-full flex-col bg-card">
                        {/* Header */}
                        <header className="flex items-center justify-between border-b border-border bg-card px-3 py-3 sm:px-6 sm:py-4">
                            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/rooms')}
                                    className="lg:hidden"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-base font-semibold text-card-foreground sm:text-lg">
                                        {room.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span>{memberCount} members</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                {!isCreator && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setIsExitDialogOpen(true)
                                        }
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Exit Room
                                    </Button>
                                )}
                                {isCreator && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setIsDeleteDialogOpen(true)
                                        }
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Close Room
                                    </Button>
                                )}
                            </div>
                        </header>

                        {/* Messages */}
                        <MessageList
                            messages={safeMessages}
                            currentUserId={currentUser.id}
                        />

                        {/* Composer */}
                        <MessageComposer
                            onSend={handleSendMessage}
                            roomId={room.id}
                            currentUserName={currentUser.name}
                            typingUsers={typingUsers}
                            disabled={isRoomClosed}
                        />
                    </div>
                }
            />

            <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exit Room</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave "{room.name}"? You
                            will need to join again to access this room.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsExitDialogOpen(false)}
                            disabled={isLeaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleLeaveRoom}
                            disabled={isLeaving}
                        >
                            {isLeaving ? 'Leaving...' : 'Exit Room'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Close Room</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to close "{room.name}"? This
                            action cannot be undone and will delete all messages
                            in this room. All members will lose access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRoom}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Closing...' : 'Close Room'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Blocking Room Closed Dialog */}
            {isRoomClosed && (
                <>
                    {/* Full-screen overlay to block all interactions */}
                    <div
                        className="fixed inset-0 z-[100] bg-black/90"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                    />

                    <Dialog
                        open={isRoomClosed}
                        onOpenChange={() => {}}
                        modal={true}
                    >
                        <DialogContent
                            className="pointer-events-auto z-[101] max-w-md"
                            onEscapeKeyDown={(e) => e.preventDefault()}
                            onPointerDownOutside={(e) => e.preventDefault()}
                            onInteractOutside={(e) => e.preventDefault()}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-xl">
                                    Room Closed
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    The room "{room.name}" has been permanently
                                    closed by the creator. This room and all its
                                    messages are no longer accessible. Please
                                    click the button below to return to the
                                    rooms page where you can join or create
                                    other rooms.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="default"
                                    onClick={() => router.visit('/rooms')}
                                    className="w-full"
                                >
                                    Go to Rooms
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </>
    );
}
