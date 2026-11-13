"use client";

import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, Popup } from "react-leaflet";

import { Basemap, MapReady } from "@/components/map/map-base";
import { ZoneLayer } from "@/components/map/zone-layer";
import { findZoneAt } from "@/lib/geo";
import { pinIcon } from "@/lib/map-icons";
import { SEVERITY_COLORS, ZONE_STYLE } from "@/lib/severity";
import type { Incident, SiteConfig } from "@/types";

interface Props {
    site: SiteConfig;
    incidents: Incident[];
    onReady?: (map: LeafletMap) => void;
}

export default function SiteMapView({ site, incidents, onReady }: Props) {
    const zones = site.zones.features;

    const markers = useMemo(() =>
        incidents.map((i) => {
            const resolved = i.status === "resolved";
            return {
            incident: i,
            icon: resolved
                ? pinIcon(SEVERITY_COLORS.minor, "✓")
                : pinIcon(SEVERITY_COLORS[i.severity], "!"),
            zone: findZoneAt({ lat: i.lat, lng: i.lng }, zones),
            };
        }),
        [incidents, zones],
    );

    return (
        <MapContainer
            center={[site.center.lat, site.center.lng]}
            zoom={site.zoom}
            zoomControl={false}
            scrollWheelZoom
            className="h-full w-full"
        >
            <Basemap type="satellite" />

            <ZoneLayer zones={zones} interactive={false} />

            {markers.map(({ incident: i, icon, zone }) => (
                <Marker key={i.id} position={[i.lat, i.lng]} icon={icon}>
                    <Popup>
                        <div className="space-y-1 text-sm">
                            <div className="font-semibold">
                                {i.type} · {i.severity.toUpperCase()}
                            </div>

                            <div>{i.description}</div>

                            <div className="text-xs text-slate-500">
                                {i.location} · {i.time} WIB
                            </div>

                            {zone && (
                                <div className="text-xs">
                                    Zone: <b>{zone.properties.name}</b> ({ZONE_STYLE[zone.properties.level].label})
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapReady onReady={onReady} />
        </MapContainer>
    );
}
