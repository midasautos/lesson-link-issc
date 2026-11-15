"use client";

import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Bot,
    Calendar,
    CheckCircle2,
    Clock,
    Crosshair,
    MapPin,
    RotateCcw,
    ShieldAlert,
    Sparkles,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, StatusBadge } from "@/components/dashboard/badges";
import { defaultManualBooks } from "@/data/manual-book";
import type { Incident, IncidentStatus } from "@/types";

interface Props {
    incident: Incident | null;
    onClose: () => void;
    onStatusChange: (id: string, nextStatus: IncidentStatus) => void;
}

export function IncidentDetailModal({ incident, onClose, onStatusChange }: Props) {
    if (!incident) return null;

    const matchedSop = defaultManualBooks.find((sop) => sop.id === incident.manualBookRefId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Background dismiss */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Floating Card Modal */}
            <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-start justify-between border-b p-5 pb-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">
                                {incident.id}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <SeverityBadge severity={incident.severity} />
                            <StatusBadge status={incident.status} />
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white pt-1">
                            {incident.type}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {incident.time}
                            </span>
                            {incident.dayDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {incident.dayDate}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {incident.location}
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
                    {/* AI Detection Card */}
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                <Bot className="h-4 w-4" />
                                <span>Prediksi & Monitoring Otomatis AI</span>
                            </div>
                            {incident.aiConfidence && (
                                <Badge className="bg-indigo-600 text-white text-[11px] font-semibold">
                                    Confidence: {incident.aiConfidence}%
                                </Badge>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-indigo-950 dark:text-indigo-200">
                            <b>Sumber Deteksi:</b> {incident.aiSource || "Computer Vision Surveillance"}
                        </div>
                        <div className="mt-1 text-xs text-indigo-900/80 dark:text-indigo-300/80">
                            <b>Koordinat Terdeteksi:</b> {incident.lat.toFixed(6)}, {incident.lng.toFixed(6)}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Deskripsi Situasi
                        </h4>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-700 dark:text-slate-200 border">
                            {incident.description}
                        </div>
                    </div>

                    {/* Tahap Penanganan (Berdasarkan Manual Book) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                Tahap Penanganan Rekomendasi
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                                Berbasis Manual Book
                            </span>
                        </div>

                        {/* List steps */}
                        <div className="space-y-2">
                            {(incident.handlingSteps && incident.handlingSteps.length > 0
                                ? incident.handlingSteps
                                : matchedSop?.steps.flatMap((s) => s.instructions).slice(0, 3) || [
                                      "Isolasi perimeter terdekat dari personel umum.",
                                      "Hubungi tim tanggap darurat internal sesuai kategori bahaya.",
                                      "Verifikasi kestabilan zona sebelum pembukaan kembali akses.",
                                  ]
                            ).map((stepText, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2.5 rounded-lg border bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
                                >
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0 text-[11px]">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{stepText}</span>
                                </div>
                            ))}
                        </div>

                        {/* Clickable Section linking to Manual Book */}
                        {incident.manualBookRefId && (
                            <Link
                                href={`/manual-book?id=${incident.manualBookRefId}`}
                                onClick={onClose}
                                className="group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-primary transition-all hover:bg-primary/10 hover:border-primary shadow-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white shrink-0 group-hover:scale-105 transition-transform">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold">
                                            Buka SOP Referensi Lengkap di Manual Book
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            {matchedSop ? matchedSop.title : `Dokumen: ${incident.manualBookRefId}`}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </CardContent>

                {/* Footer status action buttons */}
                <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t p-4 bg-slate-50 dark:bg-slate-950/60">
                    <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
                        Tutup
                    </Button>

                    <div className="flex w-full sm:w-auto items-center gap-2">
                        {incident.status === "under_review" && (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                                onClick={() => {
                                    onStatusChange(incident.id, "in_progress");
                                    onClose();
                                }}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                ACC / Setujui (Ubah ke In Progress)
                            </Button>
                        )}

                        {incident.status === "in_progress" && (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                onClick={() => {
                                    onStatusChange(incident.id, "resolved");
                                    onClose();
                                }}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Selesaikan Insiden (Resolved)
                            </Button>
                        )}

                        {incident.status === "resolved" && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto text-amber-700 hover:bg-amber-50"
                                onClick={() => {
                                    onStatusChange(incident.id, "in_progress");
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
