import { NextResponse } from "next/server";
import { strategyInputSchema } from "@/lib/gtm/validation";
import { generateStrategy, activeProvider } from "@/lib/gtm/generator";

// Server route for strategy generation. Validates input, then delegates to the
// provider abstraction (mock by default, live AI if configured).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = strategyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const strategy = await generateStrategy(parsed.data);
    return NextResponse.json({ strategy });
  } catch (err) {
    console.error("[api/generate-strategy] error:", err);
    return NextResponse.json(
      { error: "Failed to generate strategy." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", provider: activeProvider() });
}
