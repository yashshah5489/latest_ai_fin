import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  FileText, 
  Bot, 
  Shield, 
  User,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors",
          active
            ? "bg-primary-600 text-white"
            : "text-gray-300 hover:bg-dark-700 hover:text-white"
        )}
        onClick={onClick}
      >
        <span className="mr-3 h-6 w-6">{icon}</span>
        {label}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoutMutation } = useAuth();

  const closeMobileSidebar = () => setMobileOpen(false);

  const navItems = [
    { href: "/", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { href: "/investments", icon: <BarChart3 size={24} />, label: "Investments" },
    { href: "/budget", icon: <Wallet size={24} />, label: "Budget" },
    { href: "/reports", icon: <FileText size={24} />, label: "Reports" },
    { href: "/ai-advisor", icon: <Bot size={24} />, label: "AI Advisor" },
    { href: "/risk-analysis", icon: <Shield size={24} />, label: "Risk Analysis" },
    { href: "/profile", icon: <User size={24} />, label: "Profile" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-gray-800 hidden md:block">
        <div className="p-4 flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary-500" />
          <h1 className="text-xl font-heading font-semibold text-white">Smart AI Analyzer</h1>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={location === item.href}
            />
          ))}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:bg-dark-700 hover:text-white mt-8"
            onClick={handleLogout}
          >
            <span className="mr-3 h-6 w-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Sign Out
          </Button>
        </nav>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <button
          className="p-3 bg-primary-600 rounded-full shadow-lg text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-dark-900/90 backdrop-blur-sm md:hidden">
          <div className="h-full w-64 bg-dark-900 border-r border-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary-500" />
                <h1 className="text-xl font-heading font-semibold text-white">
                  Smart AI Analyzer
                </h1>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={closeMobileSidebar}
              >
                <X />
              </button>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={location === item.href}
                  onClick={closeMobileSidebar}
                />
              ))}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-dark-700 hover:text-white mt-8"
                onClick={() => {
                  handleLogout();
                  closeMobileSidebar();
                }}
              >
                <span className="mr-3 h-6 w-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
