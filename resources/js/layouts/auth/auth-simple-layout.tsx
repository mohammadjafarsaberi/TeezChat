import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-brand-gradient p-6 md:p-10">
            <div className="w-full max-w-sm">
                <motion.div
                    className="flex flex-col gap-8"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.2, 0.8, 0.4, 1] }}
                >
                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.22, ease: [0.35, 0.8, 0.4, 1] }}
                    >
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <motion.div
                                className="mb-1 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/80 text-brand-primary shadow-sm"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            >
                                <AppLogoIcon className="size-6 fill-current" />
                            </motion.div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </motion.div>
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
