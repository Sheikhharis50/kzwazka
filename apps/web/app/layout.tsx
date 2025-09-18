import type { Metadata } from 'next';
import './globals.css';
import 'swiper/css';
import 'swiper/css/pagination';
import { AppContextsProvider } from 'providers';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';

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
          <ProtectedRoute>{children}</ProtectedRoute>
        </AppContextsProvider>
      </body>
    </html>
  );
}
