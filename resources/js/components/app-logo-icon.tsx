import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2C6.48 2 2 6.15 2 11.5c0 1.65.5 3.19 1.35 4.5L2 22l6.5-1.35C9.81 21.5 10.85 22 12 22c5.52 0 10-4.15 10-9.5S17.52 2 12 2z"
                fill="currentColor"
            />
        </svg>
    );
}
