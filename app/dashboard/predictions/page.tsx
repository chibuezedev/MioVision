"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PredictionDetector from "@/components/prediction-detector";
import { Plus, Search, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { usePredictions } from "@/context/predictions-context";

export default function PredictionsPage() {
  const [showDetector, setShowDetector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { predictions, fetchPredictions, isLoading } = usePredictions();

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const filteredPredictions = predictions.filter((p) =>
    p.recommendations?.some((rec: string) =>
      rec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="heading-lg mb-2">Myopia Detection & Prediction</h1>
          <p className="text-muted-foreground">
            AI-powered myopia risk assessment and analysis
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
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => fetchPredictions()}
            aria-label="Refresh predictions"
            className="whitespace-nowrap"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowDetector(!showDetector)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus size={20} />
            New Prediction
          </Button>
        </div>

        {showDetector && (
          <Card className="p-6">
            <PredictionDetector onSuccess={() => setShowDetector(false)} />
          </Card>
        )}

        {/* Predictions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading predictions...
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No predictions yet. Start a new analysis.
              </p>
            </div>
          ) : (
            filteredPredictions.map((pred, index) => (
              <Card
                key={`${pred._id}-${index}`}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Summary Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                  onClick={() => toggleExpand(pred._id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Date */}
                      <div className="min-w-[140px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(pred.predictedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          {new Date(pred.predictedAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {/* Risk Level */}
                      <div className="min-w-[120px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          Risk Level
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              pred.myopiaRisk === "high"
                                ? "bg-destructive"
                                : pred.myopiaRisk === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />
                          <span className="text-sm font-semibold capitalize">
                            {pred.myopiaRisk}
                          </span>
                        </div>
                      </div>

                      {/* ML Prediction */}
                      <div className="min-w-[120px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          ML Prediction
                        </p>
                        <p className="text-sm font-semibold">
                          {pred.mlPrediction}
                        </p>
                      </div>

                      {/* Confidence */}
                      <div className="min-w-[140px]">
                        <p className="text-xs text-muted-foreground mb-1">
                          Confidence
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${pred.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold min-w-[45px]">
                            {(pred.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(pred._id);
                      }}
                    >
                      {expandedId === pred._id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === pred._id && (
                  <div className="border-t border-border bg-accent/5 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Probabilities */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">
                          Detailed Probabilities
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Normal
                              </span>
                              <span className="font-medium">
                                {pred.probabilityNormal.toFixed(2)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${pred.probabilityNormal}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Myopia
                              </span>
                              <span className="font-medium">
                                {pred.probabilityMyopia.toFixed(2)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-destructive"
                                style={{
                                  width: `${pred.probabilityMyopia}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">
                          Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {pred.recommendations?.map(
                            (rec: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="text-accent font-bold mt-0.5">
                                  •
                                </span>
                                <span className="text-muted-foreground">
                                  {rec}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
