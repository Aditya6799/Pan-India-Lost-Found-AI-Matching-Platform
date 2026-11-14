"use client";

import * as React from "react";
import {
  ShieldAlert,
  Upload,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileImage,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export interface ClaimModalProps {
  reportId: string;
  matchId?: string;
  reportName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (claimId: string) => void;
}

export function ClaimModal({
  reportId,
  matchId,
  reportName = "this item",
  isOpen,
  onClose,
  onSuccess,
}: ClaimModalProps) {
  const [proofDescription, setProofDescription] = React.useState("");
  const [distinctiveProof, setDistinctiveProof] = React.useState("");
  const [evidenceImages, setEvidenceImages] = React.useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setProofDescription("");
    setDistinctiveProof("");
    setEvidenceImages([]);
    setErrorText(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceImages.length + files.length > 5) {
      toastError("You can upload a maximum of 5 evidence files.");
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload evidence image");
        }

        const data = await res.json();
        const uploaded = data.data || data;
        setEvidenceImages((prev) => [
          ...prev,
          { url: uploaded.url, publicId: uploaded.publicId },
        ]);
      }
      success("Supporting evidence uploaded successfully.");
    } catch (err: any) {
      toastError(err?.message || "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeEvidence = (publicId: string) => {
    setEvidenceImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (proofDescription.trim().length < 50) {
      setErrorText("Proof description must be at least 50 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          matchId,
          proofDescription: proofDescription.trim(),
          distinctiveProof: distinctiveProof.trim() || undefined,
          supportingEvidence: evidenceImages,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to submit claim");
      }

      const claimId = result.data?._id || result._id;
      success("Your ownership claim was submitted for verification!");
      onSuccess?.(claimId);
      handleClose();
    } catch (err: any) {
      setErrorText(err?.message || "Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary-600" />
          <span>Submit Ownership Claim</span>
        </div>
      }
      description={`Submit proof of ownership for "${reportName}" to claim and recover this item.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Privacy & Admin-Only Notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 flex items-start gap-2.5">
          <Lock className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold block">Confidential Verification Process:</span>
            <span>
              Your proof description and private details are encrypted and only accessible to authorized platform administrators and verified custodians to prevent fraudulent claims.
            </span>
          </div>
        </div>

        {errorText && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Proof Description (Required, min 50 chars) */}
        <div>
          <Textarea
            label="Proof Description (Required, min 50 characters)"
            placeholder="Describe in detail how you know this item belongs to you (e.g. circumstances when you lost it, contents inside, purchase place, approximate age)..."
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
            showCount
            maxLength={1000}
            rows={4}
            required
          />
          <p className="mt-1 text-xs text-neutral-400">
            Current length: {proofDescription.length}/50 minimum characters.
          </p>
        </div>

        {/* Distinctive Proof / Concealed Features (Optional) */}
        <div>
          <Textarea
            label="Distinctive Hidden Marks / Unseen Identifiers (Highly Recommended)"
            placeholder="Describe private features not visible in public photos (e.g., serial number suffix, internal markings, specific scratches, unique sticker residue, wallet card order)..."
            value={distinctiveProof}
            onChange={(e) => setDistinctiveProof(e.target.value)}
            showCount
            maxLength={500}
            rows={3}
          />
        </div>

        {/* Supporting Evidence Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Supporting Evidence (Receipts, Invoices, Old Photos of Item)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading || evidenceImages.length >= 5}
              onClick={() => fileInputRef.current?.click()}
              leftIcon={
                isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )
              }
            >
              {isUploading ? "Uploading..." : "Upload Photos / Receipts"}
            </Button>
            <span className="text-xs text-neutral-400">
              {evidenceImages.length}/5 files attached (Max 5MB each)
            </span>
          </div>

          {evidenceImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {evidenceImages.map((img) => (
                <div
                  key={img.publicId}
                  className="relative group rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 text-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileImage className="h-4 w-4 text-primary-500 shrink-0" />
                    <span className="truncate">Evidence</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvidence(img.publicId)}
                    className="text-neutral-400 hover:text-red-500 p-0.5 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            Submit Claim
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ClaimModal;
