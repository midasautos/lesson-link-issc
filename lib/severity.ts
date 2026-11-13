import type { Severity, ZoneLevel } from "@/types";

export const SEVERITY_COLORS: Record<Severity, string> = {
    critical: "#ef4444",
    major: "#f59e0b",
    minor: "#22c55e",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
    critical: "Critical",
    major: "Major",
    minor: "Minor",
};

export const ZONE_STYLE: Record<
    ZoneLevel,
    { color: string; label: string; hint: string }
> = {
    critical: {
        color: "#ef4444",
        label: "Critical",
        hint: "Contains key assets (production lines, tank farm, utilities, etc.)",
    },
    moderate: {
        color: "#0ea5e9",
        label: "Moderate",
        hint: "Regular area with no key assets (offices, walkways, parking, etc.)",
    },
};
