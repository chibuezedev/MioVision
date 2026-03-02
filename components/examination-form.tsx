"use client"

import type React from "react"
import { useState } from "react"
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useExaminations } from "@/context/examinations-context"
import { usePatients } from "@/context/patients-context"

interface ExaminationFormProps {
  onSuccess: () => void
}

export default function ExaminationForm({ onSuccess }: ExaminationFormProps) {
  const { createExamination, isLoading: contextLoading } = useExaminations()
  const { patients } = usePatients()
  const [formData, setFormData] = useState({
    patientId: "",
    leftEyeVision: "",
    rightEyeVision: "",
    intraocularPressure: "",
    notes: "",
    imageFile: null as File | null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


const validateIsRetina = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 100, 100);

      const { data } = ctx.getImageData(0, 0, 100, 100);
      let darkPixels = 0;
      let warmPixels = 0; // red > green > blue (retinal tissue color)
      let totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 30) darkPixels++;           // black background
        if (r > 80 && r > g * 1.2 && r > b * 1.5) warmPixels++; // reddish-orange tissue
      }

      const darkRatio = darkPixels / totalPixels;
      const warmRatio = warmPixels / totalPixels;

      console.log("Dark ratio:", darkRatio, "Warm ratio:", warmRatio);

      // Retinal image: significant dark border + warm center
      const isLikelyRetina = warmRatio > 0.35 || (darkRatio > 0.15 && warmRatio > 0.08);
      resolve(isLikelyRetina);
    };
    img.onerror = () => resolve(false);
  });
};
  
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  console.log("File selected:", file?.name);
  if (!file) return;

  setIsLoading(true); // Show a loader while TF processes
  setError("");

  const isValid = await validateIsRetina(file);

  if (!isValid) {
    setError("Error: The image does not appear to be a valid retinal scan. Please upload a clear eye image.");
    setFormData({ ...formData, imageFile: null });
    e.target.value = ""; // Clear the input field
  } else {
    setFormData({ ...formData, imageFile: file });
    setSuccess("Image validated: Retinal scan detected.");
    setTimeout(() => setSuccess(""), 3000);
  }
  setIsLoading(false);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setSuccess("")
  setIsLoading(true)

  try {
    const formDataToSend = new FormData()
    formDataToSend.append('patientId', formData.patientId)
    formDataToSend.append('notes', formData.notes)
    
    if (formData.leftEyeVision) {
      formDataToSend.append('leftEyeVision', formData.leftEyeVision)
    }
    if (formData.rightEyeVision) {
      formDataToSend.append('rightEyeVision', formData.rightEyeVision)
    }
    if (formData.intraocularPressure) {
      formDataToSend.append('intraocularPressure', formData.intraocularPressure)
    }
    
    if (formData.imageFile) {
      formDataToSend.append('image', formData.imageFile)
    }

    await createExamination(formDataToSend)

    setSuccess("Examination recorded successfully")
    setTimeout(() => onSuccess(), 1500)
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save examination")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Patient *</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={isLoading || contextLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Spherical refraction of left eye (SPHRLE)  *</label>
          <Input
            type="number"
            step="0.1"
            name="leftEyeVision"
            placeholder="If not measured, leave blank"
            value={formData.leftEyeVision}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Spherical refraction of right eye (SPHRRE) *</label>
          <Input
            type="number"
            step="0.1"
            name="rightEyeVision"
            placeholder="If not measured, leave blank"
            value={formData.rightEyeVision}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        {/* <div>
          <label className="block text-sm font-semibold mb-2">Intraocular Pressure</label>
          <Input
            type="number"
            step="0.1"
            name="intraocularPressure"
            placeholder="mmHg"
            value={formData.intraocularPressure}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div> */}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Examination Notes *</label>
        <textarea
          name="notes"
          placeholder="Clinical observations and findings..."
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Eye Image (needed)</label>
        <Input
          type="file"
          name="imageFile"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading}
          className="block w-full text-sm text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">Upload retinal or eye imaging for analysis</p>
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
          disabled={isLoading || contextLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isLoading ? "Saving..." : "Record Examination"}
        </Button>
      </div>
    </form>
  )
}
