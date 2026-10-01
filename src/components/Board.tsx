import { memo } from 'react'
import { useFlowStore } from '../store/flowStore'
import { useFlowComputed } from '../hooks/useFlow'
import { STAGES } from '../data/stages'
import type { Task } from '../types'

const TaskCard = memo(function TaskCard({
  task,
  selected,
  critical,
  blocked,
}: {
  task: Task
  selected: boolean
  critical: boolean
  blocked: boolean
}) {
  const updateTask = useFlowStore((s) => s.updateTask)
  const removeTask = useFlowStore((s) => s.removeTask)
  const moveTask = useFlowStore((s) => s.moveTask)
  const toggleDone = useFlowStore((s) => s.toggleDone)
  const selectTask = useFlowStore((s) => s.selectTask)

  return (
    <div
      onClick={() => selectTask(task.id)}
      className={`cursor-pointer rounded-md border p-2.5 transition ${
        selected
          ? 'border-brand-500/60 bg-brand-500/5'
          : 'border-white/10 bg-ink-800/50 hover:border-white/20'
      } ${blocked ? 'opacity-55' : ''}`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.done}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleDone(task.id)}
          className="mt-0.5 accent-brand-500"
        />
        <input
          value={task.title}
          placeholder="任务名"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className={`min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600 ${
            task.done ? 'text-zinc-500 line-through' : ''
          }`}
        />
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
        <span className="font-mono">{task.durationHours}h</span>
        {task.assignee && <span>· {task.assignee}</span>}
        {critical && (
          <span className="rounded bg-accent-500/15 px-1 py-0.5 text-accent-300">关键</span>
        )}
        {task.dependsOn.length > 0 && <span>· {task.dependsOn.length} 依赖</span>}
        <div className="ml-auto flex gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              moveTask(task.id, -1)
            }}
            className="rounded px-1 text-zinc-500 transition hover:text-white"
            title="前移阶段"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              moveTask(task.id, 1)
            }}
            className="rounded px-1 text-zinc-500 transition hover:text-white"
            title="后移阶段"
          >
            ›
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeTask(task.id)
            }}
            className="rounded px-1 text-zinc-600 transition hover:text-rose-400"
            title="删除"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
})

export function Board() {
  const tasks = useFlowStore((s) => s.tasks)
  const selectedTaskId = useFlowStore((s) => s.selectedTaskId)
  const addTask = useFlowStore((s) => s.addTask)
  const { criticalIds, blocked } = useFlowComputed()
  const blockedIds = new Set(blocked.map((t) => t.id))

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-4">
      {STAGES.map((stage) => {
        const stageTasks = tasks.filter((t) => t.stage === stage.id)
        return (
          <div
            key={stage.id}
            className="flex h-full w-64 shrink-0 flex-col rounded-lg border border-white/10 bg-ink-900/60"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${stage.chip}`}>
                {stage.label}
              </span>
              <span className="text-xs text-zinc-600">{stageTasks.length}</span>
              <button
                onClick={() => addTask(stage.id)}
                className="ml-auto rounded px-1.5 text-zinc-500 transition hover:text-white"
                title="在此阶段添加任务"
              >
                +
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
              {stageTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  selected={t.id === selectedTaskId}
                  critical={criticalIds.has(t.id)}
                  blocked={blockedIds.has(t.id)}
                />
              ))}
              {stageTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-zinc-700">暂无任务</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
