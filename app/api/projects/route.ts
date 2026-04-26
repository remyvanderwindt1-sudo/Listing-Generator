import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";
import { saveProject, listProjects } from "@/lib/projectStore";

export async function GET() {
  try {
    const projects = listProjects();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: "Kan projecten niet laden" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId vereist" }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });
    }

    await saveProject(sessionId, session);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
