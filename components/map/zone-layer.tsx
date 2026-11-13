"use client";

import { Polygon, Tooltip } from "react-leaflet";

import { toTuple, zoneLatLngs } from "@/lib/geo";
import { ZONE_STYLE } from "@/lib/severity";
import type { ZoneFeature } from "@/types";

interface Props {
    zones: ZoneFeature[];
    selectedId?: string | null;
    hiddenId?: string | null;
    interactive?: boolean;
    onSelect?: (id: string) => void;
}

export function ZoneLayer({
    zones,
    selectedId,
    hiddenId,
    interactive = true,
    onSelect,
}: Props) {
    return (
        <>
        {zones
            .filter((z) => z.properties.id !== hiddenId)
            .map((z) => {
                const style = ZONE_STYLE[z.properties.level];
                const selected = z.properties.id === selectedId;
                return (
                    <Polygon
                        key={`${z.properties.id}-${interactive}`}
                        positions={zoneLatLngs(z).map(toTuple)}
                        pathOptions={{
                            color: style.color,
                            weight: selected ? 4 : 2,
                            fillColor: style.color,
                            fillOpacity: selected ? 0.38 : 0.2,
                            dashArray: z.properties.level === "moderate" ? "6 4" : undefined,
                            interactive,
                        }}
                        eventHandlers={
                            onSelect
                            ? { click: () => onSelect(z.properties.id) }
                            : undefined
                        }
                    >
                        <Tooltip sticky>
                            {z.properties.name} · {style.label}
                        </Tooltip>
                    </Polygon>
                );
            })}
        </>
    );
}
