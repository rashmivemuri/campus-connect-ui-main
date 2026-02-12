import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { useEvents } from "@/lib/event-context";
import { motion } from "framer-motion";
import heroCampus from "@/assets/hero-campus.jpg";

const Index = () => {
  const { events } = useEvents();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-accent" />
            <span className="font-display text-xl font-bold">CampusHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-accent text-accent-foreground border-0">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCampus} alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
              Your Campus,<br />Your Events
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/85 mb-8 max-w-lg">
              Discover workshops, festivals, sports, and more. Join the events that matter to you.
            </p>
            <div className="flex gap-3">
              <Link to="/login">
                <Button size="lg" className="gradient-accent text-accent-foreground border-0 h-12 px-8 font-semibold shadow-glow-accent">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/student">
                <Button size="lg" variant="outline" className="h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Explore Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured events */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground mt-1">Don't miss what's happening on campus</p>
          </div>
          <Link to="/student" className="text-accent hover:underline text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
