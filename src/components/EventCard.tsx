import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useEvents, type EventData, type RegistrationStatus } from "@/lib/event-context";

interface EventCardProps {
  event: EventData;
}

const categoryColors: Record<string, string> = {
  Workshop: "bg-primary text-primary-foreground",
  Cultural: "bg-accent text-accent-foreground",
  Career: "bg-success text-success-foreground",
  Sports: "bg-warning text-warning-foreground",
  Academic: "bg-secondary text-secondary-foreground",
  Social: "bg-muted text-foreground",
  Technical: "bg-primary text-primary-foreground",
};

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const { registerForEvent, unregisterFromEvent, getRegistrationStatus, getWaitlistPosition, confirmRsvp, cancelRsvp, getRsvpStatus } = useEvents();

  const userId = user?.id || "";
  const status: RegistrationStatus = getRegistrationStatus(event.id, userId);
  const isRsvpConfirmed = getRsvpStatus(event.id, userId);
  const waitlistPos = getWaitlistPosition(event.id, userId);
  const spotsLeft = event.maxAttendees - event.registeredUsers.length;
  const fillPercent = (event.registeredUsers.length / event.maxAttendees) * 100;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    if (status === "registered") {
      if (isRsvpConfirmed) {
        // Optional: Allow canceling RSVP without unregistering? 
        // For now, let's make the green checkmark static or allow unregistering.
        // Let's allow unregistering which also cancels RSVP.
        unregisterFromEvent(event.id, userId);
      } else {
        confirmRsvp(event.id, userId);
      }
    } else if (status === "waitlisted") {
      unregisterFromEvent(event.id, userId);
    } else {
      registerForEvent(event.id, userId, user.name);
    }
  };

  const buttonConfig = {
    available: { label: "Register", variant: "default" as const, className: "gradient-accent text-accent-foreground border-0 hover:opacity-90" },
    registered: isRsvpConfirmed
      ? { label: "RSVP Confirmed ✓", variant: "outline" as const, className: "border-success text-success hover:bg-success/10" }
      : { label: "Confirm RSVP", variant: "default" as const, className: "bg-primary text-primary-foreground hover:bg-primary/90" },
    waitlisted: { label: `Waitlist #${waitlistPos}`, variant: "outline" as const, className: "border-warning text-warning" },
    closed: { label: "Join Waitlist", variant: "secondary" as const, className: "" },
  };
  const btn = buttonConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Color bar */}
      <div className="h-1.5 gradient-accent" />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${categoryColors[event.category] || "bg-muted text-foreground"} text-xs font-medium`}>
            {event.category}
          </Badge>
          {status === "registered" && (
            <Badge variant="outline" className="text-success border-success text-xs">Registered ✓</Badge>
          )}
          {status === "waitlisted" && (
            <Badge variant="outline" className="text-warning border-warning text-xs">Waitlist #{waitlistPos}</Badge>
          )}
          {status === "closed" && spotsLeft <= 0 && (
            <Badge variant="outline" className="text-destructive border-destructive text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />Full
            </Badge>
          )}
        </div>

        <Link to={`/event/${event.id}`}>
          <h3 className="font-display text-lg font-semibold text-card-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-4 mt-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.registeredUsers.length}/{event.maxAttendees}
            </span>
            <span className={spotsLeft <= 0 ? "text-destructive font-medium" : spotsLeft <= 5 ? "text-warning font-medium" : ""}>
              {spotsLeft <= 0 ? "No spots left" : `${spotsLeft} spots left`}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${fillPercent >= 100 ? "bg-destructive" : fillPercent >= 80 ? "bg-warning" : "gradient-accent"}`}
              style={{ width: `${Math.min(fillPercent, 100)}%` }}
            />
          </div>
          {event.waitlist.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{event.waitlist.length} on waitlist</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">by {event.organizer}</span>
          <Button size="sm" variant={btn.variant} className={btn.className} onClick={handleAction}>
            {btn.label}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
