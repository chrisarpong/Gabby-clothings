import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Calendar, Users, Settings, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { useUser, SignOutButton, SignInButton } from '@clerk/clerk-react';

const AdminLayout = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

  if (pathname === '/admin' || pathname === '/admin/') {
    return <Navigate to="/admin/overview" />;
  }

  const navLinks = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Clients', path: '/admin/clients', icon: Users },
  ];

  if (!isLoaded) {
    return <div className="h-screen w-full flex items-center justify-center bg-surface font-sans text-primary">Loading...</div>;
  }

  // RBAC Check
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <ShieldAlert className="w-12 h-12 mb-4 text-outline" />
        <h1 className="font-serif text-3xl mb-2">Admin Portal</h1>
        <p className="text-outline mb-8">Please sign in to access the administrator dashboard.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/admin">
          <button className="px-6 py-3 bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
            Log In as Admin
          </button>
        </SignInButton>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <ShieldAlert className="w-12 h-12 mb-4 text-error" />
        <h1 className="font-serif text-3xl mb-2 text-error">Access Denied</h1>
        <p className="text-outline mb-8">You do not have administrative privileges to view this page.</p>
        <div className="flex gap-4">
          <NavLink to="/" className="px-6 py-3 border border-outline-variant text-primary font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-variant transition-colors">
            Return Home
          </NavLink>
          <SignOutButton>
            <button className="px-6 py-3 bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-surface text-on-surface font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface z-50">
        <span className="font-serif text-lg text-primary tracking-wide">
          GABBY NEWLUK <span className="font-label text-[9px] tracking-widest uppercase text-outline ml-2">Admin</span>
        </span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-primary p-2 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-64 border-r border-outline-variant/30 bg-surface flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-[65px] md:top-0' : '-translate-x-full'}`}>
        <div>
          <div className="h-20 hidden md:flex items-center px-8 border-b border-outline-variant/30">
            <span className="font-serif text-xl text-primary tracking-wide">
              GABBY NEWLUK
              <span className="block font-label text-[10px] tracking-widest uppercase text-outline mt-1">Admin</span>
            </span>
          </div>
          <nav className="p-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-none font-label text-[11px] tracking-[0.1em] uppercase transition-colors ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-primary/70 hover:bg-surface-variant hover:text-primary'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {link.name}
                </NavLink>
              );
            })}
            
            {/* Divider */}
            <div className="h-px bg-outline-variant/30 my-4 mx-2"></div>
            
            <NavLink
              to="/admin/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-none font-label text-[11px] tracking-[0.1em] uppercase transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-primary/70 hover:bg-surface-variant hover:text-primary'
                }`
              }
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
              Settings
            </NavLink>
          </nav>
        </div>
        
        <div className="p-4 border-t border-outline-variant/30">
          <SignOutButton>
            <button className="w-full flex items-center justify-between gap-3 px-4 py-3 font-label text-[11px] tracking-[0.1em] uppercase text-error hover:bg-error/10 transition-colors">
              <span className="flex items-center gap-3"><LogOut className="w-4 h-4" strokeWidth={2} /> Logout</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface relative">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
