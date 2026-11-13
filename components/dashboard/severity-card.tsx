"use client";

import { 
    Cell, 
    Pie, 
    PieChart, 
    ResponsiveContainer, 
    Tooltip 
} from "recharts";
import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayIncidents } from "@/data/dummy";
import { summarize } from "@/lib/stats";

export function SeverityCard() {
    const data = summarize(todayIncidents);
    const total = todayIncidents.length;

    return (
        <Card>
            <CardHeader className="p-4 pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-5 w-5 text-primary" />
                    Incident Severity Today
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6 p-5 sm:flex-row">
                <div className="relative h-48 w-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                outerRadius={92}
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                            >
                                {data.map((d) => (
                                    <Cell key={d.severity} fill={d.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                        <div className="text-4xl font-bold leading-none">{total}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                        Total Incidents
                        </div>
                    </div>
                </div>

                <ul className="w-full flex-1 divide-y">
                    {data.map((d) => (
                        <li
                            key={d.severity}
                            className="flex items-center gap-3 py-3 text-sm"
                        >
                            <span
                                className="h-3.5 w-3.5 rounded-full"
                                style={{ background: d.color }}
                            />

                            <span className="flex-1 font-medium">{d.label}</span>

                            <span className="w-6 text-right font-semibold">{d.count}</span>

                            <span className="w-14 text-right text-muted-foreground">
                                {d.pct.toFixed(1)}%
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
