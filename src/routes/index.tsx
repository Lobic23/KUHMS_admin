import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '@/components/LoginForm'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}

