"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signInSchema, type SignInInput } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/dashboard`;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error.includes("CredentialsSignin") || result.error.includes("Invalid")) {
          setErrorMessage("Invalid email or password. Please verify your credentials.");
        } else {
          setErrorMessage(result.error);
        }
        setIsLoading(false);
        return;
      }

      // Hard redirect to callbackUrl ensures cookies are picked up immediately by server layouts
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-neutral-50/60 dark:bg-neutral-950">
      <div className="w-full max-w-md">
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400">
              Sign in to manage your reports, check AI matches, and track claims
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
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs sm:text-sm hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-semibold shadow-md shadow-primary-600/20"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 font-medium">
                  New to FoundIt?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/auth/sign-up`}
                className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                Create an Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
