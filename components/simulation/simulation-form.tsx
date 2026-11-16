"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function SimulationForm({ open, onClose, onSubmit }: Props) {
  const { settings } = useSystemSettings();

  const [reporterName, setReporterName] = useState("Simulasi User");
  const [reporterRole, setReporterRole] = useState("Operator Simulasi");
  const [reporterContact, setReporterContact] = useState("+62 000-0000-0000");
  const [location, setLocation] = useState("Lokasi Simulasi");
  const [type, setType] = useState("Protester / Demonstrasi");
  const [category, setCategory] = useState<HazardCategory>("man_made");
  const [severity, setSeverity] = useState<Severity>("major");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} WIB`;
    const newId = `SIM-${Date.now().toString().slice(-4)}`;

    // Determine SOP reference (same logic as report modal)
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
      status: "under_review",
      reporter: {
        name: reporterName,
        role: reporterRole,
        contact: reporterContact,
        avatar: reporterName.slice(0, 2).toUpperCase(),
      },
      lat: -6.2915,
      lng: 107.1725,
      aiRecommendation: {
        summary: `Simulasi laporan \"${type}\" di ${location}.`,
        confidence: 100,
        manualBookRefId: sopRef,
        suggestedActions: [
          "Verifikasi situasi secara simulasi.",
          "Tindak lanjuti sesuai SOP.",
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
      <Card className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-800 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between border-b p-5 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Tambah Data Simulasi</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data simulasi akan ditambahkan ke daftar laporan dengan status <b>On Review</b>.
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-sm">
            {/* Reporter Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sim-name" className="text-xs">Nama Pelapor</Label>
                <Input id="sim-name" value={reporterName} onChange={e => setReporterName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sim-role" className="text-xs">Jabatan / Regu</Label>
                <Input id="sim-role" value={reporterRole} onChange={e => setReporterRole(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-contact" className="text-xs">Kontak</Label>
              <Input id="sim-contact" value={reporterContact} onChange={e => setReporterContact(e.target.value)} required />
            </div>
            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="sim-loc" className="text-xs">Lokasi Temuan</Label>
              <Input id="sim-loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="Contoh: Gedung A, Area 3" required />
            </div>
            {/* Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sim-type" className="text-xs">Tipe Bahaya / Kejadian</Label>
                <select
                  id="sim-type"
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                  value={type}
                  onChange={e => {
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
                <Label htmlFor="sim-sev" className="text-xs">Level Severity</Label>
                <select
                  id="sim-sev"
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                  value={severity}
                  onChange={e => setSeverity(e.target.value as Severity)}
                >
                  {(["insignificant", "minor", "moderate", "major", "catastrophic"] as const).map(s => (
                    <option key={s} value={s}>
                      {settings.severityConfigs?.[s]?.label || s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="sim-desc" className="text-xs">Deskripsi</Label>
              <Textarea id="sim-desc" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 p-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" /> Simpan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
