import React from "react";
import { ItemReportForm } from "@/components/reports/item-report-form";

export const metadata = {
  title: "Report Lost Item | FoundIt India",
  description: "Submit details of your lost belonging to trigger AI-powered recovery across India.",
};

export default function ReportLostPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 py-10">
      <ItemReportForm reportType="LOST" />
    </div>
  );
}
