"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CopyResult, CozellaCopyResult, InsightsResult, SessionData, SlotCopy } from "@/types";
import { StyleConfig } from "@/types/style";

// Safely extract an error message from any fetch response (JSON or plain text)
async function safeErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.clone().json();
    return data?.error ?? fallback;
  } catch {
    const text = await res.text().catch(() => "");
    return text.trim() || fallback;
  }
}

const AMAZON_SLOT_LABELS = [
  "Slot 00 — Hero",
  "Slot 01 — Voordelen",
  "Slot 02 — Probleem / Oplossing",
  "Slot 03 — Social Proof",
  "Slot 04 — Lifestyle / CTA",
];

const COZELLA_SLOT_LABELS = [
  "Slide 00 — Hero",
  "Slide 01 — Kenmerken",
  "Slide 02 — Specificaties",
  "Slide 03 — Interieurstijl",
  "Slide 04 — Gebruiksstappen",
  "Slide 05 — Kleurvarianten",
];

const RAMBUX_SLOT_LABELS = [
  "Slide 00 — Hero",
  "Slide 01 — Kenmerken",
  "Slide 02 — Specificaties",
  "Slide 03 — Activiteiten",
  "Slide 04 — Gebruik",
  "Slide 05 — Varianten",
];

type ActivePanel = "none" | "tweak" | "style";

interface SlotState {
  copy: SlotCopy;
  styleOverride: StyleConfig | null;
  previewUrl: string | null;
  isBusy: boolean;
  tweakInput: string;
  styleTextInput: string;
  activePanel: ActivePanel;
  styleChips: string[];
}

// ── helpers ─────────────────────────────────────────────────────────────────

async function renderSlot(
  sessionId: string,
  slotIndex: number,
  copy: SlotCopy,
  styleOverride: StyleConfig | null
): Promise<string> {
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, slotIndex, copy, styleOverride }),
  });
  if (!res.ok) {
    throw new Error(await safeErrorMessage(res, "Render mislukt"));
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function styleToChips(s: StyleConfig): string[] {
  const chips: string[] = [s.layout, s.fontStyle, s.bulletStyle, s.mood];
  if (s.headlineSize !== "large") chips.push(`headline:${s.headlineSize}`);
  if (s.textColor && s.textColor !== "white") chips.push(s.textColor);
  return chips;
}

function getSlotCopy(
  session: SessionData,
  index: number
): SlotCopy {
  if ((session.templateMode === "cozella" || session.templateMode === "rambux") && session.cozellaCopy) {
    const key = `slot0${index}` as keyof CozellaCopyResult;
    return session.cozellaCopy[key] as unknown as SlotCopy;
  }
  const key = `slot0${index}` as keyof CopyResult;
  return (session.copy as unknown as Record<string, SlotCopy>)[key];
}

// ── component ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [loadError, setLoadError] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [globalStyleUploading, setGlobalStyleUploading] = useState(false);
  const [globalStyleProgress, setGlobalStyleProgress] = useState(0);
  const [globalStyleChips, setGlobalStyleChips] = useState<string[]>([]);
  const globalStyleInputRef = useRef<HTMLInputElement>(null);

  // ── init ──────────────────────────────────────────────────────────────────

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/session/${sessionId}`);
      if (!res.ok) throw new Error("Sessie niet gevonden");
      const data = await res.json();
      const s: SessionData = data.session;
      setSession(s);
      setInsights(s.insights);

      const slotCount = (s.templateMode === "cozella" || s.templateMode === "rambux") ? 6 : 5;
      setSlots(
        Array.from({ length: slotCount }, (_, i) => ({
          copy: getSlotCopy(s, i),
          styleOverride: null,
          previewUrl: null,
          isBusy: false,
          tweakInput: "",
          styleTextInput: "",
          activePanel: "none",
          styleChips: [],
        }))
      );
    } catch {
      setLoadError("Resultaten konden niet worden geladen. Ga terug en probeer opnieuw.");
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // ── slot state helpers ────────────────────────────────────────────────────

  const patchSlot = useCallback(
    (index: number, patch: Partial<SlotState>) =>
      setSlots((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
      ),
    []
  );

  // ── render preview for a single slot ─────────────────────────────────────

  const refreshPreview = useCallback(
    async (index: number, copy: SlotCopy, style: StyleConfig | null) => {
      patchSlot(index, { isBusy: true });
      try {
        const url = await renderSlot(sessionId, index, copy, style);
        patchSlot(index, { previewUrl: url, isBusy: false });
      } catch (err) {
        patchSlot(index, { isBusy: false });
        throw err;
      }
    },
    [sessionId, patchSlot]
  );

  // ── Button 1 — Tekst aanpassen ────────────────────────────────────────────

  const handleTweak = async (index: number) => {
    const slot = slots[index];
    if (!slot.tweakInput.trim()) return;
    patchSlot(index, { isBusy: true });
    try {
      const res = await fetch("/api/tweak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          slotIndex: index,
          userRequest: slot.tweakInput,
        }),
      });
      if (!res.ok) {
        throw new Error(await safeErrorMessage(res, "Aanpassen mislukt"));
      }
      const { copy: newCopy } = await res.json();
      const url = await renderSlot(sessionId, index, newCopy, slot.styleOverride);
      patchSlot(index, {
        copy: newCopy,
        previewUrl: url,
        tweakInput: "",
        activePanel: "none",
        isBusy: false,
      });
    } catch (err) {
      patchSlot(index, { isBusy: false });
      alert(err instanceof Error ? err.message : "Aanpassen mislukt");
    }
  };

  // ── Button 2 — Stijl uploaden (per slide, Amazon only) ───────────────────

  const handleStyleUpload = async (
    index: number,
    file: File,
    applyToAll: boolean
  ) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("image", file);

    if (applyToAll) {
      setSlots((prev) => prev.map((s) => ({ ...s, isBusy: true })));
    } else {
      patchSlot(index, { isBusy: true });
    }

    try {
      const res = await fetch("/api/analyze-style", { method: "POST", body: formData });
      if (!res.ok) {
        throw new Error(await safeErrorMessage(res, "Stijl analyse mislukt"));
      }
      const { styleConfig } = await res.json() as { styleConfig: StyleConfig };
      const chips = styleToChips(styleConfig);

      if (applyToAll) {
        setGlobalStyleChips(chips);
        setGlobalStyleProgress(0);
        for (let i = 0; i < slots.length; i++) {
          const slotCopy = slots[i].copy;
          const url = await renderSlot(sessionId, i, slotCopy, styleConfig);
          setSlots((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, styleOverride: styleConfig, previewUrl: url, isBusy: idx < slots.length - 1, styleChips: chips }
                : s
            )
          );
          setGlobalStyleProgress(i + 1);
        }
        setGlobalStyleUploading(false);
      } else {
        const url = await renderSlot(sessionId, index, slots[index].copy, styleConfig);
        patchSlot(index, {
          styleOverride: styleConfig,
          previewUrl: url,
          styleChips: chips,
          activePanel: "none",
          isBusy: false,
        });
      }
    } catch (err) {
      if (applyToAll) {
        setSlots((prev) => prev.map((s) => ({ ...s, isBusy: false })));
        setGlobalStyleUploading(false);
      } else {
        patchSlot(index, { isBusy: false });
      }
      alert(err instanceof Error ? err.message : "Stijl toepassen mislukt");
    }
  };

  // ── Style via text description (Amazon only) ─────────────────────────────

  const handleStyleText = async (index: number, applyToAll: boolean) => {
    const slot = slots[index];
    if (!slot.styleTextInput.trim()) return;

    if (applyToAll) {
      setSlots((prev) => prev.map((s) => ({ ...s, isBusy: true })));
    } else {
      patchSlot(index, { isBusy: true });
    }

    try {
      const res = await fetch("/api/tweak-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userRequest: slot.styleTextInput,
          currentStyle: slot.styleOverride,
          applyToAll,
        }),
      });
      if (!res.ok) {
        throw new Error(await safeErrorMessage(res, "Stijl aanpassen mislukt"));
      }
      const { styleConfig } = await res.json() as { styleConfig: StyleConfig };
      const chips = styleToChips(styleConfig);

      if (applyToAll) {
        setGlobalStyleChips(chips);
        setGlobalStyleProgress(0);
        for (let i = 0; i < slots.length; i++) {
          const url = await renderSlot(sessionId, i, slots[i].copy, styleConfig);
          setSlots((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, styleOverride: styleConfig, previewUrl: url, isBusy: idx < slots.length - 1, styleChips: chips, styleTextInput: "" }
                : s
            )
          );
          setGlobalStyleProgress(i + 1);
        }
      } else {
        const url = await renderSlot(sessionId, index, slot.copy, styleConfig);
        patchSlot(index, {
          styleOverride: styleConfig,
          previewUrl: url,
          styleChips: chips,
          styleTextInput: "",
          activePanel: "none",
          isBusy: false,
        });
      }
    } catch (err) {
      if (applyToAll) {
        setSlots((prev) => prev.map((s) => ({ ...s, isBusy: false })));
      } else {
        patchSlot(index, { isBusy: false });
      }
      alert(err instanceof Error ? err.message : "Stijl aanpassen mislukt");
    }
  };

  // ── Button 3 — Regenereer (per slot) ─────────────────────────────────────

  const handleRegenerateSlot = async (index: number) => {
    patchSlot(index, { isBusy: true });
    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, slotIndex: index, temperature: 1 }),
      });
      if (!res.ok) {
        throw new Error(await safeErrorMessage(res, "Regenereren mislukt"));
      }
      const { copy: newCopy } = await res.json();
      const url = await renderSlot(sessionId, index, newCopy, slots[index].styleOverride);
      patchSlot(index, { copy: newCopy, previewUrl: url, isBusy: false });
    } catch (err) {
      patchSlot(index, { isBusy: false });
      alert(err instanceof Error ? err.message : "Regenereren mislukt");
    }
  };

  // ── Sidebar — Full regenerate ─────────────────────────────────────────────

  const handleFullRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        throw new Error(await safeErrorMessage(res, "Regenereren mislukt"));
      }
      const { copy: newCopy } = await res.json();

      if (session?.templateMode === "cozella") {
        // newCopy is a CozellaCopyResult
        const cozellaCopy = newCopy as CozellaCopyResult;
        setSlots((prev) =>
          prev.map((s, i) => ({
            ...s,
            copy: (cozellaCopy[`slot0${i}` as keyof CozellaCopyResult] as unknown as SlotCopy),
            previewUrl: null,
          }))
        );
      } else {
        setSlots((prev) =>
          prev.map((s, i) => ({
            ...s,
            copy: (newCopy as unknown as Record<string, SlotCopy>)[`slot0${i}`],
            previewUrl: null,
          }))
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Regenereren mislukt");
    } finally {
      setRegenerating(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = async (index: number) => {
    patchSlot(index, { isBusy: true });
    try {
      const slot = slots[index];
      const url = await renderSlot(sessionId, index, slot.copy, slot.styleOverride);
      const a = document.createElement("a");
      a.href = url;
      const mode = session?.templateMode ?? "amazon";
      a.download = `infographic-${mode}-slot-0${index}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download mislukt");
    } finally {
      patchSlot(index, { isBusy: false });
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <main style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}
        className="flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-6">{loadError}</p>
          <button onClick={() => router.push("/")}
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Opnieuw beginnen
          </button>
        </div>
      </main>
    );
  }

  if (!session || !insights || slots.length === 0) {
    return (
      <main style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}
        className="flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Resultaten laden...
        </div>
      </main>
    );
  }

  const isCozella = session.templateMode === "cozella";
  const isRambux = session.templateMode === "rambux";
  const slotLabels = isCozella ? COZELLA_SLOT_LABELS : isRambux ? RAMBUX_SLOT_LABELS : AMAZON_SLOT_LABELS;

  return (
    <main style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}
      className="flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 border-r border-[#222] p-6 overflow-y-auto"
        style={{ minHeight: "100vh" }}>
        <button onClick={() => router.push("/")}
          className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1.5 transition-colors">
          ← Nieuw product
        </button>

        <h2 className="text-lg font-bold mb-0.5">{session.productName}</h2>
        <div className="flex items-center gap-2 mb-6">
          <p className="text-gray-500 text-sm">{session.category}</p>
          <span className="text-xs text-gray-600 border border-[#333] rounded px-1.5 py-0.5">
            {isCozella ? "Cozella" : isRambux ? "RAMBUX®" : "Amazon"}
          </span>
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Conversie drivers
          </h3>
          <ul className="space-y-2">
            {insights.drivers.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-green-400 flex-shrink-0 mt-0.5">●</span>
                <span className="text-gray-200">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Bezwaren
          </h3>
          <ul className="space-y-2">
            {insights.blockers.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-red-400 flex-shrink-0 mt-0.5">●</span>
                <span className="text-gray-200">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Stem van de klant
          </h3>
          <div className="flex flex-wrap gap-2">
            {insights.voiceOfCustomer.map((v, i) => (
              <span key={i}
                className="bg-[#222] border border-[#333] rounded-full px-3 py-1 text-xs text-gray-300">
                {v}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleFullRegenerate} disabled={regenerating}
          className="w-full py-2.5 border border-[#333] rounded-lg text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {regenerating ? (
            <><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Bezig...</>
          ) : "↺ Alle teksten regenereren"}
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Global style header — Amazon only */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Jouw infographics</h1>
            <p className="text-gray-500 text-sm mt-1">
              {(isCozella || isRambux)
                ? "Pas tekst aan of regenereer per slide"
                : "Pas tekst aan, upload een stijlreferentie of regenereer per slide"}
            </p>
          </div>

          {!isCozella && !isRambux && (
            <div>
              <input ref={globalStyleInputRef} type="file" accept="image/jpeg,image/png"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setGlobalStyleUploading(true);
                  setGlobalStyleProgress(0);
                  await handleStyleUpload(0, file, true);
                  e.target.value = "";
                }} />

              <button
                onClick={() => globalStyleInputRef.current?.click()}
                disabled={globalStyleUploading}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#444] rounded-xl text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-50">
                🎨
                {globalStyleUploading
                  ? `Stijl toepassen... (${globalStyleProgress}/${slots.length})`
                  : "Stijlreferentie voor alle slides"}
              </button>

              {globalStyleChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {globalStyleChips.map((c) => (
                    <span key={c}
                      className="bg-[#1a2a1a] border border-green-900 text-green-400 rounded-full px-2.5 py-0.5 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slot cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {slots.map((slot, index) => (
            <SlotCard
              key={index}
              index={index}
              slot={slot}
              session={session}
              label={slotLabels[index]}
              isCozella={isCozella || isRambux}
              onTweak={() => handleTweak(index)}
              onTweakInputChange={(v) => patchSlot(index, { tweakInput: v })}
              onStyleFile={(file, all) => handleStyleUpload(index, file, all)}
              onStyleText={(all) => handleStyleText(index, all)}
              onStyleTextInputChange={(v) => patchSlot(index, { styleTextInput: v })}
              onRegenerate={() => handleRegenerateSlot(index)}
              onDownload={() => handleDownload(index)}
              onTogglePanel={(panel) =>
                patchSlot(index, {
                  activePanel: slot.activePanel === panel ? "none" : panel,
                })
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// ── SlotCard ──────────────────────────────────────────────────────────────────

interface SlotCardProps {
  index: number;
  slot: SlotState;
  session: SessionData;
  label: string;
  isCozella: boolean;
  onTweak: () => void;
  onTweakInputChange: (v: string) => void;
  onStyleFile: (file: File, applyToAll: boolean) => void;
  onStyleText: (applyToAll: boolean) => void;
  onStyleTextInputChange: (v: string) => void;
  onRegenerate: () => void;
  onDownload: () => void;
  onTogglePanel: (panel: ActivePanel) => void;
}

function SlotCard({
  index,
  slot,
  session,
  label,
  isCozella,
  onTweak,
  onTweakInputChange,
  onStyleFile,
  onStyleText,
  onStyleTextInputChange,
  onRegenerate,
  onDownload,
  onTogglePanel,
}: SlotCardProps) {
  const styleFileInputRef = useRef<HTMLInputElement>(null);

  const photoPath =
    session.slotPhotoMap?.[index] ??
    session.photoPaths?.[index % Math.max(session.photoPaths?.length ?? 1, 1)];

  const previewSrc = slot.previewUrl ?? photoPath;

  return (
    <div className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3 border-b border-[#222] flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">{label}</span>
        {slot.styleChips.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {slot.styleChips.slice(0, 3).map((c) => (
              <span key={c}
                className="bg-[#1a2a1a] border border-green-900 text-green-400 rounded-full px-2 py-0.5 text-xs">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="relative w-full aspect-square bg-[#0a0a0a]">
        {previewSrc && (
          <img src={previewSrc} alt={`Slot ${index} preview`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${slot.isBusy ? "opacity-40" : "opacity-100"}`} />
        )}
        {slot.isBusy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {slot.previewUrl && (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            Bijgewerkt
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-[#1e1e1e]">
        <ActionBtn
          active={slot.activePanel === "tweak"}
          onClick={() => onTogglePanel("tweak")}
          disabled={slot.isBusy}>
          ✏️ Tekst aanpassen
        </ActionBtn>
        {!isCozella && (
          <ActionBtn
            active={slot.activePanel === "style"}
            onClick={() => onTogglePanel("style")}
            disabled={slot.isBusy}>
            🎨 Stijl uploaden
          </ActionBtn>
        )}
        <ActionBtn onClick={onRegenerate} disabled={slot.isBusy}>
          🔄 Regenereer
        </ActionBtn>
        <ActionBtn onClick={onDownload} disabled={slot.isBusy} primary>
          ↓ Download
        </ActionBtn>
      </div>

      {/* Tweak panel */}
      {slot.activePanel === "tweak" && (
        <div className="px-4 py-4 border-b border-[#1e1e1e] bg-[#0f0f0f]">
          <textarea
            value={slot.tweakInput}
            onChange={(e) => onTweakInputChange(e.target.value)}
            placeholder="Wat wil je aanpassen? bijv. 'Maak de headline korter' of 'Verander de bullet over materiaal'"
            rows={3}
            disabled={slot.isBusy}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#555] resize-none disabled:opacity-50"
          />
          <button
            onClick={onTweak}
            disabled={slot.isBusy || !slot.tweakInput.trim()}
            className="mt-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {slot.isBusy ? "Bezig..." : "Pas aan"}
          </button>
        </div>
      )}

      {/* Style panel — Amazon only */}
      {slot.activePanel === "style" && !isCozella && (
        <div className="px-4 py-4 border-b border-[#1e1e1e] bg-[#0f0f0f]">
          <input
            ref={styleFileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onStyleFile(file, false);
              e.target.value = "";
            }}
          />

          {/* Text-based style input */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Beschrijf de gewenste stijl:</p>
            <textarea
              value={slot.styleTextInput}
              onChange={(e) => onStyleTextInputChange(e.target.value)}
              placeholder="bijv. 'Maak het donkerder en luxueuzer' of 'Gebruik een minimale stijl met grote koptekst'"
              rows={2}
              disabled={slot.isBusy}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#555] resize-none disabled:opacity-50"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onStyleText(false)}
                disabled={slot.isBusy || !slot.styleTextInput.trim()}
                className="flex-1 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {slot.isBusy ? "Bezig..." : "Toepassen op deze slide"}
              </button>
              <button
                onClick={() => onStyleText(true)}
                disabled={slot.isBusy || !slot.styleTextInput.trim()}
                className="flex-1 py-1.5 border border-[#444] text-gray-300 text-xs rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Toepassen op alle slides
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-gray-600">of upload voorbeeld</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          <div
            onClick={() => !slot.isBusy && styleFileInputRef.current?.click()}
            className={`border-2 border-dashed border-[#333] rounded-xl p-6 text-center cursor-pointer hover:border-[#555] transition-colors ${slot.isBusy ? "opacity-50 cursor-not-allowed" : ""}`}>
            <div className="text-2xl mb-1">🖼️</div>
            <p className="text-gray-400 text-sm">
              Upload screenshot van een listing die je mooi vindt
            </p>
          </div>

          {slot.styleChips.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1.5">Gedetecteerde stijl:</p>
              <div className="flex flex-wrap gap-1.5">
                {slot.styleChips.map((c) => (
                  <span key={c}
                    className="bg-[#1a2a1a] border border-green-900 text-green-400 rounded-full px-2.5 py-0.5 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => styleFileInputRef.current?.click()}
              disabled={slot.isBusy}
              className="flex-1 py-2 border border-[#333] text-gray-300 text-xs rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-40">
              Toepassen op deze slide
            </button>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              id={`style-all-${index}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onStyleFile(file, true);
                e.target.value = "";
              }}
            />
            <label
              htmlFor={`style-all-${index}`}
              className={`flex-1 py-2 border border-[#444] text-gray-300 text-xs rounded-lg hover:bg-[#1a1a1a] transition-colors text-center cursor-pointer ${slot.isBusy ? "opacity-40 pointer-events-none" : ""}`}>
              Toepassen op alle slides
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  active,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        primary
          ? "bg-white text-black hover:bg-gray-100"
          : active
          ? "bg-[#1e3a1e] border border-green-700 text-green-300"
          : "border border-[#333] text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
      }`}>
      {children}
    </button>
  );
}
