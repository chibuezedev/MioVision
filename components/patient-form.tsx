"use client";

import type React from "react";

import { useState } from "react";
import { usePatients } from "@/context/patients-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Patient } from "@/lib/types";

interface PatientFormProps {
  onSuccess: () => void;
  initialData?: Patient;
}

export default function PatientForm({
  onSuccess,
  initialData,
}: PatientFormProps) {
  const { addPatient, updatePatient } = usePatients();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    gender: initialData?.gender || "male",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    emergencyContact: initialData?.emergencyContact || "",
    medicalHistory: initialData?.medicalHistory || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (initialData) {
        await updatePatient(initialData._id, {
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth),
        });
        setSuccess("Patient updated successfully");
      } else {
        await addPatient({
          ...formData,
          _id: crypto.randomUUID(),
          dateOfBirth: new Date(formData.dateOfBirth),
          hospitalId: "default",
        });
        setSuccess("Patient registered successfully");
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          gender: "male",
          dateOfBirth: "",
          emergencyContact: "",
          medicalHistory: "",
        });
      }
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Phone Number *
          </label>
          <Input
            type="tel"
            name="phone"
            placeholder="+234 (000) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <Input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Date of Birth *
          </label>
          <Input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Emergency Contact
          </label>
          <Input
            type="tel"
            name="emergencyContact"
            placeholder="Emergency contact number"
            value={formData.emergencyContact}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Address *</label>
        <Input
          type="text"
          name="address"
          placeholder="123 Main St, City, State"
          value={formData.address}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Medical History
        </label>
        <textarea
          name="medicalHistory"
          placeholder="Previous medical conditions, allergies, etc."
          value={formData.medicalHistory}
          onChange={handleChange}
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Patient"
            : "Register Patient"}
        </Button>
      </div>
    </form>
  );
}
