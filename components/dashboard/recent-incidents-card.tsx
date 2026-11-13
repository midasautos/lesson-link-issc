import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { SeverityBadge, StatusBadge } from "@/components/dashboard/badges";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { todayIncidents } from "@/data/dummy";
import { SEVERITY_COLORS } from "@/lib/severity";

export function RecentIncidentsCard() {
    const rows = todayIncidents.slice(0, 5);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Recent Incidents
                </CardTitle>
                <Link
                    href="#"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                    View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </CardHeader>

            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-5">Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="pr-5">Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.map((i) => (
                        <TableRow key={i.id}>
                            <TableCell className="pl-5">
                                <span className="flex items-center gap-2.5 font-medium">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ background: SEVERITY_COLORS[i.severity] }}
                                />
                                    {i.time}
                                </span>
                            </TableCell>

                            <TableCell className="whitespace-nowrap">{i.location}</TableCell>

                            <TableCell>{i.type}</TableCell>

                            <TableCell>
                                <SeverityBadge severity={i.severity} />
                            </TableCell>

                            <TableCell className="min-w-56 text-muted-foreground">
                                {i.description}
                            </TableCell>

                            <TableCell className="pr-5">
                                <StatusBadge status={i.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
