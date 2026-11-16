"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimulationForm } from "@/components/simulation/simulation-form";
import { ReportsView } from "@/components/reports/reports-view";
import { useReports } from "@/lib/report-store";

export default function SimulationPage() {
  const { addReport } = useReports();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center py-8">
      <div className="w-full max-w-4xl bg-white border border-blue-800 rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Simulation Data Entry</h1>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-primary hover:bg-primary text-white"
          >
            Tambah Simulasi
          </Button>
        </div>

        <SimulationForm open={isOpen} onClose={() => setIsOpen(false)} onSubmit={addReport} />

        {/* Reuse the existing Reports view to list the simulated entries */}
        <div className="mt-8">
          <ReportsView />
        </div>
      </div>
    </div>
  );
}
