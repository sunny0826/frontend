import { Link, Outlet } from 'react-router-dom';
import { Logo } from '@/app/components/logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none transition-colors hover:bg-secondary/55 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="size-8" />
            <span className="text-xl font-semibold leading-none">
              <span className="text-sky-400">Open</span>
              <span className="text-primary">Share</span>
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-[inset_0_1px_0_rgba(226,232,240,0.08)] sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
