import { LayoutDashboard, CalendarDays, Settings, LogOut, Users, PlusCircle, GraduationCap } from "lucide-react";
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
      className={`${mobile ? "flex" : "hidden lg:flex"} flex-col w-64 gradient-primary min-h-screen p-4 text-primary-foreground`}
    >
      <div className="flex items-center gap-2 px-3 py-4 mb-6">
        <GraduationCap className="h-7 w-7 text-accent" />
        <span className="font-display text-xl font-bold">CampusHub</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.title}
            to={link.url}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
            activeClassName="bg-sidebar-accent text-accent"
          >
            <link.icon className="h-4 w-4" />
            <span>{link.title}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mt-auto"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
