'use server';

import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { User, AuditLog } from '@/models';
import { signUpSchema } from '@/lib/validations/user';

export interface RegisterResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function registerUser(formData: FormData | Record<string, any>): Promise<RegisterResult> {
  try {
    await connectDB();

    const rawData: Record<string, any> = {};
    if (formData instanceof FormData) {
      formData.forEach((value, key) => {
        if (key === 'acceptTerms') {
          rawData[key] = String(value) === 'on' || String(value) === 'true';
        } else {
          rawData[key] = value;
        }
      });
    } else {
      Object.assign(rawData, formData);
    }

    if (rawData.acceptTerms === undefined) {
      rawData.acceptTerms = rawData.acceptTerms === true || rawData.terms === true;
    }

    const validated = signUpSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || 'Validation failed';
      return { success: false, error: firstError };
    }

    const { name, email, password, phone, preferredLanguage } = validated.data;

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password (salt rounds: 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || null,
      preferredLanguage: preferredLanguage || 'en',
      role: 'user',
      isActive: true,
      isEmailVerified: false,
    });

    // Create AuditLog entry
    await AuditLog.create({
      userId: newUser._id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: newUser._id,
      metadata: { name, email: email.toLowerCase() },
    });

    return { success: true, message: 'Account registered successfully.' };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during registration.' };
  }
}
