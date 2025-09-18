'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import { API_URL } from '../../../config';
import GoogleIcon from '@/icons/google.svg';
import Paragraph from './Paragraph';

export default function GoogleSignIn() {
  const router = useRouter();

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile',
    ux_mode: 'popup',
    onSuccess: async ({ code }) => {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          console.error('Google auth failed:', await res.text());
          return;
        }

        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'token',
              newValue: data.access_token,
            })
          );
        }

        router.push('/dashboard');
      } catch (e) {
        console.error('Google authentication error:', e);
      }
    },
    onError: (err) => {
      console.error('Google login failed', err);
    },
  });

  return (
    <button
      onClick={() => login()}
      className="flex gap-3 w-full items-center justify-center text-black rounded-lg p-2 border-border border-[1px] mb-3"
      type="button"
    >
      <Image
        src={GoogleIcon}
        alt="Google icon"
        width={24}
        height={24}
        className="w-4 md:w-5 xl:w-6"
      />
      <Paragraph text="Sign in with Google" />
    </button>
  );
}
