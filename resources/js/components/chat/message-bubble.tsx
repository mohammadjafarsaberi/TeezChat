import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
    message: {
        id: number;
        body: string;
        user: {
            id: number;
            name: string;
            avatar?: string | null;
        };
        created_at: string;
        created_at_human?: string;
    };
    isOwn: boolean;
    showAvatar?: boolean;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export function MessageBubble({
    message,
    isOwn,
    showAvatar = false,
}: MessageBubbleProps) {
    const date = new Date(message.created_at);

    return (
        <div
            className={`flex w-full animate-in gap-2 duration-300 fade-in slide-in-from-bottom-2 ${
                isOwn ? 'justify-end' : 'justify-start'
            }`}
        >
            {!isOwn && showAvatar && (
                <div className="flex-shrink-0">
                    {message.user.avatar ? (
                        <img
                            src={message.user.avatar}
                            alt={message.user.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-brand-accent">
                            {getInitials(message.user.name)}
                        </div>
                    )}
                </div>
            )}
            <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 transition-all sm:max-w-[70%] sm:px-4 sm:py-2.5 ${
                    isOwn
                        ? 'bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90'
                        : 'bg-card text-card-foreground shadow-sm hover:shadow-md'
                }`}
            >
                {!isOwn && (
                    <div className="mb-1 text-xs font-semibold text-brand-primary">
                        {message.user.name}
                    </div>
                )}
                <p className="text-sm leading-relaxed break-words">
                    {message.body}
                </p>
                <div
                    className={`mt-1.5 text-xs ${
                        isOwn
                            ? 'text-brand-primary-foreground/70'
                            : 'text-muted-foreground'
                    }`}
                >
                    {formatDistanceToNow(date, { addSuffix: true })}
                </div>
            </div>
            {isOwn && showAvatar && (
                <div className="flex-shrink-0">
                    {message.user.avatar ? (
                        <img
                            src={message.user.avatar}
                            alt={message.user.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-brand-accent">
                            {getInitials(message.user.name)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
