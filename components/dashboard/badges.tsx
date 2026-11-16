"use client";

import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABEL, ZONE_STYLE } from "@/lib/severity";
import { cn } from "@/lib/utils";
import { useSystemSettings } from "@/lib/settings-store";
import type { IncidentStatus, Severity, ZoneLevel } from "@/types";

const SEVERITY_CLASS: Record<Severity, string> = {
    catastrophic: "bg-red-600 text-white",
    major: "bg-amber-500 text-white",
    moderate: "bg-yellow-400 text-yellow-950",
    minor: "bg-emerald-500 text-white",
    insignificant: "bg-slate-500 text-white",
};

export function SeverityBadge({
    severity,
    customLabel,
    customColor,
    className,
}: {
    severity: Severity;
    customLabel?: string;
    customColor?: string;
    className?: string;
}) {
    const { settings } = useSystemSettings();
    const config = settings.severityConfigs?.[severity];

    const label = customLabel ?? config?.label ?? SEVERITY_LABEL[severity] ?? severity;
    const color = customColor ?? config?.color;

    return (
        <Badge
            variant="outline"
            className={cn(
                "min-w-16 justify-center border-transparent font-semibold shadow-xs",
                !color && SEVERITY_CLASS[severity],
                className,
            )}
            style={color ? { backgroundColor: color, color: "#ffffff" } : undefined}
        >
            {label}
        </Badge>
    );
}

const STATUS: Record<IncidentStatus, { label: string; className: string }> = {
    under_review: { label: "On Review", className: "border-sky-300 bg-sky-100 text-sky-800 font-medium dark:bg-sky-950 dark:text-sky-300" },
    in_progress: { label: "In Progress", className: "border-amber-300 bg-amber-100 text-amber-800 font-medium dark:bg-amber-950 dark:text-amber-300" },
    resolved: { label: "Resolved", className: "border-emerald-300 bg-emerald-100 text-emerald-800 font-medium dark:bg-emerald-950 dark:text-emerald-300" },
};

export function StatusBadge({ status, className }: { status: IncidentStatus; className?: string }) {
    const s = STATUS[status] ?? STATUS.under_review;
    return (
        <Badge variant="outline" className={cn("min-w-24 justify-center py-0.5", s.className, className)}>
            {s.label}
        </Badge>
    );
}

const ZONE_CLASS: Record<ZoneLevel, string> = {
    high: "border-transparent bg-red-500 text-white",
    moderate: "border-transparent bg-yellow-500 text-slate-950",
    low: "border-transparent bg-emerald-500 text-white",
};

export function ZoneLevelBadge({ level }: { level: ZoneLevel }) {
    const style = ZONE_STYLE[level] ?? ZONE_STYLE.low;
    return <Badge variant="outline" className={ZONE_CLASS[level] ?? ZONE_CLASS.low}>{style.label}</Badge>;
}
