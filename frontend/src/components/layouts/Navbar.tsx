// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, Brain, FileText, MessageSquare, Briefcase, 
  User, Menu, X, Sparkles, Lock, ArrowRight 
} from "lucide-react";
import { cn } from "../../lib/utils";
import Logo from "../ui/Logo";
import { useUser } from "../../contexts/user-context";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, progress } = useUser();
  
  // Local state for profile image as fallback
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);

  // Load from localStorage directly as fallback
  useEffect(() => {
    const savedImage = localStorage.getItem('profile_image');
    if (savedImage) {
      setLocalProfileImage(savedImage);
    }
  }, []);

  // Debug logs
  console.log("Navbar - user?.profileImage:", user?.profileImage);
  console.log("Navbar - localProfileImage:", localProfileImage);
  console.log("Navbar - full user:", user);

  const getNavItems = () => {
    return [
      { 
        path: "/dashboard", 
        label: "Dashboard", 
        icon: Home, 
        always: true 
      },
      { 
        path: "/dashboard/cv-analyzer", 
        label: "CV Analyzer", 
        icon: FileText, 
        always: true,
        tooltip: "Start here - Analyze your CV"
      },
      { 
        path: "/dashboard/twin", 
        label: "Digital Twin", 
        icon: Brain, 
        disabled: !progress.cvCompleted,
        tooltip: progress.cvCompleted ? "Build your AI twin" : "Complete CV Analyzer first"
      },
      { 
        path: "/dashboard/interview-coach", 
        label: "Interview Coach", 
        icon: MessageSquare, 
        disabled: !progress.twinCompleted,
        tooltip: progress.twinCompleted ? "Practice interviews" : "Build your Digital Twin first"
      },
      { 
        path: "/dashboard/opportunities", 
        label: "Opportunities", 
        icon: Briefcase, 
        disabled: !progress.twinCompleted,
        tooltip: progress.twinCompleted ? "Find matched opportunities" : "Build your Digital Twin first"
      },
    ];
  };

  const navItems = getNavItems();
  
  // Get the profile image from multiple sources
  const profileImageSource = user?.profileImage || localProfileImage;
  
  // Get initials for fallback
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" linkTo="/dashboard" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              if (item.disabled) {
                return (
                  <div
                    key={item.path}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed flex items-center gap-2"
                    title={item.tooltip}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <Lock className="h-3 w-3" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    "hover:text-[var(--secondary)] group",
                    isActive ? "text-[var(--secondary)]" : "text-muted-foreground"
                  )}
                  title={item.tooltip}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-[var(--secondary)]/10 rounded-xl border border-[var(--secondary)]/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Next step indicator */}
            {!progress.twinCompleted && (
              <Link
                to={!progress.cvCompleted ? "/dashboard/cv-analyzer" : "/dashboard/twin"}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 hover:bg-[var(--secondary)]/20 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-[var(--secondary)]" />
                <span className="text-xs font-medium text-[var(--secondary)]">
                  {!progress.cvCompleted ? "Start CV Analysis" : "Build Digital Twin"}
                </span>
                <ArrowRight className="h-3 w-3 text-[var(--secondary)]" />
              </Link>
            )}

            {/* Profile Link with Image - FIXED VERSION */}
            <Link
              to="/profile"
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-[var(--secondary)]/10 transition-colors border border-border overflow-hidden"
            >
              {profileImageSource ? (
                <img 
                  src={profileImageSource} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load profile image");
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {initials}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-[var(--secondary)]/10 transition-colors border border-border"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground opacity-50 cursor-not-allowed"
                      title={item.tooltip}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium flex-1">{item.label}</span>
                      <Lock className="h-4 w-4" />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-[var(--secondary)]/10 text-[var(--secondary)] border border-[var(--secondary)]/20"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}