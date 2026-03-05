"use client";

import { useState, useEffect, useCallback } from "react";
import { SA_LANGUAGES, translations, type SALanguage } from "../lib/sa-languages";

const ROTATION_INTERVAL = 5000; // 5 seconds

export function useLanguageRotation() {
  const [langIndex, setLangIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % SA_LANGUAGES.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const currentLanguage: SALanguage = SA_LANGUAGES[langIndex];

  const t = useCallback(
    (key: string): string => {
      const phrase = translations[key];
      if (!phrase) return key;
      return phrase[currentLanguage] ?? phrase.isiZulu;
    },
    [currentLanguage]
  );

  return { t, currentLanguage, langIndex };
}
