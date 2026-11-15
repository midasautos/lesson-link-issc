import { Suspense } from "react";
import { ManualBookView } from "@/components/manual-book/manual-book-view";

export const metadata = {
    title: "Manual Book & SOP — LessonLink",
    description: "Katalog prosedur standar operasional penanganan situasi darurat dan gangguan keamanan",
};

export default function ManualBookPage() {
    return (
        <div className="mx-auto max-w-[1600px] p-4 lg:p-6">
            <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat Manual Book...</div>}>
                <ManualBookView />
            </Suspense>
        </div>
    );
}
