'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          🏋️ Fitness Challenge
        </Link>
      </div>
      <div className="flex-none gap-4 items-center">
        <ThemeSwitcher />
        {isConnected && (
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Dashboard
          </Link>
        )}
        <ConnectButton />
      </div>
    </header>
  );
}
