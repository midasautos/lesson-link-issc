import { SEVERITY_COLORS, SEVERITY_LABEL } from "@/lib/severity";
import type { Incident, Severity, TrendPoint } from "@/types";

const ORDER: Severity[] = ["catastrophic", "major", "moderate", "minor", "insignificant"];

export function summarize(incidents: Incident[]) {
    const total = incidents.length;
    return ORDER.map((severity) => {
        const count = incidents.filter((i) => i.severity === severity).length;
        return {
            severity,
            label: SEVERITY_LABEL[severity] || severity,
            color: SEVERITY_COLORS[severity] || "#94a3b8",
            count,
            pct: total ? (count / total) * 100 : 0,
        };
    });
}

const dayLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Jakarta",
});

export function buildTrend(
    incidents: Incident[],
    history: TrendPoint[],
    now: Date,
) {
    const todayCounts: TrendPoint = {
        daysAgo: 0,
        insignificant: incidents.filter((i) => i.severity === "insignificant").length,
        minor: incidents.filter((i) => i.severity === "minor").length,
        moderate: incidents.filter((i) => i.severity === "moderate").length,
        major: incidents.filter((i) => i.severity === "major").length,
        catastrophic: incidents.filter((i) => i.severity === "catastrophic").length,
    };

    return [...history, todayCounts]
        .sort((a, b) => b.daysAgo - a.daysAgo)
        .map((p) => ({
            label: dayLabel.format(new Date(now.getTime() - p.daysAgo * 86_400_000)),
            insignificant: p.insignificant,
            minor: p.minor,
            moderate: p.moderate,
            major: p.major,
            catastrophic: p.catastrophic,
        }));
}
