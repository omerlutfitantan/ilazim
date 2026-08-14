"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster"
      toastOptions={{
        classNames: {
          toast: "bg-card border-border text-foreground",
        },
      }}
    />
  );
}

export { Toaster };
