import type { Task } from '../types'

/** A ready-made short-documentary production plan. */
export const DEMO_TOPIC = '城市里的独立书店：一家开了二十年的旧书店'

export const DEMO_TASKS: Task[] = [
  { id: 't1', title: '选题调研与资料收集', stage: 'ideation', durationHours: 4, dependsOn: [], assignee: '编导', done: true },
  { id: 't2', title: '确定选题方向与采访对象', stage: 'ideation', durationHours: 2, dependsOn: ['t1'], assignee: '编导', done: true },
  { id: 't3', title: '撰写脚本大纲', stage: 'script', durationHours: 6, dependsOn: ['t2'], assignee: '编导', done: true },
  { id: 't4', title: '脚本定稿', stage: 'script', durationHours: 3, dependsOn: ['t3'], assignee: '编导', done: false },
  { id: 't5', title: '绘制分镜脚本', stage: 'storyboard', durationHours: 5, dependsOn: ['t4'], assignee: '摄影', done: false },
  { id: 't6', title: '勘景与器材准备', stage: 'shooting', durationHours: 3, dependsOn: ['t5'], assignee: '摄影', done: false },
  { id: 't7', title: '拍摄店主采访', stage: 'shooting', durationHours: 8, dependsOn: ['t6'], assignee: '摄影', done: false },
  { id: 't8', title: '拍摄书店空镜', stage: 'shooting', durationHours: 4, dependsOn: ['t6'], assignee: '摄影', done: false },
  { id: 't9', title: '粗剪（选素材、搭结构）', stage: 'editing', durationHours: 8, dependsOn: ['t7', 't8'], assignee: '剪辑', done: false },
  { id: 't10', title: '精剪（节奏、转场）', stage: 'editing', durationHours: 6, dependsOn: ['t9'], assignee: '剪辑', done: false },
  { id: 't11', title: '调色', stage: 'post', durationHours: 4, dependsOn: ['t10'], assignee: '剪辑', done: false },
  { id: 't12', title: '字幕与包装', stage: 'post', durationHours: 3, dependsOn: ['t10'], assignee: '剪辑', done: false },
  { id: 't13', title: '导出母版并审核', stage: 'post', durationHours: 1, dependsOn: ['t11', 't12'], assignee: '编导', done: false },
  { id: 't14', title: '发布上线', stage: 'publish', durationHours: 2, dependsOn: ['t13'], assignee: '运营', done: false },
]

/** Canned "AI" task plan used when no API key is configured. */
export const DEMO_GENERATED_TASKS: Task[] = [
  { id: 'g1', title: '选题调研', stage: 'ideation', durationHours: 4, dependsOn: [], assignee: '', done: false },
  { id: 'g2', title: '撰写脚本', stage: 'script', durationHours: 6, dependsOn: ['g1'], assignee: '', done: false },
  { id: 'g3', title: '绘制分镜', stage: 'storyboard', durationHours: 5, dependsOn: ['g2'], assignee: '', done: false },
  { id: 'g4', title: '现场拍摄', stage: 'shooting', durationHours: 12, dependsOn: ['g3'], assignee: '', done: false },
  { id: 'g5', title: '剪辑', stage: 'editing', durationHours: 10, dependsOn: ['g4'], assignee: '', done: false },
  { id: 'g6', title: '调色与字幕', stage: 'post', durationHours: 6, dependsOn: ['g5'], assignee: '', done: false },
  { id: 'g7', title: '发布', stage: 'publish', durationHours: 2, dependsOn: ['g6'], assignee: '', done: false },
]
