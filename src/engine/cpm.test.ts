import { describe, expect, it } from 'vitest'
import { computeSchedule, topologicalOrder, computeProgress, blockedTasks, readyTasks } from './cpm'
import type { Task } from '../types'

function task(partial: Partial<Task> & { id: string }): Task {
  return { title: partial.id, stage: 'ideation', durationHours: 1, dependsOn: [], assignee: '', done: false, ...partial }
}

// Classic CPM example:
//   A(5) -> B(3) -> D(2)   => path A-B-D = 10h
//   A(5) -> C(4) -> D(2)   => path A-C-D = 11h  (critical)
describe('topologicalOrder', () => {
  it('orders by dependency', () => {
    const tasks = [
      task({ id: 'D', dependsOn: ['B', 'C'] }),
      task({ id: 'B', dependsOn: ['A'] }),
      task({ id: 'C', dependsOn: ['A'] }),
      task({ id: 'A' }),
    ]
    const order = topologicalOrder(tasks)
    expect(order).not.toBeNull()
    const pos = (id: string) => order!.indexOf(id)
    expect(pos('A')).toBeLessThan(pos('B'))
    expect(pos('A')).toBeLessThan(pos('C'))
    expect(pos('B')).toBeLessThan(pos('D'))
    expect(pos('C')).toBeLessThan(pos('D'))
  })
  it('returns null on a cycle', () => {
    const tasks = [task({ id: 'A', dependsOn: ['B'] }), task({ id: 'B', dependsOn: ['A'] })]
    expect(topologicalOrder(tasks)).toBeNull()
  })
})

describe('computeSchedule', () => {
  it('computes the critical path and project duration', () => {
    const tasks = [
      task({ id: 'A', durationHours: 5 }),
      task({ id: 'B', durationHours: 3, dependsOn: ['A'] }),
      task({ id: 'C', durationHours: 4, dependsOn: ['A'] }),
      task({ id: 'D', durationHours: 2, dependsOn: ['B', 'C'] }),
    ]
    const schedule = computeSchedule(tasks)!
    expect(schedule.projectDuration).toBe(11)

    const t = (id: string) => schedule.timing.get(id)!
    // Critical path is A-C-D (slack 0); B has 1h of float.
    expect(t('A').critical).toBe(true)
    expect(t('C').critical).toBe(true)
    expect(t('D').critical).toBe(true)
    expect(t('B').critical).toBe(false)
    expect(t('B').slack).toBeCloseTo(1)
  })
  it('returns null on a cycle', () => {
    const tasks = [task({ id: 'A', dependsOn: ['B'] }), task({ id: 'B', dependsOn: ['A'] })]
    expect(computeSchedule(tasks)).toBeNull()
  })
})

describe('computeProgress', () => {
  it('weights progress by duration', () => {
    const tasks = [
      task({ id: 'A', durationHours: 9, done: true }),
      task({ id: 'B', durationHours: 1, done: false }),
    ]
    expect(computeProgress(tasks).percent).toBeCloseTo(90)
  })
  it('handles empty task list', () => {
    expect(computeProgress([]).percent).toBe(0)
  })
})

describe('blockedTasks / readyTasks', () => {
  it('classifies by dependency completion', () => {
    const tasks = [
      task({ id: 'A', done: true }),
      task({ id: 'B', dependsOn: ['A'] }),
      task({ id: 'C', dependsOn: ['B'] }),
    ]
    expect(readyTasks(tasks).map((t) => t.id)).toEqual(['B'])
    expect(blockedTasks(tasks).map((t) => t.id)).toEqual(['C'])
  })
})
