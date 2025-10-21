import { Link, useLocation } from "react-router-dom";
import { Mic, FileText, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();

  const links = [
    { href: "/capture", icon: Mic, label: "Capture" },
    { href: "/notes", icon: FileText, label: "Notes" },
    { href: "/contacts", icon: Users, label: "Contacts" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = location.pathname === href || location.pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors min-w-[72px]",
                  isActive 
                    ? "text-brand" 
                    : "text-text-muted hover:text-text"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
