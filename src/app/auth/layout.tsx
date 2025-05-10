import { ReactNode } from 'react';
import Image from 'next/image';
import { Logo } from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white p-8">
        {/* Logo */}
        <div className="mb-8">
          <Logo textColor="text-primary" />
        </div>
        
        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Right side - Full image with overlay and text */}
      <div className="hidden lg:block relative w-1/2 h-screen">
        <Image
          src="/assets/login_page.jpg"
          alt="Running Event"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-10">
          <h2 className="text-2xl font-bold mb-2">Join Our Running Community</h2>
          <p className="max-w-md">Create your account to participate in exciting running events and be part of our growing community.</p>
        </div>
      </div>
    </div>
  );
} 