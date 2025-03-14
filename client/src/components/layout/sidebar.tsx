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
  X,
  LogOut,
  FileUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        onClick={onClick}
      >
        {icon}
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
    { href: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { href: "/investments", icon: <BarChart3 size={18} />, label: "Investments" },
    { href: "/budget", icon: <Wallet size={18} />, label: "Budget" },
    { href: "/reports", icon: <FileText size={18} />, label: "Reports" },
    { href: "/documents", icon: <FileUp size={18} />, label: "Documents" },
    { href: "/ai-advisor", icon: <Bot size={18} />, label: "AI Advisor" },
    { href: "/risk-analysis", icon: <Shield size={18} />, label: "Risk Analysis" },
    { href: "/profile", icon: <User size={18} />, label: "Profile" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex md:flex-col h-screen">
        <div className="p-4 flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Smart AI Analyzer</h1>
        </div>
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={location === item.href}
              />
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign out of your account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 h-full w-3/4 max-w-xs bg-background border-r border-border shadow-lg">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">
                  Smart AI Analyzer
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-2 px-2 space-y-1 overflow-y-auto">
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
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  handleLogout();
                  closeMobileSidebar();
                }}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
