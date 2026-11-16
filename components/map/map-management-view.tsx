"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import {
    Check,
    Copy,
    Crosshair,
    Download,
    Eye,
    Filter,
    Layers,
    LocateFixed,
    MapPin,
    MousePointerClick,
    Navigation,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Search,
    ShieldAlert,
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
import { ZoneLevelBadge } from "@/components/dashboard/badges";
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
            Loading Map View…
        </div>
    ),
});

type Mode = "idle" | "pickCenter" | "draw";

interface Draft {
    id: string | null;
    name: string;
    level: ZoneLevel;
    description: string;
    points: LatLng[];
}

const emptyDraft: Draft = {
    id: null,
    name: "",
    level: "high",
    description: "",
    points: [],
};

export function MapManagementView() {
    const { site, save, reset } = useSiteConfig();
    const [draftSite, setDraftSite] = useState<SiteConfig>(site);

    // Keep draftSite in sync with site store on initial mount
    const [lastSite, setLastSite] = useState(site);
    if (site !== lastSite) {
        setLastSite(site);
        setDraftSite(site);
    }

    const [map, setMap] = useState<LeafletMap | null>(null);
    const [basemap, setBasemap] = useState<BasemapKey>("satellite");
    const [mode, setMode] = useState<Mode>("idle");
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [view, setView] = useState<MapView>({ center: [site.center.lat, site.center.lng], nonce: 0 });
    const [dirty, setDirty] = useState(false);
    const [coordInput, setCoordInput] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);
    const [savedNotice, setSavedNotice] = useState(false);

    // Active Sidebar Tab: "zones" | "location" | "draw" | "import"
    const [activeTab, setActiveTab] = useState<"zones" | "location" | "draw" | "import">("zones");

    // Zone Search & Level Filter
    const [zoneSearch, setZoneSearch] = useState("");
    const [zoneLevelFilter, setZoneLevelFilter] = useState<ZoneLevel | "all">("all");

    const zones = draftSite.zones.features;

    // Filtered zones list
    const filteredZones = useMemo(() => {
        return zones.filter((z) => {
            if (zoneLevelFilter !== "all" && z.properties.level !== zoneLevelFilter) {
                return false;
            }
            if (!zoneSearch.trim()) return true;
            const q = zoneSearch.toLowerCase();
            return (
                z.properties.name.toLowerCase().includes(q) ||
                (z.properties.description && z.properties.description.toLowerCase().includes(q))
            );
        });
    }, [zones, zoneLevelFilter, zoneSearch]);

    // Focus on zone on map
    const focusZone = (z: ZoneFeature) => {
        setSelectedId(z.properties.id);
        const b = boundsOf(zoneLatLngs(z));
        if (b) {
            setView({ center: [0, 0], bounds: b, nonce: Date.now() });
        }
    };

    const handleSave = () => {
        save(draftSite);
        setDirty(false);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    const handleReset = () => {
        const next = reset();
        setDraftSite(next);
        setDraft(emptyDraft);
        setSelectedId(null);
        setMode("idle");
        setDirty(false);
        setView({ center: [next.center.lat, next.center.lng], zoom: next.zoom, nonce: Date.now() });
    };

    // Center picking
    const handlePickCenter = () => {
        setMode("pickCenter");
        setSelectedId(null);
    };

    const handleCoordCommit = () => {
        if (!coordInput.trim()) return;
        const p = parseCoordinateString(coordInput);
        if (!p) {
            setParseError("Format koordinat tidak valid. Gunakan format: -6.2915, 107.1720");
            return;
        }
        setParseError(null);
        setDraftSite((s) => ({ ...s, center: p }));
        setDirty(true);
        setView({ center: [p.lat, p.lng], zoom: draftSite.zoom, nonce: Date.now() });
        setCoordInput("");
    };

    // Drawing handlers
    const startDrawing = (level: ZoneLevel) => {
        setDraft({
            id: null,
            name: `Zona Baru ${zones.length + 1}`,
            level,
            description: "",
            points: [],
        });
        setSelectedId(null);
        setMode("draw");
        setActiveTab("draw");
    };

    const handleEditZone = (z: ZoneFeature) => {
        setDraft({
            id: z.properties.id,
            name: z.properties.name,
            level: z.properties.level,
            description: z.properties.description ?? "",
            points: zoneLatLngs(z),
        });
        setSelectedId(z.properties.id);
        setMode("draw");
        setActiveTab("draw");
        focusZone(z);
    };

    const handleMapClick = (p: LatLng) => {
        if (mode === "pickCenter") {
            setDraftSite((s) => ({ ...s, center: p }));
            setDirty(true);
            setMode("idle");
            return;
        }

        if (mode === "draw") {
            setDraft((d) => ({ ...d, points: [...d.points, p] }));
        }
    };

    const handleSaveDraft = () => {
        if (draft.points.length < 3 || !draft.name.trim()) return;

        const id = draft.id ?? `zone-${Date.now().toString(36)}`;
        const ring = latLngsToRing(draft.points);

        const newFeature: ZoneFeature = {
            type: "Feature",
            properties: {
                id,
                name: draft.name.trim(),
                level: draft.level,
                description: draft.description.trim() || undefined,
            },
            geometry: {
                type: "Polygon",
                coordinates: [ring],
            },
        };

        const next = draft.id
            ? zones.map((z) => (z.properties.id === draft.id ? newFeature : z))
            : [...zones, newFeature];

        setDraftSite((s) => ({
            ...s,
            zones: { ...s.zones, features: next },
        }));

        setDraft(emptyDraft);
        setMode("idle");
        setSelectedId(id);
        setDirty(true);
        setActiveTab("zones");
    };

    const handleDeleteZone = (id: string) => {
        setDraftSite((s) => ({
            ...s,
            zones: {
                ...s.zones,
                features: s.zones.features.filter((z) => z.properties.id !== id),
            },
        }));
        if (selectedId === id) setSelectedId(null);
        setDirty(true);
    };

    // GeoJSON Export & Import
    const handleDownload = () => {
        const json = JSON.stringify(toGeoJSON(draftSite), null, 2);
        const blob = new Blob([json], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${draftSite.name.toLowerCase().replace(/\s+/g, "-")}-zones.geojson`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const res = parseSiteGeoJSON(String(reader.result ?? ""));
            if (res.ok) {
                const center = res.site?.center ?? draftSite.center;
                const zoom = res.site?.zoom ?? draftSite.zoom;
                const name = res.site?.name ?? draftSite.name;
                setDraftSite({
                    name,
                    center,
                    zoom,
                    zones: { type: "FeatureCollection", features: res.zones },
                });
                setDirty(true);
                setView({ center: [center.lat, center.lng], zoom, nonce: Date.now() });
                setActiveTab("zones");
            } else {
                alert(`File GeoJSON tidak valid: ${res.error}`);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Map & Area Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola batas area kritis/moderate, titik lokasi fasilitas, serta poligon perimeter pengawasan.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {savedNotice && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                            <Check className="h-4 w-4" /> Tersimpan!
                        </span>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1.5"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Default
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!dirty}
                        className="gap-1.5 bg-primary font-semibold shadow-sm"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Simpan Perubahan
                    </Button>
                </div>
            </div>

            {/* Layout: Sidebar Controls + Main Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Interactive Map (7 Cols) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                    <Card className="overflow-hidden border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between p-3.5 bg-muted/40 border-b">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{draftSite.name}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">
                                    {draftSite.center.lat.toFixed(4)}, {draftSite.center.lng.toFixed(4)}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant={basemap === "satellite" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setBasemap("satellite")}
                                    className="h-7 text-xs px-2.5"
                                >
                                    Satelit
                                </Button>
                                <Button
                                    variant={basemap === "streets" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setBasemap("streets")}
                                    className="h-7 text-xs px-2.5"
                                >
                                    Jalan (Streets)
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    title="Pusatkan Peta"
                                    onClick={() =>
                                        setView({
                                            center: [draftSite.center.lat, draftSite.center.lng],
                                            zoom: draftSite.zoom,
                                            nonce: Date.now(),
                                        })
                                    }
                                >
                                    <LocateFixed className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardHeader>

                        <div className="relative h-[550px] w-full">
                            <SiteEditorMap
                                initialCenter={[draftSite.center.lat, draftSite.center.lng]}
                                initialZoom={draftSite.zoom}
                                basemap={basemap}
                                zones={zones}
                                selectedId={selectedId}
                                hiddenId={draft.id}
                                busy={mode !== "idle"}
                                onSelect={(id) => {
                                    if (mode === "idle") {
                                        setSelectedId(id);
                                        const found = zones.find((z) => z.properties.id === id);
                                        if (found) focusZone(found);
                                    }
                                }}
                                onMapClick={handleMapClick}
                                draftPoints={mode === "draw" ? draft.points : null}
                                draftLevel={draft.level}
                                onMovePoint={(index, p) =>
                                    setDraft((d) => {
                                        const pts = [...d.points];
                                        pts[index] = p;
                                        return { ...d, points: pts };
                                    })
                                }
                                centerMarker={draftSite.center}
                                view={view}
                                onReady={setMap}
                            />

                            {/* Mode indicator floating banner */}
                            {mode === "pickCenter" && (
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg flex items-center gap-2 animate-bounce">
                                    <Crosshair className="h-4 w-4" />
                                    Klik titik di peta untuk memindahkan Titik Pusat Pabrik
                                    <button
                                        onClick={() => setMode("idle")}
                                        className="rounded-full bg-black/20 p-0.5 hover:bg-black/40"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}

                            {mode === "draw" && (
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-slate-900/95 px-4 py-2 text-xs text-white shadow-lg backdrop-blur flex items-center gap-3">
                                    <span>
                                        Klik peta untuk menambah titik sudut poligon (
                                        <b>{draft.points.length} titik</b>)
                                    </span>
                                    {draft.points.length > 0 && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    points: d.points.slice(0, -1),
                                                }))
                                            }
                                        >
                                            <Undo2 className="h-3 w-3 mr-1" /> Undo Titik
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-6 text-[10px] px-2"
                                        onClick={() => {
                                            setDraft(emptyDraft);
                                            setMode("idle");
                                            setActiveTab("zones");
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            )}

                            {/* Legend Overlay */}
                            <div className="absolute bottom-3 left-3 z-[900] space-y-1 rounded-lg bg-white/90 p-2 text-[11px] shadow backdrop-blur dark:bg-slate-900/90 border">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-3.5 rounded-sm bg-red-500/30 border-2 border-red-500" />
                                    <span>Area Kritis (Critical)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-3.5 rounded-sm bg-sky-500/30 border-2 border-sky-500 border-dashed" />
                                    <span>Area Moderat (Moderate)</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Configuration Panel (5 Cols) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    {/* Navigation Tabs */}
                    <div className="grid grid-cols-4 gap-1 rounded-lg border bg-muted/60 p-1 text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab("zones")}
                            className={cn(
                                "rounded-md py-1.5 transition text-center",
                                activeTab === "zones"
                                    ? "bg-white text-primary shadow-xs dark:bg-slate-900"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Daftar Area
                        </button>
                        <button
                            onClick={() => setActiveTab("location")}
                            className={cn(
                                "rounded-md py-1.5 transition text-center",
                                activeTab === "location"
                                    ? "bg-white text-primary shadow-xs dark:bg-slate-900"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Site Location
                        </button>
                        <button
                            onClick={() => setActiveTab("draw")}
                            className={cn(
                                "rounded-md py-1.5 transition text-center",
                                activeTab === "draw"
                                    ? "bg-white text-primary shadow-xs dark:bg-slate-900"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {mode === "draw" ? "Edit Poligon" : "Gambar Baru"}
                        </button>
                        <button
                            onClick={() => setActiveTab("import")}
                            className={cn(
                                "rounded-md py-1.5 transition text-center",
                                activeTab === "import"
                                    ? "bg-white text-primary shadow-xs dark:bg-slate-900"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            GeoJSON
                        </button>
                    </div>

                    {/* TAB 1: DAFTAR AREA & ZONES (WITH SEARCH & FILTER) */}
                    {activeTab === "zones" && (
                        <Card>
                            <CardHeader className="p-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-primary" />
                                        Daftar Area ({zones.length})
                                    </CardTitle>
                                    <div className="flex gap-1.5">
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs gap-1 bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => startDrawing("high")}
                                        >
                                            <Plus className="h-3 w-3" /> Kritis
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs gap-1 bg-sky-600 hover:bg-sky-700 text-white"
                                            onClick={() => startDrawing("moderate")}
                                        >
                                            <Plus className="h-3 w-3" /> Moderat
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription className="text-xs">
                                    Gunakan search bar dan filter untuk mencari atau memfokuskan area.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 space-y-3">
                                {/* Search Bar Area */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama area atau deskripsi..."
                                        className="h-8 pl-8 text-xs"
                                        value={zoneSearch}
                                        onChange={(e) => setZoneSearch(e.target.value)}
                                    />
                                    {zoneSearch && (
                                        <button
                                            onClick={() => setZoneSearch("")}
                                            className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Filter Area Buttons */}
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
                                        <Filter className="h-3 w-3" /> Filter:
                                    </span>
                                    <button
                                        onClick={() => setZoneLevelFilter("all")}
                                        className={cn(
                                            "rounded px-2 py-0.5 text-[11px] font-medium transition",
                                            zoneLevelFilter === "all"
                                                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                                                : "text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        Semua ({zones.length})
                                    </button>
                                    <button
                                        onClick={() => setZoneLevelFilter("high")}
                                        className={cn(
                                            "rounded px-2 py-0.5 text-[11px] font-medium transition",
                                            zoneLevelFilter === "high"
                                                ? "bg-red-500 text-white"
                                                : "text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        High ({zones.filter((z) => z.properties.level === "high").length})
                                    </button>
                                    <button
                                        onClick={() => setZoneLevelFilter("moderate")}
                                        className={cn(
                                            "rounded px-2 py-0.5 text-[11px] font-medium transition",
                                            zoneLevelFilter === "moderate"
                                                ? "bg-sky-500 text-white"
                                                : "text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        Moderate ({zones.filter((z) => z.properties.level === "moderate").length})
                                    </button>
                                </div>

                                {/* Zone List */}
                                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                    {filteredZones.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                                            Tidak ada area yang sesuai dengan pencarian/filter.
                                        </div>
                                    ) : (
                                        filteredZones.map((z) => {
                                            const pts = zoneLatLngs(z);
                                            const areaM2 = approxAreaM2(pts);
                                            const isSelected = selectedId === z.properties.id;

                                            return (
                                                <div
                                                    key={z.properties.id}
                                                    onClick={() => focusZone(z)}
                                                    className={cn(
                                                        "group rounded-lg border p-3 text-xs transition-all cursor-pointer",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                            : "bg-white hover:border-slate-300 dark:bg-slate-900",
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                                                style={{
                                                                    backgroundColor:
                                                                        ZONE_STYLE[z.properties.level].color,
                                                                }}
                                                            />
                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                {z.properties.name}
                                                            </span>
                                                        </div>
                                                        <ZoneLevelBadge level={z.properties.level} />
                                                    </div>

                                                    {z.properties.description && (
                                                        <div className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                                                            {z.properties.description}
                                                        </div>
                                                    )}

                                                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                                                        <span>Luas: {formatArea(areaM2)}</span>
                                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                title="Fokus di peta"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    focusZone(z);
                                                                }}
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-amber-600 hover:text-amber-700"
                                                                title="Edit Poligon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditZone(z);
                                                                }}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                                                title="Hapus Poligon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteZone(z.properties.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 2: SITE LOCATION SETTINGS */}
                    {activeTab === "location" && (
                        <Card>
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    Pengaturan Lokasi Fasilitas
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Tentukan nama fasilitas, koordinat pusat (GPS), dan level zoom bawaan.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 space-y-4 text-xs">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nama Fasilitas / Site</Label>
                                    <Input
                                        value={draftSite.name}
                                        onChange={(e) => {
                                            setDraftSite((s) => ({ ...s, name: e.target.value }));
                                            setDirty(true);
                                        }}
                                        placeholder="Contoh: Demo Plant Kawasan Industri"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Titik Koordinat Pusat (Latitude, Longitude)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={`${draftSite.center.lat.toFixed(6)}, ${draftSite.center.lng.toFixed(6)}`}
                                            readOnly
                                            className="bg-muted font-mono"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePickCenter}
                                            className="shrink-0 gap-1 text-xs"
                                        >
                                            <Crosshair className="h-3.5 w-3.5 text-primary" />
                                            Pilih di Peta
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Input Manual Koordinat GPS</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="-6.2915, 107.1720"
                                            value={coordInput}
                                            onChange={(e) => setCoordInput(e.target.value)}
                                            className="font-mono text-xs"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleCoordCommit}
                                            className="shrink-0 text-xs"
                                        >
                                            Terapkan
                                        </Button>
                                    </div>
                                    {parseError && (
                                        <div className="text-[11px] text-red-500">{parseError}</div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <Label className="text-xs">Default Map Zoom</Label>
                                        <span className="font-semibold text-primary">{draftSite.zoom}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={12}
                                        max={19}
                                        step={1}
                                        value={draftSite.zoom}
                                        onChange={(e) => {
                                            const z = Number(e.target.value);
                                            setDraftSite((s) => ({ ...s, zoom: z }));
                                            setDirty(true);
                                            map?.setZoom(z);
                                        }}
                                        className="w-full cursor-pointer accent-primary"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 3: DRAW & EDIT ZONE */}
                    {activeTab === "draw" && (
                        <Card>
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Pencil className="h-4 w-4 text-primary" />
                                    {draft.id ? "Edit Poligon Area" : "Gambar Area Baru"}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Klik di peta untuk membuat titik sudut area (minimal 3 titik).
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 space-y-3 text-xs">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nama Area</Label>
                                    <Input
                                        value={draft.name}
                                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                        placeholder="Contoh: Tangki Bahan Kimia Selatan"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Level Zona Bahaya</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDraft((d) => ({ ...d, level: "high" }))}
                                            className={cn(
                                                "rounded-lg border p-2 text-left transition",
                                                draft.level === "high"
                                                    ? "border-red-500 bg-red-500/10 text-red-700 font-bold"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            Critical Zone
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDraft((d) => ({ ...d, level: "moderate" }))}
                                            className={cn(
                                                "rounded-lg border p-2 text-left transition",
                                                draft.level === "moderate"
                                                    ? "border-sky-500 bg-sky-500/10 text-sky-700 font-bold"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            Moderate Zone
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Deskripsi Area (Opsional)</Label>
                                    <Textarea
                                        rows={2}
                                        value={draft.description}
                                        onChange={(e) =>
                                            setDraft((d) => ({ ...d, description: e.target.value }))
                                        }
                                        placeholder="Fungsi aset di area ini..."
                                    />
                                </div>

                                <div className="rounded-lg bg-muted p-2.5 space-y-1">
                                    <div className="flex justify-between text-[11px]">
                                        <span>Jumlah Titik Sudut:</span>
                                        <span className="font-bold">{draft.points.length} titik</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>Estimasi Luas:</span>
                                        <span className="font-bold">
                                            {formatArea(approxAreaM2(draft.points))}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setDraft(emptyDraft);
                                            setMode("idle");
                                            setActiveTab("zones");
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="flex-1 bg-primary font-semibold"
                                        disabled={draft.points.length < 3 || !draft.name.trim()}
                                        onClick={handleSaveDraft}
                                    >
                                        Simpan Poligon
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 4: IMPORT / EXPORT GEOJSON */}
                    {activeTab === "import" && (
                        <Card>
                            <CardHeader className="p-4 pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Download className="h-4 w-4 text-primary" />
                                    Import & Export GeoJSON
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Backup atau impor batasan geospasial area pabrik dalam format standar.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 space-y-3 text-xs">
                                <div className="rounded-lg border p-3 space-y-2">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        Download GeoJSON
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Ekspor seluruh poligon zona area dan titik koordinat pusat saat ini.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        className="w-full gap-1.5"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh File GeoJSON
                                    </Button>
                                </div>

                                <div className="rounded-lg border p-3 space-y-2">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        Upload GeoJSON
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Unggah file .geojson atau .json untuk memperbarui poligon area.
                                    </p>
                                    <label className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed hover:bg-muted text-xs font-medium">
                                        <Upload className="h-3.5 w-3.5 text-primary" />
                                        Pilih File GeoJSON
                                        <input
                                            type="file"
                                            accept=".geojson,.json"
                                            onChange={handleUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
