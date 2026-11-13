import Link from "next/link";
import {
    ArrowRight,
    FileText,
    Map as MapIcon,
    Settings,
    TriangleAlert,
    Zap,
    type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Action {
    title: string;
    description: string;
    icon: LucideIcon;
    /** kosong = fitur belum dibuat */
    href?: string;
}

const ACTIONS: Action[] = [
    {
        title: "Report Incident",
        description: "Create a new incident report",
        icon: TriangleAlert,
    },
    {
        title: "View Full Map",
        description: "Explore all areas and incidents",
        icon: MapIcon,
    },
    {
        title: "Generate Report",
        description: "Download safety reports",
        icon: FileText,
    },
    {
        title: "System Settings",
        description: "Manage preferences and alerts",
        icon: Settings,
        href: "/settings/site",
    },
];

const tileClass =
    "group flex flex-col rounded-xl border bg-white p-4 text-left transition hover:border-primary/40 hover:bg-accent/60 hover:shadow-sm";

function Tile({ title, description, icon: Icon }: Action) {
    return (
        <>
        <div className="flex items-start justify-between">
            <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
        </>
    );
}

export function QuickActionsCard() {
    return (
        <Card>
            <CardHeader className="p-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2">
                {ACTIONS.map((a) =>
                    a.href ? (
                        <Link key={a.title} href={a.href} className={tileClass}>
                            <Tile {...a} />
                        </Link>
                    ) : (
                        <button
                            key={a.title}
                            type="button"
                            title="Coming soon"
                            className={tileClass}
                        >
                            <Tile {...a} />
                        </button>
                    ),
                )}
            </CardContent>
        </Card>
    );
}
