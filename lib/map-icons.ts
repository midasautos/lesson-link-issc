import L from "leaflet";

export function pinIcon(color: string, glyph: string) {
    return L.divIcon({
        className: "ll-pin",
        html: `<div class="ll-pin__body" style="background:${color}"><span>${glyph}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 36],
        popupAnchor: [0, -34],
    });
}

export function vertexIcon(first: boolean) {
    return L.divIcon({
        className: "ll-vertex",
        html: `<div class="ll-vertex__dot${first ? " ll-vertex__dot--first" : ""}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

export function centerIcon() {
    return L.divIcon({
        className: "ll-center",
        html: `<div class="ll-center__dot"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}
