import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TypingUser {
    id: number;
    name: string;
}

interface MessageComposerProps {
    onSend: (message: string) => void;
    roomId: number;
    currentUserName: string;
    typingUsers?: TypingUser[];
    disabled?: boolean;
}

export function MessageComposer({
    onSend,
    roomId,
    currentUserName,
    typingUsers = [],
    disabled = false,
}: MessageComposerProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const whisperChannelRef = useRef<any>(null);

    // Set up whisper channel
    useEffect(() => {
        if (!window.Echo) return;

        whisperChannelRef.current = window.Echo.join(`room.${roomId}`);

        return () => {
            if (window.Echo && whisperChannelRef.current) {
                window.Echo.leave(`room.${roomId}`);
            }
        };
    }, [roomId]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                200,
            )}px`;
        }

        // Typing indicator using whisper
        if (value.trim() && !isTyping && whisperChannelRef.current) {
            setIsTyping(true);
            whisperChannelRef.current.whisper('typing', {
                name: currentUserName,
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping && whisperChannelRef.current) {
                setIsTyping(false);
                whisperChannelRef.current.whisper('typing', {
                    name: currentUserName,
                    is_typing: false,
                });
            }
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || disabled) return;

        const messageToSend = message.trim();
        setMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Stop typing
        if (isTyping && whisperChannelRef.current) {
            setIsTyping(false);
            whisperChannelRef.current.whisper('typing', {
                name: currentUserName,
                is_typing: false,
            });
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        onSend(messageToSend);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Format typing indicator text
    const getTypingText = () => {
        if (typingUsers.length === 0) return null;

        if (typingUsers.length === 1) {
            return `${typingUsers[0].name} is typing...`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
        } else {
            return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-card p-3 sm:p-4"
        >
            <div className="mb-2 min-h-[20px] px-2">
                {typingUsers.length > 0 && (
                    <p className="text-xs text-muted-foreground italic">
                        {getTypingText()}
                    </p>
                )}
            </div>
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="h-[38px] w-9 shrink-0 rounded-lg p-0 disabled:opacity-50 sm:h-[42px] sm:w-10"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
