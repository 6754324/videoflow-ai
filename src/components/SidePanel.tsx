import { useState } from 'react'
import { useFlowStore } from '../store/flowStore'
import { useFlowComputed } from '../hooks/useFlow'
import { generateTasks } from '../ai/generate'
import { STAGES } from '../data/stages'

const fieldCls =
  'w-full rounded-md border border-ink-200 bg-paper-200 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-brand-500/60'

function AiTab() {
  const topic = useFlowStore((s) => s.topic)
  const apiKey = useFlowStore((s) => s.apiKey)
  const setApiKey = useFlowStore((s) => s.setApiKey)
  const applyGeneratedTasks = useFlowStore((s) => s.applyGeneratedTasks)

  const [generating, setGenerating] = useState(false)
  const [source, setSource] = useState<'demo' | 'api' | null>(null)

  const onGenerate = async () => {
    setGenerating(true)
    setSource(null)
    const result = await generateTasks(topic, apiKey.trim())
    applyGeneratedTasks(result.tasks)
    setSource(result.source)
    setGenerating(false)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-ink-200 bg-paper-200/40 p-3 text-xs leading-relaxed text-ink-500">
        {topic.trim() || '先在顶部输入选题，或点击「载入示例」。'}
      </div>
      <input
        className={fieldCls}
        type="password"
        placeholder="DeepSeek API Key（可选）"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        onClick={onGenerate}
        disabled={generating || !topic.trim()}
        className="w-full rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-paper-50 transition hover:bg-accent-500 disabled:opacity-50"
      >
        {generating ? '生成中…' : '✨ 根据选题生成任务清单'}
      </button>
      <p className="text-[11px] leading-relaxed text-ink-400">
        {source === 'api' && '已用 AI 模型生成任务，可继续编辑与排程。'}
        {source === 'demo' && '未配置 API Key，已载入示例任务清单（可离线体验）。'}
        {!source && '未配置 Key 时使用内置示例，配置后走 DeepSeek 实时生成。'}
      </p>
    </div>
  )
}

function TaskTab() {
  const tasks = useFlowStore((s) => s.tasks)
  const selected = useFlowStore((s) => s.tasks.find((t) => t.id === s.selectedTaskId) ?? null)
  const updateTask = useFlowStore((s) => s.updateTask)
  const removeTask = useFlowStore((s) => s.removeTask)
  const toggleDone = useFlowStore((s) => s.toggleDone)
  const toggleDependency = useFlowStore((s) => s.toggleDependency)

  if (!selected) {
    return <p className="py-10 text-center text-sm text-ink-400">在左侧看板点击一个任务查看详情</p>
  }

  const others = tasks.filter((t) => t.id !== selected.id)

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs text-ink-400">任务名</span>
        <input
          className={fieldCls}
          value={selected.title}
          onChange={(e) => updateTask(selected.id, { title: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-400">阶段</span>
          <select
            className={fieldCls}
            value={selected.stage}
            onChange={(e) => updateTask(selected.id, { stage: e.target.value as typeof selected.stage })}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-400">工时（小时）</span>
          <input
            className={fieldCls}
            type="number"
            min={1}
            value={selected.durationHours}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (Number.isFinite(n) && n > 0) updateTask(selected.id, { durationHours: n })
            }}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-400">负责人</span>
        <input
          className={fieldCls}
          placeholder="编导 / 摄影 / 剪辑 / 运营…"
          value={selected.assignee}
          onChange={(e) => updateTask(selected.id, { assignee: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          className="accent-brand-500"
          checked={selected.done}
          onChange={() => toggleDone(selected.id)}
        />
        已完成
      </label>

      <div>
        <span className="mb-1 block text-xs text-ink-400">前置任务（依赖）</span>
        {others.length === 0 ? (
          <p className="text-xs text-ink-400">没有其他任务</p>
        ) : (
          <div className="max-h-44 space-y-1 overflow-auto rounded-md border border-ink-200 bg-paper-200/40 p-2">
            {others.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-ink-600">
                <input
                  type="checkbox"
                  className="accent-brand-500"
                  checked={selected.dependsOn.includes(t.id)}
                  onChange={() => toggleDependency(selected.id, t.id)}
                />
                <span className="truncate">{t.title || '未命名任务'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => removeTask(selected.id)}
        className="w-full rounded-md border border-rose-500/30 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-500/10"
      >
        删除任务
      </button>
    </div>
  )
}

function PathTab() {
  const tasks = useFlowStore((s) => s.tasks)
  const { schedule, progress, blocked, ready } = useFlowComputed()

  const title = (id: string) => tasks.find((t) => t.id === id)?.title || id
  const durationOf = (id: string) => tasks.find((t) => t.id === id)?.durationHours ?? 0

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-baseline justify-between text-xs text-ink-400">
          <span>进度（按工时加权）</span>
          <span className="font-mono text-ink-600">{progress.percent.toFixed(0)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-900/5">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-ink-400">
          {progress.doneCount} / {progress.totalCount} 项任务已完成
        </p>
      </div>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
          关键路径
        </h3>
        {!schedule ? (
          <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
            依赖关系存在环，无法排程 — 请检查前置任务。
          </p>
        ) : schedule.order.length === 0 ? (
          <p className="text-xs text-ink-400">还没有任务</p>
        ) : (
          <div className="space-y-2">
            <div className="rounded-md bg-ink-900/5 px-3 py-2 text-xs text-ink-500">
              项目总时长 <span className="font-mono text-ink-900">{schedule.projectDuration}h</span>
            </div>
            <ol className="space-y-1">
              {schedule.order
                .filter((id) => schedule.timing.get(id)?.critical)
                .map((id, i) => (
                  <li key={id} className="flex items-center gap-2 text-xs text-ink-600">
                    <span className="text-ink-400">{i + 1}.</span>
                    <span className="truncate">{title(id)}</span>
                    <span className="ml-auto shrink-0 font-mono text-ink-400">
                      {durationOf(id)}h
                    </span>
                  </li>
                ))}
            </ol>
          </div>
        )}
      </div>

      {ready.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
            可开始
          </h3>
          <ul className="space-y-1">
            {ready.map((t) => (
              <li key={t.id} className="truncate text-xs text-emerald-700">
                · {t.title || '未命名任务'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {blocked.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
            被阻塞
          </h3>
          <ul className="space-y-1">
            {blocked.map((t) => (
              <li key={t.id} className="truncate text-xs text-amber-600/90">
                · {t.title || '未命名任务'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function SidePanel() {
  const [tab, setTab] = useState<'ai' | 'task' | 'path'>('ai')

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-1 border-b border-ink-200 p-1.5">
        {(
          [
            ['ai', 'AI 助手'],
            ['task', '任务详情'],
            ['path', '排程'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${
              tab === key ? 'bg-ink-900/8 text-ink-900' : 'text-ink-400 hover:text-ink-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tab === 'ai' && <AiTab />}
        {tab === 'task' && <TaskTab />}
        {tab === 'path' && <PathTab />}
      </div>
    </div>
  )
}
