/**
 * Vercel Edge function that asks DeepSeek for a video-production task plan.
 * Key from request body or DEEPSEEK_API_KEY env var. Kept out of `tsconfig`
 * include — Vercel bundles it itself.
 */
export const config = { runtime: 'edge' }

const STAGE_IDS = ['ideation', 'script', 'storyboard', 'shooting', 'editing', 'post', 'publish']

const SYSTEM_PROMPT = `你是一位视频制作统筹。根据用户给的选题，拆解一份完整的视频制作任务清单（从选题到发布）。
严格只输出一个 JSON 对象，形如 { "tasks": [ ... ] }，不要任何解释或 markdown 代码块。
每个任务元素字段：
{
  "title": "任务名",
  "stage": "${STAGE_IDS.join('|')} 之一",
  "durationHours": 预计工时（数字，小时）,
  "dependsOn": [前置任务在数组中的下标（从 0 开始），无前置则为 []],
  "assignee": "建议负责人岗位，如 编导/摄影/剪辑/运营"
}
要求：8 到 14 个任务，覆盖主要阶段，依赖关系形成一条可排程的流程。`

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function stripFences(text: string): string {
  const t = text.trim()
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fence ? fence[1] : t
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405)

  let body: Record<string, unknown> | null = null
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const apiKey =
    typeof body.apiKey === 'string' && body.apiKey ? body.apiKey : process.env.DEEPSEEK_API_KEY
  if (!apiKey) return json({ error: 'no API key' }, 401)

  const topic = typeof body.topic === 'string' && body.topic ? body.topic : '一个视频选题'

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `选题：${topic}\n\n请输出任务清单。` },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text().catch(() => '')
    return json({ error: `upstream ${upstream.status}`, detail: err }, 502)
  }

  const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  try {
    const parsed = JSON.parse(stripFences(content)) as { tasks?: unknown }
    return json({ tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [] })
  } catch {
    return json({ error: 'model returned invalid JSON', content }, 502)
  }
}
