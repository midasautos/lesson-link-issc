import { IncidentsView } from "@/components/incidents/incidents-view";

export const metadata = {
    title: "Incidents — LessonLink",
    description: "Monitoring insiden otomatis berbasis AI dan alur penanganan situasi",
};

export default function IncidentsPage() {
    return (
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
            <IncidentsView />
        </div>
    );
}
