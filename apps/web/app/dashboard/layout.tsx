import type { Metadata } from 'next';
import '../globals.css';
import Sidebar from '@/components/sidebar';

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
    <section className="flex p-1.5 h-dvh bg-white">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </section>
  );
}
