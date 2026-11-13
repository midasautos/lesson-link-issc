import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABEL, ZONE_STYLE } from "@/lib/severity";
import { cn } from "@/lib/utils";
import type { IncidentStatus, Severity, ZoneLevel } from "@/types";

const SEVERITY_CLASS: Record<Severity, string> = {
    critical: "bg-red-500 text-white",
    major: "bg-amber-400 text-amber-950",
    moderate: "bg-yellow-400 text-yellow-800",
    minor: "bg-emerald-400 text-emerald-950",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
    return (
        <Badge
            variant="outline"
            className={cn("min-w-16 justify-center border-transparent", SEVERITY_CLASS[severity])}
        >
            {SEVERITY_LABEL[severity]}
        </Badge>
    );
}

const STATUS: Record<IncidentStatus, { label: string; className: string }> = {
    in_progress: { label: "In Progress", className: "border-amber-200 bg-amber-100 text-amber-800" },
    under_review: { label: "Under Review", className: "border-sky-200 bg-sky-100 text-sky-800" },
    resolved: { label: "Resolved", className: "border-emerald-200 bg-emerald-100 text-emerald-800" },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
    const s = STATUS[status];
    return (
        <Badge variant="outline" className={cn("min-w-24 justify-center", s.className)}>
        {s.label}
        </Badge>
    );
}

const ZONE_CLASS: Record<ZoneLevel, string> = {
    critical: "border-transparent bg-red-500 text-white",
    moderate: "border-sky-200 bg-sky-100 text-sky-800",
};

export function ZoneLevelBadge({ level }: { level: ZoneLevel }) {
    return <Badge variant="outline" className={ZONE_CLASS[level]}>{ZONE_STYLE[level].label}</Badge>;
}