import { useMemo } from 'react'
import { useFlowStore } from '../store/flowStore'
import { computeSchedule, computeProgress, blockedTasks, readyTasks } from '../engine/cpm'

/**
 * Derives scheduling state (critical path, progress, blocked/ready tasks) from
 * the task graph. Shared by the board (for badges) and the side panel (report).
 */
export function useFlowComputed() {
  const tasks = useFlowStore((s) => s.tasks)
  return useMemo(() => {
    const schedule = computeSchedule(tasks)
    const progress = computeProgress(tasks)
    const blocked = blockedTasks(tasks)
    const ready = readyTasks(tasks)
    const criticalIds = new Set<string>()
    if (schedule) {
      for (const [id, timing] of schedule.timing) {
        if (timing.critical) criticalIds.add(id)
      }
    }
    return { schedule, progress, blocked, ready, criticalIds }
  }, [tasks])
}
