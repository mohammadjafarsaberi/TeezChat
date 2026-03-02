import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';

interface Message {
    id: number;
    body: string;
    user: {
        id: number;
        name: string;
        avatar?: string | null;
    };
    created_at: string;
    created_at_human?: string;
}

interface MessageListProps {
    messages: Message[];
    currentUserId: number;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(true);

    // Ensure messages is always an array
    const safeMessages = Array.isArray(messages) ? messages : [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            shouldAutoScroll.current = isNearBottom;
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (shouldAutoScroll.current) {
            scrollToBottom();
        }
    }, [safeMessages]);

    if (safeMessages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
                {safeMessages.map((message, index) => {
                    const prevMessage =
                        index > 0 ? safeMessages[index - 1] : null;
                    const showGroup =
                        prevMessage?.user.id === message.user.id &&
                        new Date(message.created_at).getTime() -
                            new Date(prevMessage.created_at).getTime() <
                            300000; // 5 minutes

                    return (
                        <div
                            key={message.id}
                            className={`${showGroup ? 'mt-1' : 'mt-4'}`}
                        >
                            <MessageBubble
                                message={message}
                                isOwn={message.user.id === currentUserId}
                            />
                        </div>
                    );
                })}
            </div>
            <div ref={messagesEndRef} />
        </div>
    );
}
