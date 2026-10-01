import type { StageId } from '../types'

export interface StageMeta {
  id: StageId
  label: string
  short: string
  /** Tailwind chip classes for the stage header. */
  chip: string
}

export const STAGES: StageMeta[] = [
  { id: 'ideation', label: '选题', short: '选', chip: 'bg-violet-500/15 text-violet-700' },
  { id: 'script', label: '脚本', short: '脚', chip: 'bg-sky-500/15 text-sky-700' },
  { id: 'storyboard', label: '分镜', short: '镜', chip: 'bg-cyan-500/15 text-cyan-700' },
  { id: 'shooting', label: '拍摄', short: '拍', chip: 'bg-emerald-500/15 text-emerald-700' },
  { id: 'editing', label: '剪辑', short: '剪', chip: 'bg-amber-500/15 text-amber-700' },
  { id: 'post', label: '调色/字幕', short: '后', chip: 'bg-rose-500/15 text-rose-700' },
  { id: 'publish', label: '发布', short: '发', chip: 'bg-brand-500/15 text-brand-700' },
]

export const STAGE_MAP: Record<StageId, StageMeta> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
) as Record<StageId, StageMeta>
