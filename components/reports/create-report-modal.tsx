"use client";

import { useState } from "react";
import { Plus, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSystemSettings } from "@/lib/settings-store";
import type { HazardCategory, Report, Severity } from "@/types";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (report: Report) => void;
}

export function CreateReportModal({ open, onClose, onSubmit }: Props) {
    const { settings } = useSystemSettings();

    const [reporterName, setReporterName] = useState("Aditya Pratama");
    const [reporterRole, setReporterRole] = useState("Supervisor HSE");
    const [reporterContact, setReporterContact] = useState("+62 812-9988-7766");
    const [location, setLocation] = useState("Warehouse Barat - Dock 3");
    const [type, setType] = useState("Protester / Demonstrasi");
    const [category, setCategory] = useState<HazardCategory>("man_made");
    const [severity, setSeverity] = useState<Severity>("major");
    const [description, setDescription] = useState("");

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
        const newId = `REP-${Date.now().toString().slice(-4)}`;

        // Match SOP reference automatically based on selected type
        let sopRef = "SOP-MAN-PROT-01";
        if (type.includes("Fire")) sopRef = "SOP-NAT-FIRE-01";
        else if (type.includes("Flood")) sopRef = "SOP-NAT-FLOOD-01";
        else if (type.includes("Chemical")) sopRef = "SOP-NAT-CHEM-01";
        else if (type.includes("Damage")) sopRef = "SOP-MAN-PROP-01";
        else if (type.includes("Intrusion")) sopRef = "SOP-MAN-INTR-01";

        const newReport: Report = {
            id: newId,
            time: timeStr,
            dayDate: "Hari ini",
            location,
            type,
            category,
            severity,
            description,
            status: "under_review", // By default: On Review
            reporter: {
                name: reporterName,
                role: reporterRole,
                contact: reporterContact,
                avatar: reporterName.slice(0, 2).toUpperCase(),
            },
            lat: -6.2915,
            lng: 107.1725,
            aiRecommendation: {
                summary: `AI menganalisis laporan "${type}" di lokasi ${location}. Disarankan respon awal sesuai protokol mitigasi.`,
                confidence: 90,
                manualBookRefId: sopRef,
                suggestedActions: [
                    "Verifikasi situasi visual ke lokasi dalam 5 menit pertama.",
                    "Pastikan personel di sekitar lokasi menjauhi titik bahaya.",
                    "Koordinasikan penanganan lanjutan dengan pengawas shift.",
                ],
            },
        };

        onSubmit(newReport);
        setDescription("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />

            <Card className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-row items-center justify-between border-b p-5 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold">
                                Buat Laporan Lapangan Baru
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Laporan yang baru dikirim akan berstatus <b>On Review</b> dan dianalisis oleh AI.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 text-sm">
                        {/* Reporter info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="rep-name" className="text-xs">
                                    Nama Pelapor / Sender
                                </Label>
                                <Input
                                    id="rep-name"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="rep-role" className="text-xs">
                                    Jabatan / Regu
                                </Label>
                                <Input
                                    id="rep-role"
                                    value={reporterRole}
                                    onChange={(e) => setReporterRole(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <Label htmlFor="rep-loc" className="text-xs">
                                Lokasi Temuan
                            </Label>
                            <Input
                                id="rep-loc"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Contoh: Gedung Produksi A, Tangki 3, dll"
                                required
                            />
                        </div>

                        {/* Type & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="rep-type" className="text-xs">
                                    Tipe Bahaya / Kejadian
                                </Label>
                                <select
                                    id="rep-type"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                                    value={type}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setType(val);
                                        if (val.includes("Fire") || val.includes("Flood") || val.includes("Chemical")) {
                                            setCategory("natural_hazard");
                                        } else {
                                            setCategory("man_made");
                                        }
                                    }}
                                >
                                    <option value="Protester / Demonstrasi">Protester / Demonstrasi</option>
                                    <option value="Damage Property / Vandalisme">Damage Property / Vandalisme</option>
                                    <option value="Unauthorized Intrusion / Penyusup">Unauthorized Intrusion / Penyusup</option>
                                    <option value="Fire / Kebakaran">Fire / Kebakaran</option>
                                    <option value="Flood / Banjir">Flood / Banjir</option>
                                    <option value="Chemical Spill / B3">Chemical Spill / B3</option>
                                    <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="rep-sev" className="text-xs">
                                    Level Severity
                                </Label>
                                <select
                                    id="rep-sev"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value as Severity)}
                                >
                                    {(["catastrophic", "major", "moderate", "minor", "insignificant"] as const).map((s) => (
                                        <option key={s} value={s}>
                                            {settings.severityConfigs?.[s]?.label || s.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="rep-desc" className="text-xs">
                                Deskripsi Rinci Temuan
                            </Label>
                            <Textarea
                                id="rep-desc"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Jelaskan kondisi di lapangan secara jelas dan rinci..."
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-end gap-2 border-t p-4 bg-slate-50 dark:bg-slate-950/60">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" size="sm" className="gap-1.5 bg-primary font-semibold">
                            <Send className="h-3.5 w-3.5" />
                            Kirim Laporan (On Review)
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
