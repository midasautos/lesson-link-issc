import type { 
    Feature, 
    FeatureCollection, 
    Polygon 
} from "geojson";

const severityValue = {
    critical: "destructive",
    major: "warning",
    moderate: "secondary",
    minor: 
} as const;

export type Severity = keyof typeof severityValue;

export type IncidentStatus = "in_progress" | "under_review" | "resolved";

export interface Incident {
    id: string;
    time: string;
    location: string;
    type: string;
    severity: Severity;
    description: string;
    status: IncidentStatus;
    lat: number;
    lng: number;
}

export const zoneLevelValue = {
    critical: "destructive",
    moderate: "secondary"
} as const;

export type ZoneLevel = keyof typeof zoneLevelValue;

export interface ZoneProperties {
    id: string;
    name: string;
    level: ZoneLevel;
    description?: string;
}

export type ZoneFeature = Feature<Polygon, ZoneProperties>;
export type ZoneCollection = FeatureCollection<Polygon, ZoneProperties>;

export interface LatLng {
    lat: number;
    lng: number;
}

export interface SiteConfig {
    name: string;
    center: LatLng;
    zoom: number;
    zones: ZoneCollection;
}

export interface TrendPoint {
    daysAgo: number;
    minor: number;
    major: number;
    critical: number;
}

export type BasemapKey = "satellite" | "streets";

export interface MapView {
    center: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
    /** naikkan nilainya setiap kali ingin memicu pindah view */
    nonce: number;
}
