import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport } from "@/models";
import { deleteImage } from "@/lib/cloudinary";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    await connectDB();
    const report = await ItemReport.findById(id);

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const isOwner = report.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only modify your own reports." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { images } = body; // Array of { url, publicId }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided" },
        { status: 400 }
      );
    }

    // Check maximum total images limit (max 5)
    if ((report.images?.length || 0) + images.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 images allowed per report" },
        { status: 400 }
      );
    }

    for (const img of images) {
      if (img.url && img.publicId) {
        report.images.push({ url: img.url, publicId: img.publicId });
      }
    }

    await report.save();

    return NextResponse.json({
      success: true,
      message: "Images added successfully",
      data: report.images,
    });
  } catch (error) {
    console.error("POST /api/reports/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add images to report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    await connectDB();
    const report = await ItemReport.findById(id);

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const isOwner = report.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only modify your own reports." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "publicId parameter is required" },
        { status: 400 }
      );
    }

    // Remove from report.images
    const initialCount = report.images.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    report.images = report.images.filter((img: any) => img.publicId !== publicId);

    if (report.images.length === initialCount) {
      return NextResponse.json(
        { success: false, error: "Image not found on this report" },
        { status: 404 }
      );
    }

    await report.save();

    // Fire and forget delete from Cloudinary
    deleteImage(publicId).catch((err) => console.warn("Cloudinary delete error:", err));

    return NextResponse.json({
      success: true,
      message: "Image removed successfully",
      data: report.images,
    });
  } catch (error) {
    console.error("DELETE /api/reports/[id]/images error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
