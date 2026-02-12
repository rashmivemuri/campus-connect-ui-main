import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "student" | "organizer";
}

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: "student" | "organizer";
}

interface AuthContextValue {
    user: SessionUser | null;
    isAuthenticated: boolean;
    signup: (name: string, email: string, password: string, role: "student" | "organizer") => boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    updateProfile: (updates: { name?: string; email?: string; password?: string }) => boolean;
}

// ─── Helpers ────────────────────────────────────────────────────

const USERS_KEY = "campushub_users";
const SESSION_KEY = "campushub_session";

function getStoredUsers(): AuthUser[] {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveUsers(users: AuthUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredSession(): SessionUser | null {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
        return null;
    }
}

function saveSession(user: SessionUser | null) {
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Context ────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(getStoredSession);

    // Keep localStorage in sync
    useEffect(() => {
        saveSession(user);
    }, [user]);

    const signup = (name: string, email: string, password: string, role: "student" | "organizer"): boolean => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("All fields are required");
            return false;
        }

        const users = getStoredUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            toast.error("An account with this email already exists");
            return false;
        }

        const newUser: AuthUser = { id: generateId(), name: name.trim(), email: email.trim().toLowerCase(), password, role };
        saveUsers([...users, newUser]);

        const session: SessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        setUser(session);
        toast.success(`Welcome to CampusHub, ${newUser.name}!`);
        return true;
    };

    const login = (email: string, password: string): boolean => {
        if (!email.trim() || !password.trim()) {
            toast.error("Email and password are required");
            return false;
        }

        const users = getStoredUsers();
        const found = users.find(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );

        if (!found) {
            toast.error("Invalid email or password. Please sign up first.");
            return false;
        }

        const session: SessionUser = { id: found.id, name: found.name, email: found.email, role: found.role };
        setUser(session);
        toast.success(`Welcome back, ${found.name}!`);
        return true;
    };

    const logout = () => {
        setUser(null);
        toast.info("You have been logged out");
    };

    const updateProfile = (updates: { name?: string; email?: string; password?: string }): boolean => {
        if (!user) return false;

        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx === -1) return false;

        // Check email uniqueness if changing email
        if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
            if (users.some((u) => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== user.id)) {
                toast.error("This email is already taken");
                return false;
            }
        }

        const updated = { ...users[idx] };
        if (updates.name?.trim()) updated.name = updates.name.trim();
        if (updates.email?.trim()) updated.email = updates.email.trim().toLowerCase();
        if (updates.password?.trim()) updated.password = updates.password.trim();
        users[idx] = updated;
        saveUsers(users);

        const session: SessionUser = { id: updated.id, name: updated.name, email: updated.email, role: updated.role };
        setUser(session);
        toast.success("Profile updated successfully");
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
