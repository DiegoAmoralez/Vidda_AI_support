"use client";

import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider delayDuration={250}>
    {children}
    <Toaster
      position="top-right"
      toastOptions={{
        className: "font-sans",
        duration: 3200,
      }}
    />
  </TooltipProvider>
);
