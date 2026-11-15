"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Bot,
    Calendar,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    RotateCcw,
    Sparkles,
    User,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge } from "@/components/dashboard/badges";
import { defaultManualBooks } from "@/data/manual-book";
import type { IncidentStatus, Report } from "@/types";

interface Props {
    report: Report | null;
    onClose: () => void;
    onStatusChange: (id: string, nextStatus: IncidentStatus) => void;
}

export function ReportDetailModal({ report, onClose, onStatusChange }: Props) {
    if (!report) return null;

    const matchedSop = defaultManualBooks.find(
        (sop) => sop.id === report.aiRecommendation?.manualBookRefId,
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Floating Card */}
            <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-start justify-between border-b p-5 pb-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">
                                {report.id}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <SeverityBadge severity={report.severity} />
                            <StatusBadge status={report.status} />
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white pt-1">
                            {report.type}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {report.time}
                            </span>
                            {report.dayDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {report.dayDate}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {report.location}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                    {/* Sender / Reporter Info Card */}
                    <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/60 p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {report.reporter.avatar || report.reporter.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    Pelapor / Sender:
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {report.reporter.name}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {report.reporter.role}
                                </div>
                            </div>
                        </div>

                        {report.reporter.contact && (
                            <div className="text-right">
                                <Badge variant="outline" className="gap-1 text-xs">
                                    <Phone className="h-3 w-3 text-emerald-600" />
                                    {report.reporter.contact}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Report Description */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Deskripsi Laporan Lapangan
                        </h4>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 text-sm text-slate-700 dark:text-slate-200 border">
                            {report.description}
                        </div>
                    </div>

                    {/* AI Recommendation / Saran Penanganan AI */}
                    {report.aiRecommendation && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="h-4 w-4 text-indigo-600" />
                                    <span>AI Analysis & Saran Penanganan Rekomendasi</span>
                                </div>
                                <Badge className="bg-indigo-600 text-white text-[11px] font-semibold">
                                    Akurasi Saran: {report.aiRecommendation.confidence}%
                                </Badge>
                            </div>

                            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                                {report.aiRecommendation.summary}
                            </p>

                            {/* Suggested action checklist */}
                            <div className="space-y-1.5 pt-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                                    Langkah Taktis Yang Disarankan:
                                </div>
                                {report.aiRecommendation.suggestedActions.map((act, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 text-xs text-indigo-900 dark:text-indigo-200"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 mt-0.5 shrink-0" />
                                        <span>{act}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clickable Link to Manual Book */}
                    {report.aiRecommendation?.manualBookRefId && (
                        <Link
                            href={`/manual-book?id=${report.aiRecommendation.manualBookRefId}`}
                            onClick={onClose}
                            className="group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-primary transition-all hover:bg-primary/10 hover:border-primary shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white shrink-0 group-hover:scale-105 transition-transform">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold">
                                        Buka SOP Rujukan Lengkap di Manual Book
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {matchedSop ? matchedSop.title : `Dokumen: ${report.aiRecommendation.manualBookRefId}`}
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </CardContent>

                {/* Footer status transitions */}
                <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t p-4 bg-slate-50 dark:bg-slate-950/60">
                    <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
                        Tutup
                    </Button>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        {report.status === "under_review" && (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                                onClick={() => {
                                    onStatusChange(report.id, "in_progress");
                                    onClose();
                                }}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                ACC / Setujui Laporan (In Progress)
                            </Button>
                        )}

                        {report.status === "in_progress" && (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                onClick={() => {
                                    onStatusChange(report.id, "resolved");
                                    onClose();
                                }}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Selesaikan Laporan (Resolved)
                            </Button>
                        )}

                        {report.status === "resolved" && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto text-amber-700 hover:bg-amber-50"
                                onClick={() => {
                                    onStatusChange(report.id, "in_progress");
                                    onClose();
                                }}
                            >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Buka Kembali (Reopen to In Progress)
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
