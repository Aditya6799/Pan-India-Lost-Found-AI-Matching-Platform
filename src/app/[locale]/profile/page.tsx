"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useUIStore } from "@/stores/ui-store";
import { formatDate } from "@/lib/utils";
import {
  updateProfileAction,
  changePasswordAction,
  deactivateAccountAction,
  getProfileDataAction,
} from "@/features/users/actions";
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Lock,
  Camera,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  FileText,
  Sparkles,
  Award,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // User & Stats state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "hi">("en");
  const [profileImage, setProfileImage] = useState<string>("");

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getProfileDataAction();
      if (res.success && res.user) {
        setUser(res.user);
        setName(res.user.name || "");
        setPhone(res.user.phone || "");
        setPreferredLanguage((res.user.preferredLanguage as "en" | "hi") || "en");
        setProfileImage(res.user.profileImage || "");
        setStats(res.stats || null);
      } else {
        router.push(`/${locale}/auth/sign-in`);
      }
      setIsLoading(false);
    }
    loadData();
  }, [locale, router]);

  // Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProfileImage(data.url);

      // Auto update profile with new image
      await updateProfileAction({ profileImage: data.url });

      addToast({
        type: "success",
        title: "Avatar Updated",
        message: "Your new profile picture has been saved.",
      });
    } catch (err: unknown) {
      console.error("Avatar upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      addToast({
        type: "error",
        title: "Upload Failed",
        message: msg,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Profile Details Submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);

      const res = await updateProfileAction({
        name,
        phone,
        preferredLanguage,
        profileImage,
      });

      if (!res.success) throw new Error(res.error || "Update failed");

      addToast({
        type: "success",
        title: "Profile Saved",
        message: "Your account information has been updated.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      addToast({
        type: "error",
        title: "Update Error",
        message: msg,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await changePasswordAction(currentPassword, newPassword);

      if (!res.success) {
        setPasswordError(res.error || "Password update failed.");
        return;
      }

      addToast({
        type: "success",
        title: "Password Updated",
        message: "Your password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Deactivate Account
  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      const res = await deactivateAccountAction();
      if (!res.success) throw new Error(res.error);

      addToast({
        type: "info",
        title: "Account Deactivated",
        message: "Your account has been deactivated. You will now be signed out.",
      });

      await signOut({ callbackUrl: `/${locale}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deactivate";
      addToast({
        type: "error",
        title: "Error",
        message: msg,
      });
      setIsDeactivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-neutral-500">Loading your profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header with Back to Dashboard Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your personal credentials, contact preferences, and security
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 self-start sm:self-auto">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified Citizen
        </span>
      </div>

      {/* Account Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs text-neutral-400 block font-medium">Member Since</span>
          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1 block">
            {user?.createdAt ? formatDate(user.createdAt) : "Recent"}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs text-neutral-400 block font-medium">Total Reports</span>
          <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mt-0.5 block">
            {(stats?.totalLost || 0) + (stats?.totalFound || 0)}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs text-neutral-400 block font-medium">AI Matches</span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
            {stats?.matches || 0}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs text-neutral-400 block font-medium">Successful Recoveries</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {stats?.recoveries || 0}
          </span>
        </div>
      </div>

      {/* Profile Details Form */}
      <Card className="border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
          <CardDescription>Update your public identity and notification channels</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative group">
                <Avatar
                  src={profileImage || undefined}
                  fallback={name || user?.name || "U"}
                  size="xl"
                  className="h-20 w-20 ring-4 ring-neutral-100 dark:ring-neutral-800 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-colors"
                  title="Upload profile photo"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="text-center sm:text-left">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">{name || user?.name}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline mt-1.5 inline-block"
                >
                  Change Profile Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                  helperText="Email address cannot be changed"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Used for automated SMS alerts on verified matches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-neutral-400" />
                  <span>Preferred Interface Language</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredLanguage("en")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      preferredLanguage === "en"
                        ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredLanguage("hi")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      preferredLanguage === "hi"
                        ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400"
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary-600" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>Ensure your account remains safe with strong credentials</CardDescription>
        </CardHeader>

        <CardContent>
          {passwordError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Input
                type={showCurrentPw ? "text" : "password"}
                label="Current Password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  type={showNewPw ? "text" : "password"}
                  label="New Password"
                  placeholder="Min 8 chars, uppercase, special"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-type new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone: Account Deactivation */}
      <Card className="border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Deactivate your citizen account. Your active reports will be paused and hidden from search.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-between items-center pt-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            This action can only be reversed by contacting platform administrators.
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowDeactivateModal(true)}
          >
            Deactivate Account
          </Button>
        </CardFooter>
      </Card>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Account Confirmation"
        description="Are you absolutely sure you want to deactivate your account?"
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivateModal(false)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeactivate}
              isLoading={isDeactivating}
            >
              Yes, Deactivate My Account
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-2">
          <p>
            By confirming deactivation:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your account status will be set to inactive.</li>
            <li>All your active Lost and Found reports will be closed.</li>
            <li>AI match notifications for your items will be halted.</li>
            <li>You will immediately be logged out.</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
