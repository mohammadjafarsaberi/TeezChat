import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        Pusher?: typeof import('pusher-js');
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        Echo?: import('laravel-echo').Echo;
    }
}
