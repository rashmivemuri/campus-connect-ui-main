import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/event-context";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const CheckIn = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { checkInUser, getEvent } = useEvents();

    const [status, setStatus] = useState<"checking" | "success" | "already" | "not-registered" | "not-found" | "not-logged-in">("checking");

    const event = getEvent(id || "");

    useEffect(() => {
        if (!user) {
            setStatus("not-logged-in");
            return;
        }
        if (!id) {
            setStatus("not-found");
            return;
        }

        // Short delay for the animation effect
        const timer = setTimeout(() => {
            const result = checkInUser(id, user.id);
            setStatus(result);
        }, 1500);

        return () => clearTimeout(timer);
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const configs = {
        checking: {
            icon: <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-accent border-t-transparent" />,
            title: "Checking In...",
            description: "Verifying your registration",
            color: "text-accent",
        },
        success: {
            icon: <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}><CheckCircle2 className="h-20 w-20 text-success" /></motion.div>,
            title: "You're Checked In! 🎉",
            description: event ? `Welcome to "${event.title}"! Enjoy the event.` : "Welcome! Enjoy the event.",
            color: "text-success",
        },
        already: {
            icon: <AlertTriangle className="h-20 w-20 text-warning" />,
            title: "Already Checked In",
            description: "You've already checked in for this event. Enjoy!",
            color: "text-warning",
        },
        "not-registered": {
            icon: <XCircle className="h-20 w-20 text-destructive" />,
            title: "Not Registered",
            description: "You're not registered for this event. Please register first.",
            color: "text-destructive",
        },
        "not-found": {
            icon: <XCircle className="h-20 w-20 text-destructive" />,
            title: "Event Not Found",
            description: "This event doesn't exist or has been removed.",
            color: "text-destructive",
        },
        "not-logged-in": {
            icon: <AlertTriangle className="h-20 w-20 text-warning" />,
            title: "Login Required",
            description: "Please log in to check in for this event.",
            color: "text-warning",
        },
    };

    const config = configs[status];

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                    {/* Top gradient bar */}
                    <div className="h-2 gradient-fun" />

                    <div className="p-8 flex flex-col items-center text-center gap-4">
                        {/* Decorative confetti for success */}
                        {status === "success" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: -20, x: Math.random() * 300 - 150, opacity: 1, rotate: 0 }}
                                        animate={{ y: 400, opacity: 0, rotate: Math.random() * 360 }}
                                        transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                                        className="absolute text-2xl"
                                        style={{ left: `${10 + Math.random() * 80}%` }}
                                    >
                                        {["🎉", "✨", "🎊", "⭐", "🌟"][i % 5]}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {config.icon}

                        <h1 className={`font-display text-2xl font-bold ${config.color}`}>{config.title}</h1>

                        <p className="text-muted-foreground text-sm max-w-[280px]">{config.description}</p>

                        {event && (
                            <div className="w-full mt-2 p-4 bg-muted/30 rounded-xl text-left space-y-1.5">
                                <p className="font-display font-semibold text-sm">{event.title}</p>
                                <p className="text-xs text-muted-foreground">📅 {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                                <p className="text-xs text-muted-foreground">🕐 {event.time}</p>
                                <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 w-full mt-4">
                            {status === "not-logged-in" ? (
                                <Link to="/login">
                                    <Button className="w-full gradient-accent text-white border-0">Go to Login</Button>
                                </Link>
                            ) : (
                                <Link to={user?.role === "organizer" ? "/organizer" : "/student"}>
                                    <Button className="w-full gradient-accent text-white border-0">
                                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckIn;
