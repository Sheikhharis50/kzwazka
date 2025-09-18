'use client';

import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import Heading from './Heading';
import Button from './Button';
import { useRouter, usePathname } from 'next/navigation';
import { publicRoutes } from 'constants/public-routes';
import Loader from './Loader';
import { useUser } from '@/hooks/useUser';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { hasToken } = useAuth();
  const { isLoading: isUserLoading = true, user } = useUser();

  React.useEffect(() => {
    if (pathname.includes('login') && hasToken && !!user && user.is_verified) {
      router.push('/dashboard');
    }
  }, [pathname, hasToken, user, router]);

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (isUserLoading) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <Loader black />
      </div>
    );
  }

  if (!hasToken || !user) {
    return (
      <div className="w-full h-dvh flex flex-col gap-5 items-center justify-center">
        <Heading text="Unauthorized, please login" className="text-center" />
        <Button
          text="Login"
          onClick={() => router.push(`/login?next=${pathname}`)}
          className="w-44"
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
