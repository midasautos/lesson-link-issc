import type { Severity, ZoneLevel } from "@/types";

export const SEVERITY_COLORS: Record<Severity, string> = {
    catastrophic: "#dc2626",
    major: "#f59e0b",
    moderate: "#eab308",
    minor: "#22c55e",
    insignificant: "#64748b",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
    catastrophic: "Catastrophic",
    major: "Major",
    moderate: "Moderate",
    minor: "Minor",
    insignificant: "Insignificant",
};

export const ZONE_STYLE: Record<
    ZoneLevel,
    { color: string; label: string; hint: string }
> = {
    high: {
        color: "#ef4444",
        label: "High",
        hint: "Area risiko tinggi (fasilitas utama, tank farm, gardu listrik, utilitas)",
    },
    moderate: {
        color: "#eab308",
        label: "Moderate",
        hint: "Area risiko sedang (gudang, loading dock, bengkel pemeliharaan)",
    },
    low: {
        color: "#22c55e",
        label: "Low",
        hint: "Area risiko rendah (gedung admin, koridor terbuka, parkir, taman)",
    },
};
