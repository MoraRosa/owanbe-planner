import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  MessageSquare, 
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  TrendingUp,
  Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { getUnreadMessageCount, initDB } from '@/lib/indexedDb';

const navItems = [
  { path: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor/profile', label: 'My Profile', icon: Store },
  { path: '/vendor/services', label: 'Services', icon: Package },
  { path: '/vendor/bookings', label: 'Bookings', icon: Calendar },
  { path: '/vendor/reviews', label: 'Reviews', icon: Star },
  { path: '/vendor/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/vendor/messages', label: 'Messages', icon: MessageSquare, hasNotification: true },
  { path: '/vendor/settings', label: 'Settings', icon: Settings },
];

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      await initDB();
      const count = await getUnreadMessageCount(user.id);
      setUnreadCount(count);
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          "bg-gradient-to-b from-teal to-teal-dark flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-teal-light/20">
          <Link to="/vendor" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-coral flex items-center justify-center">
              <Store className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-cream">Owambe</h1>
              <p className="text-xs text-cream/60">Vendor Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/vendor' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gold text-foreground font-semibold shadow-lg"
                    : "text-cream/80 hover:bg-teal-light/30 hover:text-cream"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.hasNotification && unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-coral text-cream text-xs font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-teal-light/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-cream font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">{user?.name || 'Vendor'}</p>
              <p className="text-xs text-cream/60 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-cream/80 hover:text-cream hover:bg-teal-light/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <Link to="/vendor" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-gold flex items-center justify-center">
                <Store className="w-4 h-4 text-foreground" />
              </div>
              <span className="font-display font-bold text-gradient-celebration">Vendor</span>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
