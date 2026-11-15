"use client";

import { useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    Bell,
    Check,
    Cpu,
    ExternalLink,
    Flame,
    MapPin,
    Palette,
    Plus,
    RotateCcw,
    Save,
    Settings,
    ShieldAlert,
    Sliders,
    Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SeverityBadge } from "@/components/dashboard/badges";
import { useSystemSettings } from "@/lib/settings-store";
import type { HazardCategory, HazardTypeConfig, Severity, SeverityConfigItem } from "@/types";

const COLOR_PRESETS = [
    { label: "Red", value: "#ef4444" },
    { label: "Amber", value: "#f59e0b" },
    { label: "Yellow", value: "#eab308" },
    { label: "Green", value: "#22c55e" },
    { label: "Emerald", value: "#10b981" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Indigo", value: "#6366f1" },
    { label: "Purple", value: "#8b5cf6" },
    { label: "Rose", value: "#f43f5e" },
];

export function SettingsView() {
    const { settings, updateSeverity, updateHazardTypes, updateSettings, reset } = useSystemSettings();

    const [savedNotice, setSavedNotice] = useState(false);

    // Draft state for severity configs
    const [severities, setSeverities] = useState(settings.severityConfigs);
    const [hazardTypes, setHazardTypes] = useState(settings.hazardTypes);
    const [aiThreshold, setAiThreshold] = useState(settings.aiConfidenceThreshold);
    const [autoReview, setAutoReview] = useState(settings.autoReviewEnabled);
    const [notifSound, setNotifSound] = useState(settings.notificationSound);

    // New hazard type form
    const [newHazName, setNewHazName] = useState("");
    const [newHazCat, setNewHazCat] = useState<HazardCategory>("man_made");
    const [newHazSev, setNewHazSev] = useState<Severity>("moderate");
    const [newHazDesc, setNewHazDesc] = useState("");

    const handleSeverityChange = (key: Severity, field: keyof SeverityConfigItem, value: string) => {
        setSeverities((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const handleSaveAll = () => {
        // Save all settings at once
        updateSettings({
            severityConfigs: severities,
            hazardTypes,
            aiConfidenceThreshold: aiThreshold,
            autoReviewEnabled: autoReview,
            notificationSound: notifSound,
        });
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    const handleReset = () => {
        const def = reset();
        setSeverities(def.severityConfigs);
        setHazardTypes(def.hazardTypes);
        setAiThreshold(def.aiConfidenceThreshold);
        setAutoReview(def.autoReviewEnabled);
        setNotifSound(def.notificationSound);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const handleAddHazard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHazName.trim()) return;

        const newItem: HazardTypeConfig = {
            id: `haz-${Date.now().toString(36)}`,
            name: newHazName.trim(),
            category: newHazCat,
            defaultSeverity: newHazSev,
            description: newHazDesc.trim() || "Tipe bahaya kustom fasilitas.",
        };

        setHazardTypes((prev) => [...prev, newItem]);
        setNewHazName("");
        setNewHazDesc("");
    };

    const handleDeleteHazard = (id: string) => {
        setHazardTypes((prev) => prev.filter((h) => h.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Parameters & Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Kustomisasi level severity (warna, label, prioritas), katalog tipe bahaya, dan parameter sensitivitas AI monitoring.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {savedNotice && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                            <Check className="h-4 w-4" /> Pengaturan Tersimpan!
                        </span>
                    )}

                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Bawaan
                    </Button>

                    <Button size="sm" onClick={handleSaveAll} className="gap-1.5 bg-primary font-semibold shadow-sm">
                        <Save className="h-3.5 w-3.5" />
                        Simpan Semua Pengaturan
                    </Button>
                </div>
            </div>

            {/* Banner: Map & Site Location has been moved */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white shrink-0">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                            Lokasi Fasilitas & Area Kritis Pindah ke Halaman Map
                        </div>
                        <div className="text-muted-foreground">
                            Pengaturan titik GPS, nama site, gambar poligon area, dan pencarian area kini terpusat di halaman <b>Map</b>.
                        </div>
                    </div>
                </div>

                <Link href="/map">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold text-primary border-primary/40 hover:bg-primary hover:text-white">
                        <span>Buka Halaman Map</span>
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </Link>
            </div>

            {/* SECTION 1: SEVERITY LEVELS MANAGEMENT */}
            <Card>
                <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        Kustomisasi Level Severity & Warna
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Ubah nama label, warna badge, dan deskripsi untuk masing-masing level keparahan. Perubahan akan langsung tercermin pada halaman Incidents, Reports, Manual Book, dan Dashboard.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {(["critical", "major", "moderate", "minor"] as const).map((key) => {
                            const conf = severities[key];
                            return (
                                <div
                                    key={key}
                                    className="rounded-xl border bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-3.5 w-3.5 rounded-full"
                                                style={{ backgroundColor: conf.color }}
                                            />
                                            <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                                                ID: {key}
                                            </span>
                                        </div>

                                        {/* Live Badge Preview */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground">Preview:</span>
                                            <Badge
                                                style={{ backgroundColor: conf.color, color: "#ffffff" }}
                                                className="min-w-16 justify-center font-semibold text-xs border-transparent"
                                            >
                                                {conf.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Nama Label</Label>
                                            <Input
                                                value={conf.label}
                                                onChange={(e) =>
                                                    handleSeverityChange(key, "label", e.target.value)
                                                }
                                                className="h-8 text-xs font-semibold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs">Warna (Hex)</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={conf.color}
                                                    onChange={(e) =>
                                                        handleSeverityChange(key, "color", e.target.value)
                                                    }
                                                    className="h-8 w-9 cursor-pointer rounded border p-0.5 bg-transparent"
                                                />
                                                <Input
                                                    value={conf.color}
                                                    onChange={(e) =>
                                                        handleSeverityChange(key, "color", e.target.value)
                                                    }
                                                    className="h-8 font-mono text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color palette quick selector */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-[10px] text-muted-foreground">Preset:</span>
                                        {COLOR_PRESETS.map((p) => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                title={p.label}
                                                onClick={() => handleSeverityChange(key, "color", p.value)}
                                                className="h-4 w-4 rounded-full border border-black/10 hover:scale-110 transition"
                                                style={{ backgroundColor: p.value }}
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-1 pt-1 border-t text-xs">
                                        <Label className="text-xs">Penjelasan / Definisi Risiko</Label>
                                        <Textarea
                                            rows={2}
                                            value={conf.description}
                                            onChange={(e) =>
                                                handleSeverityChange(key, "description", e.target.value)
                                            }
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: HAZARD TYPES CONFIGURATION */}
            <Card>
                <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        Katalog Tipe Bahaya (Hazard Types)
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Daftar tipe bahaya yang dapat dipilih pada form pelaporan lapangan dan deteksi prediksi AI.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-4">
                    {/* Add new hazard form */}
                    <form
                        onSubmit={handleAddHazard}
                        className="rounded-xl border bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-3 text-xs"
                    >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                            Tambah Tipe Bahaya Baru
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Nama Tipe Bahaya</Label>
                                <Input
                                    placeholder="Contoh: Gas Anomaly / Ledakan Debu"
                                    value={newHazName}
                                    onChange={(e) => setNewHazName(e.target.value)}
                                    className="h-8 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Kategori</Label>
                                <select
                                    className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                                    value={newHazCat}
                                    onChange={(e) => setNewHazCat(e.target.value as HazardCategory)}
                                >
                                    <option value="man_made">Man-Made</option>
                                    <option value="natural_hazard">Natural Hazard</option>
                                    <option value="operational">Operasional</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Default Severity</Label>
                                <select
                                    className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                                    value={newHazSev}
                                    onChange={(e) => setNewHazSev(e.target.value as Severity)}
                                >
                                    {(["critical", "major", "moderate", "minor"] as const).map((s) => (
                                        <option key={s} value={s}>
                                            {severities[s]?.label || s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Deskripsi ringkas potensi bahaya..."
                                value={newHazDesc}
                                onChange={(e) => setNewHazDesc(e.target.value)}
                                className="h-8 text-xs flex-1"
                            />
                            <Button type="submit" size="sm" className="h-8 gap-1 text-xs shrink-0">
                                <Plus className="h-3.5 w-3.5" /> Tambah
                            </Button>
                        </div>
                    </form>

                    {/* Existing Hazard Types List */}
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {hazardTypes.map((haz) => (
                            <div
                                key={haz.id}
                                className="flex items-start justify-between rounded-lg border bg-white dark:bg-slate-900 p-3 text-xs shadow-2xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {haz.name}
                                        </span>
                                        <SeverityBadge severity={haz.defaultSeverity} />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Kategori:{" "}
                                        <b className="capitalize text-slate-700 dark:text-slate-300">
                                            {haz.category.replace("_", " ")}
                                        </b>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        {haz.description}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteHazard(haz.id)}
                                    className="h-6 w-6 text-muted-foreground hover:text-red-600 shrink-0"
                                    title="Hapus tipe bahaya"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 3: AI MONITORING & SYSTEM PARAMETERS */}
            <Card>
                <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" />
                        Sensitivitas AI & Notifikasi Sistem
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Atur ambang batas keyakinan prediksi AI (confidence threshold) dan preferensi peringatan.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-4 text-xs">
                    {/* Confidence Slider */}
                    <div className="rounded-lg border p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Ambang Batas Keyakinan AI (Confidence Threshold)</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Insiden hanya akan otomatis dicatat jika tingkat keyakinan model computer vision di atas nilai ini.
                                </p>
                            </div>
                            <span className="text-base font-bold text-primary font-mono">
                                {aiThreshold}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min={50}
                            max={95}
                            step={5}
                            value={aiThreshold}
                            onChange={(e) => setAiThreshold(Number(e.target.value))}
                            className="w-full cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Sensitif (50%)</span>
                            <span>Optimal (80%)</span>
                            <span>Sangat Ketat (95%)</span>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Audio Notifikasi Alert</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Bunyikan nada peringatan saat insiden level Critical terdeteksi.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifSound}
                                onChange={(e) => setNotifSound(e.target.checked)}
                                className="h-4 w-4 rounded cursor-pointer accent-primary mt-1"
                            />
                        </div>

                        <div className="flex items-start justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold">Auto-Review Incident Minor</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Otomatis pindahkan insiden level Minor ke In Progress setelah 15 menit.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoReview}
                                onChange={(e) => setAutoReview(e.target.checked)}
                                className="h-4 w-4 rounded cursor-pointer accent-primary mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
