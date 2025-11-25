"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Users, Calendar, Eye, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [statsRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reports/dashboard-stats`, { headers }),
        fetch(`${API_BASE_URL}/api/reports/monthly-trends`, { headers }),
      ]);

      if (!statsRes.ok || !trendsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [stats, trends] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
      ]);

      setDashboardStats(stats.data);
      setMonthlyTrends(trends.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysExams = () => {
    if (monthlyTrends.length === 0) return 0;
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    return Math.round(lastMonth.count / 30);
  };

  const stats = dashboardStats
    ? [
        {
          label: "Total Patients",
          value: dashboardStats.totalPatients.toLocaleString(),
          icon: Users,
          color: "bg-primary/10 text-primary",
        },
        {
          label: "Total Examined",
          value: dashboardStats.totalExamined.toLocaleString(),
          icon: Calendar,
          color: "bg-accent/10 text-accent",
        },
        {
          label: "Myopia Detections",
          value: dashboardStats.positiveDetections.toLocaleString(),
          icon: Eye,
          color: "bg-secondary/10 text-secondary",
        },
        {
          label: "Detection Rate",
          value: `${dashboardStats.detectionRate}%`,
          icon: TrendingUp,
          color: "bg-green-500/10 text-green-600",
        },
      ]
    : [];

  const chartData = monthlyTrends.map((trend: any) => ({
    month: trend.month,
    myopia: trend.detections,
    normal: trend.count - trend.detections,
    total: trend.count,
  }));

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-destructive">Error loading dashboard: {error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-lg mb-2">
              Welcome, {user?.name || "Administrator"}
            </h1>
            <p className="text-muted-foreground">Hospital Dashboard Overview</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            className="gap-2 cursor-pointer"
          >
            <Loader2 size={16} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="heading-sm mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="heading-sm mb-4">Myopia Detection Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                  <Bar
                    dataKey="myopia"
                    fill="var(--color-accent)"
                    radius={[8, 8, 0, 0]}
                    name="Myopia Detected"
                  />
                  <Bar
                    dataKey="normal"
                    fill="var(--color-primary)"
                    radius={[8, 8, 0, 0]}
                    name="Normal"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="heading-sm mb-4">Monthly Examinations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                    dataKey="total"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)" }}
                    name="Total Examinations"
                  />
                  <Line
                    type="monotone"
                    dataKey="myopia"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-accent)" }}
                    name="Myopia Cases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {dashboardStats && (
          <Card className="p-6">
            <h3 className="heading-sm mb-4">Myopia Risk Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Low Risk</p>
                <p className="text-2xl font-bold text-green-700 mt-2">
                  {dashboardStats.myopiaDistribution.low}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (dashboardStats.myopiaDistribution.low /
                      dashboardStats.totalExamined) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">
                  Medium Risk
                </p>
                <p className="text-2xl font-bold text-yellow-700 mt-2">
                  {dashboardStats.myopiaDistribution.medium}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (dashboardStats.myopiaDistribution.medium /
                      dashboardStats.totalExamined) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-600 font-medium">High Risk</p>
                <p className="text-2xl font-bold text-red-700 mt-2">
                  {dashboardStats.myopiaDistribution.high}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (dashboardStats.myopiaDistribution.high /
                      dashboardStats.totalExamined) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="heading-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/patients")}
              className="w-full cursor-pointer"
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" />
              View All Patients
            </Button>
            <Button
              onClick={() => router.push("/examinations")}
              className="w-full cursor-pointer"
              variant="outline"
            >
              <Eye className="mr-2 h-4 w-4" />
              New Examination
            </Button>
            <Button
              onClick={() => router.push("/reports")}
              className="w-full cursor-pointer"
              variant="outline"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
