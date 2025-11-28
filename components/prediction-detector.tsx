"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Volume2, VolumeX } from "lucide-react";
import { usePredictions } from "@/context/predictions-context";
import { useExaminations } from "@/context/examinations-context";

interface PredictionDetectorProps {
  onSuccess: () => void;
}

export default function PredictionDetector({
  onSuccess,
}: PredictionDetectorProps) {
  const { createPrediction, isLoading: contextLoading } = usePredictions();
  const { examinations, fetchExaminations } = useExaminations();
  const [formData, setFormData] = useState({
    examinationId: "",
  });
  const [selectedExamination, setSelectedExamination] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  const generateAnnouncement = (pred: any): string => {
    const riskLevel = pred.myopiaRisk || "unknown";
    const confidence = (pred.confidence * 100).toFixed(1);
    const sphericalEq = pred.sphericalEquivalent?.toFixed(2) || "0.00";

    let announcement = `Myopia prediction complete. `;
    announcement += `Risk level: ${riskLevel}. `;
    announcement += `Confidence: ${confidence} percent. `;
    announcement += `Spherical equivalent: ${sphericalEq} diopters. `;

    if (pred.mlPrediction) {
      announcement += `Machine learning prediction indicates ${pred.mlPrediction.toLowerCase()} vision. `;
    }

    if (pred.probabilityNormal > 50) {
      announcement += `Probability of normal vision: ${pred.probabilityNormal.toFixed(
        1
      )} percent. `;
    }

    // announcement += `Recommendations: `;
    // pred.recommendations.forEach((rec: string, idx: number) => {
    //   announcement += `${idx + 1}. ${rec}. `;
    // });

    return announcement;
  };

  const announceResults = (pred: any) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const announcement = generateAnnouncement(pred);
      const utterance = new SpeechSynthesisUtterance(announcement);

      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error("Speech synthesis error");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser");
    }
  };

  // Stop speech
  const stopAnnouncement = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    createPrediction(formData.examinationId)
      .then((prediction) => {
        setPrediction(prediction);

        setSuccess("Myopia prediction completed successfully");

        setTimeout(() => {
          announceResults(prediction);
        }, 500);

        setTimeout(() => onSuccess(), 2000);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to process prediction"
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Examination *
            </label>
            <select
              value={formData.examinationId}
              onChange={(e) => {
                const examId = e.target.value;
                setFormData({ ...formData, examinationId: examId });
                const exam = examinations.find((ex) => ex._id === examId);
                setSelectedExamination(exam || null);
                setPrediction(null);
                stopAnnouncement();
              }}
              required
              disabled={isLoading || contextLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">Select an examination</option>
              {examinations.map((exam: any) => (
                <option key={exam._id} value={exam._id}>
                  {exam.patientId.name} - {exam.notes.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {selectedExamination && (
            <Card className="p-4 bg-accent/5 border-accent/20">
              <h4 className="font-semibold mb-3">Examination Details</h4>
              <div className="space-y-3">
                {selectedExamination.imageUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedExamination.imageUrl}
                      alt="Eye examination"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(
                        selectedExamination.examinationDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Left Eye Vision:
                    </span>
                    <span className="font-medium">
                      {selectedExamination.leftEyeVision.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Right Eye Vision:
                    </span>
                    <span className="font-medium">
                      {selectedExamination.rightEyeVision.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Intraocular Pressure:
                    </span>
                    <span className="font-medium">
                      {selectedExamination.intraocularPressure.toFixed(1)} mmHg
                    </span>
                  </div>
                  {selectedExamination.notes && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground block mb-1">
                        Notes:
                      </span>
                      <p className="text-foreground">
                        {selectedExamination.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {prediction && (
            <Card className="p-4 bg-accent/5 border-accent/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Prediction Results</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    isSpeaking
                      ? stopAnnouncement()
                      : announceResults(prediction)
                  }
                  className="gap-2"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Announce
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <span className="font-semibold capitalize">
                    {prediction.myopiaRisk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-semibold">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {prediction.sphericalEquivalent !== undefined && (
                  <div className="flex justify-between">
                    <span>Spherical Equivalent:</span>
                    <span className="font-mono">
                      {prediction.sphericalEquivalent.toFixed(2)} D
                    </span>
                  </div>
                )}
                {prediction.mlPrediction && (
                  <div className="flex justify-between">
                    <span>ML Prediction:</span>
                    <span className="font-semibold">
                      {prediction.mlPrediction}
                    </span>
                  </div>
                )}
                {prediction.probabilityNormal && (
                  <div className="flex justify-between">
                    <span>Probability Normal:</span>
                    <span className="font-mono">
                      {prediction.probabilityNormal.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {prediction && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-accent font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || contextLoading || !formData.examinationId}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2.5"
      >
        {isLoading ? "Analyzing Image..." : "Run Myopia Detection"}
      </Button>
    </div>
  );
}
