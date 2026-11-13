import { SEVERITY_COLORS, SEVERITY_LABEL } from "@/lib/severity";
import type { Incident, Severity, TrendPoint } from "@/types";

const ORDER: Severity[] = ["critical", "major", "minor"];

export function summarize(incidents: Incident[]) {
    const total = incidents.length;
    return ORDER.map((severity) => {
        const count = incidents.filter((i) => i.severity === severity).length;
        return {
            severity,
            label: SEVERITY_LABEL[severity],
            color: SEVERITY_COLORS[severity],
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
    const todayCounts = {
        daysAgo: 0,
        minor: incidents.filter((i) => i.severity === "minor").length,
        major: incidents.filter((i) => i.severity === "major").length,
        critical: incidents.filter((i) => i.severity === "critical").length,
    };

    return [...history, todayCounts]
        .sort((a, b) => b.daysAgo - a.daysAgo)
        .map((p) => ({
            label: dayLabel.format(new Date(now.getTime() - p.daysAgo * 86_400_000)),
            minor: p.minor,
            major: p.major,
            critical: p.critical,
        }));
}
