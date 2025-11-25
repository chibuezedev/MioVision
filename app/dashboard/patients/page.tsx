"use client";

import { useEffect, useState } from "react";
import { usePatients } from "@/context/patients-context";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PatientForm from "@/components/patient-form";
import PatientTable from "@/components/patient-table";
import { Plus, Search, X } from "lucide-react";

export default function PatientsPage() {
  const { patients, isLoading, fetchPatients } = usePatients();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="heading-lg mb-2">Patient Management</h1>
          <p className="text-muted-foreground">
            Register, view, and manage patient records
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
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer"
          >
            {showForm ? <X size={20} /> : <Plus size={20} /> }
            {showForm ? "Close" : "Register Patient"}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6">
            <PatientForm onSuccess={() => setShowForm(false)} />
          </Card>
        )}

        {/* Table */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <PatientTable patients={filteredPatients} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
