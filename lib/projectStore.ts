import fs from "fs";
import path from "path";
import { SessionData, TemplateMode, Language } from "@/types";
import { setSession } from "@/lib/store";

const DATA_DIR = path.join(process.cwd(), "data", "projects");
const PUBLIC_PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_PROJECTS_DIR, { recursive: true });
}

export interface ProjectMeta {
  sessionId: string;
  productName: string;
  templateMode: TemplateMode;
  language: Language;
  savedAt: number;
}

/**
 * Save a session to disk:
 * 1. Copy uploaded photos to /public/projects/{sessionId}/
 * 2. Update photoPaths + slotPhotoMap in the session to point to /projects/{id}/
 * 3. Write full SessionData as JSON to /data/projects/{sessionId}.json
 */
export async function saveProject(
  sessionId: string,
  session: SessionData
): Promise<void> {
  ensureDirs();

  const photoDestDir = path.join(PUBLIC_PROJECTS_DIR, sessionId);
  fs.mkdirSync(photoDestDir, { recursive: true });

  // Copy photos and remap paths
  const remapPath = (webPath: string): string => {
    // webPath is like /uploads/{sessionId}/photo_xxx.jpg
    const srcAbs = path.join(process.cwd(), "public", webPath);
    if (!fs.existsSync(srcAbs)) return webPath; // already missing, keep as-is
    const filename = path.basename(webPath);
    const destAbs = path.join(photoDestDir, filename);
    fs.copyFileSync(srcAbs, destAbs);
    return `/projects/${sessionId}/${filename}`;
  };

  const newPhotoPaths = (session.photoPaths ?? []).map(remapPath);

  const newSlotPhotoMap: Record<number, string> = {};
  for (const [k, v] of Object.entries(session.slotPhotoMap ?? {})) {
    newSlotPhotoMap[Number(k)] = remapPath(v);
  }

  const savedSession: SessionData & { savedAt: number } = {
    ...session,
    photoPaths: newPhotoPaths,
    slotPhotoMap: newSlotPhotoMap,
    savedAt: Date.now(),
  };

  const filePath = path.join(DATA_DIR, `${sessionId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(savedSession, null, 2), "utf-8");
}

/**
 * Load a saved project from disk into the in-memory session store.
 * Returns the SessionData so the caller can verify it loaded.
 */
export function loadProject(sessionId: string): SessionData | null {
  const filePath = path.join(DATA_DIR, `${sessionId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as SessionData;
  setSession(sessionId, data);
  return data;
}

/**
 * List all saved projects, sorted by savedAt descending (newest first).
 */
export function listProjects(): ProjectMeta[] {
  ensureDirs();
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const metas: ProjectMeta[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
      const data = JSON.parse(raw) as SessionData & { savedAt?: number };
      metas.push({
        sessionId: path.basename(file, ".json"),
        productName: data.productName,
        templateMode: data.templateMode,
        language: data.language,
        savedAt: data.savedAt ?? data.createdAt,
      });
    } catch {
      // corrupt file — skip
    }
  }
  return metas.sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Delete a saved project: removes JSON + permanent photo folder.
 */
export function deleteProject(sessionId: string): void {
  const filePath = path.join(DATA_DIR, `${sessionId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const photoDir = path.join(PUBLIC_PROJECTS_DIR, sessionId);
  if (fs.existsSync(photoDir)) {
    fs.rmSync(photoDir, { recursive: true, force: true });
  }
}
