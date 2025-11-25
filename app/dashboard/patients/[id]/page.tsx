"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatients } from "@/context/patients-context";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PatientForm from "@/components/patient-form";
import type { Patient } from "@/lib/types";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User } from "lucide-react";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { patients, getPatientById } = usePatients();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    if (!id) {
      setPatient(null);
      setIsLoading(false);
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const foundPatient = await getPatientById(id);
        if (!mounted) return;
        if (foundPatient) {
          setPatient(foundPatient);
        } else {
          setPatient(null);
        }
      } catch (err) {
        if (mounted) setPatient(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params?.id, patients, getPatientById]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Patient not found</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const age =
    new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const formattedDOB = new Date(patient.dateOfBirth).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="heading-lg">{patient.name}</h1>
              <p className="text-muted-foreground">Patient ID: {patient._id}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        {/* Edit Form or View */}
        {isEditing ? (
          <Card className="p-6">
            <PatientForm
              initialData={patient}
              onSuccess={() => {
                setIsEditing(false);
              }}
            />
          </Card>
        ) : (
          <>
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="heading-md mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={20} className="text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar
                      size={20}
                      className="text-primary mt-1 shrink-0"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {formattedDOB} ({age} years)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-1 shrink-0 text-primary flex items-center">
                      <span className="text-sm font-medium">●</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{patient.gender}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="heading-md mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  {patient.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{patient.address}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Emergency Contact & Medical History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patient.emergencyContact && (
                <Card className="p-6">
                  <h2 className="heading-md mb-4">Emergency Contact</h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    Contact Person
                  </p>
                  <p className="font-medium">{patient.emergencyContact}</p>
                </Card>
              )}

              {patient.medicalHistory && (
                <Card className="p-6">
                  <h2 className="heading-md mb-4">Medical History</h2>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {patient.medicalHistory}
                  </p>
                </Card>
              )}
            </div>

            {/* Registration Details */}
            <Card className="p-6">
              <h2 className="heading-md mb-4">Registration Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Registration Date</p>
                  <p className="font-medium">
                    {new Date(patient.registrationDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hospital ID</p>
                  <p className="font-medium">{patient.hospitalId}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
