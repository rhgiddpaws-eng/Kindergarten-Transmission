'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building, FileSpreadsheet, Send, Settings, LogOut, Calculator, CreditCard } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: Home },
  { href: '/dashboard/transactions', label: '현금출납부', icon: FileSpreadsheet },
  { href: '/dashboard/account-sync', label: '계좌 연동', icon: CreditCard },
  { href: '/dashboard/transmission', label: '에듀파인 전송', icon: Send },
  { href: '/dashboard/budget', label: '예산/결산', icon: Calculator },
  { href: '/dashboard/hr', label: '인사/급여', icon: Users },
];

const adminNavItems = [
  { href: '/dashboard/kindergartens', label: '유치원 관리', icon: Building },
  { href: '/dashboard/users', label: '사용자 관리', icon: Users },
  { href: '/dashboard/settings', label: '설정', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
            <Building className="w-6 h-6" />
            <div>
              <div className="text-base leading-tight">아이큐브</div>
              <div className="text-xs text-indigo-400 font-normal leading-tight">에듀파인 자동화</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${isActive(href)
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}

          <div className="pt-5 pb-2 px-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">관리자</div>

          {adminNavItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${isActive(href)
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">관</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">관리자</div>
              <div className="text-xs text-gray-400 truncate">admin@icube.edu</div>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="로그아웃">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
