"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    FileText,
    LayoutDashboard,
    Map as MapIcon,
    Settings,
    TriangleAlert,
    X,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    soon?: boolean;
}

const NAV: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Incidents", href: "/incidents", icon: TriangleAlert },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Map", href: "/map", icon: MapIcon },
    { label: "Manual Book", href: "/manual-book", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
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
                        onClick={onNavigate}
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
    );
}

function StatusBadge() {
    return (
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
    );
}

/** Desktop sidebar — always visible on lg+ */
export function Sidebar() {
    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col justify-between border-r bg-white/70 p-4 lg:flex dark:bg-slate-950/70">
            <NavLinks />
            <StatusBadge />
        </aside>
    );
}

/** Mobile drawer sidebar — rendered as overlay */
export function MobileSidebar({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white p-4 shadow-2xl dark:bg-slate-950 lg:hidden animate-in slide-in-from-left duration-200">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">
                        Menu
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col justify-between overflow-y-auto">
                    <NavLinks onNavigate={onClose} />
                    <div className="mt-4">
                        <StatusBadge />
                    </div>
                </div>
            </div>
        </>
    );
}
