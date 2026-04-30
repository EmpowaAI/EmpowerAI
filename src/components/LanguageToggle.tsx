import { useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGS = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "af", label: "Afrikaans" },
  { code: "st", label: "Sesotho" },
];

const STORAGE = "empowai-lang";

export const LanguageToggle = () => {
  const [lang, setLang] = useState(() =>
    typeof window === "undefined" ? "en" : localStorage.getItem(STORAGE) || "en"
  );

  const choose = (code: string) => {
    setLang(code);
    localStorage.setItem(STORAGE, code);
    document.documentElement.lang = code;
  };

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold uppercase">
          <Languages className="h-4 w-4" />
          {current.code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => choose(l.code)}
            className={l.code === lang ? "font-semibold text-primary" : ""}
          >
            <span className="mr-2 text-[10px] font-bold uppercase opacity-60">{l.code}</span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
