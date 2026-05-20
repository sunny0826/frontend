import { Link, Outlet } from 'react-router-dom';
import { Logo } from '@/app/components/logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1a2332] to-[#0F172A] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="h-9 w-9" />
            <span className="text-2xl font-semibold">
              <span style={{ color: "#3B82F6" }}>Open</span>
              <span style={{ color: "#22C55E" }}>Share</span>
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border border-[#475569] bg-[#1E293B]/90 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
