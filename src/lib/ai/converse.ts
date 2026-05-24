import Anthropic from '@anthropic-ai/sdk'

export interface ConverseArgs {
  model?: string
  system: string
  knowledge: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  maxTokens?: number
}

export interface TextDeltaEvent {
  type: 'text-delta'
  text: string
}

export interface DoneEvent {
  type: 'done'
  usage: { input_tokens: number; output_tokens: number }
}

export interface ErrorEvent {
  type: 'error'
  error: string
}

export type ConverseEvent = TextDeltaEvent | DoneEvent | ErrorEvent

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

export async function* converse(args: ConverseArgs): AsyncGenerator<ConverseEvent> {
  const {
    model = 'claude-sonnet-4-6',
    system,
    knowledge,
    messages,
    maxTokens = 1024,
  } = args

  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: 'text', text: system },
    { type: 'text', text: `<knowledge>\n${knowledge}\n</knowledge>` },
  ]

  const stream = getClient().messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemBlocks,
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield { type: 'text-delta', text: event.delta.text }
    }
  }

  const final = await stream.finalMessage()
  yield {
    type: 'done',
    usage: {
      input_tokens: final.usage.input_tokens,
      output_tokens: final.usage.output_tokens,
    },
  }
}
