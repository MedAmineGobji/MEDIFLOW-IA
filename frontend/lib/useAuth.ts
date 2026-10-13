import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }

  return { user, loading, logout }
}