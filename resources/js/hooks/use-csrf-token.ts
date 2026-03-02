import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface PageProps {
    csrfToken?: string;
    [key: string]: unknown;
}

/**
 * Hook to get and update CSRF token from Inertia props
 * Updates the meta tag and Echo CSRF token automatically
 */
export function useCsrfToken(): string {
    const { props } = usePage<PageProps>();

    useEffect(() => {
        const csrfToken = props.csrfToken;
        if (csrfToken) {
            // Update meta tag
            const metaTag = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            );
            if (metaTag) {
                metaTag.setAttribute('content', csrfToken);
            }

            // Update Echo CSRF token if available
            if (window.Echo) {
                try {
                    if (window.Echo.connector?.pusher?.config?.auth?.headers) {
                        window.Echo.connector.pusher.config.auth.headers['X-CSRF-TOKEN'] = csrfToken;
                    }
                } catch (error) {
                    console.warn('Failed to update Echo CSRF token:', error);
                }
            }
        }
    }, [props.csrfToken]);

    // Return token from props or fallback to meta tag
    return (props.csrfToken as string) || getCsrfTokenFromMeta();
}

/**
 * Get CSRF token from meta tag
 */
function getCsrfTokenFromMeta(): string {
    const metaTag = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    );
    return metaTag?.content || '';
}
