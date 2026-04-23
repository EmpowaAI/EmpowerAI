import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "cta" | "outlineLight";
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  ghost: "text-primary hover:bg-primary/10",
  cta: "bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-cta hover:brightness-105 hover:-translate-y-0.5 transition-smooth font-semibold",
  outlineLight:
    "border-2 border-white/90 bg-transparent text-white hover:bg-white/10 backdrop-blur-sm font-semibold",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-12 rounded-md px-8 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, type, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      variantClasses[variant],
      sizeClasses[size],
      className
    );
    if (asChild) {
      return <Slot className={classes} ref={ref} {...props} />;
    }
    return <button type={type ?? "button"} className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
