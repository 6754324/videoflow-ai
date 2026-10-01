/** Video production pipeline stage ids, in workflow order. */
export type StageId =
  | 'ideation'
  | 'script'
  | 'storyboard'
  | 'shooting'
  | 'editing'
  | 'post'
  | 'publish'

export interface Task {
  id: string
  title: string
  stage: StageId
  /** Estimated effort in hours (used for critical-path scheduling). */
  durationHours: number
  /** Ids of tasks that must finish before this one can start. */
  dependsOn: string[]
  assignee: string
  done: boolean
}
