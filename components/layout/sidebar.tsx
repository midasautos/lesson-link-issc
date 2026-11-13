"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText,
    LayoutDashboard,
    Map as MapIcon,
    Settings,
    TriangleAlert,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    /** halaman belum dibuat → tampil disabled */
    soon?: boolean;
}

const NAV: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Incidents", href: "/incidents", icon: TriangleAlert, soon: true },
    { label: "Map", href: "/map", icon: MapIcon, soon: true },
    { label: "Reports", href: "/reports", icon: FileText, soon: true },
    { label: "Settings", href: "/settings/site", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col justify-between border-r bg-white/70 p-4 lg:flex">
            <nav className="space-y-1">
                {NAV.map(({ label, href, icon: Icon, soon }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

                if (soon) {
                        return (
                            <div
                                key={label}
                                aria-disabled="true"
                                title="Coming soon"
                                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground/60"
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                    Soon
                                </span>
                            </div>
                        );
                    }

                    return (
                        <Link
                        key={label}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                            active
                            ? "bg-primary text-primary-foreground shadow"
                            : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                        )}
                        >
                        <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex items-center gap-3 rounded-lg bg-accent px-3 py-3">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                <div className="leading-tight">
                    <div className="text-xs font-semibold">System Online</div>
                    <div className="text-[11px] text-muted-foreground">
                        All systems operational
                    </div>
                </div>
            </div>
        </aside>
    );
}
