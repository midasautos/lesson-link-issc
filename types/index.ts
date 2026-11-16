import type { 
    Feature, 
    FeatureCollection, 
    Polygon 
} from "geojson";

export const severityValue = {
    catastrophic: "destructive",
    major: "warning",
    moderate: "secondary",
    minor: "outline",
    insignificant: "ghost",
} as const;

export type Severity = keyof typeof severityValue;

export type IncidentStatus = "under_review" | "in_progress" | "resolved";

export type HazardCategory = "man_made" | "natural_hazard" | "operational";

export interface Incident {
    id: string;
    time: string;
    dayDate?: string;
    location: string;
    type: string;
    category?: HazardCategory;
    severity: Severity;
    description: string;
    status: IncidentStatus;
    lat: number;
    lng: number;
    aiSource?: string;
    aiConfidence?: number;
    manualBookRefId?: string;
    handlingSteps?: string[];
}

export interface ReporterInfo {
    name: string;
    role: string;
    contact?: string;
    avatar?: string;
}

export interface AIRecommendation {
    summary: string;
    confidence: number;
    manualBookRefId: string;
    suggestedActions: string[];
}

export interface Report {
    id: string;
    time: string;
    dayDate?: string;
    location: string;
    type: string;
    category: HazardCategory;
    severity: Severity;
    description: string;
    status: IncidentStatus;
    reporter: ReporterInfo;
    lat: number;
    lng: number;
    evidencePhoto?: string;
    aiRecommendation?: AIRecommendation;
}

export interface ManualBookStep {
    phase: string;
    title: string;
    instructions: string[];
}

export interface ManualBookItem {
    id: string;
    title: string;
    hazardType: string;
    category: HazardCategory;
    severity: Severity;
    summary: string;
    steps: ManualBookStep[];
    equipment: string[];
    responsibleRoles: string[];
    estimatedResolutionTime: string;
    lastUpdated?: string;
}

export interface SeverityConfigItem {
    key: Severity;
    label: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    description: string;
}

export interface HazardTypeConfig {
    id: string;
    name: string;
    category: HazardCategory;
    defaultSeverity: Severity;
    description: string;
}

export interface SystemSettings {
    severityConfigs: Record<Severity, SeverityConfigItem>;
    hazardTypes: HazardTypeConfig[];
    aiConfidenceThreshold: number;
    autoReviewEnabled: boolean;
    notificationSound: boolean;
}

export const zoneLevelValue = {
    high: "destructive",
    moderate: "warning",
    low: "outline",
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
    insignificant: number;
    minor: number;
    moderate: number;
    major: number;
    catastrophic: number;
}

export type BasemapKey = "satellite" | "streets";

export interface MapView {
    center: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
    /** naikkan nilainya setiap kali ingin memicu pindah view */
    nonce: number;
}
