import React from "react";
import { ItemReportForm } from "@/components/reports/item-report-form";

export const metadata = {
  title: "Report Found Item | FoundIt India",
  description: "Report an article you found and help reunite it with its rightful owner.",
};

export default function ReportFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 py-10">
      <ItemReportForm reportType="FOUND" />
    </div>
  );
}
