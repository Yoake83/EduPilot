import type { Metadata } from 'next';
import './globals.css';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'EduPilot',
  description: 'AI-Powered Educational Platform',
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
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <ConditionalSidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}