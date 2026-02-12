import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { mockEvents as seedEvents, type Event as BaseEvent } from "@/lib/mock-data";

// ─── Types ──────────────────────────────────────────────────────

export interface Attendee {
    userId: string;
    userName: string;
    userEmail: string;
    registeredAt: string; // ISO timestamp
}

export interface EventData extends Omit<BaseEvent, "attendees" | "isRsvped"> {
    registeredUsers: Attendee[];
    waitlist: Attendee[];
    rsvpConfirmed: string[];   // user IDs who confirmed RSVP
    checkedIn: string[];       // user IDs who checked in via QR
    bookmarks: string[];       // user IDs who bookmarked the event
    createdBy: string;         // organizer user ID
}

export interface Notification {
    id: string;
    message: string;
    eventId: string;
    timestamp: string;
    read: boolean;
}

interface EventContextValue {
    events: EventData[];
    notifications: Notification[];
    getEvent: (id: string) => EventData | undefined;
    createEvent: (event: Omit<EventData, "id" | "registeredUsers" | "waitlist" | "rsvpConfirmed" | "checkedIn">) => void;
    updateEvent: (id: string, updates: Partial<Omit<EventData, "id" | "registeredUsers" | "waitlist" | "rsvpConfirmed" | "checkedIn" | "createdBy">>) => void;
    deleteEvent: (id: string) => void;
    registerForEvent: (eventId: string, userId: string, userName: string, userEmail: string) => void;
    unregisterFromEvent: (eventId: string, userId: string) => void;
    getRegistrationStatus: (eventId: string, userId: string) => RegistrationStatus;
    getWaitlistPosition: (eventId: string, userId: string) => number;
    confirmRsvp: (eventId: string, userId: string) => void;
    cancelRsvp: (eventId: string, userId: string) => void;
    getRsvpStatus: (eventId: string, userId: string) => boolean;
    checkInUser: (eventId: string, userId: string) => "success" | "already" | "not-registered" | "not-found";
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    unreadCount: number;
    checkReminders: (userId: string) => void;
    toggleBookmark: (eventId: string, userId: string) => void;
    isBookmarked: (eventId: string, userId: string) => boolean;
}

export type RegistrationStatus = "available" | "registered" | "waitlisted" | "closed";

// ─── Helpers ────────────────────────────────────────────────────

const EVENTS_KEY = "campushub_events";
const NOTIFS_KEY = "campushub_notifications";
const REMINDERS_KEY = "campushub_sent_reminders";

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function seedToEventData(events: BaseEvent[]): EventData[] {
    return events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        category: e.category,
        department: e.department,
        organizer: e.organizer,
        maxAttendees: e.maxAttendees,
        image: e.image,
        tags: e.tags,
        registeredUsers: [],
        waitlist: [],
        rsvpConfirmed: [],
        checkedIn: [],
        bookmarks: [],
        createdBy: "seed-organizer",
    }));
}

function getStored<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

// Helper to check if user is in an Attendee array
function hasUser(list: Attendee[], userId: string): boolean {
    return list.some((a) => a.userId === userId);
}

function removeUser(list: Attendee[], userId: string): Attendee[] {
    return list.filter((a) => a.userId !== userId);
}

// ─── Context ────────────────────────────────────────────────────

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<EventData[]>(() =>
        getStored<EventData[] | null>(EVENTS_KEY, null) || seedToEventData(seedEvents)
    );
    const [notifications, setNotifications] = useState<Notification[]>(() =>
        getStored<Notification[]>(NOTIFS_KEY, [])
    );

    useEffect(() => { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }, [events]);
    useEffect(() => { localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications)); }, [notifications]);

    const addNotification = (message: string, eventId: string) => {
        const notif: Notification = { id: generateId(), message, eventId, timestamp: new Date().toISOString(), read: false };
        setNotifications((prev) => [notif, ...prev]);
    };

    const getEvent = (id: string) => events.find((e) => e.id === id);

    // ── CRUD ────────────────────────────────────────────────────

    const createEvent = (event: Omit<EventData, "id" | "registeredUsers" | "waitlist" | "rsvpConfirmed" | "checkedIn" | "bookmarks">) => {
        const newEvent: EventData = { ...event, id: generateId(), registeredUsers: [], waitlist: [], rsvpConfirmed: [], checkedIn: [], bookmarks: [] };
        setEvents((prev) => [newEvent, ...prev]);
        toast.success(`Event "${newEvent.title}" created!`);
    };

    const updateEvent = (id: string, updates: Partial<Omit<EventData, "id" | "registeredUsers" | "waitlist" | "rsvpConfirmed" | "checkedIn" | "bookmarks" | "createdBy">>) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
        toast.success("Event updated!");
    };

    const deleteEvent = (id: string) => {
        const ev = events.find((e) => e.id === id);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        if (ev) toast.success(`"${ev.title}" deleted`);
    };

    // ── Registration ────────────────────────────────────────────

    const registerForEvent = (eventId: string, userId: string, userName: string, userEmail: string) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;
                if (hasUser(e.registeredUsers, userId) || hasUser(e.waitlist, userId)) return e;

                const attendee: Attendee = { userId, userName, userEmail, registeredAt: new Date().toISOString() };

                if (e.registeredUsers.length < e.maxAttendees) {
                    toast.success(`Registered for "${e.title}" 🎉`);
                    addNotification(`You registered for "${e.title}" on ${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, e.id);
                    return { ...e, registeredUsers: [...e.registeredUsers, attendee] };
                } else {
                    const pos = e.waitlist.length + 1;
                    toast.info(`"${e.title}" is full — you're #${pos} on the waitlist`);
                    addNotification(`You joined the waitlist (#${pos}) for "${e.title}"`, e.id);
                    return { ...e, waitlist: [...e.waitlist, attendee] };
                }
            })
        );
    };

    const unregisterFromEvent = (eventId: string, userId: string) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;

                if (hasUser(e.waitlist, userId)) {
                    toast.info("Removed from waitlist");
                    return { ...e, waitlist: removeUser(e.waitlist, userId) };
                }

                if (hasUser(e.registeredUsers, userId)) {
                    const newRegistered = removeUser(e.registeredUsers, userId);
                    const newWaitlist = [...e.waitlist];
                    if (newWaitlist.length > 0) {
                        const promoted = newWaitlist.shift()!;
                        newRegistered.push(promoted);
                        addNotification(`A spot opened up! You've been promoted from the waitlist for "${e.title}"`, e.id);
                    }
                    toast.info("Registration cancelled");
                    return { ...e, registeredUsers: newRegistered, waitlist: newWaitlist };
                }
                return e;
            })
        );
    };

    const getRegistrationStatus = (eventId: string, userId: string): RegistrationStatus => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return "closed";
        if (hasUser(event.registeredUsers, userId)) return "registered";
        if (hasUser(event.waitlist, userId)) return "waitlisted";
        if (event.registeredUsers.length >= event.maxAttendees) return "closed";
        return "available";
    };

    const getWaitlistPosition = (eventId: string, userId: string): number => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return -1;
        const idx = event.waitlist.findIndex((a) => a.userId === userId);
        return idx === -1 ? -1 : idx + 1;
    };

    // ── RSVP ──────────────────────────────────────────────────────

    const confirmRsvp = (eventId: string, userId: string) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;
                if (!hasUser(e.registeredUsers, userId)) return e;
                if (e.rsvpConfirmed?.includes(userId)) return e;
                toast.success(`RSVP confirmed for "${e.title}" ✓`);
                addNotification(`You confirmed your RSVP for "${e.title}"`, e.id);
                return { ...e, rsvpConfirmed: [...(e.rsvpConfirmed || []), userId] };
            })
        );
    };

    const cancelRsvp = (eventId: string, userId: string) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;
                toast.info("RSVP cancelled");
                return { ...e, rsvpConfirmed: (e.rsvpConfirmed || []).filter((id) => id !== userId) };
            })
        );
    };

    const getRsvpStatus = (eventId: string, userId: string): boolean => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return false;
        return (event.rsvpConfirmed || []).includes(userId);
    };

    // ── Check-In (QR) ────────────────────────────────────────────

    const checkInUser = (eventId: string, userId: string): "success" | "already" | "not-registered" | "not-found" => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return "not-found";
        if (!hasUser(event.registeredUsers, userId)) return "not-registered";
        if ((event.checkedIn || []).includes(userId)) return "already";

        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;
                return { ...e, checkedIn: [...(e.checkedIn || []), userId] };
            })
        );
        toast.success("Checked in successfully! 🎉");
        return "success";
    };

    // ── Bookmarks ────────────────────────────────────────────────

    const toggleBookmark = (eventId: string, userId: string) => {
        setEvents((prev) =>
            prev.map((e) => {
                if (e.id !== eventId) return e;
                const bookmarks = e.bookmarks || [];
                const isBookmarked = bookmarks.includes(userId);

                if (isBookmarked) {
                    toast.success("Bookmark removed");
                    return { ...e, bookmarks: bookmarks.filter(id => id !== userId) };
                } else {
                    toast.success("Event bookmarked");
                    return { ...e, bookmarks: [...bookmarks, userId] };
                }
            })
        );
    };

    const isBookmarked = (eventId: string, userId: string): boolean => {
        const event = events.find((e) => e.id === eventId);
        return (event?.bookmarks || []).includes(userId);
    };

    // ── Reminders ────────────────────────────────────────────────

    const checkReminders = (userId: string) => {
        if (!userId) return;
        const sentReminders: string[] = getStored<string[]>(REMINDERS_KEY, []);
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        events.forEach((e) => {
            if (!hasUser(e.registeredUsers, userId)) return;
            const eventDate = new Date(e.date);
            const timeDiff = eventDate.getTime() - now.getTime();
            const reminderKey = `${userId}_${e.id}`;

            if (timeDiff > 0 && timeDiff <= oneDayMs && !sentReminders.includes(reminderKey)) {
                addNotification(
                    `⏰ Reminder: "${e.title}" is tomorrow at ${e.time}! Don't forget to attend.`,
                    e.id
                );
                sentReminders.push(reminderKey);
            }
        });

        localStorage.setItem(REMINDERS_KEY, JSON.stringify(sentReminders));
    };

    const markNotificationRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    const clearNotifications = () => setNotifications([]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <EventContext.Provider
            value={{
                events, notifications, getEvent,
                createEvent, updateEvent, deleteEvent,
                registerForEvent, unregisterFromEvent,
                getRegistrationStatus, getWaitlistPosition,
                confirmRsvp, cancelRsvp, getRsvpStatus,
                checkInUser,
                markNotificationRead, clearNotifications, unreadCount,
                checkReminders,
                toggleBookmark,
                isBookmarked,
            }}
        >
            {children}
        </EventContext.Provider>
    );
}

export function useEvents() {
    const ctx = useContext(EventContext);
    if (!ctx) throw new Error("useEvents must be used within EventProvider");
    return ctx;
}
