import { createInertiaApp } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Pusher from 'pusher-js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { ToastProvider } from '@/components/ui/toast';

const appName = import.meta.env.VITE_APP_NAME || 'TeezChat';

// Helper function to get CSRF token from meta tag
function getCsrfToken(): string {
    const metaTag = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    );
    return metaTag?.content || '';
}

// Configure Laravel Echo with Reverb (only if variables are available)
if (import.meta.env.VITE_REVERB_APP_KEY) {
    window.Pusher = Pusher;

    // Initialize Echo with CSRF token
    // The token will be updated dynamically when Inertia props change
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        },
    });

    // Log Echo connection status
    console.log('Laravel Echo initialized:', {
        key: import.meta.env.VITE_REVERB_APP_KEY ? 'Set' : 'Missing',
        host: import.meta.env.VITE_REVERB_HOST || 'localhost',
        port: import.meta.env.VITE_REVERB_PORT || 8080,
    });
} else {
    console.warn(
        'VITE_REVERB_APP_KEY not found. WebSocket features will not work.',
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Update CSRF token in meta tag on initial load if available
        if (props.initialPage?.props?.csrfToken) {
            const metaTag = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            );
            if (metaTag) {
                metaTag.setAttribute('content', props.initialPage.props.csrfToken);
            }
        }

        root.render(
            <StrictMode>
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Single-theme (green) appearance is handled via CSS variables in app.css.
