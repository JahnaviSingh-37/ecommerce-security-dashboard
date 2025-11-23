import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Security Scans', href: '/scans', icon: MagnifyingGlassIcon },
    { name: 'Vulnerabilities', href: '/vulnerabilities', icon: ExclamationTriangleIcon },
    { name: 'Compliance', href: '/compliance', icon: DocumentCheckIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <ShieldCheckIcon className="h-8 w-8 text-primary-500" />
          <span className="ml-2 text-white font-bold text-lg">SecureCommerce</span>
        </div>
        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-primary-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              E-Commerce Security Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
