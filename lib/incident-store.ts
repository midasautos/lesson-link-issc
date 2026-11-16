"use client";

import { useCallback, useEffect, useState } from "react";
import type { Incident, IncidentStatus } from "@/types";

const KEY = "lessonlink:incidents:v3";
const EVENT = "lessonlink:incidents-updated";

export const initialIncidents: Incident[] = [
    {
        id: "INC-2026-001",
        time: "14:25 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Gerbang Utama (Main Gate)",
        type: "Protester / Demonstrasi",
        category: "man_made",
        severity: "major",
        description: "AI CCTV mendeteksi kerumunan 35+ orang berkumpul di depan pintu gerbang utama membawa spanduk.",
        status: "under_review",
        lat: -6.2912,
        lng: 107.1724,
        aiSource: "Perimeter Vision AI (Cam 01-Gate)",
        aiConfidence: 94,
        manualBookRefId: "SOP-MAN-PROT-01",
        handlingSteps: [
            "Kunci perimeter drop-arm & alihkan truk logistik ke Gerbang Timur.",
            "Koordinasikan penyiagaan barikade crowd-control dengan Chief Security.",
            "Hubungi aparat Polsek terdekat untuk asistensi ring luar.",
        ],
    },
    {
        id: "INC-2026-002",
        time: "13:50 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Tank Farm (Tangki T-04)",
        type: "Fire / Kebakaran",
        category: "natural_hazard",
        severity: "catastrophic",
        description: "Thermal sensor mendeteksi lonjakan temperatur drastis (220°C) disertai anomali asap di sekitar katup pipa.",
        status: "in_progress",
        lat: -6.2925,
        lng: 107.1750,
        aiSource: "Thermal Radiometric AI Sensor S-08",
        aiConfidence: 98,
        manualBookRefId: "SOP-NAT-FIRE-01",
        handlingSteps: [
            "Aktivasi Emergency Shutdown System (ESD) pipa bahan bakar tangki T-04.",
            "Kerahkan tim Fire Brigade internal berpakaian tahan panas & SCBA.",
            "Nyalakan sistem deluge foam spray pendingin dinding tangki.",
        ],
    },
    {
        id: "INC-2026-003",
        time: "12:15 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Warehouse Barat (Loading Dock 2)",
        type: "Flood / Banjir",
        category: "natural_hazard",
        severity: "major",
        description: "Sensor genangan mendeteksi luapan air hujan setinggi 22 cm mengalir menuju area penyimpanan pallet.",
        status: "under_review",
        lat: -6.2925,
        lng: 107.1729,
        aiSource: "Hydraulic Flood Sensor H-03",
        aiConfidence: 89,
        manualBookRefId: "SOP-NAT-FLOOD-01",
        handlingSteps: [
            "Aktifkan pompa submersible darurat di bak kontrol barat.",
            "Susun barikade sandbag di bibir pintu loading dock.",
            "Evakuasi pallet bahan baku sensitif air ke rak tier 2 & tier 3.",
        ],
    },
    {
        id: "INC-2026-004",
        time: "11:30 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Pagar Batas Sektor Timur",
        type: "Damage Property / Vandalisme",
        category: "man_made",
        severity: "moderate",
        description: "Deteksi getaran pagar roboh sepanjang 6 meter terbentur maneuver truk trailer.",
        status: "in_progress",
        lat: -6.2915,
        lng: 107.1755,
        aiSource: "Acoustic Fence Sensor A-12",
        aiConfidence: 92,
        manualBookRefId: "SOP-MAN-PROP-01",
        handlingSteps: [
            "Pasang batas pita pembatas keselamatan (safety tape) di zona pagar roboh.",
            "Tugaskan 1 personil satpam stasioner menjaga celah perimeter.",
            "Panggil tim maintenance sipil untuk pemasangan barikade seng darurat.",
        ],
    },
    {
        id: "INC-2026-005",
        time: "10:05 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Gedung Produksi A",
        type: "Chemical Spill / B3",
        category: "natural_hazard",
        severity: "catastrophic",
        description: "Gas detector mendeteksi konsentrasi uap asam sulfat melebihi ambang batas aman (15 ppm).",
        status: "resolved",
        lat: -6.2905,
        lng: 107.1695,
        aiSource: "Multi-Gas Detector MG-02",
        aiConfidence: 96,
        manualBookRefId: "SOP-NAT-CHEM-01",
        handlingSteps: [
            "Evakuasi pekerja radius 25 meter ke arah berlawanan mata angin (upwind).",
            "Petugas Hazmat menggunakan chemical spill kit untuk netralisasi tumpahan.",
            "Verifikasi gas detector hingga kadar di bawah 1 ppm sebelum re-entry.",
        ],
    },
    {
        id: "INC-2026-006",
        time: "09:20 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Perimeter Utara (Zona Belakang)",
        type: "Unauthorized Intrusion / Penyusup",
        category: "man_made",
        severity: "catastrophic",
        description: "CCTV AI mendeteksi 1 orang tanpa seragam resmi melompati kawat berduri pagar utara.",
        status: "under_review",
        lat: -6.2900,
        lng: 107.1710,
        aiSource: "Boundary Intrusion AI (Cam 14)",
        aiConfidence: 95,
        manualBookRefId: "SOP-MAN-INTR-01",
        handlingSteps: [
            "Kunci otomatis seluruh pintu akses elektronik menuju gedung utilitas.",
            "Arahkan tim Quick Reaction Patrol menuju koordinat target via radio HT.",
            "Lakukan penangkapan terukur dan penggeledahan badan sebelum diserahkan ke pos pusat.",
        ],
    },
    {
        id: "INC-2026-007",
        time: "08:45 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Gedung Utilitas (Panel Listrik B)",
        type: "Fire / Kebakaran",
        category: "natural_hazard",
        severity: "minor",
        description: "Sensor inframerah mendeteksi percikan bunga api kecil pada isolator kabel switchgear 3.",
        status: "resolved",
        lat: -6.2925,
        lng: 107.1695,
        aiSource: "Arc Flash Optical Sensor AF-01",
        aiConfidence: 87,
        manualBookRefId: "SOP-NAT-FIRE-02",
        handlingSteps: [
            "Matikan MCB suplai arus listrik breaker cabang.",
            "Semprotkan APAR CO2 5kg pada pangkal percikan api.",
            "Lakukan penggantian isolator kabel yang aus oleh teknisi elektrik.",
        ],
    },
    {
        id: "INC-2026-008",
        time: "08:10 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Gedung Produksi B (Assembly Line 1)",
        type: "Mechanical Breakdown",
        category: "operational",
        severity: "major",
        description: "Vibration telemetry sensor mencatat lonjakan getaran roller conveyor 5.2 mm/s (anomali bearing).",
        status: "under_review",
        lat: -6.2905,
        lng: 107.1730,
        aiSource: "Conveyor Vibration Monitor V-04",
        aiConfidence: 91,
        manualBookRefId: "SOP-OPE-MECH-01",
        handlingSteps: [
            "Tekan Emergency Stop conveyor dan pasang gembok LOTO.",
            "Ganti bearing roller yang aus dengan part cadangan dari gudang.",
            "Lakukan uji putar tanpa beban selama 10 menit sebelum restart produksi.",
        ],
    },
    {
        id: "INC-2026-009",
        time: "07:30 WIB",
        dayDate: "Senin, 16 Nov 2026",
        location: "Koridor Kantor Utama",
        type: "Housekeeping & Near-Miss",
        category: "operational",
        severity: "insignificant",
        description: "Ceceran air pendingin dispenser di lantai koridor berpotensi licin.",
        status: "resolved",
        lat: -6.2915,
        lng: 107.1738,
        aiSource: "Floor Camera Vision",
        aiConfidence: 88,
        manualBookRefId: "SOP-OPE-NEAR-01",
        handlingSteps: [
            "Pasang papan tanda peringatan Wet Floor.",
            "Panggil petugas kebersihan untuk pel kering.",
        ],
    },
];

function isValidIncidents(x: unknown): x is Incident[] {
    return Array.isArray(x) && x.length > 0 && typeof (x[0] as Incident).id === "string";
}

export function loadIncidents(): Incident[] {
    try {
        if (typeof window === "undefined") return initialIncidents;
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return initialIncidents;
        const parsed: unknown = JSON.parse(raw);
        return isValidIncidents(parsed) ? parsed : initialIncidents;
    } catch {
        return initialIncidents;
    }
}

export function saveIncidents(incidents: Incident[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(incidents));
    window.dispatchEvent(new Event(EVENT));
}

export function useIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const sync = () => setIncidents(loadIncidents());
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
        const list = loadIncidents().map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item,
        );
        saveIncidents(list);
    }, []);

    const addIncident = useCallback((newInc: Incident) => {
        const list = [newInc, ...loadIncidents()];
        saveIncidents(list);
    }, []);

    const deleteIncident = useCallback((id: string) => {
        const list = loadIncidents().filter((i) => i.id !== id);
        saveIncidents(list);
    }, []);

    const reset = useCallback(() => {
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(KEY);
            window.dispatchEvent(new Event(EVENT));
        }
    }, []);

    return {
        incidents,
        ready,
        updateStatus,
        addIncident,
        deleteIncident,
        reset,
    };
}
