import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'VM HUB - Academic Operations & Broadcast Platform',
  description:
    'VM HUB: Unified academic operations and broadcast platform for Students, Teachers, HODs, and Admins with fast checklist attendance, targeted announcements, and leave workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
