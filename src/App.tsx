import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Spinner } from 'flowbite-react'
import AppRouter from './routes/AppRouter'
import { useAuthStore } from './stores/authStore'

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <BrowserRouter>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <Spinner size="xl" color="info" />
        </div>
      ) : (
        <AppRouter />
      )}
    </BrowserRouter>
  )
}

export default App
