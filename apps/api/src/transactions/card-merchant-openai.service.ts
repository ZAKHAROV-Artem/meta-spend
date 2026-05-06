import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  parseAutoCategorizeAiPayload,
  stripJsonFence,
  validateAssignmentsForChunk,
} from './card-merchant-auto-categorize.schema';

const CHUNK_MERCHANT_INSTRUCTION = [
  'You assign debit card merchants to budget categories.',
  'Reply with ONLY valid JSON matching this shape:',
  '{"assignments":[{"merchantKey":string,"categoryId":string|null,"confidence"?:number,"reason"?:string}]}',
  'Rules:',
  '- Copy each merchantKey EXACTLY as given (same spelling and casing normalization as input).',
  '- categoryId must be one of the provided category IDs, or JSON null if you cannot pick one.',
  '- Return exactly ONE assignment object per merchant in the request (same count).',
  '- Use only JSON; no Markdown, no prose, no code fences.',
].join('\n');

@Injectable()
export class CardMerchantOpenAiService {
  private readonly logger = new Logger(CardMerchantOpenAiService.name);

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    const key = this.configService.get<string>('openai.apiKey') ?? '';
    return key.trim();
  }

  private getModel(): string {
    const model = this.configService.get<string>('openai.model');
    return (model ?? 'gpt-4o-mini').trim();
  }

  /**
   * Classifies one chunk of merchants. Validates response against chunk keys + category IDs.
   */
  async classifyMerchantsChunk(input: {
    categories: Array<{ id: string; name: string }>;
    merchants: Array<{ merchantKey: string; sampleTitle: string }>;
  }) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured on the server');
    }

    const client = new OpenAI({ apiKey });
    const model = this.getModel();

    const userPayload = JSON.stringify({
      categories: input.categories,
      merchants: input.merchants,
    });

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.1,
        max_completion_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: CHUNK_MERCHANT_INSTRUCTION },
          { role: 'user', content: userPayload },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (!content.trim()) {
        throw new BadRequestException('Auto-categorize: empty AI response');
      }

      const text = stripJsonFence(content);
      const parsed = parseAutoCategorizeAiPayload(text);
      validateAssignmentsForChunk({
        assignments: parsed.assignments,
        expectedKeys: new Set(input.merchants.map((m) => m.merchantKey)),
        categoryIds: new Set(input.categories.map((c) => c.id)),
      });

      return parsed.assignments;
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof ServiceUnavailableException) throw e;

      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`OpenAI auto-categorize failed: ${message}`);
      throw new ServiceUnavailableException('Auto-categorize: AI provider request failed');
    }
  }
}
