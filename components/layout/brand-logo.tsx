import { ShieldCheck } from "lucide-react";

export function BrandLogo() {
    return (
        <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">
                LessonLink
            </span>
        </div>
    );
}
