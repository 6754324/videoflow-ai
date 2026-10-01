import type { Task } from '../types'

export interface TaskTiming {
  /** Earliest start (hours from project start). */
  es: number
  earliestFinish: number
  latestStart: number
  /** Latest finish (hours from project start). */
  lf: number
  /** Total float: how much a task can slip without delaying the project. */
  slack: number
  /** On the critical path when slack is zero. */
  critical: boolean
}

export interface Schedule {
  /** Topological order of task ids. */
  order: string[]
  timing: Map<string, TaskTiming>
  /** Project length in hours. */
  projectDuration: number
}

export interface Progress {
  doneCount: number
  totalCount: number
  /** Weighted by effort (duration hours). */
  percent: number
}

/**
 * Kahn's algorithm for a topological order over task dependencies. Returns
 * null when the dependency graph contains a cycle.
 */
export function topologicalOrder(tasks: Task[]): string[] | null {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const indegree = new Map(tasks.map((t) => [t.id, 0]))
  const successors = new Map<string, string[]>()
  for (const t of tasks) {
    for (const dep of t.dependsOn) {
      if (!byId.has(dep)) continue
      if (!successors.has(dep)) successors.set(dep, [])
      successors.get(dep)!.push(t.id)
      indegree.set(t.id, (indegree.get(t.id) ?? 0) + 1)
    }
  }
  const queue = tasks.filter((t) => (indegree.get(t.id) ?? 0) === 0).map((t) => t.id)
  const order: string[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    order.push(id)
    for (const succ of successors.get(id) ?? []) {
      const next = (indegree.get(succ) ?? 1) - 1
      indegree.set(succ, next)
      if (next === 0) queue.push(succ)
    }
  }
  return order.length === tasks.length ? order : null
}

/**
 * Critical Path Method: forward pass (earliest start/finish) then backward pass
 * (latest start/finish), producing total float and the critical path. Returns
 * null when the graph is cyclic.
 */
export function computeSchedule(tasks: Task[]): Schedule | null {
  const order = topologicalOrder(tasks)
  if (!order) return null
  const byId = new Map(tasks.map((t) => [t.id, t]))

  const es = new Map<string, number>()
  const ef = new Map<string, number>()
  for (const id of order) {
    const task = byId.get(id)!
    const start = task.dependsOn.length
      ? Math.max(...task.dependsOn.map((d) => ef.get(d) ?? 0))
      : 0
    es.set(id, start)
    ef.set(id, start + task.durationHours)
  }
  const projectDuration = order.length ? Math.max(...order.map((id) => ef.get(id) ?? 0)) : 0

  const successors = new Map<string, string[]>()
  for (const t of tasks) {
    for (const dep of t.dependsOn) {
      if (!successors.has(dep)) successors.set(dep, [])
      successors.get(dep)!.push(t.id)
    }
  }

  const ls = new Map<string, number>()
  const lf = new Map<string, number>()
  for (const id of [...order].reverse()) {
    const task = byId.get(id)!
    const succs = successors.get(id) ?? []
    const finish = succs.length
      ? Math.min(...succs.map((s) => ls.get(s) ?? projectDuration))
      : projectDuration
    lf.set(id, finish)
    ls.set(id, finish - task.durationHours)
  }

  const timing = new Map<string, TaskTiming>()
  for (const id of order) {
    const slack = (ls.get(id) ?? 0) - (es.get(id) ?? 0)
    timing.set(id, {
      es: es.get(id)!,
      earliestFinish: ef.get(id)!,
      latestStart: ls.get(id)!,
      lf: lf.get(id)!,
      slack,
      critical: slack <= 1e-9,
    })
  }

  return { order, timing, projectDuration }
}

/** Progress weighted by effort, so a long task counts more than a short one. */
export function computeProgress(tasks: Task[]): Progress {
  const totalDuration = tasks.reduce((a, t) => a + t.durationHours, 0)
  const doneDuration = tasks.filter((t) => t.done).reduce((a, t) => a + t.durationHours, 0)
  return {
    doneCount: tasks.filter((t) => t.done).length,
    totalCount: tasks.length,
    percent: totalDuration > 0 ? (doneDuration / totalDuration) * 100 : 0,
  }
}

/** Tasks whose dependencies are not all done yet. */
export function blockedTasks(tasks: Task[]): Task[] {
  const done = new Set(tasks.filter((t) => t.done).map((t) => t.id))
  return tasks.filter((t) => !t.done && t.dependsOn.some((d) => !done.has(d)))
}

/** Tasks that can start right now: not done and all dependencies done. */
export function readyTasks(tasks: Task[]): Task[] {
  const done = new Set(tasks.filter((t) => t.done).map((t) => t.id))
  return tasks.filter((t) => !t.done && t.dependsOn.every((d) => done.has(d)))
}
