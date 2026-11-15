"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowUpDown,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Flame,
    Plus,
    RotateCcw,
    Search,
    ShieldAlert,
    SlidersHorizontal,
    Sparkles,
    Wrench,
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
import { IncidentDetailModal } from "@/components/incidents/incident-detail-modal";
import { useIncidents } from "@/lib/incident-store";
import { useSystemSettings } from "@/lib/settings-store";
import { cn } from "@/lib/utils";
import type { HazardCategory, Incident, IncidentStatus, Severity } from "@/types";

const PAGE_SIZE = 6;

export function IncidentsView() {
    const { incidents, updateStatus, addIncident } = useIncidents();
    const { settings } = useSystemSettings();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
    const [categoryFilter, setCategoryFilter] = useState<HazardCategory | "all">("all");
    const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Selected incident for the floating card modal
    const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

    // Filter logic
    const filtered = useMemo(() => {
        return incidents.filter((i) => {
            if (statusFilter !== "all" && i.status !== statusFilter) return false;
            if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
            if (severityFilter !== "all" && i.severity !== severityFilter) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                i.id.toLowerCase().includes(q) ||
                i.type.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
            );
        });
    }, [incidents, statusFilter, categoryFilter, severityFilter, search]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    // Quick counts for tabs
    const counts = useMemo(() => {
        return {
            all: incidents.length,
            under_review: incidents.filter((i) => i.status === "under_review").length,
            in_progress: incidents.filter((i) => i.status === "in_progress").length,
            resolved: incidents.filter((i) => i.status === "resolved").length,
        };
    }, [incidents]);

    // Simulate new incoming AI incident detection
    const handleSimulateNewIncident = () => {
        const pool: Array<Omit<Incident, "id" | "time" | "dayDate">> = [
            {
                location: "Gerbang Barat Pos 3",
                type: "Protester / Demonstrasi",
                category: "man_made",
                severity: "major",
                description: "AI CCTV mendeteksi kerumunan 20 orang membawa megafon mendekati pintu gerbang.",
                status: "under_review",
                lat: -6.2918,
                lng: 107.1712,
                aiSource: "Crowd Vision Analytics (Cam 08)",
                aiConfidence: 93,
                manualBookRefId: "SOP-MAN-PROT-01",
                handlingSteps: [
                    "Kunci perimeter drop-arm & alihkan truk logistik.",
                    "Siagakan barikade crowd-control dengan tim security.",
                    "Hubungi Polsek terdekat untuk koordinasi ring luar.",
                ],
            },
            {
                location: "Kandang Genset & Transformator",
                type: "Fire / Kebakaran",
                category: "natural_hazard",
                severity: "critical",
                description: "Optical flame detector mendeteksi radiasi nyala api pada gardu trafo 2.",
                status: "under_review",
                lat: -6.2921,
                lng: 107.1702,
                aiSource: "Optical Flame Sensor UV-IR",
                aiConfidence: 97,
                manualBookRefId: "SOP-NAT-FIRE-01",
                handlingSteps: [
                    "Aktivasi Emergency Shutdown trafo daya unit 2.",
                    "Kerahkan tim Fire Brigade internal berpakaian pemadam.",
                    "Semprotkan APAR Clean Agent / Dry Powder.",
                ],
            },
            {
                location: "Pagar Belakang Sektor Timur",
                type: "Unauthorized Intrusion / Penyusup",
                category: "man_made",
                severity: "critical",
                description: "Radar sensor mendeteksi target manusia menaiki pagar kawat duri.",
                status: "under_review",
                lat: -6.2910,
                lng: 107.1758,
                aiSource: "Perimeter Radar Tracker R-02",
                aiConfidence: 96,
                manualBookRefId: "SOP-MAN-INTR-01",
                handlingSteps: [
                    "Kunci semua pintu gedung produksi terdekat.",
                    "Arahkan unit patroli Quick Reaction ke koordinat target.",
                    "Lakukan penangkapan terukur dan penggeledahan.",
                ],
            },
        ];

        const pick = pool[Math.floor(Math.random() * pool.length)];
        const newId = `INC-${Date.now().toString().slice(-4)}`;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

        const newInc: Incident = {
            ...pick,
            id: newId,
            time: timeStr,
            dayDate: "Hari ini",
            status: "under_review", // By default: On Review
        };

        addIncident(newInc);
        setStatusFilter("under_review");
        setCurrentPage(1);
        setActiveIncident(newInc);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Incident Management (AI Monitoring & Prediksi)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Data insiden terdeteksi secara otomatis oleh sensor dan analitik AI. Insiden baru berstatus <b>On Review</b> dan dapat disetujui (ACC) menjadi <b>In Progress</b> hingga <b>Resolved</b>.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleSimulateNewIncident}
                        className="gap-2 bg-primary font-semibold shadow-sm"
                        size="sm"
                    >
                        <Sparkles className="h-4 w-4" />
                        Simulasi Deteksi AI Baru
                    </Button>
                </div>
            </div>

            {/* Filter Card */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari insiden berdasarkan ID, tipe bahaya, lokasi, deskripsi..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Status Filter Tabs */}
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

                    {/* Secondary Filters: Category & Severity */}
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
                            {(["critical", "major", "moderate", "minor"] as const).map((sev) => {
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

            {/* Incidents Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[170px] pl-5">Time & Tanggal</TableHead>
                            <TableHead className="w-[180px]">Type / Bahaya</TableHead>
                            <TableHead className="w-[110px]">Severity</TableHead>
                            <TableHead className="w-[160px]">Lokasi</TableHead>
                            <TableHead className="min-w-[240px]">Deskripsi Kejadian</TableHead>
                            <TableHead className="w-[130px]">Status</TableHead>
                            <TableHead className="w-[150px] text-right pr-5">Aksi Penanganan</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                    Tidak ada data incident yang sesuai dengan filter yang dipilih.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map((inc) => (
                                <TableRow key={inc.id} className="hover:bg-muted/40 transition-colors">
                                    {/* Time & Day Date */}
                                    <TableCell className="pl-5">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {inc.time}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {inc.dayDate || "Hari ini"}
                                        </div>
                                        <div className="font-mono text-[10px] text-primary mt-0.5">
                                            {inc.id}
                                        </div>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                            {inc.type}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {inc.category === "natural_hazard"
                                                ? "Natural Hazard"
                                                : inc.category === "man_made"
                                                  ? "Man-Made"
                                                  : "Operasional"}
                                        </div>
                                    </TableCell>

                                    {/* Severity */}
                                    <TableCell>
                                        <SeverityBadge severity={inc.severity} />
                                    </TableCell>

                                    {/* Location */}
                                    <TableCell className="font-medium text-xs text-slate-700 dark:text-slate-300">
                                        {inc.location}
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                                        <p className="line-clamp-2 leading-relaxed">
                                            {inc.description}
                                        </p>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <StatusBadge status={inc.status} />
                                    </TableCell>

                                    {/* Action button */}
                                    <TableCell className="text-right pr-5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary hover:text-white"
                                            onClick={() => setActiveIncident(inc)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail & SOP
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
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
                        dari <span className="font-semibold text-foreground">{filtered.length}</span> insiden
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

            {/* Floating Card Modal for Detail & Manual Book Steps */}
            <IncidentDetailModal
                incident={activeIncident}
                onClose={() => setActiveIncident(null)}
                onStatusChange={updateStatus}
            />
        </div>
    );
}
