import connectDB from "@/lib/mongodb";
import { ItemReport } from "@/models";
import { ReportModalView } from "@/components/reports/report-modal-view";

interface ModalPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function InterceptedReportModal({ params }: ModalPageProps) {
  const { id } = await params;

  try {
    await connectDB();
    const report = await ItemReport.findById(id).lean();
    if (!report) return null;

    return (
      <ReportModalView
        report={{
          id: report._id.toString(),
          itemName: report.itemName,
          description: report.description,
          reportType: report.reportType,
          category: report.category,
          imageUrl: report.images?.[0]?.url,
          state: report.state,
          city: report.city,
          locality: report.locality,
          date: report.lostFoundDate ? new Date(report.lostFoundDate).toISOString() : "",
        }}
      />
    );
  } catch (err) {
    console.error("Error loading intercepted report modal:", err);
    return null;
  }
}
