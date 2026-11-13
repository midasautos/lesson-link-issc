import type { LatLng, SiteConfig, ZoneFeature, ZoneLevel } from "@/types";

export function ringToLatLngs(ring: number[][]): LatLng[] {
    const pts = ring.map(([lng, lat]) => ({ lat, lng }));
    if (pts.length > 1) {
        const first = pts[0];
        const last = pts[pts.length - 1];
        if (first.lat === last.lat && first.lng === last.lng) pts.pop();
    }
    return pts;
}

export function latLngsToRing(points: LatLng[]): number[][] {
    const ring = points.map((p) => [p.lng, p.lat]);
    if (ring.length) ring.push([...ring[0]]);
    return ring;
}

export function toTuple(p: LatLng): [number, number] {
    return [p.lat, p.lng];
}

export function zoneLatLngs(z: ZoneFeature): LatLng[] {
    return ringToLatLngs(z.geometry.coordinates[0]);
}

export function pointInPolygon(p: LatLng, poly: LatLng[]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].lng;
        const yi = poly[i].lat;
        const xj = poly[j].lng;
        const yj = poly[j].lat;
        const hit =
        yi > p.lat !== yj > p.lat &&
        p.lng < ((xj - xi) * (p.lat - yi)) / (yj - yi) + xi;
        if (hit) inside = !inside;
    }
    return inside;
}

/** Zona yang memuat titik. Kalau overlap, zona critical diprioritaskan. */
export function findZoneAt(p: LatLng, zones: ZoneFeature[]) {
    const hits = zones.filter((z) => pointInPolygon(p, zoneLatLngs(z)));
    return hits.find((z) => z.properties.level === "critical") ?? hits[0];
}

export function boundsOf(points: LatLng[]): [[number, number], [number, number]] {
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
    ];
}

export function approxAreaM2(points: LatLng[]): number {
    if (points.length < 3) return 0;
    const origin = points[0];
    const kx = 111_320 * Math.cos((origin.lat * Math.PI) / 180);
    const ky = 110_540;
    const xy = points.map((p) => ({
        x: (p.lng - origin.lng) * kx,
        y: (p.lat - origin.lat) * ky,
    }));
    let s = 0;
    for (let i = 0; i < xy.length; i++) {
        const a = xy[i];
        const b = xy[(i + 1) % xy.length];
        s += a.x * b.y - b.x * a.y;
    }
    return Math.abs(s) / 2;
}

export function formatArea(m2: number): string {
    return m2 < 10_000
        ? `${Math.round(m2).toLocaleString("en-US")} m²`
        : `${(m2 / 10_000).toFixed(2)} ha`;
}

/** Terima "-6.2915, 107.172" (format copy dari Google Maps) */
export function parseCoordinateString(input: string): LatLng | null {
    const m = input
        .trim()
        .match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*\)?$/);
    if (!m) return null;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
}

export function toGeoJSON(config: SiteConfig) {
    return {
        type: "FeatureCollection" as const,
        site: { name: config.name, center: config.center, zoom: config.zoom },
        features: config.zones.features,
    };
}

export type ImportResult =
    | {
        ok: true;
        zones: ZoneFeature[];
        site?: { name?: string; center?: LatLng; zoom?: number };
        skipped: number;
        }
    | { ok: false; error: string };

function normalizeRing(raw: unknown): number[][] | null {
    if (!Array.isArray(raw) || raw.length < 3) return null;
    const ring: number[][] = [];
    for (const pt of raw) {
        if (
            !Array.isArray(pt) ||
            typeof pt[0] !== "number" ||
            typeof pt[1] !== "number" ||
            Math.abs(pt[0]) > 180 ||
            Math.abs(pt[1]) > 90
        ) {
            return null;
        }
        ring.push([pt[0], pt[1]]);
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
    return ring.length >= 4 ? ring : null;
}

export function parseSiteGeoJSON(text: string): ImportResult {
    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        return { ok: false, error: "That is not valid JSON." };
    }

    let features: any[] | null = null;
    if (data?.type === "FeatureCollection" && Array.isArray(data.features)) {
        features = data.features;
    } else if (data?.type === "Feature") {
        features = [data];
    } else if (data?.type === "Polygon" || data?.type === "MultiPolygon") {
        features = [{ type: "Feature", properties: {}, geometry: data }];
    }
    if (!features) {
        return {
            ok: false,
            error: "Expected a GeoJSON FeatureCollection, Feature, or Polygon.",
        };
    }

    const zones: ZoneFeature[] = [];
    const usedIds = new Set<string>();
    let skipped = 0;

    features.forEach((f, idx) => {
        const g = f?.geometry;
        let rings: unknown[] = [];

        if (g?.type === "Polygon") rings = [g.coordinates?.[0]];
        else if (g?.type === "MultiPolygon")
            rings = (g.coordinates ?? []).map((p: unknown[]) => p?.[0]);
        else {
            skipped++;
            return;
        }

        rings.forEach((rawRing, ri) => {
        const ring = normalizeRing(rawRing);
        if (!ring) {
            skipped++;
            return;
        }
        const p = f.properties ?? {};
        let id: string =
            typeof p.id === "string" && p.id ? p.id : `zone-${idx + 1}-${ri + 1}`;
        while (usedIds.has(id)) id += "-x";
        usedIds.add(id);

        const level: ZoneLevel =
            p.level === "critical" || p.level === "moderate" ? p.level : "moderate";

        zones.push({
            type: "Feature",
            properties: {
                id,
                name:
                    typeof p.name === "string" && p.name.trim()
                    ? p.name.trim()
                    : `Zone ${zones.length + 1}`,
                level,
                description:
                    typeof p.description === "string" ? p.description : undefined,
            },
            geometry: { type: "Polygon", coordinates: [ring] },
        });
        });
    });

    if (!zones.length) {
        return { ok: false, error: "No valid Polygon features were found." };
    }

    let site: { name?: string; center?: LatLng; zoom?: number } | undefined;
    const s = data?.site;
    if (s && typeof s === "object") {
        const c = s.center;
        site = {
            name: typeof s.name === "string" ? s.name : undefined,
            center:
                c && typeof c.lat === "number" && typeof c.lng === "number"
                ? { lat: c.lat, lng: c.lng }
                : undefined,
            zoom: typeof s.zoom === "number" ? s.zoom : undefined,
        };
    }

    return { ok: true, zones, site, skipped };
}
