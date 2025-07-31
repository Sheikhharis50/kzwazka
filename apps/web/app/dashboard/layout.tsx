import type { Metadata } from 'next';
import '../globals.css';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/Navbar';
import { AppContextsProvider } from 'app/context';

export const metadata: Metadata = {
  title: 'Kzwazka | Dashboard',
  description: 'A wrestling training management web app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppContextsProvider>
      <section className="lg:flex lg:p-1.5 h-dvh overflow-hidden bg-white relative">
        <Sidebar />
        <Navbar />
        <main className="flex-1">{children}</main>
      </section>
    </AppContextsProvider>
  );
}
