import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { show } from '@/routes/two-factor';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Head title="Two-Factor Authentication - Teez Chat" />

            <div className="mx-auto w-full max-w-4xl px-4 py-8">
                <Link
                    href="/settings"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Settings
                </Link>

                <div className="mb-8">
                        <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient">
                            <Shield className="h-6 w-6 fill-current text-brand-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Two-Factor Authentication
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-2 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    Security Status
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    {twoFactorEnabled
                                        ? 'Your account is protected with two-factor authentication'
                                        : 'Enable two-factor authentication to secure your account'}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={twoFactorEnabled ? 'default' : 'destructive'}
                                className="text-sm"
                            >
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {twoFactorEnabled ? (
                            <>
                                <div className="rounded-lg bg-brand-muted p-4">
                                    <p className="text-sm text-foreground">
                                        <strong>Protected:</strong> With
                                        two-factor authentication enabled, you
                                        will be prompted for a secure, random
                                        pin during login, which you can retrieve
                                        from the TOTP-supported application on
                                        your phone.
                                    </p>
                                </div>

                                <TwoFactorRecoveryCodes
                                    recoveryCodesList={recoveryCodesList}
                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                    errors={errors}
                                />

                                <div className="border-t pt-6">
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                size="lg"
                                            >
                                                <ShieldBan className="mr-2 h-5 w-5" />
                                                {processing
                                                    ? 'Disabling...'
                                                    : 'Disable 2FA'}
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-lg bg-yellow-50 p-4">
                                    <p className="text-sm text-yellow-900">
                                        <strong>Not Protected:</strong> When you
                                        enable two-factor authentication, you
                                        will be prompted for a secure pin during
                                        login. This pin can be retrieved from a
                                        TOTP-supported application on your
                                        phone.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {hasSetupData ? (
                                        <Button
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <ShieldCheck className="mr-2 h-5 w-5" />
                                            Continue Setup
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    <ShieldCheck className="mr-2 h-5 w-5" />
                                                    {processing
                                                        ? 'Enabling...'
                                                        : 'Enable 2FA'}
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </>
                        )}

                        <TwoFactorSetupModal
                            isOpen={showSetupModal}
                            onClose={() => setShowSetupModal(false)}
                            requiresConfirmation={requiresConfirmation}
                            twoFactorEnabled={twoFactorEnabled}
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            clearSetupData={clearSetupData}
                            fetchSetupData={fetchSetupData}
                            errors={errors}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
