"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays, ChevronDown } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { currentUser } from "@/data/dummy";

const TZ = "Asia/Jakarta";

function formatDate(d: Date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: TZ,
    }).formatToParts(d);

    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}

function formatTime(d: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TZ,
    }).format(d);
}

export function Topbar() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const t = setInterval(() => setNow(new Date()), 15_000);
        return () => clearInterval(t);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur lg:px-6">
            <BrandLogo />

            <div className="flex items-center gap-4 sm:gap-6">
                <div className="hidden items-center gap-2.5 text-right sm:flex">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div className="leading-tight">
                        <div className="text-xs text-muted-foreground">
                            {now ? formatDate(now) : " "}
                        </div>
                        <div className="text-sm font-bold">
                            {now ? formatTime(now) : "--:--"}{" "}
                            <span className="text-[10px] font-medium text-muted-foreground">
                                (WIB)
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    aria-label={`${currentUser.unreadNotifications} notifications`}
                    className="relative rounded-full p-2 text-primary transition-colors hover:bg-accent"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {currentUser.unreadNotifications}
                    </span>
                </button>

                <div className="flex items-center gap-3 border-l pl-4 sm:pl-6">
                    <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-primary/30 bg-accent text-sm font-bold text-primary">
                        {currentUser.initials}
                    </div>
                    <div className="hidden leading-tight sm:block">
                        <div className="text-sm font-semibold">{currentUser.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {currentUser.role}
                        </div>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </div>
            </div>
        </header>
    );
}
