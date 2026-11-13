"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import {
    Check,
    Copy,
    Crosshair,
    Download,
    LocateFixed,
    MousePointerClick,
    Navigation,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Trash2,
    Undo2,
    Upload,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ZoneLevelBadge } from "../dashboard/badges";
import {
    approxAreaM2,
    boundsOf,
    formatArea,
    latLngsToRing,
    parseCoordinateString,
    parseSiteGeoJSON,
    toGeoJSON,
    zoneLatLngs,
} from "@/lib/geo";
import { ZONE_STYLE } from "@/lib/severity";
import { useSiteConfig } from "@/lib/site-store";
import { cn } from "@/lib/utils";
import type {
    BasemapKey,
    LatLng,
    MapView,
    SiteConfig,
    ZoneFeature,
    ZoneLevel,
} from "@/types";

const SiteEditorMap = dynamic(() => import("@/components/map/site-editor-map"), {
    ssr: false,
    loading: () => (
        <div className="grid h-full place-items-center bg-muted text-sm text-muted-foreground">
            Loading map…
        </div>
    ),
});

type Mode = "idle" | "pickCenter" | "draw";

interface Draft {
    id: string | null;
    points: LatLng[];
    name: string;
    level: ZoneLevel;
    description: string;
}

type Message = { type: "ok" | "error"; text: string } | null;

export function SiteEditor() {
    const { site, ready, save, reset } = useSiteConfig();

    if (!ready) {
        return (
        <div className="grid h-64 place-items-center text-sm text-muted-foreground">
            Loading site configuration…
        </div>
        );
    }
    return <EditorInner saved={site} onSave={save} onReset={reset} />;
}

function EditorInner({
    saved,
    onSave,
    onReset,
}: {
    saved: SiteConfig;
    onSave: (c: SiteConfig) => void;
    onReset: () => SiteConfig;
}) {
    const [name, setName] = useState(saved.name);
    const [latStr, setLatStr] = useState(String(saved.center.lat));
    const [lngStr, setLngStr] = useState(String(saved.center.lng));
    const [zoomStr, setZoomStr] = useState(String(saved.zoom));
    const [pasteStr, setPasteStr] = useState("");

    const [zones, setZones] = useState<ZoneFeature[]>(saved.zones.features);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [mode, setMode] = useState<Mode>("idle");

    const [basemap, setBasemap] = useState<BasemapKey>("satellite");
    const [view, setView] = useState<MapView>({
        center: [saved.center.lat, saved.center.lng],
        zoom: saved.zoom,
        nonce: 0,
    });
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
    const [geoText, setGeoText] = useState("");
    const [message, setMessage] = useState<Message>(null);

    const parsed = useMemo(() => {
        if (!latStr.trim() || !lngStr.trim() || !zoomStr.trim()) return null;

        const lat = Number(latStr);
        const lng = Number(lngStr);
        const zoom = Number(zoomStr);

        if (![lat, lng, zoom].every(Number.isFinite)) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

        return { lat, lng, zoom: Math.min(19, Math.max(1, Math.round(zoom))) };
    }, [latStr, lngStr, zoomStr]);

    const config: SiteConfig | null = useMemo(
        () =>
        parsed
            ? {
                name: name.trim() || "Untitled site",
                center: { lat: parsed.lat, lng: parsed.lng },
                zoom: parsed.zoom,
                zones: { type: "FeatureCollection", features: zones },
            }
            : null,
        [parsed, name, zones],
    );

    const dirty = useMemo(
        () => !config || JSON.stringify(config) !== JSON.stringify(saved),
        [config, saved],
    );

    const criticalCount = zones.filter((z) => z.properties.level === "critical").length;
    const moderateCount = zones.length - criticalCount;

    const flash = (type: "ok" | "error", text: string) => setMessage({ type, text });

    const flyTo = (lat: number, lng: number, zoom?: number) =>
        setView((v) => ({ center: [lat, lng], zoom, nonce: v.nonce + 1 }));

    const applyConfig = (c: SiteConfig) => {
        setName(c.name);
        setLatStr(String(c.center.lat));
        setLngStr(String(c.center.lng));
        setZoomStr(String(c.zoom));
        setZones(c.zones.features);
        setDraft(null);
        setMode("idle");
        setSelectedId(null);
        flyTo(c.center.lat, c.center.lng, c.zoom);
    };

    const goToCoordinates = () => {
        if (!parsed) {
            flash("error", "Invalid coordinates. Latitude must be -90…90 and longitude -180…180.");
            return;
        }
        flyTo(parsed.lat, parsed.lng, parsed.zoom);
    };

    const handlePaste = (value: string) => {
        setPasteStr(value);
        const c = parseCoordinateString(value);
        if (!c) return;
        setLatStr(String(c.lat));
        setLngStr(String(c.lng));
        flyTo(c.lat, c.lng, parsed?.zoom ?? 17);
        flash("ok", "Coordinates applied.");
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            flash("error", "Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = +pos.coords.latitude.toFixed(6);
                const lng = +pos.coords.longitude.toFixed(6);
                setLatStr(String(lat));
                setLngStr(String(lng));
                flyTo(lat, lng, parsed?.zoom ?? 17);
            },
            () => flash("error", "Could not get your location (permission denied?)."),
            { enableHighAccuracy: true, timeout: 10_000 },
        );
    };

    const useCurrentView = () => {
        if (!mapInstance) return;
        const c = mapInstance.getCenter();
        setLatStr(c.lat.toFixed(6));
        setLngStr(c.lng.toFixed(6));
        setZoomStr(String(mapInstance.getZoom()));
        flash("ok", "Center and zoom taken from the current map view.");
    };

    const startDraw = () => {
        setSelectedId(null);
        setDraft({ id: null, points: [], name: "", level: "critical", description: "" });
        setMode("draw");
    };

    const editShape = (z: ZoneFeature) => {
        setDraft({
            id: z.properties.id,
            points: zoneLatLngs(z),
            name: z.properties.name,
            level: z.properties.level,
            description: z.properties.description ?? "",
        });
        setSelectedId(z.properties.id);
        setMode("idle");
    };

    const patchDraft = (patch: Partial<Draft>) =>
        setDraft((d) => (d ? { ...d, ...patch } : d));

    const addPoint = (p: LatLng) =>
        setDraft((d) => (d ? { ...d, points: [...d.points, p] } : d));

    const movePoint = (i: number, p: LatLng) =>
        setDraft((d) =>
        d ? { ...d, points: d.points.map((q, idx) => (idx === i ? p : q)) } : d,
        );

    const undoPoint = () =>
        setDraft((d) => (d ? { ...d, points: d.points.slice(0, -1) } : d));

    const cancelDraft = () => {
        setDraft(null);
        setMode("idle");
    };

    const commitDraft = () => {
        if (!draft) return;

        if (draft.points.length < 3) {
            flash("error", "A zone needs at least 3 points.");
            return;
        }

        if (!draft.name.trim()) {
            flash("error", "Give the zone a name.");
            return;
        }

        const id = draft.id ?? `zone-${Date.now().toString(36)}`;
        const feature: ZoneFeature = {
            type: "Feature",
            properties: {
                id,
                name: draft.name.trim(),
                level: draft.level,
                description: draft.description.trim() || undefined,
            },
            geometry: { type: "Polygon", coordinates: [latLngsToRing(draft.points)] },
        };

        setZones((zs) =>
            draft.id ? zs.map((z) => (z.properties.id === id ? feature : z)) : [...zs, feature],
        );

        setSelectedId(id);
        setDraft(null);
        setMode("idle");
        flash("ok", "Zone added to the draft. Click “Save changes” to apply it to the dashboard.");
    };

    const deleteZone = (id: string) => {
        setZones((zs) => zs.filter((z) => z.properties.id !== id));
        if (selectedId === id) setSelectedId(null);
        if (draft?.id === id) cancelDraft();
    };

    const toggleLevel = (id: string) =>
        setZones((zs) =>
        zs.map((z) =>
            z.properties.id === id
            ? {
                ...z,
                properties: {
                    ...z.properties,
                    level: z.properties.level === "critical" ? "moderate" : "critical",
                },
                }
            : z,
        ),
        );

    const focusZone = (z: ZoneFeature) => {
        setSelectedId(z.properties.id);
        setView((v) => ({
            center: v.center,
            bounds: boundsOf(zoneLatLngs(z)),
            nonce: v.nonce + 1,
        }));
    };

    const handleMapClick = (p: LatLng) => {
        if (mode === "pickCenter") {
            setLatStr(p.lat.toFixed(6));
            setLngStr(p.lng.toFixed(6));
            setMode("idle");
            flash("ok", "Site center set from the map.");
        } else if (mode === "draw") {
            addPoint(p);
        }
    };

    const exportGeoJSON = () => {
        if (!config) return;

        const blob = new Blob([JSON.stringify(toGeoJSON(config), null, 2)], {
            type: "application/geo+json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `${(config.name || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyGeoJSON = async () => {
        if (!config) return;
        try {
            await navigator.clipboard.writeText(JSON.stringify(toGeoJSON(config), null, 2));
            flash("ok", "GeoJSON copied to clipboard.");
        } catch {
            flash("error", "Clipboard is not available in this context.");
        }
    };

    const importGeoJSON = (text: string) => {
        const res = parseSiteGeoJSON(text);

        if (!res.ok) {
            flash("error", res.error);
            return;
        }

        setZones(res.zones);
        setDraft(null);
        setMode("idle");
        setSelectedId(null);

        const pts = res.zones.flatMap(zoneLatLngs);
        const [[minLat, minLng], [maxLat, maxLng]] = boundsOf(pts);

        const center = res.site?.center ?? {
            lat: +((minLat + maxLat) / 2).toFixed(6),
            lng: +((minLng + maxLng) / 2).toFixed(6),
        };

        if (res.site?.name) setName(res.site.name);
        setLatStr(String(center.lat));
        setLngStr(String(center.lng));
        if (res.site?.zoom) setZoomStr(String(res.site.zoom));

        setView((v) => ({
            center: [center.lat, center.lng],
            bounds: [
                [minLat, minLng],
                [maxLat, maxLng],
            ],
            nonce: v.nonce + 1,
        }));

        flash(
            "ok",
            `Imported ${res.zones.length} zone(s)${res.skipped ? `, skipped ${res.skipped} unsupported feature(s)` : ""}.`,
        );
    };

    const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setGeoText(text);
        importGeoJSON(text);
        e.target.value = "";
    };

    const handleSave = () => {
        if (!config) {
            flash("error", "Fix the site coordinates before saving.");
            return;
        }

        onSave(config);
        flash("ok", "Saved. The dashboard map now uses this site and these zones.");
    };

    const handleReset = () => {
        if (!window.confirm("Reset to the demo site and zones? Your saved configuration will be removed.")) return;
        applyConfig(onReset());
        flash("ok", "Reset to demo data.");
    };

    const mapHint =
        mode === "draw"
            ? "Click on the map to add points (min. 3). Drag a point to adjust it."
            : mode === "pickCenter"
                ? "Click anywhere on the map to set the site center."
                : draft
                    ? "Drag the points to reshape the zone."
                    : null;

    return (
        <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Setup</h1>
            <p className="text-muted-foreground">
                Set the site location, then draw and classify its areas.
            </p>
            </div>
            <div className="flex items-center gap-2">
            {dirty && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Unsaved changes
                </span>
            )}
            <Button variant="outline" onClick={handleReset}>
                <RotateCcw /> Reset demo
            </Button>
            <Button onClick={handleSave} disabled={!dirty || !config}>
                <Save /> Save changes
            </Button>
            </div>
        </div>

        {message && (
            <div
            role="status"
            className={cn(
                "mb-4 flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                message.type === "ok"
                ? "border-sky-200 bg-sky-50 text-sky-900"
                : "border-red-200 bg-red-50 text-red-800",
            )}
            >
            <span>{message.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setMessage(null)}>
                <X className="h-4 w-4" />
            </button>
            </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="min-w-0 space-y-6">
                <Card>
                    <CardHeader>
                        <StepTitle n={1}>Site location</StepTitle>
                        <CardDescription>
                            Enter the coordinates first. The map and the dashboard center on this point.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="site-name">Site name</Label>
                            <Input
                                id="site-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Plant Cikarang"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="paste">Paste coordinates</Label>
                            <Input
                                id="paste"
                                value={pasteStr}
                                onChange={(e) => handlePaste(e.target.value)}
                                placeholder="-6.2915, 107.1720  (copied from Google Maps)"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                            <Label htmlFor="lat">Latitude</Label>
                            <Input
                                id="lat"
                                inputMode="decimal"
                                value={latStr}
                                onChange={(e) => setLatStr(e.target.value)}
                            />
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="lng">Longitude</Label>
                                <Input
                                    id="lng"
                                    inputMode="decimal"
                                    value={lngStr}
                                    onChange={(e) => setLngStr(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="zoom">Zoom</Label>
                                <Input
                                    id="zoom"
                                    inputMode="numeric"
                                    value={zoomStr}
                                    onChange={(e) => setZoomStr(e.target.value)}
                                />
                            </div>
                        </div>
                        {!parsed && (
                            <p className="text-xs text-red-600">
                                Coordinates are invalid (lat -90…90, lng -180…180).
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={goToCoordinates}>
                                <Navigation /> Go to location
                            </Button>

                            <Button
                                size="sm"
                                variant={mode === "pickCenter" ? "default" : "outline"}
                                onClick={() => {
                                    setDraft(null);
                                    setMode(mode === "pickCenter" ? "idle" : "pickCenter");
                                }}
                            >
                                <MousePointerClick /> Pick on map
                            </Button>

                            <Button size="sm" variant="outline" onClick={useCurrentView}>
                                <Crosshair /> Use map view
                            </Button>

                            <Button size="sm" variant="outline" onClick={useMyLocation}>
                                <LocateFixed /> My location
                            </Button>
                        </div>
                        </CardContent>
                    </Card>

                    {/* ---- 2. Zones ---- */}
                    <Card>
                        <CardHeader>
                            <StepTitle n={2}>Areas & classification</StepTitle>
                            <CardDescription>
                                Draw a shape for each area, then mark it{" "}
                                <b className="text-red-600">Critical</b> (key assets) or{" "}
                                <b className="text-sky-600">Moderate</b> (regular area).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!draft ? (
                                <Button onClick={startDraw} disabled={!parsed} className="w-full">
                                    <Plus /> Draw new area
                                </Button>
                            ) : (
                                <DraftForm
                                    draft={draft}
                                    mode={mode}
                                    onPatch={patchDraft}
                                    onUndo={undoPoint}
                                    onToggleAdding={() => setMode(mode === "draw" ? "idle" : "draw")}
                                    onSave={commitDraft}
                                    onCancel={cancelDraft}
                                />
                            )}

                            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                                <span>{zones.length} area(s)</span>
                                <span>
                                    {criticalCount} critical · {moderateCount} moderate
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {zones.length === 0 && (
                                    <li className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                        No areas yet. Click “Draw new area”.
                                    </li>
                                )}

                                {zones.map((z) => {
                                    const style = ZONE_STYLE[z.properties.level];
                                    const active = z.properties.id === selectedId;
                                    return (
                                        <li
                                            key={z.properties.id}
                                            className={cn(
                                                "flex items-center gap-2 rounded-lg border p-2.5 transition-colors",
                                                active ? "border-primary bg-accent" : "bg-white hover:bg-muted/50",
                                            )}
                                        >
                                            <span
                                                className="h-8 w-1.5 shrink-0 rounded-full"
                                                style={{ background: style.color }}
                                            />
                                            <button
                                                type="button"
                                                className="min-w-0 flex-1 text-left"
                                                onClick={() => focusZone(z)}
                                            >
                                                <div className="truncate text-sm font-medium">{z.properties.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    ≈ {formatArea(approxAreaM2(zoneLatLngs(z)))}
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                title="Click to switch level"
                                                onClick={() => toggleLevel(z.properties.id)}
                                            >
                                                <ZoneLevelBadge level={z.properties.level} />
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={`Edit shape of ${z.properties.name}`}
                                                onClick={() => editShape(z)}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                                aria-label={`Delete ${z.properties.name}`}
                                                onClick={() => deleteZone(z.properties.id)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <StepTitle n={3}>GeoJSON</StepTitle>
                            <CardDescription>
                                Export the site or import an existing GeoJSON (Polygon / MultiPolygon).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={exportGeoJSON} disabled={!config}>
                                    <Download /> Download
                                </Button>

                                <Button size="sm" variant="outline" onClick={copyGeoJSON} disabled={!config}>
                                    <Copy /> Copy
                                </Button>

                                <Button size="sm" variant="outline">
                                    <label className="cursor-pointer">
                                        <Upload /> Upload file
                                        <input
                                        type="file"
                                        accept=".geojson,.json,application/geo+json,application/json"
                                        className="sr-only"
                                        onChange={onFile}
                                        />
                                    </label>
                                </Button>
                            </div>
                            <Textarea
                                value={geoText}
                                onChange={(e) => setGeoText(e.target.value)}
                                rows={5}
                                className="font-mono text-xs"
                                placeholder='Paste GeoJSON here… {"type":"FeatureCollection","features":[…]}'
                            />
                            <Button
                                size="sm"
                                onClick={() => importGeoJSON(geoText)}
                                disabled={!geoText.trim()}
                            >
                                <Check /> Apply GeoJSON
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
                    <div className="relative z-0 h-[560px] xl:h-full">
                        <SiteEditorMap
                            initialCenter={[saved.center.lat, saved.center.lng]}
                            initialZoom={saved.zoom}
                            basemap={basemap}
                            zones={zones}
                            selectedId={selectedId}
                            hiddenId={draft?.id ?? null}
                            busy={mode !== "idle"}
                            onSelect={setSelectedId}
                            onMapClick={handleMapClick}
                            draftPoints={draft ? draft.points : null}
                            draftLevel={draft?.level ?? "critical"}
                            onMovePoint={movePoint}
                            centerMarker={parsed ? { lat: parsed.lat, lng: parsed.lng } : null}
                            view={view}
                            onReady={setMapInstance}
                        />

                        {mapHint && (
                            <div className="absolute left-3 top-3 z-[900] max-w-[60%] rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg">
                                {mapHint}
                            </div>
                        )}

                        <div className="absolute right-3 top-3 z-[900] flex rounded-lg border bg-white p-1 shadow">
                            {(["satellite", "streets"] as const).map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => setBasemap(b)}
                                    className={cn(
                                        "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                                        basemap === b
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent",
                                    )}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
    return (
        <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {n}
            </span>

            {children}
        </CardTitle>
    );
}

const LEVEL_OPTIONS: { value: ZoneLevel; title: string; text: string }[] = [
    {
        value: "critical",
        title: "Critical",
        text: "Contains key assets. Incidents here deserve top priority.",
    },
    {
        value: "moderate",
        title: "Moderate",
        text: "Regular area with no key assets.",
    },
];

function DraftForm({
    draft,
    mode,
    onPatch,
    onUndo,
    onToggleAdding,
    onSave,
    onCancel,
}: {
    draft: Draft;
    mode: Mode;
    onPatch: (p: Partial<Draft>) => void;
    onUndo: () => void;
    onToggleAdding: () => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    const enough = draft.points.length >= 3;

    return (
        <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-accent/40 p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                    {draft.id ? "Edit area" : "New area"}
                </span>

                <span className={cn("text-xs", enough ? "text-emerald-600" : "text-muted-foreground")}>
                    {draft.points.length} point(s){enough ? " ✓" : " · min. 3"}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    size="sm"
                    variant={mode === "draw" ? "default" : "outline"}
                    onClick={onToggleAdding}
                >
                    <Plus /> {mode === "draw" ? "Adding points…" : "Add more points"}
                </Button>

                <Button size="sm" variant="outline" onClick={onUndo} disabled={!draft.points.length}>
                    <Undo2 /> Undo
                </Button>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="zone-name">Area name</Label>
                <Input
                    id="zone-name"
                    value={draft.name}
                    onChange={(e) => onPatch({ name: e.target.value })}
                    placeholder="e.g. Tank Farm"
                />
            </div>

            <div className="space-y-1.5">
                <Label>Classification</Label>

                <div className="grid grid-cols-2 gap-2">
                    {LEVEL_OPTIONS.map((o) => {
                        const on = draft.level === o.value;
                        return (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => onPatch({ level: o.value })}
                            aria-pressed={on}
                            className={cn(
                            "rounded-lg border-2 bg-white p-2.5 text-left transition-colors",
                            on ? "shadow-sm" : "border-border opacity-70 hover:opacity-100",
                            )}
                            style={on ? { borderColor: ZONE_STYLE[o.value].color } : undefined}
                        >
                            <div className="flex items-center gap-1.5 text-sm font-semibold">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: ZONE_STYLE[o.value].color }}
                            />
                            {o.title}
                            </div>
                            <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{o.text}</div>
                        </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="zone-desc">Notes (optional)</Label>
                <Input
                    id="zone-desc"
                    value={draft.description}
                    onChange={(e) => onPatch({ description: e.target.value })}
                    placeholder="e.g. Chemical & fuel tanks"
                />
            </div>

            <div className="flex gap-2">
                <Button size="sm" onClick={onSave} disabled={!enough || !draft.name.trim()}>
                    <Check /> {draft.id ? "Update area" : "Add area"}
                </Button>

                <Button size="sm" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
