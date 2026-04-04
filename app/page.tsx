"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Language, ProductCategory, TemplateMode } from "@/types";

async function safeErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.clone().json();
    return data?.error ?? fallback;
  } catch {
    const text = await res.text().catch(() => "");
    return text.trim() || fallback;
  }
}

const CATEGORIES: ProductCategory[] = [
  "Electronics",
  "Health",
  "Kitchen",
  "Beauty",
  "Sports",
  "Home",
  "Pet",
  "Baby",
  "Other",
];

const SLOT_NAMES = ["00 Hero", "01 Benefits", "02 Problem/Solution", "03 Social Proof", "04 Lifestyle/CTA"];

interface UploadedPhoto {
  file: File;
  preview: string;
  slot: number;
}

type Step = "idle" | "uploading" | "analyzing" | "generating" | "done" | "error";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Electronics");
  const [language, setLanguage] = useState<Language>("nl");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("amazon");
  const [reviews, setReviews] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const remaining = 5 - photos.length;
      const toAdd = arr.slice(0, remaining);
      const newPhotos = toAdd.map((file, i) => ({
        file,
        preview: URL.createObjectURL(file),
        slot: (photos.length + i) % 5,
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    },
    [photos.length]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateSlot = (photoIndex: number, slot: number) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === photoIndex ? { ...p, slot } : p))
    );
  };

  const handleSubmit = async () => {
    if (!productName.trim()) return setErrorMsg("Please enter a product name.");
    if (!reviews.trim()) return setErrorMsg("Please paste some reviews.");
    if (photos.length === 0) return setErrorMsg("Please upload at least one photo.");

    setErrorMsg("");
    setStep("uploading");

    try {
      // Step 1: Upload photos
      const formData = new FormData();
      photos.forEach((p) => formData.append("photos", p.file));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        throw new Error(await safeErrorMessage(uploadRes, "Upload mislukt"));
      }
      const { sessionId, filePaths } = await uploadRes.json();

      // Build slot→photo mapping
      const slotPhotoMap: Record<number, string> = {};
      photos.forEach((p, i) => {
        if (filePaths[i]) slotPhotoMap[p.slot] = filePaths[i];
      });
      for (let s = 0; s < 5; s++) {
        if (slotPhotoMap[s] === undefined && filePaths.length > 0) {
          slotPhotoMap[s] = filePaths[s % filePaths.length];
        }
      }

      await fetch(`/api/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotPhotoMap, photoPaths: filePaths }),
      });

      // Step 2: Analyze reviews
      setStep("analyzing");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, productName, category, reviews, language, templateMode }),
      });
      if (!analyzeRes.ok) {
        throw new Error(await safeErrorMessage(analyzeRes, "Analyse mislukt"));
      }

      // Step 3: Generate copy
      setStep("generating");
      const copyRes = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!copyRes.ok) {
        throw new Error(await safeErrorMessage(copyRes, "Tekst genereren mislukt"));
      }

      setStep("done");
      router.push(`/results/${sessionId}`);
    } catch (err) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const isLoading = ["uploading", "analyzing", "generating", "done"].includes(step);

  const stepLabel: Record<Step, string> = {
    idle: "",
    uploading: "Step 1: Uploading photos...",
    analyzing: "Step 2: Analyzing reviews...",
    generating: "Step 3: Generating copy...",
    done: "Step 3: Ready!",
    error: "",
  };

  return (
    <main
      style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}
      className="flex flex-col items-center py-16 px-4"
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          Amazon Infographic Generator
        </h1>
        <p className="text-gray-400 mb-10 text-lg">
          Upload photos + paste reviews → get 5 ready-to-use listing images
        </p>

        {/* Template mode selector */}
        <div className="mb-8">
          <span className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-widest">
            Template
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTemplateMode("amazon")}
              disabled={isLoading}
              className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
                templateMode === "amazon"
                  ? "border-white bg-white/5"
                  : "border-[#333] hover:border-[#555]"
              }`}
            >
              <div className="text-base font-semibold mb-0.5">Amazon / Bol.com</div>
              <div className="text-xs text-gray-500">5 slides · Aanpasbare stijl</div>
            </button>
            <button
              onClick={() => setTemplateMode("cozella")}
              disabled={isLoading}
              className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
                templateMode === "cozella"
                  ? "border-white bg-white/5"
                  : "border-[#333] hover:border-[#555]"
              }`}
            >
              <div className="text-base font-semibold mb-0.5">Cozella</div>
              <div className="text-xs text-gray-500">6 slides · Premium lifestyle stijl</div>
            </button>
          </div>
        </div>

        {/* Language toggle */}
        <div className="mb-8 flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
            Taal / Language
          </span>
          <div className="flex rounded-lg overflow-hidden border border-[#333]">
            {(["nl", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                disabled={isLoading}
                className={`px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  language === lang
                    ? "bg-white text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                }`}
              >
                {lang === "nl" ? "🇳🇱 Nederlands" : "🇬🇧 English"}
              </button>
            ))}
          </div>
        </div>

        {/* Product name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-widest">
            Product Name
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Premium Bamboo Cutting Board"
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#555] text-base disabled:opacity-50"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-widest">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#555] text-base disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-widest">
            Amazon Reviews
          </label>
          <textarea
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
            placeholder="Paste 10–30 Amazon reviews here..."
            disabled={isLoading}
            rows={8}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#555] text-base resize-y disabled:opacity-50"
          />
        </div>

        {/* Photo upload */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-widest">
            Lifestyle Photos{" "}
            <span className="text-gray-500 normal-case font-normal">
              (1–5 photos, JPEG/PNG, max 10MB each)
            </span>
          </label>

          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-400/5"
                : "border-[#333] hover:border-[#555]"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
              photos.length >= 5 ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading || photos.length >= 5}
            />
            {photos.length === 0 ? (
              <>
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-400 text-base">
                  Drag & drop photos here, or{" "}
                  <span className="text-blue-400 underline">click to browse</span>
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">
                {photos.length}/5 photos added —{" "}
                {photos.length < 5 ? "click to add more" : "maximum reached"}
              </p>
            )}
          </div>

          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <div className="mt-4 space-y-3">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3"
                >
                  <img
                    src={photo.preview}
                    alt={`Photo ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {photo.file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(photo.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={photo.slot}
                      onChange={(e) => updateSlot(i, Number(e.target.value))}
                      disabled={isLoading}
                      className="bg-[#252525] border border-[#333] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none disabled:opacity-50"
                    >
                      {SLOT_NAMES.map((name, s) => (
                        <option key={s} value={s}>
                          Slot {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removePhoto(i)}
                      disabled={isLoading}
                      className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none disabled:opacity-50"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Loading step indicator */}
        {isLoading && (
          <div className="mb-5 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-blue-300 text-sm font-medium">
                {stepLabel[step]}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              {(["uploading", "analyzing", "generating"] as Step[]).map(
                (s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      step === "done" ||
                      (["uploading", "analyzing", "generating"] as Step[]).indexOf(step) >= i
                        ? "bg-blue-400"
                        : "bg-[#333]"
                    }`}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating..." : "Generate Infographics"}
        </button>
      </div>
    </main>
  );
}
