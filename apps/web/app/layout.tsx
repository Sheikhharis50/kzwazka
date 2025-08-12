import type { Metadata } from 'next';
import './globals.css';
import { AppContextsProvider } from '@/providers';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'Kzwazka',
  description: 'A wrestling training management web app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppContextsProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            pauseOnFocusLoss
            pauseOnHover
          />
          {children}
        </AppContextsProvider>
      </body>
    </html>
  );
}
