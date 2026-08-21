/**
 * AI abstraction layer (§41).
 *
 * The rest of the application talks to the AIProvider interface ONLY.
 * The MVP provider is fully deterministic: templates + retrieval over
 * verified content. A vendor provider (OpenAI/Gemini/Claude/local) can be
 * dropped in later without touching product code.
 *
 * Hard rule (§21): never let a model invent official school information.
 * Sensitive answers always cite verified database content first.
 */

export interface AiAnswerSource {
  title: string;
  url: string;
  kind: 'announcement' | 'guide' | 'letter' | 'tool' | 'university';
}

export interface AiAnswer {
  answer: string;
  sources: AiAnswerSource[];
  /** True when the response came from verified/curated content only. */
  grounded: boolean;
}

export interface AIProvider {
  name: string;
  answerQuestion(question: string, context?: { institutionSlug?: string | null }): Promise<AiAnswer>;
  generateDocument?(templateKey: string, values: Record<string, string>): Promise<string>;
  classifyQuestion?(question: string): Promise<{ category: string; confidence: number }>;
}

/** MVP provider: deterministic, template/retrieval based. */
export class TemplateAIProvider implements AIProvider {
  name = 'template';

  async answerQuestion(question: string): Promise<AiAnswer> {
    return {
      answer: 'This question should be resolved via the curated knowledge search.',
      sources: [],
      grounded: true
    };
  }
}

export function getAIProvider(): AIProvider {
  // Later: switch on process.env.AI_PROVIDER and construct vendor clients.
  return new TemplateAIProvider();
}
