import { LayoutDashboard, CalendarDays, Settings, LogOut, Users, PlusCircle, GraduationCap, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface AppSidebarProps {
  role: "student" | "organizer";
  mobile?: boolean;
}

const studentLinks = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "My Events", url: "/student?tab=my-events", icon: CalendarDays },
  { title: "Settings", url: "/settings", icon: Settings },
];

const organizerLinks = [
  { title: "Dashboard", url: "/organizer", icon: LayoutDashboard },
  { title: "Create Event", url: "/organizer?tab=create", icon: PlusCircle },
  { title: "Attendees", url: "/organizer?tab=attendees", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ role, mobile = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const links = role === "student" ? studentLinks : organizerLinks;

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <aside
      className={`${mobile ? "flex" : "hidden lg:flex"} flex-col w-64 gradient-primary min-h-screen p-4 text-primary-foreground relative overflow-hidden`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-20 -left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-center gap-2 px-3 py-4 mb-6 relative">
        <div className="relative">
          <GraduationCap className="h-7 w-7 text-accent" />
          <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-bounce-subtle" />
        </div>
        <span className="font-display text-xl font-bold">CampusHub</span>
      </div>

      <nav className="flex-1 space-y-1 relative">
        {links.map((link) => (
          <NavLink
            key={link.title}
            to={link.url}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-0.5"
            activeClassName="bg-sidebar-accent text-accent shadow-glow-accent/20"
          >
            <link.icon className="h-4 w-4" />
            <span>{link.title}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 mt-auto"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
