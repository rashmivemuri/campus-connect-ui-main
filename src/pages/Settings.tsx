import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const role = user?.role || "student";

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    const handleSaveProfile = () => {
        if (!name.trim()) { toast.error("Name is required"); return; }
        if (!email.trim()) { toast.error("Email is required"); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { toast.error("Please enter a valid email address"); return; }

        const success = updateProfile({ name: name.trim(), email: email.trim() });
        if (success) {
            // toast already fires inside updateProfile
        }
    };

    const handleChangePassword = () => {
        if (!currentPw) { toast.error("Enter your current password"); return; }
        if (!newPw) { toast.error("Enter a new password"); return; }
        if (newPw.length < 4) { toast.error("Password must be at least 4 characters"); return; }
        if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }

        // Verify current password
        const users = JSON.parse(localStorage.getItem("campushub_users") || "[]");
        const found = users.find((u: any) => u.id === user?.id);
        if (!found || found.password !== currentPw) {
            toast.error("Current password is incorrect");
            return;
        }

        const success = updateProfile({ password: newPw });
        if (success) {
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        }
    };

    return (
        <DashboardLayout role={role}>
            <div className="max-w-2xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
                </motion.div>

                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-lg border border-border bg-card shadow-card p-6 space-y-5"
                >
                    <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-accent" /> Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="settings-name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="settings-name" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="settings-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="settings-email" type="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={role.charAt(0).toUpperCase() + role.slice(1)} disabled className="bg-muted" />
                        </div>
                    </div>

                    <Button className="gradient-accent text-accent-foreground border-0 font-semibold" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" /> Save Profile
                    </Button>
                </motion.div>

                {/* Password Section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-lg border border-border bg-card shadow-card p-6 space-y-5"
                >
                    <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                        <Lock className="h-5 w-5 text-accent" /> Change Password
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-pw">Current Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="current-pw" type="password" className="pl-9" placeholder="••••••••" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-pw">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="new-pw" type="password" className="pl-9" placeholder="••••••••" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-pw">Confirm New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="confirm-pw" type="password" className="pl-9" placeholder="••••••••" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" className="font-semibold" onClick={handleChangePassword}>
                        <Lock className="h-4 w-4 mr-2" /> Update Password
                    </Button>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
