import type {
    Incident,
    LatLng,
    SiteConfig,
    TrendPoint,
    ZoneFeature,
    ZoneLevel,
} from "@/types";

export const DEFAULT_CENTER: LatLng = { lat: -6.2915, lng: 107.172 };

const U = 0.001;
const at = (dLat: number, dLng: number): LatLng => ({
  lat: +(DEFAULT_CENTER.lat + dLat * U).toFixed(6),
  lng: +(DEFAULT_CENTER.lng + dLng * U).toFixed(6),
});

function box(
    id: string,
    name: string,
    level: ZoneLevel,
    n: number,
    s: number,
    w: number,
    e: number,
    description: string,
): ZoneFeature {
    const nw = at(n, w);
    const ne = at(n, e);
    const se = at(s, e);
    const sw = at(s, w);
    return {
        type: "Feature",
        properties: { id, name, level, description },
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [nw.lng, nw.lat],
                    [ne.lng, ne.lat],
                    [se.lng, se.lat],
                    [sw.lng, sw.lat],
                    [nw.lng, nw.lat],
                ],
            ],
        },
    };
}

export const defaultZones: ZoneFeature[] = [
    box("zone-prod-a", "Production Area A", "high", 2.0, 0.1, -3.9, -1.1, "Lini produksi utama & reaktor"),
    box("zone-prod-b", "Production Area B", "high", 2.0, 0.1, -0.9, 1.8, "Conveyor & assembly line"),
    box("zone-tank", "Tank Farm", "high", -0.1, -2.0, 2.0, 3.9, "Penyimpanan bahan kimia & bahan bakar"),
    box("zone-utilities", "Utilities & Power House", "high", -0.1, -2.0, -3.9, -1.1, "Gardu listrik, kompresor, boiler"),
    box("zone-warehouse", "Warehouse & Loading Dock", "moderate", -0.1, -2.0, -0.9, 1.8, "Penyimpanan barang jadi & logistik"),
    box("zone-admin", "Administration & Office", "low", 2.0, 0.1, 2.0, 3.9, "Gedung kantor & ruang rapat"),
    box("zone-parking", "Main Gate & Parking Area", "low", 2.2, 0.2, 4.0, 5.2, "Area parkir luar & pos sekuriti"),
];

export const DEFAULT_SITE: SiteConfig = {
    name: "Demo Plant Kawasan Industri",
    center: DEFAULT_CENTER,
    zoom: 16,
    zones: { type: "FeatureCollection", features: defaultZones },
};

function incident(
    id: string,
    time: string,
    location: string,
    type: string,
    severity: Incident["severity"],
    description: string,
    status: Incident["status"],
    dLat: number,
    dLng: number,
): Incident {
    const p = at(dLat, dLng);
    return { id, time, location, type, severity, description, status, ...p };
}

/** 12 insiden hari ini dengan 5 level severity */
export const todayIncidents: Incident[] = [
    incident("INC-012", "14:25", "Tank Farm", "Fire / Kebakaran", "catastrophic", "Lonjakan suhu drastis pada katup tangki T-04 disertai asap.", "in_progress", -1.0, 3.0),
    incident("INC-011", "14:12", "Main Gate", "Protester / Demonstrasi", "major", "Kerumunan massa buruh berkumpul memblokir akses truk logistik.", "under_review", 2.2, 4.5),
    incident("INC-010", "13:47", "Production Area A", "Chemical Spill / B3", "catastrophic", "Kebocoran uap asam sulfat pekat pada sambungan pipa.", "resolved", 1.0, -2.6),
    incident("INC-009", "13:20", "Warehouse", "Flood / Banjir", "major", "Luapan air hujan menggenangi area loading dock 2.", "in_progress", -1.0, 0.4),
    incident("INC-008", "12:50", "Pagar Timur", "Damage Property / Vandalisme", "moderate", "Pagar pembatas roboh tertabrak manuver trailer logistik.", "resolved", 1.0, 3.0),
    incident("INC-007", "11:42", "Utilities", "Mechanical Breakdown", "major", "Getaran motor kompresor utama melebihi ambang batas toleransi.", "in_progress", -0.6, -3.4),
    incident("INC-006", "11:05", "Production Area B", "Conveyor Slip", "moderate", "V-belt conveyor aus dan tergelincir di jalur packaging.", "resolved", 0.6, 1.2),
    incident("INC-005", "10:30", "Warehouse", "Housekeeping", "minor", "Tumpahan oli drum kecil di lorong 3 segera dibersihkan.", "resolved", -1.6, 1.0),
    incident("INC-004", "09:48", "Production Area A", "Electrical", "minor", "Lampu penerangan stasiun inspeksi berkedip (loose connection).", "under_review", 0.8, -1.8),
    incident("INC-003", "09:10", "Administration", "Ergonomic", "insignificant", "Keluhan posisi kursi kerja di ruang engineering.", "resolved", 1.5, 2.6),
    incident("INC-002", "08:35", "Main Gate", "Visitor Log", "insignificant", "Tamu vendor terlambat menukar kartu identitas.", "resolved", 2.1, 4.8),
    incident("INC-001", "07:55", "Warehouse", "PPE Near-Miss", "minor", "Sopir truk tidak memakai rompi reflektif saat turun di dock.", "resolved", -0.5, -0.2),
];

/** Trend 6 hari sebelumnya */
export const trendHistory: TrendPoint[] = [
    { daysAgo: 6, insignificant: 2, minor: 4, moderate: 2, major: 1, catastrophic: 0 },
    { daysAgo: 5, insignificant: 1, minor: 3, moderate: 3, major: 2, catastrophic: 1 },
    { daysAgo: 4, insignificant: 3, minor: 5, moderate: 2, major: 1, catastrophic: 0 },
    { daysAgo: 3, insignificant: 2, minor: 4, moderate: 4, major: 2, catastrophic: 1 },
    { daysAgo: 2, insignificant: 1, minor: 6, moderate: 3, major: 3, catastrophic: 1 },
    { daysAgo: 1, insignificant: 3, minor: 5, moderate: 2, major: 2, catastrophic: 0 },
];

export const currentUser = {
    name: "Aditya Pratama",
    role: "Supervisor HSE & Security",
    initials: "AP",
    unreadNotifications: 4,
};
