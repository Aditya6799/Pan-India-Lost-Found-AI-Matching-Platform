"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signUpSchema, type SignUpInput } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, Eye, EyeOff, Globe } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      preferredLanguage: (locale === "hi" ? "hi" : "en"),
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password") || "";
  const preferredLanguage = watch("preferredLanguage") || "en";

  // Password strength calculation
  const strengthScore = useMemo(() => {
    let score = 0;
    if (!passwordValue) return 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    return score;
  }, [passwordValue]);

  const strengthMeta = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4", text: "text-red-600 dark:text-red-400" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", width: "w-2/4", text: "text-amber-600 dark:text-amber-400" };
      case 3:
        return { label: "Good", color: "bg-blue-500", width: "w-3/4", text: "text-blue-600 dark:text-blue-400" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", width: "w-full", text: "text-emerald-600 dark:text-emerald-400" };
      default:
        return { label: "Too short", color: "bg-neutral-200", width: "w-0", text: "text-neutral-400" };
    }
  }, [strengthScore]);

  const onSubmit = async (data: SignUpInput) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If auto sign-in fails, redirect to sign-in page with notice
        router.push(`/${locale}/auth/sign-in?registered=true`);
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setErrorMessage("Network error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-neutral-50/60 dark:bg-neutral-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2.5 text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-50 hover:opacity-90 transition-opacity"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
              <MapPin className="h-6 w-6 stroke-[2.2]" />
            </div>
            <span>
              Found<span className="text-primary-600 dark:text-primary-400">It</span>
            </span>
          </Link>
          <div className="mt-1 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Pan-India Lost & Found Platform
          </div>
        </div>

        <Card className="border border-neutral-200/90 shadow-xl shadow-neutral-200/40 dark:border-neutral-800 dark:shadow-none bg-white dark:bg-neutral-900">
          <CardHeader className="space-y-1.5 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Create an Account
            </CardTitle>
            <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400">
              Join thousands of citizens reuniting lost belongings across India
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  {...register("name")}
                  type="text"
                  label="Full Name"
                  placeholder="e.g. Ramesh Kumar"
                  autoComplete="name"
                  disabled={isLoading}
                  error={errors.name?.message}
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <div>
                <Input
                  {...register("email")}
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div>
                <Input
                  {...register("phone")}
                  type="tel"
                  label="Phone Number (Optional)"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  disabled={isLoading}
                  error={errors.phone?.message}
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Used for SMS alerts on AI match discoveries"
                />
              </div>

              {/* Preferred Language Toggle */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-neutral-400" />
                  <span>Preferred Language</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("preferredLanguage", "en")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-sm font-medium transition-all ${
                      preferredLanguage === "en"
                        ? "border-primary-600 bg-primary-50/70 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300 font-semibold shadow-sm"
                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>English</span>
                    {preferredLanguage === "en" && <CheckCircle2 className="h-4 w-4 text-primary-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("preferredLanguage", "hi")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-sm font-medium transition-all ${
                      preferredLanguage === "hi"
                        ? "border-primary-600 bg-primary-50/70 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300 font-semibold shadow-sm"
                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {preferredLanguage === "hi" && <CheckCircle2 className="h-4 w-4 text-primary-600" />}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Min 8 chars, uppercase, lowercase, special"
                  autoComplete="new-password"
                  disabled={isLoading}
                  error={errors.password?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                {/* Password strength meter */}
                {passwordValue.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400">Strength:</span>
                      <span className={`font-semibold ${strengthMeta.text}`}>{strengthMeta.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthMeta.color} ${strengthMeta.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none text-sm text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    {...register("acceptTerms")}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span className="text-xs sm:text-sm leading-snug">
                    I agree to the{" "}
                    <Link href={`/${locale}/terms`} className="text-primary-600 hover:underline dark:text-primary-400 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href={`/${locale}/privacy`} className="text-primary-600 hover:underline dark:text-primary-400 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.acceptTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-semibold shadow-md shadow-primary-600/20"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 font-medium">
                  Already registered?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/auth/sign-in`}
                className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                Sign In to Your Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
