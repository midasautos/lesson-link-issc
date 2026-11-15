"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Clock,
    ExternalLink,
    Filter,
    Flame,
    HardHat,
    Search,
    ShieldAlert,
    Users,
    Wrench,
    Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/dashboard/badges";
import { defaultManualBooks } from "@/data/manual-book";
import { useSystemSettings } from "@/lib/settings-store";
import { cn } from "@/lib/utils";
import type { HazardCategory, ManualBookItem, Severity } from "@/types";

export function ManualBookView() {
    const searchParams = useSearchParams();
    const queryId = searchParams.get("id");
    const querySeverity = searchParams.get("severity");

    const { settings } = useSystemSettings();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<HazardCategory | "all">("all");
    const [selectedSeverity, setSelectedSeverity] = useState<Severity | "all">("all");
    const [expandedId, setExpandedId] = useState<string | null>(queryId || defaultManualBooks[0]?.id || null);

    // Deep link handling: jika ada query ?id=, otomatis expand dan scroll
    useEffect(() => {
        if (queryId) {
            setExpandedId(queryId);
            const el = document.getElementById(queryId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [queryId]);

    useEffect(() => {
        if (querySeverity && ["critical", "major", "moderate", "minor"].includes(querySeverity)) {
            setSelectedSeverity(querySeverity as Severity);
        }
    }, [querySeverity]);

    const filtered = useMemo(() => {
        return defaultManualBooks.filter((item) => {
            if (selectedCategory !== "all" && item.category !== selectedCategory) {
                return false;
            }
            if (selectedSeverity !== "all" && item.severity !== selectedSeverity) {
                return false;
            }
            if (!search.trim()) return true;

            const q = search.toLowerCase();
            const inTitle = item.title.toLowerCase().includes(q);
            const inId = item.id.toLowerCase().includes(q);
            const inType = item.hazardType.toLowerCase().includes(q);
            const inSummary = item.summary.toLowerCase().includes(q);
            const inSteps = item.steps.some(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.instructions.some((ins) => ins.toLowerCase().includes(q)),
            );
            const inRoles = item.responsibleRoles.some((r) => r.toLowerCase().includes(q));

            return inTitle || inId || inType || inSummary || inSteps || inRoles;
        });
    }, [search, selectedCategory, selectedSeverity]);

    const categoryIcons: Record<HazardCategory, typeof Flame> = {
        natural_hazard: Flame,
        man_made: ShieldAlert,
        operational: Wrench,
    };

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Standar Operasional Prosedur (SOP)
                        </span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">
                        Manual Book & Panduan Penanganan Situasi
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                        Protokol resmi respon cepat untuk bahaya alam (natural hazards), gangguan keamanan manusia (man-made), dan operasional pabrik.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200">
                        {defaultManualBooks.length} Dokumen SOP Aktif
                    </Badge>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari SOP berdasarkan nama bahaya, keyword instruksi, ID SOP, atau PIC..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                [
                                    { id: "all", label: "Semua Kategori" },
                                    { id: "natural_hazard", label: "Natural Hazard" },
                                    { id: "man_made", label: "Man-Made" },
                                    { id: "operational", label: "Operasional" },
                                ] as const
                            ).map((c) => (
                                <Button
                                    key={c.id}
                                    variant={selectedCategory === c.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(c.id)}
                                    className="h-8 text-xs font-medium"
                                >
                                    {c.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Severity Pills (dynamically configured via Settings) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Filter className="h-3 w-3" /> Level Keparahan:
                        </span>
                        <Button
                            variant={selectedSeverity === "all" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedSeverity("all")}
                            className="h-7 text-xs px-2.5"
                        >
                            Semua Level
                        </Button>
                        {(["critical", "major", "moderate", "minor"] as const).map((sev) => {
                            const conf = settings.severityConfigs?.[sev];
                            const label = conf?.label || sev.toUpperCase();
                            const active = selectedSeverity === sev;
                            return (
                                <button
                                    key={sev}
                                    onClick={() => setSelectedSeverity(sev)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium transition-all",
                                        active
                                            ? "ring-2 ring-primary ring-offset-1 text-white shadow-xs"
                                            : "opacity-80 hover:opacity-100 bg-muted text-muted-foreground",
                                    )}
                                    style={active && conf?.color ? { backgroundColor: conf.color } : undefined}
                                >
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: conf?.color || "#94a3b8" }}
                                    />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* List SOP Items */}
            {filtered.length === 0 ? (
                <div className="grid place-items-center rounded-xl border border-dashed py-16 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/60" />
                    <h3 className="mt-3 text-base font-semibold">Tidak ada SOP yang cocok</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Coba sesuaikan kata kunci pencarian atau ubah filter level keparahan.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                            setSearch("");
                            setSelectedCategory("all");
                            setSelectedSeverity("all");
                        }}
                    >
                        Reset Filter
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => {
                        const Icon = categoryIcons[item.category] || ShieldAlert;
                        const isExpanded = expandedId === item.id;
                        const isTargeted = queryId === item.id;

                        return (
                            <Card
                                key={item.id}
                                id={item.id}
                                className={cn(
                                    "transition-all duration-200 overflow-hidden",
                                    isTargeted && "ring-2 ring-primary border-primary shadow-md",
                                    isExpanded ? "border-slate-300 dark:border-slate-700 shadow-sm" : "hover:border-slate-300",
                                )}
                            >
                                <CardHeader
                                    className="cursor-pointer p-4 pb-3 hover:bg-muted/40 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-primary">
                                                        {item.id}
                                                    </span>
                                                    <span className="text-muted-foreground">·</span>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {item.hazardType}
                                                    </span>
                                                    <SeverityBadge severity={item.severity} />
                                                    {isTargeted && (
                                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                                                            Referensi Dipilih
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-base font-bold mt-1">
                                                    {item.title}
                                                </CardTitle>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>Est. {item.estimatedResolutionTime}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs font-semibold"
                                            >
                                                {isExpanded ? "Tutup SOP" : "Buka SOP"}
                                            </Button>
                                        </div>
                                    </div>

                                    <CardDescription className="mt-1 text-sm line-clamp-2">
                                        {item.summary}
                                    </CardDescription>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="p-4 pt-0 border-t bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
                                        {/* Procedural Phases */}
                                        <div className="mt-4 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Langkah-Langkah & Tahap Penanganan Resmi:
                                            </h4>

                                            <div className="grid gap-3 md:grid-cols-3">
                                                {item.steps.map((step, idx) => (
                                                    <div
                                                        key={step.phase}
                                                        className="rounded-lg border bg-white p-3.5 dark:bg-slate-950 shadow-2xs space-y-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                                                                {idx + 1}
                                                            </span>
                                                            <div className="text-xs font-semibold text-primary">
                                                                {step.phase}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                            {step.title}
                                                        </div>
                                                        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                            {step.instructions.map((ins, iIdx) => (
                                                                <li key={iIdx} className="flex items-start gap-1.5">
                                                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                                    <span>{ins}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Equipment & Emergency Roles */}
                                        <div className="grid gap-4 pt-3 border-t md:grid-cols-2">
                                            <div>
                                                <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                    <HardHat className="h-4 w-4 text-primary" /> Perlengkapan & APD Wajib:
                                                </h5>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.equipment.map((eq) => (
                                                        <Badge
                                                            key={eq}
                                                            variant="secondary"
                                                            className="text-[11px] font-normal"
                                                        >
                                                            {eq}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                    <Users className="h-4 w-4 text-primary" /> Personel Penanggung Jawab:
                                                </h5>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.responsibleRoles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="outline"
                                                            className="border-slate-300 bg-white text-[11px] font-medium dark:bg-slate-900"
                                                        >
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
