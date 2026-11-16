"use client";

import { useMemo, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Filter,
    Plus,
    Search,
    Sparkles,
    User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SeverityBadge, StatusBadge } from "@/components/dashboard/badges";
import { CreateReportModal } from "@/components/reports/create-report-modal";
import { ReportDetailModal } from "@/components/reports/report-detail-modal";
import { useReports } from "@/lib/report-store";
import { useSystemSettings } from "@/lib/settings-store";
import { cn } from "@/lib/utils";
import type { HazardCategory, IncidentStatus, Report, Severity } from "@/types";

const PAGE_SIZE = 6;

export function ReportsView() {
    const { reports, updateStatus, addReport } = useReports();
    const { settings } = useSystemSettings();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
    const [categoryFilter, setCategoryFilter] = useState<HazardCategory | "all">("all");
    const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [activeReport, setActiveReport] = useState<Report | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Filtering
    const filtered = useMemo(() => {
        return reports.filter((r) => {
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
            if (severityFilter !== "all" && r.severity !== severityFilter) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                r.id.toLowerCase().includes(q) ||
                r.reporter.name.toLowerCase().includes(q) ||
                r.reporter.role.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
            );
        });
    }, [reports, statusFilter, categoryFilter, severityFilter, search]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    const counts = useMemo(() => {
        return {
            all: reports.length,
            under_review: reports.filter((r) => r.status === "under_review").length,
            in_progress: reports.filter((r) => r.status === "in_progress").length,
            resolved: reports.filter((r) => r.status === "resolved").length,
        };
    }, [reports]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Field Reports & AI Triage
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Laporan temuan langsung dari personel lapangan (Security, Housekeeping, HSE). AI memberikan saran penanganan taktis dan memetakan SOP rujukan.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2 bg-primary font-semibold shadow-sm"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        Buat Laporan Baru
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari laporan berdasarkan nama pelapor, tipe bahaya, lokasi, deskripsi..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                [
                                    { id: "all", label: "Semua", count: counts.all },
                                    { id: "under_review", label: "On Review", count: counts.under_review },
                                    { id: "in_progress", label: "In Progress", count: counts.in_progress },
                                    { id: "resolved", label: "Resolved", count: counts.resolved },
                                ] as const
                            ).map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant={statusFilter === tab.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setStatusFilter(tab.id);
                                        setCurrentPage(1);
                                    }}
                                    className="h-8 text-xs font-medium gap-1.5"
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={cn(
                                            "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                                            statusFilter === tab.id
                                                ? "bg-white text-primary dark:bg-slate-900"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-muted-foreground flex items-center gap-1">
                                <Filter className="h-3 w-3" /> Kategori:
                            </span>
                            {(
                                [
                                    { id: "all", label: "Semua Kategori" },
                                    { id: "natural_hazard", label: "Natural Hazard" },
                                    { id: "man_made", label: "Man-Made" },
                                    { id: "operational", label: "Operasional" },
                                ] as const
                            ).map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setCategoryFilter(c.id);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "rounded-md px-2.5 py-1 font-medium transition",
                                        categoryFilter === c.id
                                            ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                                            : "text-muted-foreground hover:bg-muted",
                                    )}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-muted-foreground">Severity:</span>
                            <button
                                onClick={() => {
                                    setSeverityFilter("all");
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "rounded px-2 py-0.5 font-medium",
                                    severityFilter === "all"
                                        ? "bg-slate-700 text-white"
                                        : "text-muted-foreground hover:bg-muted",
                                )}
                            >
                                Semua
                            </button>
                            {(["insignificant", "minor", "moderate", "major", "catastrophic"] as const).map((sev) => {
                                const conf = settings.severityConfigs?.[sev];
                                const active = severityFilter === sev;
                                return (
                                    <button
                                        key={sev}
                                        onClick={() => {
                                            setSeverityFilter(sev);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition",
                                            active
                                                ? "ring-2 ring-primary ring-offset-1 text-white"
                                                : "bg-muted text-muted-foreground hover:opacity-100",
                                        )}
                                        style={active && conf?.color ? { backgroundColor: conf.color } : undefined}
                                    >
                                        <span
                                            className="h-1.5 w-1.5 rounded-full"
                                            style={{ backgroundColor: conf?.color || "#94a3b8" }}
                                        />
                                        {conf?.label || sev}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reports Table with SENDER / REPORTER Column */}
            <Card className="overflow-hidden border border-blue-800 rounded-lg shadow-md">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[150px] pl-5">Time & Tanggal</TableHead>
                            <TableHead className="w-[200px]">Sender / Pelapor</TableHead>
                            <TableHead className="w-[170px]">Type / Bahaya</TableHead>
                            <TableHead className="w-[110px]">Severity</TableHead>
                            <TableHead className="w-[160px]">Lokasi</TableHead>
                            <TableHead className="min-w-[240px]">Deskripsi & Saran AI</TableHead>
                            <TableHead className="w-[130px]">Status</TableHead>
                            <TableHead className="w-[150px] text-right pr-5">Aksi Penanganan</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                                    Tidak ada laporan lapangan yang sesuai dengan filter yang dipilih.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map((rep) => (
                                <TableRow key={rep.id} className="hover:bg-muted/40 transition-colors">
                                    {/* Time */}
                                    <TableCell className="pl-5">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {rep.time}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {rep.dayDate || "Hari ini"}
                                        </div>
                                        <div className="font-mono text-[10px] text-primary mt-0.5">
                                            {rep.id}
                                        </div>
                                    </TableCell>

                                    {/* Sender / Reporter */}
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                                {rep.reporter.avatar || rep.reporter.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="leading-tight">
                                                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                                                    {rep.reporter.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground line-clamp-1">
                                                    {rep.reporter.role}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
                                            {rep.type}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {rep.category === "natural_hazard"
                                                ? "Natural Hazard"
                                                : rep.category === "man_made"
                                                  ? "Man-Made"
                                                  : "Operasional"}
                                        </div>
                                    </TableCell>

                                    {/* Severity */}
                                    <TableCell>
                                        <SeverityBadge severity={rep.severity} />
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell className="font-medium text-xs text-slate-700 dark:text-slate-300">
                                        {rep.location}
                                    </TableCell>

                                    {/* Description & AI Triage */}
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                                        <p className="line-clamp-1 leading-relaxed text-slate-800 dark:text-slate-200">
                                            {rep.description}
                                        </p>
                                        {rep.aiRecommendation && (
                                            <p className="line-clamp-1 text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 shrink-0" />
                                                <span>AI: {rep.aiRecommendation.summary}</span>
                                            </p>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <StatusBadge status={rep.status} />
                                    </TableCell>

                                    {/* Action button */}
                                    <TableCell className="text-right pr-5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary hover:text-white"
                                            onClick={() => setActiveReport(rep)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail & Saran
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t p-4 text-xs text-muted-foreground">
                    <div>
                        Menampilkan{" "}
                        <span className="font-semibold text-foreground">
                            {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-semibold text-foreground">
                            {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                        </span>{" "}
                        dari <span className="font-semibold text-foreground">{filtered.length}</span> laporan
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            aria-label="Previous Page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="px-3 font-semibold text-foreground">
                            Halaman {currentPage} dari {totalPages}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            aria-label="Next Page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Modals */}
            <ReportDetailModal
                report={activeReport}
                onClose={() => setActiveReport(null)}
                onStatusChange={updateStatus}
            />

            <CreateReportModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={(newRep) => {
                    addReport(newRep);
                    setStatusFilter("under_review");
                    setCurrentPage(1);
                    setActiveReport(newRep);
                }}
            />
        </div>
    );
}
