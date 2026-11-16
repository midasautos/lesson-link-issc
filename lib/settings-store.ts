"use client";

import { useCallback, useEffect, useState } from "react";
import type { HazardTypeConfig, Severity, SeverityConfigItem, SystemSettings } from "@/types";

const KEY = "lessonlink:system-settings:v3";
const EVENT = "lessonlink:settings-updated";

export const DEFAULT_SEVERITY_CONFIGS: Record<Severity, SeverityConfigItem> = {
    catastrophic: {
        key: "catastrophic",
        label: "Catastrophic",
        color: "#dc2626",
        badgeBg: "bg-red-600",
        badgeText: "text-white",
        description: "Ancaman kritis langsung terhadap keselamatan jiwa, aset primer, atau integritas fasilitas utama.",
    },
    major: {
        key: "major",
        label: "Major",
        color: "#f59e0b",
        badgeBg: "bg-amber-500",
        badgeText: "text-white",
        description: "Gangguan signifikan terhadap operasional pabrik atau potensi eskalasi bahaya sedang.",
    },
    moderate: {
        key: "moderate",
        label: "Moderate",
        color: "#eab308",
        badgeBg: "bg-yellow-400",
        badgeText: "text-yellow-950",
        description: "Insiden terkendali di area non-kritis yang membutuhkan tindakan terencana.",
    },
    minor: {
        key: "minor",
        label: "Minor",
        color: "#22c55e",
        badgeBg: "bg-emerald-500",
        badgeText: "text-white",
        description: "Penyimpangan kecil, hampir celaka (near-miss), atau housekeeping rutin.",
    },
    insignificant: {
        key: "insignificant",
        label: "Insignificant",
        color: "#64748b",
        badgeBg: "bg-slate-500",
        badgeText: "text-white",
        description: "Deviasi sangat kecil tanpa dampak langsung pada keselamatan atau operasional pabrik.",
    },
};

export const DEFAULT_HAZARD_TYPES: HazardTypeConfig[] = [
    {
        id: "haz-fire",
        name: "Fire / Kebakaran",
        category: "natural_hazard",
        defaultSeverity: "catastrophic",
        description: "Kebakaran struktur, percikan listrik, atau ledakan panas.",
    },
    {
        id: "haz-flood",
        name: "Flood / Banjir",
        category: "natural_hazard",
        defaultSeverity: "major",
        description: "Luapan saluran air, genangan hujan ekstrem, kebocoran pipa.",
    },
    {
        id: "haz-chem",
        name: "Chemical Spill / B3",
        category: "natural_hazard",
        defaultSeverity: "catastrophic",
        description: "Tumpahan zat beracun, korosif, atau uap kimia berbahaya.",
    },
    {
        id: "haz-prot",
        name: "Protester / Unlawful Gathering",
        category: "man_made",
        defaultSeverity: "major",
        description: "Kerumunan massa tanpa izin, pemblokadean pintu akses.",
    },
    {
        id: "haz-prop",
        name: "Damage Property / Vandalisme",
        category: "man_made",
        defaultSeverity: "moderate",
        description: "Pengrusakan fasilitas fisik, coretan, kerusakan pagar batas.",
    },
    {
        id: "haz-intr",
        name: "Unauthorized Intrusion / Penyusup",
        category: "man_made",
        defaultSeverity: "catastrophic",
        description: "Penyusupan individu tanpa izin ke area terlarang/kritis.",
    },
    {
        id: "haz-mech",
        name: "Mechanical Breakdown",
        category: "operational",
        defaultSeverity: "major",
        description: "Kegagalan mesin produksi, motor kompresor, atau conveyor.",
    },
    {
        id: "haz-near",
        name: "Housekeeping & Minor Near-Miss",
        category: "operational",
        defaultSeverity: "insignificant",
        description: "Ceceran air mineral, kabel berserak, atau penataan perkakas.",
    },
];

export const DEFAULT_SETTINGS: SystemSettings = {
    severityConfigs: DEFAULT_SEVERITY_CONFIGS,
    hazardTypes: DEFAULT_HAZARD_TYPES,
    aiConfidenceThreshold: 80,
    autoReviewEnabled: false,
    notificationSound: true,
};

function isValidSettings(x: unknown): x is SystemSettings {
    const s = x as SystemSettings;
    return !!s && typeof s === "object" && !!s.severityConfigs && Array.isArray(s.hazardTypes);
}

export function loadSettings(): SystemSettings {
    try {
        if (typeof window === "undefined") return DEFAULT_SETTINGS;
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed: unknown = JSON.parse(raw);
        return isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: SystemSettings) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(EVENT));
}

export function resetSettings(): SystemSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
    return DEFAULT_SETTINGS;
}

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const sync = () => setSettings(loadSettings());
        sync();
        setReady(true);
        window.addEventListener("storage", sync);
        window.addEventListener(EVENT, sync);

        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener(EVENT, sync);
        };
    }, []);

    const updateSeverity = useCallback((key: Severity, updates: Partial<SeverityConfigItem>) => {
        const current = loadSettings();
        const next: SystemSettings = {
            ...current,
            severityConfigs: {
                ...current.severityConfigs,
                [key]: {
                    ...current.severityConfigs[key],
                    ...updates,
                },
            },
        };
        saveSettings(next);
    }, []);

    const updateHazardTypes = useCallback((hazardTypes: HazardTypeConfig[]) => {
        const current = loadSettings();
        saveSettings({ ...current, hazardTypes });
    }, []);

    const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
        const current = loadSettings();
        saveSettings({ ...current, ...updates });
    }, []);

    const reset = useCallback(() => resetSettings(), []);

    return {
        settings,
        ready,
        updateSeverity,
        updateHazardTypes,
        updateSettings,
        reset,
    };
}
