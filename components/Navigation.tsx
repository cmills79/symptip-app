'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/utils/helpers';
import Image from 'next/image';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/photos', label: 'Photos' },
  { href: '/timelapse', label: 'Time-Lapse' },
  { href: '/symptoms', label: 'Symptoms' },
  { href: '/supplements', label: 'Supplements' },
  { href: '/meals', label: 'Meals' },
  { href: '/analysis/patterns', label: 'Patterns' },
  { href: '/reports', label: 'Reports' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-background-paper shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                Symptiq
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-primary hover:border-primary/50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-10 bg-primary/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline text-sm text-text-secondary">
                    {user.displayName}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-primary/20">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                pathname === item.href
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:bg-primary/5 hover:border-primary/50 hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
