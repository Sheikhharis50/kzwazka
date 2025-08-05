'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function usePreviousPath(fallback: string = '/') {
  const router = useRouter();
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = localStorage.getItem('prevPath');
      localStorage.setItem('prevPath', pathname);
    }
  }, [pathname]);

  const goBack = () => {
    const prevPath = prevPathRef.current;
    if (prevPath && prevPath !== pathname) {
      router.push(prevPath);
    } else {
      router.push(fallback);
    }
  };

  return { goBack, currentPath: pathname };
}
