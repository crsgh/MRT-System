'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, MapPin, Users, LogOut, Menu, X, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import clsx from 'clsx';

interface UserInfo {
  username: string;
  role: UserRole;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    },
    { 
      href: '/admin/stations', 
      label: 'Stations', 
      icon: MapPin,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    },
    { 
      href: '/admin/users', 
      label: 'Users', 
      icon: Users,
      roles: [UserRole.SUPER_ADMIN]
    },
    { 
      href: '/admin/qr-testing', 
      label: 'QR Testing', 
      icon: QrCode,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      hidden: true  // Hidden - QR testing available in mobile app
    },
  ];

  const visibleNavItems = navItems.filter(item => 
    !item.hidden && userInfo && item.roles.includes(userInfo.role)
  );

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'text-gray-600 bg-black-50';
      case UserRole.ADMIN:
        return 'text-blue-600 bg-blue-50';
      case UserRole.PASSENGER:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getBorderColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'border-gray-700';
      case UserRole.ADMIN:
        return 'border-blue-600';
      case UserRole.PASSENGER:
        return 'border-gray-600';
      default:
        return 'border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-center">
            <img src="/globaltek-logo.png" alt="GlobalTek Logo" className="h-25 object-contain" />
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">MRT System</h1>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}