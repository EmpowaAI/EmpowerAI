import { useEffect, useState } from "react";
import logo from "/empowerLogo.jpg";

const AppPreloader = () => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const minShowTimer = window.setTimeout(() => setLeaving(true), 900);
    const removeTimer = window.setTimeout(() => setVisible(false), 1250);

    return () => {
      window.clearTimeout(minShowTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      aria-label="Loading EmpowAI"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo with spinning ring */}
      <div className="relative mb-8">
        {/* Spinning ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
        </div>
        
        {/* Logo in center */}
        <div className="relative h-16 w-16 flex items-center justify-center">
          <img 
            src={logo} 
            alt="EmpowAI logo"
            className="h-12 w-12 rounded-md object-cover"
          />
        </div>
      </div>

      {/* Brand text */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-primary">
          EmpowAI
        </h1>
        <p className="text-sm text-muted-foreground">
          Preparing your career intelligence
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;
