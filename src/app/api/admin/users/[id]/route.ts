import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { User, AuditLog } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { role, isActive } = body;

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (role && ["user", "admin", "moderator"].includes(role)) {
      updateData.role = role;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .select("-passwordHash")
      .lean();

    // Log admin audit action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE_USER_STATUS",
      resourceType: "User",
      resourceId: user._id,
      metadata: updateData,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own admin account." },
        { status: 400 }
      );
    }

    // Soft delete user: set isActive to false
    user.isActive = false;
    await user.save();

    // Audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "DEACTIVATE_USER",
      resourceType: "User",
      resourceId: user._id,
      metadata: { isActive: false },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
      data: { id: user._id, isActive: false },
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
