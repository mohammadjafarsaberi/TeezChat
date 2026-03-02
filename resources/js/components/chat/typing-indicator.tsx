interface TypingIndicatorProps {
    users: Array<{ id: number; name: string }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
    if (users.length === 0) {
        return null;
    }

    let text = '';
    if (users.length === 1) {
        text = `${users[0].name} is typing...`;
    } else if (users.length === 2) {
        text = `${users[0].name} and ${users[1].name} are typing...`;
    } else {
        text = `${users[0].name} and ${users.length - 1} others are typing...`;
    }

    return (
        <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
                <span>{text}</span>
            </div>
        </div>
    );
}
