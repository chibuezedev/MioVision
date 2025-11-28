"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ExaminationForm from "@/components/examination-form";
import ExaminationTable from "@/components/examination-table";
import { Plus, Search } from "lucide-react";
import { useExaminations } from "@/context/examinations-context";

export default function ExaminationPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { examinations, fetchExaminations, isLoading } = useExaminations();

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  const filteredExaminations = examinations.filter((e) =>
    e.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="heading-lg mb-2">Patient Examination</h1>
          <p className="text-muted-foreground">
            Record and manage patient eye examination data
          </p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="Search by notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            onClick={() => fetchExaminations()}
            aria-label="Refresh examinations"
            className="whitespace-nowrap"
          >
            Refresh
          </Button>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus size={20} />
            New Examination
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6">
            <ExaminationForm onSuccess={() => setShowForm(false)} />
          </Card>
        )}

        {/* Table */}
        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading examinations...
            </div>
          ) : (
            <ExaminationTable examinations={filteredExaminations} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
