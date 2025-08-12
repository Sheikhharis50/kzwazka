'use client';
import { useRouter } from 'next/navigation';
import Button from './components/Button';

export default function Home() {
  const router = useRouter();
  return (
    <div className="w-full h-screen bg-yellow flex flex-col gap-5 items-center justify-center">
      <h1 className="text-5xl font-Inter">Home</h1>
      <div className="flex gap-3">
        <Button text="Login" onClick={() => router.push('/login')} />
        <Button text="Register" onClick={() => router.push('/register')} />
        <Button text="Dashboard" onClick={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}
