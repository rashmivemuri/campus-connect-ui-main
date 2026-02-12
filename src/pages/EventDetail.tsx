import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/event-context";
import { toast } from "sonner";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, registerForEvent, unregisterFromEvent, getRegistrationStatus, getWaitlistPosition } = useEvents();

  const event = getEvent(id || "");
  const userId = user?.id || "";
  const status = getRegistrationStatus(id || "", userId);
  const waitlistPos = getWaitlistPosition(id || "", userId);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Event not found</h1>
          <Link to="/student" className="text-accent hover:underline">← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const spotsLeft = event.maxAttendees - event.registeredUsers.length;
  const fillPercent = (event.registeredUsers.length / event.maxAttendees) * 100;

  const handleAction = () => {
    if (!user) {
      toast.error("Please log in or sign up to register for events");
      navigate("/login");
      return;
    }
    if (status === "registered" || status === "waitlisted") {
      unregisterFromEvent(event.id, userId);
    } else {
      registerForEvent(event.id, userId, user.name, user.email);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero bar */}
      <div className="gradient-hero h-48 lg:h-64 relative">
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-4xl mx-auto px-4 lg:px-6 pb-6">
            <Link to="/student" className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to events
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 -mt-8 relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card shadow-card-hover p-6 lg:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className="gradient-accent text-accent-foreground border-0">{event.category}</Badge>
                <Badge variant="secondary">{event.department}</Badge>
                {status === "registered" && (
                  <Badge variant="outline" className="text-success border-success">Registered ✓</Badge>
                )}
                {status === "waitlisted" && (
                  <Badge variant="outline" className="text-warning border-warning">Waitlist #{waitlistPos}</Badge>
                )}
                {spotsLeft <= 0 && status !== "registered" && status !== "waitlisted" && (
                  <Badge variant="outline" className="text-destructive border-destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />Registration Closed
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-2xl lg:text-3xl font-bold text-card-foreground mb-4">
                {event.title}
              </h1>

              <p className="text-muted-foreground leading-relaxed mb-6">{event.description}</p>

              {/* Details grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="text-sm font-medium">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Organizer</p>
                    <p className="text-sm font-medium">{event.organizer}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 space-y-4">
              {/* Capacity */}
              <div className="rounded-lg border border-border p-5">
                <h3 className="font-display font-semibold mb-3">Capacity</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{event.registeredUsers.length} registered</span>
                  <span className={`font-medium ${spotsLeft <= 0 ? "text-destructive" : spotsLeft <= 5 ? "text-warning" : ""}`}>
                    {spotsLeft <= 0 ? "No spots left" : `${spotsLeft} left`}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${fillPercent >= 100 ? "bg-destructive" : fillPercent >= 80 ? "bg-warning" : "gradient-accent"}`}
                    style={{ width: `${Math.min(fillPercent, 100)}%` }}
                  />
                </div>
                {event.waitlist.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-3">{event.waitlist.length} on waitlist</p>
                )}

                <Button
                  className={`w-full h-11 font-semibold ${status === "registered"
                    ? "border-success text-success"
                    : status === "waitlisted"
                      ? "border-warning text-warning"
                      : status === "closed"
                        ? ""
                        : "gradient-accent text-accent-foreground border-0"
                    }`}
                  variant={status === "available" ? "default" : "outline"}
                  onClick={handleAction}
                >
                  {status === "registered"
                    ? "Cancel Registration"
                    : status === "waitlisted"
                      ? "Leave Waitlist"
                      : status === "closed"
                        ? "Join Waitlist"
                        : "Register Now"}
                </Button>
              </div>

              {/* Attendee info */}
              {(event.registeredUsers.length > 0 || event.waitlist.length > 0) && (
                <div className="rounded-lg border border-border p-5">
                  <h3 className="font-display font-semibold mb-2 text-sm">Registration Info</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total capacity</span>
                      <span className="font-medium">{event.maxAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered</span>
                      <span className="font-medium text-success">{event.registeredUsers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waitlisted</span>
                      <span className="font-medium text-warning">{event.waitlist.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium">{Math.max(spotsLeft, 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" /> Share Event
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;
