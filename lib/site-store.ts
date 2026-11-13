"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SITE } from "@/data/dummy";
import type { SiteConfig } from "@/types";

const KEY = "lessonlink:site-config:v1";
const EVENT = "lessonlink:site-updated";

function isValidSite(x: unknown): x is SiteConfig {
    const s = x as SiteConfig;
    return (
        !!s &&
        typeof s.name === "string" &&
        typeof s.zoom === "number" &&
        typeof s.center?.lat === "number" &&
        typeof s.center?.lng === "number" &&
        s.zones?.type === "FeatureCollection" &&
        Array.isArray(s.zones.features)
    );
}

export function loadSiteConfig(): SiteConfig {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return DEFAULT_SITE;
        const parsed: unknown = JSON.parse(raw);
        return isValidSite(parsed) ? parsed : DEFAULT_SITE;
    } catch {
        return DEFAULT_SITE;
    }
}

export function saveSiteConfig(config: SiteConfig) {
    window.localStorage.setItem(KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(EVENT));
}

export function resetSiteConfig(): SiteConfig {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
    return DEFAULT_SITE;
}

export function useSiteConfig() {
    const [site, setSite] = useState<SiteConfig>(DEFAULT_SITE);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const sync = () => setSite(loadSiteConfig());
        sync();
        setReady(true);
        window.addEventListener("storage", sync);
        window.addEventListener(EVENT, sync);
        
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener(EVENT, sync);
        };
    }, []);

    const save = useCallback((config: SiteConfig) => saveSiteConfig(config), []);
    const reset = useCallback(() => resetSiteConfig(), []);

    return { site, ready, save, reset };
}
