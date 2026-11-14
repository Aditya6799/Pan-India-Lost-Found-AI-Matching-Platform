import { create } from "zustand";
import { CreateReportInput } from "@/types";

export interface ReportStore {
  step: number;
  formData: Partial<CreateReportInput>;
  uploadedImages: { url: string; publicId: string }[];
  setStep: (step: number) => void;
  setFormData: (data: Partial<CreateReportInput>) => void;
  addImage: (img: { url: string; publicId: string }) => void;
  removeImage: (publicId: string) => void;
  reset: () => void;
}

const initialFormData: Partial<CreateReportInput> = {
  reportType: "LOST",
  color: [],
  images: [],
};

export const useReportStore = create<ReportStore>((set) => ({
  step: 1,
  formData: initialFormData,
  uploadedImages: [],
  setStep: (step) => set({ step }),
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  addImage: (img) =>
    set((state) => {
      const nextImages = [...state.uploadedImages, img];
      return {
        uploadedImages: nextImages,
        formData: {
          ...state.formData,
          images: nextImages,
        },
      };
    }),
  removeImage: (publicId) =>
    set((state) => {
      const nextImages = state.uploadedImages.filter(
        (img) => img.publicId !== publicId
      );
      return {
        uploadedImages: nextImages,
        formData: {
          ...state.formData,
          images: nextImages,
        },
      };
    }),
  reset: () =>
    set({
      step: 1,
      formData: initialFormData,
      uploadedImages: [],
    }),
}));

export default useReportStore;
