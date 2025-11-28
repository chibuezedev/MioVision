"use client";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

interface ExaminationTableProps {
  examinations: any[];
}

export default function ExaminationTable({
  examinations,
}: ExaminationTableProps) {
  if (examinations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No examinations recorded yet. Create a new examination to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">Patient</th>
            <th className="text-left py-3 px-4 font-semibold">
              Examination Date
            </th>
            <th className="text-left py-3 px-4 font-semibold">SPHRLE</th>
            <th className="text-left py-3 px-4 font-semibold">SPHRRE</th>
            <th className="text-left py-3 px-4 font-semibold">Notes</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {examinations.map((exam) => (
            <tr
              key={exam._id || exam.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-4 px-4">
                {exam.patientId?.name || exam.patientName}
              </td>
              <td className="py-4 px-4">
                {new Date(exam.examinationDate).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">{exam.leftEyeVision}</td>
              <td className="py-4 px-4">{exam.rightEyeVision}</td>
              <td className="py-4 px-4">{exam.notes?.substring(0, 30)}...</td>
              <td className="py-4 px-4 text-right">
                <Link href={`/dashboard/examination/${exam._id || exam.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
                    <Eye size={16} />
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
