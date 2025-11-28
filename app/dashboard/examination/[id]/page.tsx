"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit2, Save, X, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useExaminations } from "@/context/examinations-context";
import { useToast } from "@/hooks/use-toast";
import { examinationService } from "@/lib/examination-service";

export default function ExaminationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    getExaminationById,
    updateExamination,
    isLoading: contextLoading,
  } = useExaminations();
  const { toast } = useToast();

  const [examination, setExamination] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchExamination = async () => {
      setIsLoading(true);
      try {
        const data = await getExaminationById(params.id as string);
        if (data) {
          setExamination(data);
          setFormData(data);
          setPreviewImage(data.imageUrl || null);
        } else {
          toast({
            title: "Error",
            description: "Examination not found",
            variant: "destructive",
          });
          router.push("/dashboard/examination");
        }
      } catch (error) {
        console.error("[v0] Failed to fetch examination:", error);
        toast({
          title: "Error",
          description: "Failed to load examination details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamination();
  }, [params.id, getExaminationById, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        name === "leftEyeVision" ||
        name === "rightEyeVision" ||
        name === "intraocularPressure"
          ? Number.parseFloat(value) || 0
          : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    setIsUploadingImage(true);
    try {
      const result = await examinationService.uploadExaminationImage(
        params.id as string,
        file
      );
      setExamination((prev: any) => ({
        ...prev,
        imageUrl: result.imageUrl,
      }));
      setFormData((prev: any) => ({
        ...prev,
        imageUrl: result.imageUrl,
      }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      // Reset preview on error
      setPreviewImage(examination?.imageUrl || null);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateExamination(params.id as string, formData);
      setExamination(formData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Examination updated successfully",
      });
    } catch (error) {
      console.error("[v0] Failed to update examination:", error);
      toast({
        title: "Error",
        description: "Failed to update examination",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Examination not found</p>
        <Button onClick={() => router.push("/dashboard/examination")}>
          <ArrowLeft className="mr-2" size={16} />
          Back to Examinations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/examination")}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Examination Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {examination.patientId?.name || "Patient"}
              </p>
            </div>
          </div>
          <Button
            variant={isEditing ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                setFormData(examination);
                setPreviewImage(examination.imageUrl || null);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <X size={16} />
                Cancel
              </>
            ) : (
              <>
                <Edit2 size={16} />
                Edit
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eye Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewImage ? (
                  <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={previewImage || "/placeholder.svg"}
                      alt="Eye examination image"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No image available
                    </p>
                  </div>
                )}
                {isEditing && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full gap-2"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload New Image
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Patient Name
                    </p>
                    <p className="font-semibold">
                      {examination.patientId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">
                      {examination.patientId?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">
                      {examination.patientId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold capitalize">
                      {examination.patientId?.gender}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examination Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Examination Data</CardTitle>
                <CardDescription>
                  {new Date(examination.examinationDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          Left Eye Vision
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          name="leftEyeVision"
                          value={formData.leftEyeVision || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., 0.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Right Eye Vision
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          name="rightEyeVision"
                          value={formData.rightEyeVision || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., 0.6"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Intraocular Pressure
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        name="intraocularPressure"
                        value={formData.intraocularPressure || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., 0.8"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleInputChange}
                        placeholder="Enter examination notes..."
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Left Eye Vision
                        </p>
                        <p className="text-lg font-semibold">
                          {examination.leftEyeVision || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Right Eye Vision
                        </p>
                        <p className="text-lg font-semibold">
                          {examination.rightEyeVision || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Intraocular Pressure
                      </p>
                      <p className="text-lg font-semibold">
                        {examination.intraocularPressure || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-base whitespace-pre-wrap">
                        {examination.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor Name</p>
                    <p className="font-semibold">
                      {examination.createdBy?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">
                      {examination.createdBy?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold">
                      {new Date(examination.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
