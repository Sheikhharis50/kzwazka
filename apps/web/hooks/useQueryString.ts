import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryString() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const removeSearchParam = (paramKey: string) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete(paramKey);
    router.push(`?${currentParams.toString()}`);
  };

  return { createQueryString, removeSearchParam };
}
