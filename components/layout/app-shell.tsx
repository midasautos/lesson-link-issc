import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children } : { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Topbar />
            <div className="flex">
                <Sidebar />
                <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    )
}