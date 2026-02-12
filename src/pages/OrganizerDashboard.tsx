import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/lib/auth-context";
import { useEvents, type EventData, type Attendee } from "@/lib/event-context";
import { categories, departments } from "@/lib/mock-data";
import {
  CalendarDays, Users, TrendingUp, PlusCircle, Pencil, Trash2, Eye, X, ChevronDown, QrCode, BarChart3, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Event Form ─────────────────────────────────────────────────

interface FormFields {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  department: string;
  organizer: string;
  maxAttendees: string;
  tags: string;
}

const emptyForm: FormFields = {
  title: "", description: "", date: "", time: "", location: "",
  category: "Workshop", department: "Computer Science", organizer: "",
  maxAttendees: "50", tags: "",
};

function validate(f: FormFields): string | null {
  if (!f.title.trim()) return "Title is required";
  if (!f.description.trim()) return "Description is required";
  if (!f.date) return "Date is required";
  if (!f.time.trim()) return "Time is required";
  if (!f.location.trim()) return "Location is required";
  if (!f.organizer.trim()) return "Organizer name is required";
  const max = parseInt(f.maxAttendees);
  if (!max || max < 1) return "Max attendees must be at least 1";
  return null;
}

// ─── Chart Colors ───────────────────────────────────────────────

const CHART_COLORS = [
  "#f97316", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981",
  "#f59e0b", "#6366f1", "#14b8a6",
];

// ─── QR Code Modal ──────────────────────────────────────────────

function QRCodeModal({ event, onClose }: { event: EventData; onClose: () => void }) {
  const checkInUrl = `${window.location.origin}/event/${event.id}/checkin`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-fun p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-white">Check-In QR Code</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-white/80 text-sm mt-1">{event.title}</p>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <QRCodeSVG
              value={checkInUrl}
              size={200}
              level="H"
              fgColor="#1e1b4b"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[240px]">
            Students scan this QR code at the event entrance to check in
          </p>
          <div className="w-full p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Check-in URL</p>
            <p className="text-xs font-mono break-all text-foreground">{checkInUrl}</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(checkInUrl); toast.success("URL copied!"); }}>
              Copy URL
            </Button>
            <Button className="flex-1 gradient-accent text-white border-0" onClick={() => { window.print(); }}>
              Print QR
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Attendees Modal (Tabular) ──────────────────────────────────

function AttendeesModal({ event, onClose }: { event: EventData; onClose: () => void }) {
  const [search, setSearch] = useState("");

  const filterList = (list: Attendee[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.userName.toLowerCase().includes(q) || a.userEmail.toLowerCase().includes(q) || a.userId.toLowerCase().includes(q)
    );
  };

  const filteredRegistered = filterList(event.registeredUsers);
  const filteredWaitlisted = filterList(event.waitlist);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-display font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.registeredUsers.length}/{event.maxAttendees} registered
                {event.waitlist.length > 0 && ` · ${event.waitlist.length} waitlisted`}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted/50"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees by name or email..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {/* Registered Section */}
          <div className="px-4 pt-3 pb-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Registered Attendees ({filteredRegistered.length})
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground w-12">#</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistered.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">No registered attendees found.</td></tr>
                ) : (
                  filteredRegistered.map((attendee, i) => {
                    const isRsvped = event.rsvpConfirmed?.includes(attendee.userId);
                    const isCheckedIn = event.checkedIn?.includes(attendee.userId);
                    return (
                      <tr key={attendee.userId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <span className="w-7 h-7 rounded-full gradient-accent text-white flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{attendee.userName}</td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell">{attendee.userEmail}</td>
                        <td className="p-3 text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {isCheckedIn ? (
                              <Badge className="bg-success/15 text-success border-success/30 text-xs">Checked In ✓</Badge>
                            ) : isRsvped ? (
                              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">RSVP ✓</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">Registered</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right text-muted-foreground text-xs hidden md:table-cell">
                          {new Date(attendee.registeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Waitlist Section */}
          {event.waitlist.length > 0 && (
            <>
              <div className="px-4 pt-4 pb-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Waiting List ({filteredWaitlisted.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warning/5">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground w-12">Pos</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlisted.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">No matching waitlisted users.</td></tr>
                    ) : (
                      filteredWaitlisted.map((attendee, i) => (
                        <tr key={attendee.userId} className="border-b border-border/50 hover:bg-warning/5 transition-colors">
                          <td className="p-3">
                            <span className="w-7 h-7 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs font-bold">
                              #{i + 1}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{attendee.userName}</td>
                          <td className="p-3 text-muted-foreground hidden sm:table-cell">{attendee.userEmail}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-warning border-warning text-xs">Waitlisted</Badge>
                          </td>
                          <td className="p-3 text-right text-muted-foreground text-xs hidden md:table-cell">
                            {new Date(attendee.registeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Attendance Trends ──────────────────────────────────────────

function AttendanceTrends({ events }: { events: EventData[] }) {
  // Bar chart data: registrations per event
  const barData = useMemo(() =>
    events.slice(0, 8).map((e) => ({
      name: e.title.length > 18 ? e.title.slice(0, 18) + "…" : e.title,
      registered: e.registeredUsers.length,
      capacity: e.maxAttendees,
      waitlist: e.waitlist.length,
    })),
    [events]
  );

  // Pie chart data: registrations by category
  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.registeredUsers.length);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <BarChart3 className="h-5 w-5 text-accent" />
        <h2 className="font-display text-lg font-semibold">Attendance Trends</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card p-5">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4">Registrations vs Capacity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="registered" fill="#f97316" radius={[4, 4, 0, 0]} name="Registered" />
              <Bar dataKey="capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Capacity" />
              <Bar dataKey="waitlist" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Waitlist" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No registration data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);
  const [attendeesEvent, setAttendeesEvent] = useState<EventData | null>(null);
  const [qrEvent, setQrEvent] = useState<EventData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const totalAttendees = events.reduce((sum, e) => sum + e.registeredUsers.length, 0);
  const totalWaitlisted = events.reduce((sum, e) => sum + e.waitlist.length, 0);
  const firstName = user?.name?.split(" ")[0] || "Organizer";

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors(null);
    setShowForm(true);
  };

  const openEdit = (event: EventData) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      department: event.department,
      organizer: event.organizer,
      maxAttendees: String(event.maxAttendees),
      tags: event.tags.join(", "),
    });
    setErrors(null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const err = validate(form);
    if (err) { setErrors(err); toast.error(err); return; }
    setErrors(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time.trim(),
      location: form.location.trim(),
      category: form.category,
      department: form.department,
      organizer: form.organizer.trim(),
      maxAttendees: parseInt(form.maxAttendees),
      image: "",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editingId) {
      updateEvent(editingId, payload);
    } else {
      createEvent({ ...payload, createdBy: user?.id || "" });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setConfirmDelete(null);
  };

  const set = (field: keyof FormFields, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <DashboardLayout role="organizer">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Welcome, {firstName}! 🎯</h1>
            <p className="text-muted-foreground mt-1">Manage your campus events</p>
          </div>
          <Button className="gradient-accent text-accent-foreground border-0 h-11 font-semibold shadow-glow-accent" onClick={openCreate}>
            <PlusCircle className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Events" value={events.length} icon={<CalendarDays className="h-5 w-5" />} />
          <StatsCard title="Total Registered" value={totalAttendees} icon={<Users className="h-5 w-5" />} />
          <StatsCard title="On Waitlist" value={totalWaitlisted} icon={<TrendingUp className="h-5 w-5" />} />
          <StatsCard title="Avg Attendance" value={events.length > 0 ? Math.round(totalAttendees / events.length) : 0} icon={<ChevronDown className="h-5 w-5" />} />
        </div>

        {/* Create / Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-lg font-semibold">{editingId ? "Edit Event" : "Create New Event"}</h2>
                  <button onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
                </div>

                {errors && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{errors}</div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Event title" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description *</Label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Event description" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="2:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Room 301" />
                  </div>
                  <div className="space-y-2">
                    <Label>Organizer *</Label>
                    <Input value={form.organizer} onChange={(e) => set("organizer", e.target.value)} placeholder="CS Department" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => set("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.filter((c) => c !== "All").map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={form.department} onValueChange={(v) => set("department", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {departments.filter((d) => d !== "All").map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Attendees *</Label>
                    <Input type="number" min="1" value={form.maxAttendees} onChange={(e) => set("maxAttendees", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="AI, Python, Hands-on" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button className="gradient-accent text-accent-foreground border-0" onClick={handleSubmit}>
                    {editingId ? "Save Changes" : "Create Event"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <h2 className="font-display font-semibold">Your Events ({events.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Event</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Registered</th>
                  <th className="text-center p-3 font-medium text-muted-foreground hidden lg:table-cell">Confirmed</th>
                  <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Waitlist</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className={event.registeredUsers.length >= event.maxAttendees ? "text-destructive font-medium" : ""}>
                        {event.registeredUsers.length}/{event.maxAttendees}
                      </span>
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell">
                      <span className="text-success font-medium">
                        {event.rsvpConfirmed?.length || 0}
                      </span>
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      {event.waitlist.length > 0 ? (
                        <Badge variant="outline" className="text-warning border-warning text-xs">{event.waitlist.length}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAttendeesEvent(event)} title="View Attendees">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => setQrEvent(event)} title="QR Check-In">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(event)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDelete(event.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Trends */}
        <AttendanceTrends events={events} />
      </div>

      {/* Modals */}
      {attendeesEvent && (
        <AttendeesModal event={attendeesEvent} onClose={() => setAttendeesEvent(null)} />
      )}

      {qrEvent && (
        <QRCodeModal event={qrEvent} onClose={() => setQrEvent(null)} />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold mb-2">Delete Event?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone. All registrations will be lost.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>Delete</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
