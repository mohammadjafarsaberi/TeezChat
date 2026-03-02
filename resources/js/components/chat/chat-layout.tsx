import type { ReactNode } from 'react';

interface ChatLayoutProps {
    sidebar: ReactNode;
    main: ReactNode;
}

export function ChatLayout({ sidebar, main }: ChatLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="w-64 flex-shrink-0">{sidebar}</div>
            <div className="flex flex-1 flex-col overflow-hidden">{main}</div>
        </div>
    );
}
