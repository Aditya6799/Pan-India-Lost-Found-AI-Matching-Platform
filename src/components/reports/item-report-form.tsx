"use client";

import React, { useState, useId } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  lostReportSchema,
  foundReportSchema,
  type LostReportInput,
  type FoundReportInput,
} from "@/lib/validations/report";
import { ITEM_CATEGORIES, INDIAN_STATES, COLOR_OPTIONS } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  UploadCloud,
  X,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Tag,
  Info,
} from "lucide-react";

interface ItemReportFormProps {
  reportType: "LOST" | "FOUND";
}

type FormData = {
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  subcategory?: string;
  description: string;
  brand?: string;
  color: string[];
  distinctiveFeatures?: string;
  state: string;
  city: string;
  locality?: string;
  latitude?: number | null;
  longitude?: number | null;
  lostFoundDate: string | Date;
  lostFoundTime?: string;
  images?: Array<{ url: string; publicId: string }>;
  additionalInfo?: string;
  contactPreference: "email" | "phone" | "both";
  isSafelyStored?: boolean;
};

export function ItemReportForm({ reportType }: ItemReportFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const cityDatalistId = useId();

  const isFound = reportType === "FOUND";
  const activeSchema = isFound ? foundReportSchema : lostReportSchema;

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(activeSchema) as any,
    defaultValues: {
      reportType,
      itemName: "",
      category: "",
      subcategory: "",
      description: "",
      brand: "",
      color: [],
      distinctiveFeatures: "",
      lostFoundDate: todayStr,
      lostFoundTime: "",
      state: "",
      city: "",
      locality: "",
      latitude: undefined,
      longitude: undefined,
      images: [],
      additionalInfo: "",
      contactPreference: "email",
      isSafelyStored: true,
    },
  });

  const selectedCategory = watch("category");
  const selectedState = watch("state");
  const selectedColors = watch("color") || [];
  const uploadedImages = watch("images") || [];
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Dynamic subcategories based on chosen category
  const availableSubcategories = React.useMemo(() => {
    const cat = ITEM_CATEGORIES.find((c) => c.name === selectedCategory || c.id === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory]);

  // Dynamic cities based on chosen Indian state
  const availableCities = React.useMemo(() => {
    const st = INDIAN_STATES.find((s) => s.value === selectedState || s.label === selectedState);
    return st ? st.cities : [];
  }, [selectedState]);

  // Color multi-selection toggle
  const toggleColor = (colorVal: string) => {
    const current = [...selectedColors];
    const index = current.indexOf(colorVal);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(colorVal);
    }
    setValue("color", current, { shouldValidate: true });
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude, { shouldValidate: true });
        setValue("longitude", position.coords.longitude, { shouldValidate: true });
        setIsLocating(false);
        addToast({
          type: "info",
          title: "Location Tagged",
          message: "GPS coordinates added to assist AI geospatial matching.",
        });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocationError("Unable to retrieve coordinates. You can still enter your city and area manually.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Image Upload Handler
  const handleImageUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setUploadError("Maximum 5 images allowed");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const newImages = [...uploadedImages];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Failed to upload image");
        }

        const data = await res.json();
        newImages.push({ url: data.url, publicId: data.publicId });
      }

      setValue("images", newImages, { shouldValidate: true });
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Error uploading image";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = uploadedImages.filter((_, i) => i !== index);
    setValue("images", updated, { shouldValidate: true });
  };

  // Step Navigation with validation
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["itemName", "category", "description", "color"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["lostFoundDate", "state", "city"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form Submit
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        reportType,
        lostFoundDate: new Date(data.lostFoundDate).toISOString(),
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit report");
      }

      addToast({
        type: "success",
        title: isFound ? "Found Report Published!" : "Lost Report Published!",
        message: "AI matching engine has initiated scans across national databases.",
      });

      router.push(`/${locale}/dashboard/reports`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Submit error:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit report";
      addToast({
        type: "error",
        title: "Submission Failed",
        message: msg,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide uppercase bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300">
          <Tag className="h-3.5 w-3.5" />
          {isFound ? "Report a Found Item" : "Report a Lost Item"}
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
          {isFound ? "Help Reunite Belongings" : "Report Your Missing Belongings"}
        </h1>
        <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
          {isFound
            ? "Submit details of the item you found. Our multi-model AI engine matches it against lost item records in real time."
            : "Describe your lost article with precision. AI matching continuously scans new found reports and alerts you instantly."}
        </p>
      </div>

      {/* Multi-step Progress Bar */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          {[
            { step: 1, title: "1. Item Details" },
            { step: 2, title: "2. When & Where" },
            { step: 3, title: "3. Media & Submit" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div
                className={`w-full h-2 rounded-full mb-2 transition-all ${
                  currentStep >= s.step
                    ? "bg-primary-600 dark:bg-primary-500"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  currentStep === s.step
                    ? "text-primary-600 dark:text-primary-400"
                    : currentStep > s.step
                    ? "text-neutral-700 dark:text-neutral-300"
                    : "text-neutral-400 dark:text-neutral-600"
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-neutral-200/90 shadow-lg dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 1: ITEM DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Step 1: Item Specifics
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Provide precise details so the AI semantic matcher can distinguish your item.
                  </p>
                </div>

                <div>
                  <Input
                    {...register("itemName")}
                    label="Item Name *"
                    placeholder={
                      isFound
                        ? "e.g. Black Leather Titan Wallet, Blue Backpack"
                        : "e.g. Midnight Blue iPhone 14 Pro, Fastrack Watch"
                    }
                    error={errors.itemName?.message}
                    helperText="A clear title helps identify the item quickly"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      {...register("category")}
                      label="Category *"
                      placeholder="Select a category"
                      error={errors.category?.message}
                      options={ITEM_CATEGORIES.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                    />
                  </div>

                  <div>
                    <Select
                      {...register("subcategory")}
                      label="Subcategory (Optional)"
                      placeholder="Select subcategory"
                      error={errors.subcategory?.message}
                      disabled={availableSubcategories.length === 0}
                      options={availableSubcategories.map((sub) => ({
                        value: sub,
                        label: sub,
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Textarea
                    {...register("description")}
                    label="Description *"
                    rows={4}
                    placeholder="Describe markings, contents, serial numbers, labels, scratches, or wear & tear (minimum 20 characters)..."
                    error={errors.description?.message}
                    showCount
                    maxLength={2000}
                    helperText="Minimum 20 characters. Detailed descriptions dramatically improve AI matching accuracy."
                  />
                </div>

                <div>
                  <Input
                    {...register("brand")}
                    label="Brand / Manufacturer (Optional)"
                    placeholder="e.g. Apple, Samsung, Wildcraft, Woodland, Casio"
                    error={errors.brand?.message}
                  />
                </div>

                {/* Color Multi-Select Chips */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Primary Colors * (Select one or more)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((col) => {
                      const isSelected = selectedColors.includes(col.value);
                      return (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => toggleColor(col.value)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-50 text-primary-800 ring-2 ring-primary-500/20 dark:bg-primary-950/60 dark:text-primary-300 font-semibold"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-600 shrink-0"
                            style={{
                              background: col.hex,
                            }}
                          />
                          <span>{col.label}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.color && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{errors.color.message}</p>
                  )}
                </div>

                <div>
                  <Textarea
                    {...register("distinctiveFeatures")}
                    label="Distinctive Features / Secret Marks (Optional)"
                    rows={2}
                    placeholder="Any unique stickers, engravings, dents, or specific items inside..."
                    error={errors.distinctiveFeatures?.message}
                    helperText="Crucial for verifying genuine ownership when claims are submitted."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: WHEN & WHERE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Step 2: Date & Location
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Pinpoint where and when the event occurred across India.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register("lostFoundDate")}
                      type="date"
                      label={isFound ? "Found Date *" : "Lost Date *"}
                      max={todayStr}
                      error={errors.lostFoundDate?.message}
                      leftIcon={<Calendar className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <Input
                      {...register("lostFoundTime")}
                      type="text"
                      label="Approximate Time (Optional)"
                      placeholder="e.g. Around 4:30 PM, Morning, Evening"
                      error={errors.lostFoundTime?.message}
                      leftIcon={<Clock className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      {...register("state")}
                      label="State / Union Territory *"
                      placeholder="Select Indian State"
                      error={errors.state?.message}
                      options={INDIAN_STATES.map((st) => ({
                        value: st.value,
                        label: st.label,
                      }))}
                    />
                  </div>

                  <div>
                    <Input
                      {...register("city")}
                      label="City / District *"
                      placeholder="e.g. Bengaluru, Mumbai, Jaipur"
                      list={cityDatalistId}
                      error={errors.city?.message}
                      helperText={
                        availableCities.length > 0
                          ? `Suggestions available for ${selectedState}`
                          : "Enter city name"
                      }
                    />
                    <datalist id={cityDatalistId}>
                      {availableCities.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <Input
                    {...register("locality")}
                    label={isFound ? "Found Location / Landmark (Optional)" : "Locality / Landmark (Optional)"}
                    placeholder="e.g. Metro Station Gate 2, Terminal 3 Food Court, MG Road Bus Stop"
                    error={errors.locality?.message}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                </div>

                {/* GPS Tagging */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Navigation className="h-4 w-4 text-primary-600" />
                        <span>GPS Coordinates (Optional)</span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Enhance matching with geo-radius distance calculations
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDetectLocation}
                      isLoading={isLocating}
                      leftIcon={<Navigation className="h-3.5 w-3.5" />}
                    >
                      {latitude && longitude ? "Update GPS Location" : "Detect Current Location"}
                    </Button>
                  </div>

                  {latitude && longitude && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        GPS Tagged: Lat {latitude.toFixed(4)}, Lon {longitude.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {locationError && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      {locationError}
                    </p>
                  )}
                </div>

                {/* Found Item Custody Note */}
                {isFound && (
                  <div className="rounded-xl border border-secondary-200 dark:border-secondary-900/60 bg-secondary-50/60 dark:bg-secondary-950/40 p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isSafelyStored")}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-secondary-600 focus:ring-secondary-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-secondary-600" />
                          <span>Safe Custody Confirmation</span>
                        </span>
                        <p className="text-xs text-secondary-700 dark:text-secondary-400 mt-0.5">
                          I confirm that I am keeping this item safe in my possession or have deposited it at the nearest verified lost-and-found station / authority desk.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: MEDIA & SUBMIT */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Step 3: Photographs & Verification
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Visual embeddings from photos boost AI matching confidence by up to 85%.
                  </p>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Upload Photos (Max 5 images, up to 5MB each)
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files) {
                        handleImageUpload(e.dataTransfer.files);
                      }
                    }}
                    className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 sm:p-8 text-center hover:border-primary-500 transition-colors bg-neutral-50/50 dark:bg-neutral-950/40"
                  >
                    <input
                      type="file"
                      id="image-file-input"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleImageUpload(e.target.files);
                        }
                      }}
                      disabled={isUploading || uploadedImages.length >= 5}
                    />

                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <UploadCloud className="h-6 w-6" />
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="image-file-input"
                          className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer hover:underline"
                        >
                          Click to browse
                        </label>{" "}
                        <span className="text-neutral-500 dark:text-neutral-400">or drag and drop photos here</span>
                      </div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        JPEG, PNG, or WebP. Clear photos of labels, unique marks, and angles recommended.
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {uploadError}
                    </p>
                  )}

                  {/* Uploaded Images Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.publicId || idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={`Item photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                            title="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Textarea
                    {...register("additionalInfo")}
                    label="Additional Information (Optional)"
                    rows={3}
                    placeholder="Any other helpful notes, rewards offered, recovery instructions, or drop-off preferences..."
                    error={errors.additionalInfo?.message}
                  />
                </div>

                {/* Contact Preference */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Contact Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "email", label: "Email Only" },
                      { id: "phone", label: "Phone / SMS" },
                      { id: "both", label: "Both" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer select-none"
                      >
                        <input
                          type="radio"
                          value={opt.id}
                          {...register("contactPreference")}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                    Your personal phone/email remains masked; communication is routed securely through our platform.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Step Navigation Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant={isFound ? "secondary" : "primary"}
                  size="lg"
                  isLoading={isSubmitting}
                  className="px-8 font-semibold shadow-md shadow-primary-600/20"
                >
                  {isFound ? "Publish Found Report" : "Publish Lost Report"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ItemReportForm;
