import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rooms',
        href: '/rooms',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Teez Chat" />
            <motion.div
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.2, 0.8, 0.4, 1] }}
            >
                <motion.div
                    className="grid auto-rows-min gap-4 md:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.06,
                            },
                        },
                    }}
                >
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-card"
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.2, ease: [0.25, 0.8, 0.4, 1] }}
                        >
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-foreground/10" />
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div
                    className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card md:min-h-min"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.4, 1], delay: 0.1 }}
                >
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-foreground/10" />
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
