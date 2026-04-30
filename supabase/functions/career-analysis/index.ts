import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  cvText: z.string().trim().min(80).max(20000),
  jobDescription: z.string().trim().max(6000).optional().default(""),
});

const fallback = (cvText: string) => ({
  score: 72,
  breakdown: [
    { label: "Skills evidence", score: 72, note: "Skills are visible, but some need stronger proof and outcomes." },
    { label: "Opportunity fit", score: 70, note: "The profile can match jobs, learnerships, bursaries, and entry ventures with clearer goals." },
    { label: "ATS parsing", score: 78, note: "Keep the CV single-column with standard headings and simple bullets." },
    { label: "Income readiness", score: 68, note: "Add measurable results and tools used to improve earning projections." }
  ],
  missingSections: [],
  missingKeywords: [],
  matchedKeywords: [],
  issues: [],
  opportunityMatches: [
    { type: "Jobs", title: "Entry-level roles matching current skills", projection: "R8k–R18k/month", nextStep: "Strengthen bullets with outcomes and tools used." },
    { type: "Learning", title: "Short skills programmes or learnerships", projection: "Improves access to R15k–R25k/month pathways", nextStep: "Target one scarce skill linked to the CV." },
    { type: "Enterprise", title: "Service-based side venture", projection: "R2k–R10k/month early potential", nextStep: "Package one skill into a small paid offer." }
  ],
  revampedCv: cvText,
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Lovable AI is not configured");

    const { cvText, jobDescription } = parsed.data;
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert South African youth career analyst. Analyse the CV ONLY from evidence in the text. Return strict JSON only. Do not invent employers, degrees, or skills. Score out of 100 across: skills evidence, ATS compliance, opportunity fit, and income readiness. Include jobs plus non-job options: learnerships, bursaries/scholarships, internships, freelance/business ventures, and skill bridges. Create a complete ATS-safe revamped CV using placeholders only where user data is missing.`,
          },
          {
            role: "user",
            content: JSON.stringify({ cvText, targetJobDescription: jobDescription || null, requiredShape: {
              score: "number 0-100",
              breakdown: [{ label: "string", score: "number 0-100", note: "string" }],
              missingSections: ["string"],
              missingKeywords: ["string"],
              matchedKeywords: ["string"],
              issues: [{ type: "formatting|weak-bullet|missing-section", title: "string", suggestion: "string" }],
              opportunityMatches: [{ type: "Jobs|Learnerships|Bursaries|Scholarships|Business venture|Freelance|Skills bridge", title: "string", projection: "realistic South African income/funding projection", nextStep: "string" }],
              revampedCv: "complete ATS-safe CV text"
            } }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits are depleted. Please add Lovable AI credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI analysis failed", ...fallback(cvText) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = content ? JSON.parse(content) : fallback(cvText);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
