"use client";

import { useCallback, useEffect, useState } from "react";
import type { IncidentStatus, Report } from "@/types";

const KEY = "lessonlink:reports:v2";
const EVENT = "lessonlink:reports-updated";

export const initialReports: Report[] = [
    {
        id: "REP-2026-101",
        time: "14:10 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Gerbang Timur (Pos 2)",
        type: "Protester / Demonstrasi",
        category: "man_made",
        severity: "major",
        description: "Melihat sekitar 15 motor berkumpul di seberang pos 2 membagikan pamflet seruan aksi buruh untuk besok pagi.",
        status: "under_review",
        reporter: {
            name: "Budi Santoso",
            role: "Security Guard - Regu A",
            contact: "+62 812-3456-7890",
            avatar: "BS",
        },
        lat: -6.2915,
        lng: 107.1752,
        aiRecommendation: {
            summary: "AI merekomendasikan penyiagaan barikade dan koordinasi dini dengan Binmaspol sebelum massa bertambah.",
            confidence: 91,
            manualBookRefId: "SOP-MAN-PROT-01",
            suggestedActions: [
                "Tingkatkan patroli mobile di sepanjang jalan luar pos timur.",
                "Simpan rekaman video pamflet untuk data intelijen security.",
                "Laporkan ke Chief Security untuk koordinasi dengan Kapolsek.",
            ],
        },
    },
    {
        id: "REP-2026-102",
        time: "13:30 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Kantin Karyawan & Koridor Timur",
        type: "Damage Property / Vandalisme",
        category: "man_made",
        severity: "moderate",
        description: "Ditemukan coretan grafiti cat semprot pada dinding luar kantin baru dan satu lampu penerangan taman pecah.",
        status: "in_progress",
        reporter: {
            name: "Siti Rahmawati",
            role: "Facility Housekeeping Lead",
            contact: "+62 813-8899-1122",
            avatar: "SR",
        },
        lat: -6.2910,
        lng: 107.1740,
        aiRecommendation: {
            summary: "AI mendeteksi potensi penyusup malam hari yang belum teridentifikasi melalui titik buta kamera 07.",
            confidence: 86,
            manualBookRefId: "SOP-MAN-PROP-01",
            suggestedActions: [
                "Cek log rekaman CCTV lorong kantin antara pukul 01:00 - 04:00.",
                "Amankan pecahan kaca lampu taman agar tidak mencederai pejalan kaki.",
                "Jadwalkan pengecatan ulang dinding dan perbaikan fiting lampu.",
            ],
        },
    },
    {
        id: "REP-2026-103",
        time: "11:45 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Area Parkir Logistik & Kontainer",
        type: "Flood / Banjir",
        category: "natural_hazard",
        severity: "minor",
        description: "Saluran gorong-gorong tersumbat tumpukan sampah dedaunan, air mulai meluap setinggi mata kaki saat hujan deras.",
        status: "resolved",
        reporter: {
            name: "Ahmad Fauzi",
            role: "Driver Logistik Internal",
            contact: "+62 856-7788-9900",
            avatar: "AF",
        },
        lat: -6.2928,
        lng: 107.1735,
        aiRecommendation: {
            summary: "AI merekomendasikan pembersihan grating selokan untuk menghindari genangan masuk ke ban truk muatan.",
            confidence: 94,
            manualBookRefId: "SOP-NAT-FLOOD-01",
            suggestedActions: [
                "Angkat kisi-kisi besi dan bersihkan sumbatan sampah organik.",
                "Pasang rambu 'Awas Genangan Air Licin' di tikungan parkir.",
            ],
        },
    },
    {
        id: "REP-2026-104",
        time: "10:15 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Tank Farm Area Barat",
        type: "Chemical Spill / B3",
        category: "natural_hazard",
        severity: "critical",
        description: "Mencium bau menyengat seperti gas amonia di dekat flange pipa transfer T-02. Terlihat tetesan cairan di lantai bunding.",
        status: "under_review",
        reporter: {
            name: "Hendra Wijaya",
            role: "Operator Utilitas Shift Pagi",
            contact: "+62 811-2233-4455",
            avatar: "HW",
        },
        lat: -6.2922,
        lng: 107.1748,
        aiRecommendation: {
            summary: "AI mengklasifikasikan sebagai potensi kebocoran B3 kritis. Diperlukan isolasi segera sebelum uap terbawa angin.",
            confidence: 97,
            manualBookRefId: "SOP-NAT-CHEM-01",
            suggestedActions: [
                "Gunakan masker respirator kartrid asam segera sebelum mendekat.",
                "Tutup valve isolasi manual V-102 pada hulu pipa.",
                "Gelar chemical absorbent boom melingkari ceceran cairan.",
            ],
        },
    },
    {
        id: "REP-2026-105",
        time: "08:30 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Gedung Admin Lantai 2",
        type: "Unauthorized Intrusion / Penyusup",
        category: "man_made",
        severity: "major",
        description: "Ada tamu vendor tanpa tanda pengenal (visitor badge) berada di ruang server tanpa didampingi staf IT.",
        status: "resolved",
        reporter: {
            name: "Dewi Lestari",
            role: "Staff IT Helpdesk",
            contact: "+62 819-0011-2233",
            avatar: "DL",
        },
        lat: -6.2908,
        lng: 107.1745,
        aiRecommendation: {
            summary: "AI menyarankan pengawalan keluar dari server room dan verifikasi surat tugas vendor.",
            confidence: 93,
            manualBookRefId: "SOP-MAN-INTR-01",
            suggestedActions: [
                "Minta vendor keluar ke ruang resepsionis dan tahan kartu akses sementara.",
                "Verifikasi izin kerja (Permit to Work) ke PIC jaringan IT.",
                "Buat kartu visitor resmi di pos keamanan depan.",
            ],
        },
    },
    {
        id: "REP-2026-106",
        time: "07:50 WIB",
        dayDate: "Minggu, 15 Nov 2026",
        location: "Gudang Bahan Kimia",
        type: "Fire / Kebakaran",
        category: "natural_hazard",
        severity: "critical",
        description: "Terdengar bunyi mendesis kencang dan ada asap putih tipis dari regulator tabung gas nitrogen.",
        status: "under_review",
        reporter: {
            name: "Agus Pratama",
            role: "Petugas Gudang Bahan Baku",
            contact: "+62 878-9900-1122",
            avatar: "AP",
        },
        lat: -6.2920,
        lng: 107.1715,
        aiRecommendation: {
            summary: "AI merekomendasikan de-presurisasi darurat dan pemadaman sumber panas terdekat.",
            confidence: 95,
            manualBookRefId: "SOP-NAT-FIRE-01",
            suggestedActions: [
                "Evakuasi semua pekerja dari gudang bahan kimia.",
                "Tutup katup utama tabung menggunakan sarung tangan cryo.",
                "Siagakan APAR bubuk kering 6kg di luar pintu gudang.",
            ],
        },
    },
];

function isValidReports(x: unknown): x is Report[] {
    return Array.isArray(x) && x.length > 0 && typeof (x[0] as Report).id === "string";
}

export function loadReports(): Report[] {
    try {
        if (typeof window === "undefined") return initialReports;
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return initialReports;
        const parsed: unknown = JSON.parse(raw);
        return isValidReports(parsed) ? parsed : initialReports;
    } catch {
        return initialReports;
    }
}

export function saveReports(reports: Report[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(reports));
    window.dispatchEvent(new Event(EVENT));
}

export function useReports() {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const sync = () => setReports(loadReports());
        sync();
        setReady(true);
        window.addEventListener("storage", sync);
        window.addEventListener(EVENT, sync);

        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener(EVENT, sync);
        };
    }, []);

    const updateStatus = useCallback((id: string, nextStatus: IncidentStatus) => {
        const list = loadReports().map((r) =>
            r.id === id ? { ...r, status: nextStatus } : r,
        );
        saveReports(list);
    }, []);

    const addReport = useCallback((report: Report) => {
        const list = [report, ...loadReports()];
        saveReports(list);
    }, []);

    const deleteReport = useCallback((id: string) => {
        const list = loadReports().filter((r) => r.id !== id);
        saveReports(list);
    }, []);

    const reset = useCallback(() => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(KEY);
            window.dispatchEvent(new Event(EVENT));
        }
    }, []);

    return {
        reports,
        ready,
        updateStatus,
        addReport,
        deleteReport,
        reset,
    };
}
