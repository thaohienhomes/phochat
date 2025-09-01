"use client";

import * as React from "react";

type ToastItem = {
  id: string;
  message: string;
  variant?: "default" | "success" | "error";
  duration?: number; // ms
};

const ToastContext = React.createContext<{
  push: (t: Omit<ToastItem, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: ToastItem = {
      id,
      duration: 1800,
      variant: "default",
      ...t,
    };
    setItems((prev) => [...prev, item]);
    const timeout = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, item.duration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <Toaster items={items} onClose={(id) => setItems((prev) => prev.filter((x) => x.id !== id))} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    push: ctx.push,
    success: (message: string, duration = 1800) => ctx.push({ message, duration, variant: "success" }),
    error: (message: string, duration = 2200) => ctx.push({ message, duration, variant: "error" }),
  };
}

export function Toaster({ items, onClose }: { items: ToastItem[]; onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto rounded-md border shadow-md px-3 py-2 text-sm bg-background/95 backdrop-blur " +
            (t.variant === "success"
              ? "border-green-600/30 text-green-900 dark:text-green-200"
              : t.variant === "error"
              ? "border-red-600/30 text-red-900 dark:text-red-200"
              : "border-border text-foreground")
          }
          role="status"
        >
          <div className="flex items-center justify-between gap-3">
            <span>{t.message}</span>
            <button
              onClick={() => onClose(t.id)}
              className="rounded px-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

