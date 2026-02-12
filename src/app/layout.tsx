import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Bürokratie Killer',
    description: 'Automatisierte Belegerfassung für Handwerker und Kleinunternehmer',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="de">
            <body>{children}</body>
        </html>
    );
}
