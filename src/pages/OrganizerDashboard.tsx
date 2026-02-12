import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/lib/auth-context";
import { useEvents, type EventData } from "@/lib/event-context";
import { categories, departments } from "@/lib/mock-data";
import {
  CalendarDays, Users, TrendingUp, PlusCircle, Pencil, Trash2, Eye, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

// ─── Attendees Modal ────────────────────────────────────────────

function AttendeesModal({ event, onClose }: { event: EventData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="font-display font-semibold">Attendees — {event.title}</h3>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Registered ({event.registeredUsers.length}/{event.maxAttendees})
            </h4>
            {event.registeredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No registrations yet.</p>
            ) : (
              <ul className="space-y-1">
                {event.registeredUsers.map((uid, i) => (
                  <li key={uid} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                    <span className="w-6 h-6 rounded-full gradient-accent text-accent-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span>User {uid.slice(0, 8)}</span>
                    <Badge variant="outline" className="ml-auto text-xs text-success border-success">Confirmed</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {event.waitlist.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Waitlist ({event.waitlist.length})</h4>
              <ul className="space-y-1">
                {event.waitlist.map((uid, i) => (
                  <li key={uid} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                    <span className="w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs font-bold">#{i + 1}</span>
                    <span>User {uid.slice(0, 8)}</span>
                    <Badge variant="outline" className="ml-auto text-xs text-warning border-warning">Waitlist</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
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
          <Button className="gradient-accent text-accent-foreground border-0 h-11 font-semibold" onClick={openCreate}>
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
              className="rounded-lg border border-border bg-card shadow-card overflow-hidden"
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
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
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
      </div>

      {/* Attendees Modal */}
      {attendeesEvent && (
        <AttendeesModal event={attendeesEvent} onClose={() => setAttendeesEvent(null)} />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-sm"
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
