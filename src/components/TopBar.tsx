import { useState, useEffect, useRef } from "react";
import { Bell, Menu, Search, GraduationCap, X, LogOut, User, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useEvents, type EventData } from "@/lib/event-context";
import { motion, AnimatePresence } from "framer-motion";

interface TopBarProps {
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
}

export function TopBar({ onMenuToggle, onSearch }: TopBarProps) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<EventData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { events, notifications, unreadCount, markNotificationRead, clearNotifications } = useEvents();
  const navigate = useNavigate();
  const displayName = user?.name || "Guest";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearch(query);
    onSearch?.(query);

    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();
      const matches = events.filter(e =>
        e.title.toLowerCase().includes(lowerQuery) ||
        e.category.toLowerCase().includes(lowerQuery) ||
        e.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSwitchAccount = () => {
    logout();
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <GraduationCap className="h-6 w-6 text-accent" />
          <span className="font-display text-lg font-bold">CampusHub</span>
        </Link>
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-4" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 bg-muted/50 border-0"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => search.length > 1 && setShowSuggestions(true)}
          />

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="py-1">
                  {suggestions.map((event) => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="flex flex-col px-4 py-2 hover:bg-muted/50 transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <span className="text-sm font-medium">{event.title}</span>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{event.category}</span>
                        <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button className="text-xs text-accent hover:underline" onClick={clearNotifications}>
                        Clear all
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)}><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b border-border last:border-0 text-sm cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "bg-accent/5" : ""}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <p className={!n.read ? "font-medium" : "text-muted-foreground"}>{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="gradient-accent text-accent-foreground text-xs font-semibold">
                  {displayName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSwitchAccount}>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Switch Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
