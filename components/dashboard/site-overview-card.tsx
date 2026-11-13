"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import { LocateFixed, MapPin, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayIncidents } from "@/data/dummy";
import { useSiteConfig } from "@/lib/site-store";
import { SEVERITY_COLORS, ZONE_STYLE } from "@/lib/severity";

const SiteMapView = dynamic(() => import("@/components/map/site-map-view"), {
    ssr: false,
    loading: () => (
        <div className="grid h-full place-items-center bg-muted text-sm text-muted-foreground">
            Loading map…
        </div>
    ),
});

export function SiteOverviewCard() {
    const { site } = useSiteConfig();
    const [map, setMap] = useState<LeafletMap | null>(null);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />

                    Site Overview

                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                        · {site.name}
                    </span>
                </CardTitle>

                <div className="flex gap-1 rounded-lg border bg-white p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Zoom in"
                        onClick={() => map?.zoomIn()}
                    >
                        <Plus />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Zoom out"
                        onClick={() => map?.zoomOut()}
                    >
                        <Minus />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Recenter"
                        onClick={() =>
                            map?.setView([site.center.lat, site.center.lng], site.zoom)
                        }
                    >
                        <LocateFixed />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="relative z-0 h-[420px] overflow-hidden rounded-lg border">
                    <SiteMapView
                        key={`${site.center.lat},${site.center.lng},${site.zoom}`}
                        site={site}
                        incidents={todayIncidents}
                        onReady={setMap}
                    />

                    <div className="absolute bottom-3 left-3 z-[900] space-y-1 rounded-lg bg-white/90 px-3 py-2 text-[11px] shadow backdrop-blur">
                        <LegendRow color={ZONE_STYLE.critical.color} label="Critical zone" />
                        
                        <LegendRow
                            color={ZONE_STYLE.moderate.color}
                            label="Moderate zone"
                            dashed
                        />

                        <LegendRow color={SEVERITY_COLORS.critical} label="Open incident" dot />

                        <LegendRow color={SEVERITY_COLORS.minor} label="Resolved" dot />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LegendRow({
    color,
    label,
    dot,
    dashed,
}: {
    color: string;
    label: string;
    dot?: boolean;
    dashed?: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
        <span
            className={dot ? "h-2.5 w-2.5 rounded-full" : "h-2.5 w-4 rounded-sm border-2"}
            style={
                dot
                    ? { background: color }
                    : {
                        borderColor: color,
                        background: `${color}33`,
                        borderStyle: dashed ? "dashed" : "solid",
                    }
            }
        />
            {label}
        </div>
    );
}
