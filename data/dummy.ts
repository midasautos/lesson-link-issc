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
    box("zone-prod-a", "Production Area A", "critical", 2.0, 0.1, -3.9, -1.1, "Main production line"),
    box("zone-prod-b", "Production Area B", "critical", 2.0, 0.1, -0.9, 1.8, "Conveyor & assembly"),
    box("zone-warehouse", "Warehouse", "moderate", -0.1, -2.0, -0.9, 1.8, "Finished goods storage"),
    box("zone-utilities", "Utilities", "critical", -0.1, -2.0, -3.9, -1.1, "Power, compressors, boilers"),
    box("zone-admin", "Administration", "moderate", 2.0, 0.1, 2.0, 3.9, "Offices"),
    box("zone-tank", "Tank Farm", "critical", -0.1, -2.0, 2.0, 3.9, "Chemical & fuel tanks"),
];

export const DEFAULT_SITE: SiteConfig = {
    name: "Demo Plant",
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

/** 12 insiden hari ini → 2 critical, 3 major, 7 minor (sama seperti desain). */
export const todayIncidents: Incident[] = [
    incident("INC-012", "14:25", "Production Area B", "Mechanical", "critical", "Conveyor belt abnormal vibration detected.", "in_progress", 1.0, 0.4),
    incident("INC-011", "14:12", "Warehouse", "Slip & Fall", "major", "Worker slipped due to wet floor.", "under_review", -1.0, 0.4),
    incident("INC-010", "13:47", "Production Area A", "Chemical", "major", "Minor chemical leak detected (sensor).", "resolved", 1.0, -2.6),
    incident("INC-009", "13:20", "Utilities", "Fire", "minor", "Smoke detected in utility room (false alarm).", "resolved", -1.0, -2.6),
    incident("INC-008", "12:50", "Administration", "Ergonomic", "minor", "Employee reported back pain.", "resolved", 1.0, 3.0),
    incident("INC-007", "11:42", "Tank Farm", "Chemical", "critical", "Pressure reading above threshold on tank T-04.", "in_progress", -1.0, 3.0),
    incident("INC-006", "11:05", "Warehouse", "Forklift", "minor", "Forklift near-miss at aisle 3.", "resolved", -1.6, 1.0),
    incident("INC-005", "10:30", "Production Area A", "Electrical", "minor", "Exposed cable found near panel 2B.", "resolved", 0.8, -1.8),
    incident("INC-004", "09:48", "Utilities", "Mechanical", "major", "Compressor overheating alarm.", "under_review", -0.6, -3.4),
    incident("INC-003", "09:10", "Administration", "Ergonomic", "minor", "Monitor glare complaint in open office.", "resolved", 1.5, 2.6),
    incident("INC-002", "08:35", "Production Area B", "Housekeeping", "minor", "Oil spill cleaned near station 5.", "resolved", 0.6, 1.2),
    incident("INC-001", "07:55", "Warehouse", "PPE", "minor", "Visitor entered dock area without helmet.", "resolved", -0.5, -0.2),
];

/** 6 hari sebelum hari ini. Hari ini dihitung dari todayIncidents. */
export const trendHistory: TrendPoint[] = [
    { daysAgo: 6, minor: 6, major: 2, critical: 1 },
    { daysAgo: 5, minor: 4, major: 2, critical: 1 },
    { daysAgo: 4, minor: 6, major: 3, critical: 2 },
    { daysAgo: 3, minor: 5, major: 3, critical: 1 },
    { daysAgo: 2, minor: 6, major: 5, critical: 4 },
    { daysAgo: 1, minor: 6, major: 3, critical: 1 },
];

export const currentUser = {
    name: "Aditya Pratama",
    role: "Supervisor",
    initials: "AP",
    unreadNotifications: 3,
};
