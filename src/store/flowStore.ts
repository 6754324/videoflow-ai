import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StageId, Task } from '../types'
import { STAGES } from '../data/stages'
import { DEMO_TASKS, DEMO_TOPIC } from '../data/demo'

const STAGE_ORDER = STAGES.map((s) => s.id)

function shiftStage(stage: StageId, dir: -1 | 1): StageId {
  const idx = STAGE_ORDER.indexOf(stage)
  const target = Math.min(Math.max(idx + dir, 0), STAGE_ORDER.length - 1)
  return STAGE_ORDER[target]
}

interface FlowState {
  topic: string
  tasks: Task[]
  selectedTaskId: string | null
  apiKey: string

  setTopic: (v: string) => void
  setApiKey: (v: string) => void

  addTask: (stage: StageId) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  moveTask: (id: string, dir: -1 | 1) => void
  toggleDone: (id: string) => void
  toggleDependency: (taskId: string, depId: string) => void
  selectTask: (id: string | null) => void

  applyGeneratedTasks: (tasks: Task[]) => void
  loadDemo: () => void
  clearAll: () => void
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      topic: '',
      tasks: [],
      selectedTaskId: null,
      apiKey: '',

      setTopic: (topic) => set({ topic }),
      setApiKey: (apiKey) => set({ apiKey }),

      addTask: (stage) => {
        const id = crypto.randomUUID()
        const task: Task = {
          id,
          title: '',
          stage,
          durationHours: 4,
          dependsOn: [],
          assignee: '',
          done: false,
        }
        set((s) => ({ tasks: [...s.tasks, task], selectedTaskId: id }))
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks
            .filter((t) => t.id !== id)
            .map((t) => ({ ...t, dependsOn: t.dependsOn.filter((d) => d !== id) })),
          selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
        })),

      moveTask: (id, dir) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, stage: shiftStage(t.stage, dir) } : t)),
        })),

      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),

      toggleDependency: (taskId, depId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t
            const has = t.dependsOn.includes(depId)
            return {
              ...t,
              dependsOn: has ? t.dependsOn.filter((d) => d !== depId) : [...t.dependsOn, depId],
            }
          }),
        })),

      selectTask: (id) => set({ selectedTaskId: id }),

      applyGeneratedTasks: (tasks) =>
        set({ tasks, selectedTaskId: tasks[0]?.id ?? null }),

      loadDemo: () =>
        set({ topic: DEMO_TOPIC, tasks: DEMO_TASKS, selectedTaskId: DEMO_TASKS[0]?.id ?? null }),

      clearAll: () => set({ topic: '', tasks: [], selectedTaskId: null }),
    }),
    {
      name: 'videoflow-ai',
      partialize: (s) => ({ topic: s.topic, tasks: s.tasks }),
    },
  ),
)
