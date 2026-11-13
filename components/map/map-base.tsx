"use client";

import { useEffect } from "react";
import type { Map as LeafletMap } from "leaflet";
import { TileLayer, useMap, useMapEvents } from "react-leaflet";

import type { BasemapKey, LatLng, MapView } from "@/types";

const BASEMAPS: Record<
    BasemapKey,
    { url: string; attribution: string; maxZoom: number }
> = {
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        maxZoom: 19,
    },
    streets: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
    },
};

export function Basemap({ type }: { type: BasemapKey }) {
    const b = BASEMAPS[type];
    return (
        <TileLayer
            key={type}
            url={b.url}
            attribution={b.attribution}
            maxZoom={b.maxZoom}
        />
    );
}

export function MapReady({ onReady }: { onReady?: (map: LeafletMap) => void }) {
    const map = useMap();
    useEffect(() => {
        onReady?.(map);
    }, [map]);
    return null;
}

export function ViewController({ view }: { view?: MapView }) {
    const map = useMap();
    useEffect(() => {
        if (!view || view.nonce === 0) return;
        if (view.bounds) {
            map.flyToBounds(view.bounds, { padding: [48, 48], duration: 0.8 });
        } else {
            map.flyTo(view.center, view.zoom ?? map.getZoom(), { duration: 0.8 });
        }
    }, [view?.nonce]);
    return null;
}

export function MapClick({ onClick }: { onClick?: (p: LatLng) => void }) {
    useMapEvents({
        click(e) {
            onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}
