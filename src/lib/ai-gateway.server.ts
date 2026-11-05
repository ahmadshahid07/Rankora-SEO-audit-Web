// Server-only helper for Lovable AI Gateway.
export async function callLovableAI(body: {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  response_format?: { type: "json_object" };
}): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Try again shortly.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Please add credits in Workspace Settings.");
    throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}
