# VideoFlow AI

A video-production pipeline planner. Break a topic into tasks across the
选题 → 脚本 → 分镜 → 拍摄 → 剪辑 → 调色/字幕 → 发布 workflow, wire up
dependencies, and the app schedules the project with the Critical Path Method —
showing the project length, which tasks are on the critical path, and which are
blocked or ready to start.

## Features

- **Kanban board** — seven production stages as columns; add tasks, edit titles
  inline, mark done, move tasks between stages.
- **Dependencies** — every task can depend on others; the graph drives the schedule.
- **Critical Path Method** — forward/backward pass computes earliest/latest
  start, float, and the critical path. The 排程 tab shows project length,
  critical path, ready tasks and blocked tasks.
- **Progress weighted by effort** — a 10-hour task moves the bar more than a
  1-hour task.
- **AI task generation** — generate a full task plan from a topic via DeepSeek,
  with a canned-demo fallback so the app runs with no key.
- **Export** — download the plan as text (task list by stage + critical path).

## The self-developed core

The scheduling engine is pure TypeScript in [`src/engine/cpm.ts`](src/engine/cpm.ts),
fully unit-tested in [`src/engine/cpm.test.ts`](src/engine/cpm.test.ts):

| Function | Responsibility |
| --- | --- |
| `topologicalOrder` | Kahn's algorithm over the dependency graph (cycle detection). |
| `computeSchedule` | CPM forward/backward pass → earliest/latest start, float, critical path, project duration. |
| `computeProgress` | Completion percentage weighted by effort. |
| `blockedTasks` / `readyTasks` | Classify tasks by dependency completion. |

The AI layer ([`src/ai/generate.ts`](src/ai/generate.ts)) is isolated from the
engine — it only produces task suggestions, which then flow through the same
board and scheduler as hand-entered tasks.

## Tech

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · Zustand (persisted state) · Vitest

## AI setup

Paste a DeepSeek API key in the AI 助手 tab to enable live generation. The browser
calls the serverless proxy at [`api/generate.ts`](api/generate.ts) (deployed on
Vercel). Without a key the app uses the demo path. You can also set a
`DEEPSEEK_API_KEY` environment variable on the deployment.

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run build    # type-check + production build
```
