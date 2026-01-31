import { NavLink, useLocation } from "react-router-dom";
import { Briefcase, BarChart3, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Briefcase, label: "工作台" },
  { path: "/data", icon: BarChart3, label: "数据" },
  { path: "/inventory", icon: Package, label: "库存" },
  { path: "/profile", icon: User, label: "我的" },
];

const BottomNav = () => {
  const location = useLocation();

  // Hide nav on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "scale-110 transition-transform")} />
              <span className={cn("text-xs", isActive && "font-medium")}>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
