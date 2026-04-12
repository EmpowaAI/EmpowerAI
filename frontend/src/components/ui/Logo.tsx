// components/Logo.tsx
import { Link } from "react-router-dom"

import logoImg from "../../assets/images/empowerLogo.jpeg"

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  linkTo?: string;
  className?: string;
}

export default function Logo({ 
  variant = "default", 
  size = "md", 
  linkTo = "/",
  className = ""
}: LogoProps) {
  const sizeClasses = {
    sm: "h-9 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto",
    xl: "h-20 w-auto",
    "2xl": "h-24 w-auto",
    full: "w-full h-full", // This will make it fill the entire container
  };

  const textClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
    full: "text-6xl",
  };

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoImg}
        alt="EmpowaAI logo"
        className={`${sizeClasses[size]} crisp-image shrink-0 object-contain`}
        style={{ 
          imageRendering: "auto",
          objectFit: size === "full" ? "cover" : "contain"
        }}
      />
      <span
        className={`font-bold tracking-tight ${textClasses[size]} ${
          variant === "light" 
            ? "text-primary-foreground panel-copy-shadow" 
            : "text-foreground"
        }`}
      >
        {/* Text content if needed */}
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}