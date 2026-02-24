import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edufine Sync System',
    description: 'Kindergarten Edufine Transmission automated sync system',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body>
                {children}
            </body>
        </html>
    );
}
