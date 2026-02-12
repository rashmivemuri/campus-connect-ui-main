import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import heroCampus from "@/assets/hero-campus.jpg";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"student" | "organizer">("student");

  // If already logged in, redirect
  if (auth.isAuthenticated) {
    navigate(auth.user!.role === "student" ? "/student" : "/organizer", { replace: true });
    return null;
  }

  const handleLogin = () => {
    const success = auth.login(loginEmail, loginPassword);
    if (success) {
      // auth.user will be set after re-render; get role from stored users
      const users = JSON.parse(localStorage.getItem("campushub_users") || "[]");
      const found = users.find((u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
      navigate(found?.role === "organizer" ? "/organizer" : "/student");
    }
  };

  const handleSignup = () => {
    const success = auth.signup(signupName, signupEmail, signupPassword, signupRole);
    if (success) {
      navigate(signupRole === "student" ? "/student" : "/organizer");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroCampus} alt="Campus event" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GraduationCap className="h-12 w-12 text-accent mb-4" />
            <h1 className="font-display text-4xl font-bold mb-3">CampusHub</h1>
            <p className="text-lg opacity-90 max-w-md">
              Discover, organize, and attend campus events. Your one-stop platform for everything happening on campus.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="font-display text-2xl font-bold">CampusHub</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* ── Login Tab ── */}
            <TabsContent value="login">
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">Welcome back</h2>
                  <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="you@university.edu" className="pl-9" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-9" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </div>
                  </div>
                </div>
                <Button className="w-full gradient-accent text-accent-foreground border-0 h-11 font-semibold" onClick={handleLogin}>
                  Log In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account? Switch to the <strong>Sign Up</strong> tab above.
                </p>
              </div>
            </TabsContent>

            {/* ── Signup Tab ── */}
            <TabsContent value="signup">
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">Create account</h2>
                  <p className="text-sm text-muted-foreground">Join CampusHub to discover and manage events</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" placeholder="Alex Chen" className="pl-9" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="you@university.edu" className="pl-9" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="••••••••" className="pl-9" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">Min 6 characters, 1 uppercase letter, 1 number</p>
                  </div>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setSignupRole("student")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${signupRole === "student" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>
                        🎓 Student
                      </button>
                      <button type="button" onClick={() => setSignupRole("organizer")}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${signupRole === "organizer" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>
                        📋 Organizer
                      </button>
                    </div>
                  </div>
                </div>
                <Button className="w-full gradient-accent text-accent-foreground border-0 h-11 font-semibold" onClick={handleSignup}>
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
