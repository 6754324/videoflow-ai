import { Header } from './components/Header'
import { Board } from './components/Board'
import { SidePanel } from './components/SidePanel'

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-ink-950 text-zinc-300">
      <Header />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-hidden">
          <Board />
        </main>
        <aside className="w-[22rem] shrink-0 border-l border-white/10">
          <SidePanel />
        </aside>
      </div>
    </div>
  )
}
