"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState, useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, ZoomControl } from "react-leaflet";

import { DrawLayer } from "@/components/map/draw-layer";
import {
    Basemap,
    MapClick,
    MapReady,
    ViewController,
} from "@/components/map/map-base";
import { ZoneLayer } from "@/components/map/zone-layer";
import { centerIcon } from "@/lib/map-icons";
import { cn } from "@/lib/utils";
import type {
    BasemapKey,
    LatLng,
    MapView,
    ZoneFeature,
    ZoneLevel,
} from "@/types";

interface Props {
    initialCenter: [number, number];
    initialZoom: number;
    basemap: BasemapKey;
    zones: ZoneFeature[];
    selectedId: string | null;
    hiddenId: string | null;
    busy: boolean;
    onSelect: (id: string) => void;
    onMapClick: (p: LatLng) => void;
    draftPoints: LatLng[] | null;
    draftLevel: ZoneLevel;
    onMovePoint: (index: number, p: LatLng) => void;
    centerMarker: LatLng | null;
    view: MapView;
    onReady: (map: LeafletMap) => void;
}

export default function SiteEditorMap({
    initialCenter,
    initialZoom,
    basemap,
    zones,
    selectedId,
    hiddenId,
    busy,
    onSelect,
    onMapClick,
    draftPoints,
    draftLevel,
    onMovePoint,
    centerMarker,
    view,
    onReady,
}: Props) {
    const [mounted, setMounted] = useState(false);
    const [mapKey] = useState(() => `editor-map-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    const icon = useMemo(() => centerIcon(), []);

    if (!mounted) {
        return (
            <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground">
                Memuat peta editor…
            </div>
        );
    }

    return (
        <MapContainer
            key={mapKey}
            center={initialCenter}
            zoom={initialZoom}
            zoomControl={false}
            scrollWheelZoom
            className={
                cn("h-full w-full", busy && "map-crosshair")
            }
        >
            <Basemap type={basemap} />

            <ZoneLayer
                zones={zones}
                selectedId={selectedId}
                hiddenId={hiddenId}
                interactive={!busy}
                onSelect={onSelect}
            />

            {centerMarker && (
                <Marker
                    position={[centerMarker.lat, centerMarker.lng]}
                    icon={icon}
                    interactive={false}
                />
            )}

            {draftPoints && (
                <DrawLayer
                    points={draftPoints}
                    level={draftLevel}
                    onMovePoint={onMovePoint}
                />
            )}

            <MapClick onClick={onMapClick} />
            <ViewController view={view} />
            <MapReady onReady={onReady} />
            <ZoomControl position="bottomright" />
        </MapContainer>
    );
}
