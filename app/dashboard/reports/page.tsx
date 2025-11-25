"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, Filter, Calendar, Loader2 } from "lucide-react";

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

export default function ReportsPage() {
  const [loading, setLoading] = useState<any>(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any>([]);
  const [ageGroupData, setAgeGroupData] = useState<any>([]);
  const [examinedPatients, setExaminedPatients] = useState<any>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [statsRes, trendsRes, ageRes, patientsRes] = await Promise.all([
        fetch(`${baseUrl}/api/reports/dashboard-stats`, { headers }),
        fetch(`${baseUrl}/api/reports/monthly-trends`, { headers }),
        fetch(`${baseUrl}/api/reports/age-group-analysis`, { headers }),
        fetch(`${baseUrl}/api/reports/examined-patients?limit=10`, { headers }),
      ]);

      // Check for errors
      if (!statsRes.ok || !trendsRes.ok || !ageRes.ok || !patientsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [stats, trends, age, patients] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        ageRes.json(),
        patientsRes.json(),
      ]);

      setDashboardStats(stats.data);
      setMonthlyTrends(trends.data);
      setAgeGroupData(age.data);
      setExaminedPatients(patients.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      dashboardStats,
      monthlyTrends,
      ageGroupData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myopia-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const myopiaDistribution = dashboardStats
    ? [
        {
          name: "Low Risk",
          value: dashboardStats.myopiaDistribution.low,
        },
        {
          name: "Medium Risk",
          value: dashboardStats.myopiaDistribution.medium,
        },
        {
          name: "High Risk",
          value: dashboardStats.myopiaDistribution.high,
        },
        {
          name: "No Myopia",
          value:
            dashboardStats.totalExamined -
            dashboardStats.myopiaDistribution.low -
            dashboardStats.myopiaDistribution.medium -
            dashboardStats.myopiaDistribution.high,
        },
      ]
    : [];

  const ageGroupChartData = ageGroupData.map((group: any) => ({
    name: group.ageGroup,
    count: group.count,
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-destructive">Error loading reports: {error}</p>
          <Button onClick={fetchAllData}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-lg mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Hospital-wide myopia detection statistics and insights
            </p>
          </div>
          <Button
            onClick={handleExportReport}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Download size={20} />
            Export Report
          </Button>
        </div>

        {/* Report Controls */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar size={18} />
            Date Range
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter size={18} />
            Filter
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={fetchAllData}
          >
            <Loader2 size={18} />
            Refresh
          </Button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Myopia Distribution */}
          <Card className="p-6">
            <h3 className="heading-md mb-4">Myopia Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={myopiaDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {myopiaDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Age Group Analysis */}
          <Card className="p-6">
            <h3 className="heading-md mb-4">
              Patient Distribution by Age Group
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageGroupChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[8, 8, 0, 0]}
                  name="Patients"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Monthly Trends */}
        {monthlyTrends.length > 0 && (
          <Card className="p-6">
            <h3 className="heading-md mb-4">Monthly Examination Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  name="Total Examinations"
                />
                <Line
                  type="monotone"
                  dataKey="detections"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  name="Myopia Detections"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="heading-md mt-2">
                {dashboardStats.totalPatients.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Examined</p>
              <p className="heading-md mt-2">
                {dashboardStats.totalExamined.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Positive Cases</p>
              <p className="heading-md mt-2">
                {dashboardStats.positiveDetections.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Detection Rate</p>
              <p className="heading-md mt-2">{dashboardStats.detectionRate}%</p>
            </Card>
          </div>
        )}

        {/* Recent Examinations Table */}
        {examinedPatients.length > 0 && (
          <Card className="p-6">
            <h3 className="heading-md mb-4">Recently Examined Patients</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">
                      Patient Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Gender
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Date of Birth
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examinedPatients.map((patient: any) => (
                    <tr
                      key={patient._id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">{patient.name}</td>
                      <td className="py-4 px-4">{patient.phone}</td>
                      <td className="py-4 px-4 capitalize">{patient.gender}</td>
                      <td className="py-4 px-4">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {new Date(
                          patient.registrationDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
