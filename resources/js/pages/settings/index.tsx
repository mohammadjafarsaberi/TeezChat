import { Head } from '@inertiajs/react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileTab from '@/components/settings/profile-tab';
import PasswordTab from '@/components/settings/password-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SettingsProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Settings({
    mustVerifyEmail,
    status,
}: SettingsProps) {
    const [activeTab, setActiveTab] = useState('profile');

    // Get initial tab from URL hash or default to profile
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'password' || hash === 'profile') {
            setActiveTab(hash);
        }
    }, []);

    // Update URL hash when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.location.hash = value;
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head title="Settings - Teez Chat" />

            <div className="mx-auto w-full max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-brand-primary-foreground">
                            <SettingsIcon className="h-6 w-6 text-brand-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Settings
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your profile and account settings
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>

                        <div className="mt-6 max-w-2xl">
                            <TabsContent value="profile" className="mt-0">
                                <ProfileTab
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </TabsContent>

                            <TabsContent value="password" className="mt-0">
                                <PasswordTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
