import { SettingsView } from "@/components/settings/settings-view";

export const metadata = {
    title: "System Settings — LessonLink",
    description: "Pengaturan parameter sistem, level severity, tipe bahaya, dan sensitivitas AI monitoring",
};

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
            <SettingsView />
        </div>
    );
}
