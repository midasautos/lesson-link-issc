"use client";

import { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayIncidents, trendHistory } from "@/data/dummy";
import { useMounted } from "@/hooks/use-mounted";
import { SEVERITY_COLORS } from "@/lib/severity";
import { buildTrend } from "@/lib/stats";

const LEGEND = [
    { key: "minor", label: "Minor" },
    { key: "major", label: "Major" },
    { key: "critical", label: "Critical" },
] as const;

export function TrendCard() {
    const mounted = useMounted();
    const data = useMemo(
        () => (mounted ? buildTrend(todayIncidents, trendHistory, new Date()) : []),
        [mounted],
    );

    return (
        <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Incident Trend
            <span className="text-xs font-normal text-muted-foreground">
                (Last 7 Days)
            </span>
            </CardTitle>

            <div className="flex items-center gap-3 text-xs">
            {LEGEND.map((l) => (
                <span key={l.key} className="flex items-center gap-1.5">
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SEVERITY_COLORS[l.key] }}
                />
                {l.label}
                </span>
            ))}
            </div>
        </CardHeader>

        <CardContent className="h-56 p-4 pt-2">
            {mounted && (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                />
                <YAxis
                    domain={[0, 20]}
                    ticks={[0, 5, 10, 15, 20]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                />
                <Tooltip cursor={{ fill: "rgba(14,165,233,0.08)" }} />
                <Bar dataKey="minor" stackId="s" fill={SEVERITY_COLORS.minor} maxBarSize={36} />
                <Bar dataKey="major" stackId="s" fill={SEVERITY_COLORS.major} maxBarSize={36} />
                <Bar
                    dataKey="critical"
                    stackId="s"
                    fill={SEVERITY_COLORS.critical}
                    maxBarSize={36}
                    radius={[3, 3, 0, 0]}
                />
                </BarChart>
            </ResponsiveContainer>
            )}
        </CardContent>
        </Card>
    );
}
