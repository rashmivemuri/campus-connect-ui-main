import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EventCard } from "@/components/EventCard";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/lib/auth-context";
import { useEvents } from "@/lib/event-context";
import { categories, departments } from "@/lib/mock-data";
import { CalendarDays, BookOpen, Star, TrendingUp, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { events, getRegistrationStatus } = useEvents();
  const [searchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const tab = searchParams.get("tab");
  const isMyEvents = tab === "my-events";
  const userId = user?.id || "";

  const filteredEvents = useMemo(() => {
    let result = events;

    // My Events tab: show only registered or waitlisted
    if (isMyEvents) {
      result = result.filter(
        (e) => e.registeredUsers.includes(userId) || e.waitlist.includes(userId)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // Department filter
    if (selectedDept !== "All") {
      result = result.filter((e) => e.department === selectedDept);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter((e) => e.date === dateFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [events, selectedCategory, selectedDept, dateFilter, searchQuery, isMyEvents, userId]);

  const registeredCount = events.filter((e) => e.registeredUsers.includes(userId)).length;
  const waitlistedCount = events.filter((e) => e.waitlist.includes(userId)).length;

  // Simple calendar data — group events by date
  const calendarDates = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((e) => {
      map.set(e.date, (map.get(e.date) || 0) + 1);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const firstName = user?.name?.split(" ")[0] || "Student";

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            {isMyEvents ? "My Events" : `Welcome, ${firstName}! 👋`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isMyEvents ? "Events you've registered or waitlisted for" : "Discover and register for campus events"}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="All Events" value={events.length} icon={<CalendarDays className="h-5 w-5" />} />
          <StatsCard title="Registered" value={registeredCount} icon={<BookOpen className="h-5 w-5" />} />
          <StatsCard title="Waitlisted" value={waitlistedCount} icon={<Star className="h-5 w-5" />} />
          <StatsCard title="Categories" value={categories.length - 1} icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        {/* Search and Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by name, location, tag..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-40 h-8 text-xs"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button className="text-xs text-accent hover:underline" onClick={() => setDateFilter("")}>
                Clear date
              </button>
            )}
          </div>

          {/* Category badges */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedCategory === cat
                    ? "gradient-accent text-accent-foreground border-0"
                    : "hover:border-accent/50"
                  }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Calendar strip */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <h3 className="font-display text-sm font-semibold mb-3 text-muted-foreground">📅 Upcoming Event Dates</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {calendarDates.map(([date, count]) => {
              const d = new Date(date);
              const isSelected = dateFilter === date;
              return (
                <button
                  key={date}
                  onClick={() => setDateFilter(isSelected ? "" : date)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border text-xs transition-all ${isSelected
                      ? "gradient-accent text-accent-foreground border-transparent"
                      : "border-border hover:border-accent/50"
                    }`}
                >
                  <span className="font-semibold">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                  <span className="text-lg font-bold">{d.getDate()}</span>
                  <span className="text-[10px] opacity-75">{count} event{count > 1 ? "s" : ""}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {isMyEvents ? "You haven't registered for any events yet." : "No events match your filters."}
            </p>
            <p className="text-sm mt-1">
              {isMyEvents ? "Browse events and click Register to get started!" : "Try adjusting your search or filters."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
