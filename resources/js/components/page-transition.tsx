import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

type PageTransitionProps = {
    children: ReactNode;
    className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={cn('h-full', className)}>{children}</div>;
    }

    return (
        <motion.div
            className={cn('h-full', className)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.4, 1] }}
        >
            {children}
        </motion.div>
    );
}

