import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { PageTransition } from '@/components/page-transition';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <PageTransition>{children}</PageTransition>
    </AppLayoutTemplate>
);
