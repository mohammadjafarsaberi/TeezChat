import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { PageTransition } from '@/components/page-transition';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            <PageTransition>{children}</PageTransition>
        </AuthLayoutTemplate>
    );
}
