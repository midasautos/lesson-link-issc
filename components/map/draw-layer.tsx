"use client";

import { Marker, Polygon, Polyline } from "react-leaflet";

import { toTuple } from "@/lib/geo";
import { vertexIcon } from "@/lib/map-icons";
import { ZONE_STYLE } from "@/lib/severity";
import type { LatLng, ZoneLevel } from "@/types";

interface Props {
    points: LatLng[];
    level: ZoneLevel;
    onMovePoint: (index: number, p: LatLng) => void;
}

export function DrawLayer({ points, level, onMovePoint }: Props) {
    const color = ZONE_STYLE[level].color;
    const positions = points.map(toTuple);

    return (
        <>
        {points.length >= 3 ? (
            <Polygon
                positions={positions}
                pathOptions={{
                    color,
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.25,
                    dashArray: "4 4",
                    interactive: false,
                }}
            />
        ) : points.length === 2 ? (
            <Polyline
                positions={positions}
                pathOptions={{ color, weight: 3, interactive: false }}
            />
        ) : null}

        {points.map((p, i) => (
            <Marker
                key={i}
                position={[p.lat, p.lng]}
                icon={vertexIcon(i === 0)}
                draggable
                eventHandlers={{
                    dragend: (e) => {
                    const ll = e.target.getLatLng();
                    onMovePoint(i, { lat: ll.lat, lng: ll.lng });
                    },
                }}
            />
        ))}
        </>
    );
}
