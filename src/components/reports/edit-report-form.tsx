"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  MapPin,
  Calendar,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ITEM_CATEGORIES, INDIAN_STATES, COLOR_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export interface EditReportFormProps {
  report: {
    _id: string;
    reportType: "LOST" | "FOUND";
    itemName: string;
    category: string;
    subcategory?: string;
    description: string;
    brand?: string;
    color?: string[];
    distinctiveFeatures?: string;
    images?: Array<{ url: string; publicId: string }>;
    state: string;
    city: string;
    locality?: string;
    lostFoundDate: string | Date;
    lostFoundTime?: string;
    additionalInfo?: string;
    contactPreference?: "email" | "phone" | "both";
    status?: "active" | "recovered" | "closed";
  };
}

export function EditReportForm({ report }: EditReportFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form State initialized from existing report
  const [itemName, setItemName] = React.useState(report.itemName || "");
  const [category, setCategory] = React.useState(report.category || "Electronics");
  const [subcategory, setSubcategory] = React.useState(report.subcategory || "");
  const [description, setDescription] = React.useState(report.description || "");
  const [brand, setBrand] = React.useState(report.brand || "");
  const [colors, setColors] = React.useState<string[]>(report.color || []);
  const [distinctiveFeatures, setDistinctiveFeatures] = React.useState(
    report.distinctiveFeatures || ""
  );

  const initialDateStr = report.lostFoundDate
    ? new Date(report.lostFoundDate).toISOString().split("T")[0]
    : "";
  const [lostFoundDate, setLostFoundDate] = React.useState(initialDateStr);
  const [lostFoundTime, setLostFoundTime] = React.useState(report.lostFoundTime || "");
  const [state, setState] = React.useState(report.state || "Delhi");
  const [city, setCity] = React.useState(report.city || "New Delhi");
  const [locality, setLocality] = React.useState(report.locality || "");

  const [images, setImages] = React.useState<Array<{ url: string; publicId: string }>>(
    report.images || []
  );
  const [additionalInfo, setAdditionalInfo] = React.useState(
    report.additionalInfo || ""
  );
  const [contactPreference, setContactPreference] = React.useState<
    "email" | "phone" | "both"
  >(report.contactPreference || "both");
  const [status, setStatus] = React.useState<"active" | "recovered" | "closed">(
    report.status || "active"
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dynamic subcategories
  const currentCategoryObj = ITEM_CATEGORIES.find((c) => c.name === category);
  const subcategories = currentCategoryObj?.subcategories || [];

  // Dynamic cities
  const currentStateObj = INDIAN_STATES.find((s) => s.value === state);
  const availableCities = currentStateObj?.cities || [];

  const toggleColor = (colorVal: string) => {
    setColors((prev) =>
      prev.includes(colorVal)
        ? prev.filter((c) => c !== colorVal)
        : [...prev, colorVal]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toastError("Maximum 5 images allowed per report.");
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");
        const json = await res.json();
        const uploaded = json.data || json;
        setImages((prev) => [
          ...prev,
          { url: uploaded.url, publicId: uploaded.publicId },
        ]);
      }
      success("Image(s) uploaded successfully.");
    } catch (err: any) {
      toastError(err?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const validateStep = (currentStep: number) => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!itemName.trim()) {
        setErrorMsg("Item name is required.");
        return false;
      }
      if (description.trim().length < 20) {
        setErrorMsg("Description must be at least 20 characters.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!lostFoundDate) {
        setErrorMsg("Please select the lost/found date.");
        return false;
      }
      if (!state) {
        setErrorMsg("Please select a state.");
        return false;
      }
      if (!city) {
        setErrorMsg("Please enter or select a city.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/reports/${report._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: itemName.trim(),
          category,
          subcategory: subcategory || undefined,
          description: description.trim(),
          brand: brand.trim() || undefined,
          color: colors,
          distinctiveFeatures: distinctiveFeatures.trim() || undefined,
          lostFoundDate,
          lostFoundTime: lostFoundTime || undefined,
          state,
          city: city.trim(),
          locality: locality.trim() || undefined,
          images,
          additionalInfo: additionalInfo.trim() || undefined,
          contactPreference,
          status,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || "Failed to update report");
      }

      success("Report updated successfully!");
      router.push("/dashboard/reports");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
          <span>Step {step} of 3</span>
          <span>
            {step === 1 && "Item Details"}
            {step === 2 && "When & Where"}
            {step === 3 && "Images & Status"}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Item Details */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Item Name *"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Blue Dell Inspiron Laptop 15-inch"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category *"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
              >
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Select subcategory"
              >
                <option value="">None / General</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Brand / Manufacturer"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Dell, Apple, Samsung, Titan"
            />

            <Textarea
              label="Description * (min 20 characters)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the item..."
              showCount
              maxLength={1000}
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Color(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = colors.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleColor(c.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        isSelected
                          ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-semibold"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ background: c.hex }}
                      />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Textarea
              label="Distinctive Features / Markings"
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
              placeholder="Any unique stickers, engravings, scratches, or wear marks?"
              rows={2}
            />
          </div>
        )}

        {/* Step 2: Date & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={`Date ${report.reportType === "LOST" ? "Lost" : "Found"} *`}
                type="date"
                value={lostFoundDate}
                onChange={(e) => setLostFoundDate(e.target.value)}
                required
              />

              <Input
                label="Approximate Time"
                type="time"
                value={lostFoundTime}
                onChange={(e) => setLostFoundTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="State / Union Territory *"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity("");
                }}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>

              {availableCities.length > 0 ? (
                <Select
                  label="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select City</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  required
                />
              )}
            </div>

            <Input
              label="Locality / Landmark"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Connaught Place Metro Station, Gate 2"
            />
          </div>
        )}

        {/* Step 3: Images & Status */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Status Change */}
            <Select
              label="Report Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="active">Active (Still searching / unclaimed)</option>
              <option value="recovered">Recovered (Item reunited with owner!)</option>
              <option value="closed">Closed (Archived / no longer relevant)</option>
            </Select>

            {/* Images */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Item Images (Max 5)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading || images.length >= 5}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={
                  isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )
                }
              >
                {isUploading ? "Uploading..." : "Add More Images"}
              </Button>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {images.map((img) => (
                    <div
                      key={img.publicId}
                      className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 group"
                    >
                      <Image
                        src={img.url}
                        alt="Uploaded preview"
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.publicId)}
                        className="absolute top-1.5 right-1.5 rounded-md bg-black/60 p-1 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Select
              label="Contact Preference"
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as any)}
            >
              <option value="both">Both Email & In-App Notifications</option>
              <option value="email">Email Only</option>
              <option value="phone">In-App Notifications Only</option>
            </Select>

            <Textarea
              label="Additional Information (Optional)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other details that might help?"
              rows={3}
            />
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/reports")}
            >
              Cancel
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditReportForm;
