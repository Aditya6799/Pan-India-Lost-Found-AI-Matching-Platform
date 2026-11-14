import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { User } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    // Only public fields: name, profileImage, createdAt
    const user = await User.findById(id)
      .select("name profileImage createdAt role")
      .lean();

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
    }

    // Only the user themselves or an admin can update
    const isOwner = session.user.id === id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only update your own profile." },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();

    // Fields allowed for self-profile update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (body.name && typeof body.name === "string") {
      updateData.name = body.name.trim();
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone;
    }
    if (body.preferredLanguage && ["en", "hi"].includes(body.preferredLanguage)) {
      updateData.preferredLanguage = body.preferredLanguage;
    }
    if (body.profileImage !== undefined) {
      updateData.profileImage = body.profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .select("-passwordHash")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
