import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui/ToastContext';
import { BiolinkProvider } from '@/context/BiolinkContext';

export const metadata: Metadata = {
  title: 'BioLink — Personal Hub & Social Links',
  description: 'Curated links, featured projects, and social profiles in a minimal, high-speed bio link website.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#F8F9FA] dark:bg-[#14161C] text-gray-900 dark:text-[#E8E8ED] selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ToastProvider>
          <BiolinkProvider>
            {children}
          </BiolinkProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
