/**
 * Hugging Face Inference Client — Wrapper for HF Inference Providers API.
 *
 * Uses the OpenAI-compatible /v1/chat/completions endpoint via the HF Router.
 * Free tier with monthly credits for HF users.
 *
 * If the API key is missing or the request fails, callers should gracefully
 * fall back to rule-based evaluation (Tier 1+2 only, skip Tier 3 LLM).
 */

const HF_API_BASE =
  process.env.EXPO_PUBLIC_HUGGINGFACE_API_BASE ??
  'https://router.huggingface.co/v1';
const HF_API_KEY =
  process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY ?? '';
const HF_MODEL =
  process.env.EXPO_PUBLIC_HUGGINGFACE_MODEL ??
  'meta-llama/Llama-3.1-8B-Instruct';
const DEFAULT_TIMEOUT_MS = 30000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  /** Maximum tokens to generate (default: 300) */
  maxTokens?: number;
  /** Sampling temperature (default: 0.3) */
  temperature?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  finishReason: string | null;
}

/**
 * Send a chat completion request to the Hugging Face Inference API.
 *
 * @param messages - Array of chat messages (system/user/assistant)
 * @param options  - Optional configuration overrides
 * @returns The assistant's response content, or an error on failure
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<{ ok: true; result: ChatCompletionResult } | { ok: false; error: string }> {
  const {
    maxTokens = 300,
    temperature = 0.3,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  if (!HF_API_KEY) {
    return {
      ok: false,
      error: 'Hugging Face API key is not set. Add EXPO_PUBLIC_HUGGINGFACE_API_KEY to your .env file.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${HF_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;

      if (status === 401) {
        return {
          ok: false,
          error: 'Hugging Face API key is invalid. Check your EXPO_PUBLIC_HUGGINGFACE_API_KEY.',
        };
      }

      if (status === 429) {
        return {
          ok: false,
          error: 'Rate limit reached on Hugging Face free tier. Let\'s try again in a moment.',
        };
      }

      if (status === 503) {
        return {
          ok: false,
          error: 'Model is currently loading on Hugging Face. Let\'s try again shortly.',
        };
      }

      return {
        ok: false,
        error: 'Could not reach Hugging Face Inference API. Let\'s try again.',
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        ok: false,
        error: 'Hugging Face returned an empty response. Let\'s try again.',
      };
    }

    return {
      ok: true,
      result: {
        content: content.trim(),
        model: data.model ?? HF_MODEL,
        finishReason: data.choices?.[0]?.finish_reason ?? null,
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        ok: false,
        error: 'Hugging Face is taking longer than expected. Let\'s try again.',
      };
    }

    if (
      err.message?.includes('Network request failed') ||
      err.message?.includes('Failed to fetch')
    ) {
      return {
        ok: false,
        error: 'Could not connect to Hugging Face. Check your internet connection.',
      };
    }

    return {
      ok: false,
      error: 'Could not reach Hugging Face Inference API.',
    };
  }
}

/**
 * Check if the Hugging Face API key is configured.
 * Useful for deciding whether to attempt LLM evaluation or skip it.
 */
export async function isHfAvailable(): Promise<boolean> {
  return HF_API_KEY.length > 0;
}