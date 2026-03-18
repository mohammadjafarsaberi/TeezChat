import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, LogIn, MessageCircle, Plus, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserInfo } from '@/components/user-info';
import { useInitials } from '@/hooks/use-initials';
import { logout } from '@/routes';
import { LogOut, Settings } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    created_by: {
        id: number;
        name: string;
        avatar?: string;
    };
    member_count: number;
    is_member?: boolean;
    is_full?: boolean;
    last_message: {
        id: number;
        body: string;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    } | null;
    created_at: string;
}

interface Props {
    rooms: Room[];
}

interface RoomsIndexProps extends Props {
    roomClosedRefresh?: boolean;
    closedRoomId?: number;
}

export default function RoomsIndex({ rooms: initialRooms, roomClosedRefresh, closedRoomId }: RoomsIndexProps) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [rooms, setRooms] = useState(initialRooms);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joiningRoomId, setJoiningRoomId] = useState<number | null>(null);
    const [showRoomClosedDialog, setShowRoomClosedDialog] = useState(false);
    const getInitials = useInitials();

    const handleLogout = () => {
        router.post(logout().url, {}, {
            onFinish: () => {
                router.flushAll();
            },
        });
    };

    // Keep local rooms state in sync with server props
    useEffect(() => {
        setRooms(initialRooms);
    }, [initialRooms]);

    // Show popup if user refreshed after room was closed
    useEffect(() => {
        if (roomClosedRefresh) {
            setShowRoomClosedDialog(true);
        }
    }, [roomClosedRefresh]);

    // Listen for new rooms and room closures
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('rooms');

        channel.listen('.room.created', (payload: Room | Room[]) => {
            const incomingRooms = Array.isArray(payload) ? payload : [payload];

            const normalizedRooms = incomingRooms.map((room) => ({
                ...room,
                is_member: room.is_member ?? room.created_by?.id === currentUser.id,
                is_full: room.is_full ?? room.member_count >= 5,
            }));

            setRooms((prev) => {
                const filtered = normalizedRooms.filter(
                    (incoming) => !prev.some((existing) => existing.id === incoming.id),
                );

                if (filtered.length === 0) {
                    return prev;
                }

                return [...filtered, ...prev];
            });
        });

        channel.listen('.room.closed', (data: { id: number; name: string }) => {
            setRooms((prev) => prev.filter((r) => r.id !== data.id));
        });

        return () => {
            if (window.Echo) {
                window.Echo.leave('rooms');
            }
        };
    }, [currentUser.id]);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        router.post(
            '/rooms',
            { name: roomName },
            {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setRoomName('');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const handleJoinRoom = (roomId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (joiningRoomId) return;

        setJoiningRoomId(roomId);

        // Use Inertia router instead of fetch to avoid browser redirects
        router.post(
            `/rooms/${roomId}/join`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Navigate to the room after successful join
                    router.visit(`/rooms/${roomId}`);
                },
                onError: (errors) => {
                    console.error('Error joining room:', errors);
                    alert(
                        errors.message ||
                        'Failed to join room. Please try again.',
                    );
                },
                onFinish: () => {
                    setJoiningRoomId(null);
                },
            },
        );
    };
    return (
        <>
            <Head title="Rooms - Teez Chat" />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="border-b border-border bg-card">
                    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-brand-primary-foreground sm:h-10 sm:w-10">
                                    <AppLogoIcon className="h-5 w-5 fill-current text-brand-accent sm:h-6 sm:w-6" />
                                </div>
                                <h1 className="text-lg font-bold text-foreground sm:text-2xl">
                                    Teez Chat
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    size="sm"
                                    className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm sm:size-default"
                                >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Create Room</span>
                                    <span className="sm:hidden">Create</span>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-10 w-10 rounded-full p-0"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={currentUser.avatar || undefined}
                                                    alt={currentUser.name}
                                                />
                                                <AvatarFallback className="bg-brand-gradient text-sm font-semibold text-brand-accent">
                                                    {getInitials(currentUser.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuLabel className="p-0 font-normal">
                                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                <UserInfo
                                                    user={currentUser}
                                                    showEmail={true}
                                                />
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="block w-full cursor-pointer"
                                                    href="/settings"
                                                    prefetch
                                                >
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Settings
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <button
                                                className="block w-full cursor-pointer"
                                                onClick={handleLogout}
                                                data-test="logout-button"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log out
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    {rooms.length === 0 ? (
                        <motion.div
                            className="flex flex-col items-center justify-center py-12 sm:py-20"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.4, 1] }}
                        >
                            <motion.div
                                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20"
                                initial={{ scale: 0.94, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.22 }}
                            >
                                <MessageCircle className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                            </motion.div>
                            <h2 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">
                                No rooms yet
                            </h2>
                            <p className="mb-6 text-center text-sm text-muted-foreground sm:text-base">
                                Create your first room to start chatting!
                            </p>
                            <motion.div
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            >
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    size="lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Room
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {rooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:scale-[1.02] hover:border-brand-primary hover:shadow-lg sm:p-6 text-card-foreground"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.22,
                                        ease: [0.2, 0.8, 0.4, 1],
                                    }}
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <Link
                                            href={`/rooms/${room.id}`}
                                            className="text-base font-semibold group-hover:text-brand-primary sm:text-lg"
                                        >
                                            {room.name}
                                        </Link>
                                        {room.is_full && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-red-100 text-red-800"
                                            >
                                                Full
                                            </Badge>
                                        )}
                                    </div>

                                    {room.last_message ? (
                                        <div className="mb-4">
                                            <p className="mb-1 truncate text-sm text-muted-foreground">
                                                <span className="font-medium text-card-foreground">
                                                    {
                                                        room.last_message.user
                                                            .name
                                                    }
                                                    :
                                                </span>{' '}
                                                {room.last_message.body}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {room.last_message.created_at}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            No messages yet
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {room.member_count}/5 members
                                            </span>
                                        </div>

                                        {!room.is_member && !room.is_full && (
                                            <motion.div
                                                whileHover={{ y: -0.5 }}
                                                whileTap={{ scale: 0.97 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 260,
                                                    damping: 22,
                                                }}
                                            >
                                                <Button
                                                    size="sm"
                                                    onClick={(e) =>
                                                        handleJoinRoom(
                                                            room.id,
                                                            e,
                                                        )
                                                    }
                                                    disabled={
                                                        joiningRoomId ===
                                                        room.id
                                                    }
                                                >
                                                    {joiningRoomId ===
                                                        room.id ? (
                                                        <>Joining...</>
                                                    ) : (
                                                        <>
                                                            <LogIn className="mr-1 h-3 w-3" />
                                                            Join
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        )}

                                        {room.is_member && (
                                            <Link
                                                href={`/rooms/${room.id}`}
                                                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                                            >
                                                Open →
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>

                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Room</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Room Name</Label>
                                <Input
                                    id="name"
                                    value={roomName}
                                    onChange={(e) =>
                                        setRoomName(e.target.value)
                                    }
                                    placeholder="Enter room name..."
                                    required
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setRoomName('');
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!roomName.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Room Closed Dialog (shown when user refreshes after room is closed) */}
                {showRoomClosedDialog && (
                    <>
                        {/* Full-screen overlay to block all interactions */}
                        <div
                            className="fixed inset-0 z-100 bg-black/90"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}
                        />

                        <Dialog
                            open={showRoomClosedDialog}
                            onOpenChange={() => { }}
                            modal={true}
                        >
                            <DialogContent
                                className="pointer-events-auto z-101 max-w-md"
                                onEscapeKeyDown={(e) => e.preventDefault()}
                                onPointerDownOutside={(e) => e.preventDefault()}
                                onInteractOutside={(e) => e.preventDefault()}
                            >
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        Room Closed
                                    </DialogTitle>
                                    <DialogDescription className="text-base">
                                        The room you were viewing has been
                                        permanently closed by the creator. This room
                                        and all its messages are no longer
                                        accessible. Please click the button below to
                                        browse other available rooms or create a new
                                        one.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setShowRoomClosedDialog(false);
                                        }}
                                        className="w-full"
                                    >
                                        Continue
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </>
    );
}
