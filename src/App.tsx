import { Header } from './components/Header'
import { Board } from './components/Board'
import { SidePanel } from './components/SidePanel'

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-paper-50 text-ink-600">
      <Header />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-hidden">
          <Board />
        </main>
        <aside className="w-[22rem] shrink-0 border-l border-ink-200">
          <SidePanel />
        </aside>
      </div>
    </div>
  )
}
