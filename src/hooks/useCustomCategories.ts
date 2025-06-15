
import { useState, useEffect } from "react";

// Sanitiza inputs de categoria (máx. 50, somente caracteres permitidos)
function sanitizeCategory(str: string): string {
  return str.trim().replace(/[^\w À-ÿ',.-]/g, '').slice(0, 50);
}

// Lê array seguro do localStorage
function getStoredCustom(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const item = window.localStorage.getItem(key);
    const arr = Array.isArray(JSON.parse(item ?? "")) ? JSON.parse(item ?? "") : [];
    return arr.filter((v: any) =>
      typeof v === "string" && v.length > 0 && v.length <= 50 && /^[\w À-ÿ',.-]+$/.test(v)
    );
  } catch {
    return [];
  }
}

export function useCustomCategories(key: string, base: string[] = []) {
  const [categories, setCategories] = useState<string[]>(() => [
    ...base,
    ...getStoredCustom(key)
  ]);
  useEffect(() => {
    const customs = categories.filter(c => !base.includes(c));
    window.localStorage.setItem(key, JSON.stringify(customs.map(sanitizeCategory)));
  }, [categories, key, base]);
  
  const addCategory = (cat: string) => {
    const sanitized = sanitizeCategory(cat);
    if (!sanitized) return;
    setCategories(prev =>
      prev.includes(sanitized) ? prev : [...prev, sanitized]
    );
  };

  return {
    categories,
    addCategory,
    setCategories: (next: string[]) => setCategories(next.map(sanitizeCategory)),
    sanitize: sanitizeCategory,
  }
}
