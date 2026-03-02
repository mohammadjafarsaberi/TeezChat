import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
}

interface UserListProps {
    users: User[];
    onlineUsers?: Set<number>;
}

export function UserList({ users, onlineUsers = new Set() }: UserListProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-full flex-col border-r border-border bg-muted">
            <div className="border-b border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold text-card-foreground">
                        Members ({users.length})
                    </h2>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {users.map((user) => {
                    const isOnline = onlineUsers.has(user.id);
                    return (
                        <div
                            key={user.id}
                            className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                        >
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={user.avatar || undefined}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <AvatarFallback className="bg-brand-gradient text-sm font-semibold text-brand-accent">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-card transition-all ${
                                        isOnline
                                            ? 'animate-pulse bg-brand-primary'
                                            : 'bg-muted-foreground'
                                    }`}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-card-foreground">
                                    {user.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {isOnline ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
