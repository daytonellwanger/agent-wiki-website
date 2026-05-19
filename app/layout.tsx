import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Agent Wiki',
  description: 'A wiki about how AI agents work',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-white text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-12 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
