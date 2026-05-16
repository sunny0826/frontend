import { Link, Outlet } from 'react-router-dom';
import { Logo } from '@/app/components/logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="h-9 w-9" />
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              OpenTalent
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border border-blue-100/60 bg-white/90 p-8 shadow-xl shadow-blue-100/40 backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
