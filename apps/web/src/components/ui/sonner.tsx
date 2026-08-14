"use client";

import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast: "bg-card border-border text-foreground",
        },
      }}
    />
  );
}

export { Toaster };
