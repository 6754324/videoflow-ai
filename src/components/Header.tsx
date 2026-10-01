import { useFlowStore } from '../store/flowStore'
import { useFlowComputed } from '../hooks/useFlow'
import { STAGES } from '../data/stages'

export function Header() {
  const topic = useFlowStore((s) => s.topic)
  const tasks = useFlowStore((s) => s.tasks)
  const setTopic = useFlowStore((s) => s.setTopic)
  const loadDemo = useFlowStore((s) => s.loadDemo)
  const clearAll = useFlowStore((s) => s.clearAll)

  const { schedule, progress } = useFlowComputed()

  const exportPlan = () => {
    const lines: string[] = []
    lines.push(`《${topic || '未命名项目'}》制作计划`)
    lines.push('')
    lines.push(`项目总时长：${schedule?.projectDuration ?? 0} 小时（关键路径）`)
    lines.push(`进度：${progress.percent.toFixed(0)}%（按工时加权）`)
    lines.push('')
    lines.push('任务清单（按阶段）：')
    for (const stage of STAGES) {
      const stageTasks = tasks.filter((t) => t.stage === stage.id)
      if (stageTasks.length === 0) continue
      lines.push('')
      lines.push(`【${stage.label}】`)
      for (const t of stageTasks) {
        const deps = t.dependsOn.length ? `（依赖 ${t.dependsOn.length} 项）` : ''
        lines.push(`· ${t.done ? '[✓]' : '[ ]'} ${t.title || '未命名任务'} ${t.durationHours}h ${deps}`)
      }
    }
    if (schedule) {
      const critical = schedule.order.filter((id) => schedule.timing.get(id)?.critical)
      lines.push('')
      lines.push('关键路径：')
      lines.push(critical.map((id) => tasks.find((t) => t.id === id)?.title || id).join(' → '))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'video-plan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 px-4">
      <div className="flex items-baseline gap-2.5">
        <h1 className="font-display text-lg font-semibold tracking-tight text-ink-900">VideoFlow AI</h1>
        <span className="text-xs text-ink-400">视频制作流水线 · 关键路径排程</span>
      </div>
      <input
        className="mx-4 min-w-0 flex-1 rounded-md border border-ink-200 bg-paper-200 px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-500/60"
        placeholder="项目选题，如：城市里的独立书店"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={loadDemo}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-sm text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
        >
          载入示例
        </button>
        <button
          onClick={clearAll}
          disabled={tasks.length === 0 && topic === ''}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-sm text-ink-500 transition hover:text-ink-900 disabled:opacity-40"
        >
          清空
        </button>
        <button
          onClick={exportPlan}
          disabled={tasks.length === 0}
          className="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-paper-50 transition hover:bg-brand-500 disabled:opacity-40"
        >
          导出计划
        </button>
      </div>
    </header>
  )
}
