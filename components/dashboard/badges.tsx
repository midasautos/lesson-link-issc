import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABEL } from "@/lib/severity";
import { type IncidentStatus, severity } from "@/types";

export function SeverityBadge({ severity }: { severity: severity }) {
    return (
        <Badge variant={severity} className="min-w-16 justify-center">
            {SEVERITY_LABEL[severity]}
        </Badge>
    );
}

const STATUS: Record<
    IncidentStatus,
    { label: string; variant: "progress" | "review" | "resolved" }
> = {
    in_progress: { label: "In Progress", variant: "progress" },
    under_review: { label: "Under Review", variant: "review" },
    resolved: { label: "Resolved", variant: "resolved" },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
    const s = STATUS[status];
    return (
        <Badge variant={s.variant} className="min-w-24 justify-center">
        {s.label}
        </Badge>
    );
}
