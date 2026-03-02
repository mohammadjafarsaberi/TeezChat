import { Transition } from '@headlessui/react';
import { Form, Link, usePage } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { send } from '@/routes/verification';

interface ProfileTabProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function ProfileTab({
    mustVerifyEmail,
    status,
}: ProfileTabProps) {
    const { auth } = usePage().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        auth.user.avatar || null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Profile information"
                description="Update your name, email address, and avatar"
            />

            <Form
                {...ProfileController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                encType="multipart/form-data"
                className="space-y-6"
            >
                {({ processing, recentlySuccessful, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">Avatar</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={
                                                avatarPreview ||
                                                undefined
                                            }
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-brand-gradient text-lg font-semibold text-brand-accent">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-brand-primary-foreground shadow-lg transition-all hover:bg-brand-primary/90"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        id="avatar"
                                        type="file"
                                        name="avatar"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Click the camera icon to upload
                                        a new avatar. JPG, PNG, GIF or
                                        WEBP (max 2MB)
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.avatar}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.email}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        {mustVerifyEmail &&
                            auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is
                                        unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                        >
                                            Click here to resend the
                                            verification email.
                                        </Link>
                                    </p>

                                    {status ===
                                        'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-brand-primary">
                                            A new verification link has
                                            been sent to your email
                                            address.
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    Saved
                                </p>
                            </Transition>
                        </div>
                    </>
                )}
            </Form>

            <DeleteUser />
        </div>
    );
}
