import { ReportsView } from "@/components/reports/reports-view";

export const metadata = {
    title: "Reports — LessonLink",
    description: "Laporan situasi lapangan dari personel dan saran penanganan berbasis AI",
};

export default function ReportsPage() {
    return (
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
            <ReportsView />
        </div>
    );
}
