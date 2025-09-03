import type { Metadata } from 'next';
import '../globals.css';
import Sidebar from '@/components/dashboard/sidebar';
import Navbar from '@/components/Navbar';

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
    <section className="flex flex-col lg:flex-row lg:p-1.5 h-dvh overflow-hidden bg-white relative">
      <Sidebar />
      <Navbar />
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </section>
  );
}
