import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'VedaAI',
  description: 'AI Assessment Creator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#F3F3F3',
        }}
      >
        <div className="flex h-screen overflow-hidden">
          
          {/* Hide sidebar on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}