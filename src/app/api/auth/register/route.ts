import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { signUpSchema } from "@/lib/validations/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json(
        { success: false, error: firstError, errors: validation.error.format() },
        { status: 422 }
      );
    }

    const { name, email, password, phone, preferredLanguage } = validation.data;

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : undefined,
      preferredLanguage: preferredLanguage || "en",
      role: "user",
      isActive: true,
      isEmailVerified: false,
    });

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    try {
      await AuditLog.create({
        userId: newUser._id,
        action: "USER_REGISTER",
        resourceType: "User",
        resourceId: newUser._id,
        metadata: { email: newUser.email },
        ipAddress,
        userAgent,
      });
    } catch (auditErr) {
      console.error("Failed to create registration audit log:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
