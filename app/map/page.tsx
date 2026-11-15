import { MapManagementView } from "@/components/map/map-management-view";

export const metadata = {
    title: "Map & Area Management — LessonLink",
    description: "Pengelolaan geospasial area kritis, zona fasilitas, dan pemetaan perimeter pabrik",
};

export default function MapPage() {
    return (
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
            <MapManagementView />
        </div>
    );
}
