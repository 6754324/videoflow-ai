import type { StageId, Task } from '../types'
import { STAGES } from '../data/stages'
import { DEMO_GENERATED_TASKS } from '../data/demo'

export interface GenerateResult {
  tasks: Task[]
  /** 'demo' = canned fallback, 'api' = live model response. */
  source: 'demo' | 'api'
}

const STAGE_IDS = new Set<string>(STAGES.map((s) => s.id))

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}
function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback
}
function validStage(v: unknown): StageId | null {
  return typeof v === 'string' && STAGE_IDS.has(v) ? (v as StageId) : null
}

/** Coerce partial model output into well-formed tasks (index deps -> ids). */
export function normalizeTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return []
  const ids: string[] = raw.map(() => crypto.randomUUID())
  return raw.map((r, i) => {
    const o = (r ?? {}) as Record<string, unknown>
    const dependsOn = (Array.isArray(o.dependsOn) ? o.dependsOn : [])
      .map((d) => ids[Number(d)])
      .filter((id): id is string => typeof id === 'string')
    return {
      id: ids[i],
      title: str(o.title, `任务${i + 1}`),
      stage: validStage(o.stage) ?? STAGES[Math.min(i, STAGES.length - 1)].id,
      durationHours: num(o.durationHours, 4),
      dependsOn,
      assignee: str(o.assignee, ''),
      done: false,
    }
  })
}

/**
 * Generate a task plan from a topic. Falls back to a canned demo when no API
 * key is configured or the endpoint is unreachable, keeping the app runnable
 * with zero setup.
 */
export async function generateTasks(topic: string, apiKey: string): Promise<GenerateResult> {
  if (!apiKey) {
    return { tasks: DEMO_GENERATED_TASKS, source: 'demo' }
  }
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, apiKey }),
    })
    if (!res.ok) throw new Error(`generate failed: ${res.status}`)
    const data = (await res.json()) as { tasks?: unknown }
    const tasks = normalizeTasks(data.tasks)
    if (tasks.length === 0) throw new Error('empty response')
    return { tasks, source: 'api' }
  } catch {
    return { tasks: DEMO_GENERATED_TASKS, source: 'demo' }
  }
}
