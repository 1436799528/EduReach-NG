// ============================================
// EDUREACH HUB — AI CLIENT
// Supports: DeepSeek, OpenAI, or any OpenAI-compatible API
// ============================================

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIResponse {
  content: string | null;
  error: string | null;
}

export async function callAI(
  messages: AIMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  // Try DeepSeek first, then OpenAI
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const apiKey = deepseekKey || openaiKey;
  const baseUrl = deepseekKey
    ? "https://api.deepseek.com"
    : "https://api.openai.com";
  const model = deepseekKey ? "deepseek-chat" : "gpt-4o-mini";

  if (!apiKey) {
    return { content: null, error: "No AI API key configured." };
  }

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI API error:", res.status, errText);
      return { content: null, error: `AI API error: ${res.status}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || null;

    return { content, error: null };
  } catch (e) {
    console.error("AI request failed:", e);
    return { content: null, error: "AI request failed." };
  }
}

export function isAIConfigured(): boolean {
  return !!(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY);
}
