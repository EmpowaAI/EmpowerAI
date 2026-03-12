// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Brain, FileText, MessageSquare, Briefcase, User, Menu, X, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import Logo from "../ui/Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/dashboard/twin", label: "Digital Twin", icon: Brain },
    { path: "/dashboard/cv-analyzer", label: "CV Analyzer", icon: FileText },
    { path: "/dashboard/interview-coach", label: "Interview Coach", icon: MessageSquare },
    { path: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
  ];

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
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    "hover:text-[var(--sa-gold)] group",
                    isActive ? "text-[var(--sa-gold)]" : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-[var(--sa-gold)]/10 rounded-xl border border-[var(--sa-gold)]/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--sa-gold)]/10 border border-[var(--sa-gold)]/20">
                <Sparkles className="h-4 w-4 text-[var(--sa-gold)]" />
                <span className="text-xs font-medium text-[var(--sa-gold)]">AI Active</span>
              </div>
            </div>

            <Link
              to="/profile"
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-[var(--sa-gold)]/10 transition-colors border border-border"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-[var(--sa-gold)]/10 transition-colors border border-border"
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
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive 
                        ? "bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] border border-[var(--sa-gold)]/20" 
                        : "text-muted-foreground hover:bg-muted"
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
