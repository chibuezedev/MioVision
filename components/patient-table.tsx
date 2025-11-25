"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/context/patients-context";
import type { Patient } from "@/lib/types";
import { Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  const { deletePatient } = usePatients();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id);
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
    setDeletingId(null);
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No patients found. Register a new patient to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Phone</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Gender</th>
            <th className="text-left py-3 px-4 font-semibold">Address</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient._id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-4 px-4">{patient.name}</td>
              <td className="py-4 px-4">{patient.phone}</td>
              <td className="py-4 px-4">{patient.email || "-"}</td>
              <td className="py-4 px-4 capitalize">{patient.gender}</td>
              <td className="py-4 px-4">{patient.address}</td>
              <td className="py-4 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/patients/${patient._id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 cursor-pointer"
                    >
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(patient._id)}
                    disabled={deletingId === patient._id}
                    className="text-destructive hover:text-destructive/80 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
