import { Head, Link, usePage } from '@inertiajs/react';
import { MessageCircle, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import AppLogoIcon from '@/components/app-logo-icon';
import { login, register } from '@/routes';

export default function Master({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Real-time Chat">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-brand-gradient">
                <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2">
                            <motion.div
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-brand-primary-foreground shadow-lg sm:h-10 sm:w-10"
                                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.4, 1] }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <AppLogoIcon className="h-5 w-5 fill-current text-brand-accent sm:h-6 sm:w-6" />
                            </motion.div>
                            <span className="text-lg font-bold text-foreground sm:text-xl">
                                TeezChat
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {auth.user ? (
                                <Button size="sm" className="text-xs sm:text-sm sm:size-default" asChild>
                                    <Link href="/rooms">Go to Rooms</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" className="hidden text-xs sm:inline-flex sm:text-sm sm:size-default" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button size="sm" className="text-xs sm:text-sm sm:size-default" asChild>
                                            <Link href={register()}>Register</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-20">
                    <motion.div
                        className="mx-auto max-w-6xl"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.4, 1] }}
                    >
                        <div className="text-center">
                            <motion.h1
                                className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-6xl lg:text-7xl xl:text-8xl"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.8, 0.4, 1] }}
                            >
                                Connect in
                                <span className="bg-brand-gradient-text block sm:inline">
                                    {' '}
                                    Real-Time
                                </span>
                            </motion.h1>
                            <motion.p
                                className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:mb-12 sm:text-xl lg:text-2xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.26, ease: [0.25, 0.8, 0.4, 1], delay: 0.05 }}
                            >
                                Experience seamless, instant messaging with
                                TeezChat. Create rooms, chat with friends, and
                                stay connected—all in real-time.
                            </motion.p>

                            {/* CTA Section */}
                            {!auth.user && (
                                <div className="mx-auto mb-12 max-w-4xl sm:mb-16">
                                    <motion.h2
                                        className="mb-6 text-3xl font-bold text-foreground sm:mb-8 sm:text-4xl lg:text-5xl"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.24, ease: [0.25, 0.8, 0.4, 1], delay: 0.08 }}
                                    >
                                        Start the Conversation.
                                    </motion.h2>
                                    <div className="mb-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
                                        <motion.div
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Button size="lg" className="w-full sm:w-auto" asChild>
                                                <Link href={register()}>
                                                    Create Your Account
                                                </Link>
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                            className="w-full sm:w-auto"
                                        >
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                                asChild
                                            >
                                                <Link href={login()}>Login</Link>
                                            </Button>
                                        </motion.div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Takes less than 30 seconds.
                                    </p>
                                </div>
                            )}
                        </div>

                        <motion.div
                            className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: { staggerChildren: 0.08 },
                                },
                            }}
                        >
                            <motion.div
                                className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-brand-primary hover:shadow-xl sm:p-8"
                                variants={{
                                    hidden: { opacity: 0, y: 14 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.24, ease: [0.25, 0.8, 0.4, 1] }}
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted sm:h-14 sm:w-14">
                                    <Zap className="h-6 w-6 text-brand-primary sm:h-7 sm:w-7" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                    Lightning Fast
                                </h3>
                                <p className="text-sm text-muted-foreground sm:text-base">
                                    Real-time messaging powered by WebSockets
                                    for instant delivery and updates.
                                </p>
                            </motion.div>

                            <motion.div
                                className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-brand-secondary hover:shadow-xl sm:p-8"
                                variants={{
                                    hidden: { opacity: 0, y: 14 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.24, ease: [0.25, 0.8, 0.4, 1] }}
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted sm:h-14 sm:w-14">
                                    <Users className="h-6 w-6 text-brand-secondary sm:h-7 sm:w-7" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                    Group Chats
                                </h3>
                                <p className="text-sm text-muted-foreground sm:text-base">
                                    Create rooms and chat with multiple people
                                    simultaneously with presence indicators.
                                </p>
                            </motion.div>

                            <motion.div
                                className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-brand-accent hover:shadow-xl sm:p-8 sm:col-span-2 lg:col-span-1"
                                variants={{
                                    hidden: { opacity: 0, y: 14 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.24, ease: [0.25, 0.8, 0.4, 1] }}
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted sm:h-14 sm:w-14">
                                    <MessageCircle className="h-6 w-6 text-brand-accent sm:h-7 sm:w-7" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                    Typing Indicators
                                </h3>
                                <p className="text-sm text-muted-foreground sm:text-base">
                                    See when others are typing in real-time for
                                    a more natural conversation experience.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </main>
            </div>
        </>
    );
}
