"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ViddaMark } from "@/components/brand/vidda-mark";
import { DemoControls } from "@/components/demo/demo-controls";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { notifications } from "@/data/seed";
import { demoUsers, getNavigation } from "@/domain/roles";
import type { DemoRole } from "@/domain/types";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const role = useDemoStore((state) => state.role);
  const setRole = useDemoStore((state) => state.setRole);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = demoUsers[role];
  const navigation = getNavigation(role);

  const handleRoleChange = (nextRole: DemoRole) => {
    setRole(nextRole);
    setMobileOpen(false);
    router.push(nextRole === "employee" ? "/portal/home" : "/portal/overview");
    toast.success(`Demo role switched to ${demoUsers[nextRole].jobTitle}`);
  };

  const sidebar = (
    <aside className="flex h-full flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <div className="flex h-20 items-center border-b border-white/10 px-5">
        <ViddaMark inverse />
      </div>
      <div className="border-b border-white/10 px-4 py-4">
        <div className="rounded-xl bg-white/[0.06] p-3">
          <p className="text-xs text-white/50">Current workspace</p>
          <p className="mt-1 text-sm font-bold">NordBank International</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="size-1.5 rounded-full bg-[var(--vidda-accent)]" />
            EU production demo
          </p>
        </div>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === `/portal/${item.slug}`;
          return (
            <Link
              key={item.slug}
              href={`/portal/${item.slug}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/62 hover:bg-white/[0.07] hover:text-white",
                isActive &&
                  "bg-[var(--vidda-accent)] text-[var(--vidda-primary)] hover:bg-[var(--vidda-accent)] hover:text-[var(--vidda-primary)]",
              )}
            >
              <Icon icon={item.icon} className="size-[18px]" />
              {item.label}
              {item.slug === "regulatory-updates" && (
                <span className="ml-auto rounded-full bg-[var(--vidda-warning)] px-1.5 py-0.5 font-mono text-[9px] text-white">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-3">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs text-white/55 hover:bg-white/10 hover:text-white" onClick={() => toast.info("Vidda ecosystem: Index · Consulting · Marketplace · Automation")}>
            <Icon icon="solar:widget-add-linear" />
            Ecosystem
          </Button>
          <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs text-white/55 hover:bg-white/10 hover:text-white" onClick={() => toast.info("Help center opened in demo mode")}>
            <Icon icon="solar:question-circle-linear" />
            Help
          </Button>
        </div>
        <DemoControls />
        <Select value={role} onValueChange={(value) => handleRoleChange(value as DemoRole)}>
          <SelectTrigger className="h-auto border-white/10 bg-white/[0.06] px-2.5 py-2 text-left text-white hover:bg-white/10">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-white/10 text-[11px] text-white">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{user.name}</p>
                <p className="truncate text-[10px] text-white/45">{user.jobTitle}</p>
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(demoUsers) as DemoRole[]).map((roleKey) => (
              <SelectItem key={roleKey} value={roleKey}>
                {demoUsers[roleKey].jobTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">
        {sidebar}
      </div>
      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Icon icon="solar:hamburger-menu-linear" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-none p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-9 flex-1 justify-start gap-2 text-muted-foreground sm:max-w-sm">
                <Icon icon="solar:magnifer-linear" className="size-4" />
                <span className="hidden sm:inline">Search employees, policies, cases…</span>
                <span className="sm:hidden">Search…</span>
                <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] md:inline">⌘K</kbd>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Global search</DialogTitle></DialogHeader>
              <Input autoFocus placeholder="Try “AML Policy” or “Anna Kowalska”" />
              <div className="grid gap-2">
                {["AML & CTF Policy v4.7", "Anna Kowalska · Relationship Manager", "AML Escalation capability"].map((result) => (
                  <Button key={result} variant="ghost" className="justify-start" onClick={() => toast.info(`${result} opened in demo preview`)}>
                    <Icon icon="solar:magnifer-linear" className="mr-2 size-4" />
                    {result}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <div className="ml-auto hidden items-center gap-2 xl:flex">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              AI grounded
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              <Icon icon="solar:refresh-circle-linear" />
              3 updates
            </span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Icon icon="solar:bell-linear" className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--vidda-danger)] ring-2 ring-white" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] p-0">
              <div className="border-b p-4"><p className="font-bold">Notifications</p><p className="text-xs text-muted-foreground">3 items require attention</p></div>
              {notifications.map((notification) => (
                <button key={notification.id} className="flex w-full gap-3 border-b p-4 text-left hover:bg-muted/60" onClick={() => toast.info(notification.title)}>
                  <span className={cn("mt-1 size-2 rounded-full", notification.level === "critical" ? "bg-red-500" : notification.level === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                  <span><span className="block text-sm font-bold">{notification.title}</span><span className="block text-xs text-muted-foreground">{notification.detail} · {notification.time}</span></span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Avatar className="size-9 border">
            <AvatarFallback className="bg-[var(--vidda-primary)] text-xs text-white">{user.initials}</AvatarFallback>
          </Avatar>
        </header>
        <main className="mx-auto w-full max-w-[1540px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
