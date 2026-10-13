'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoleGuardProps {
  allowed: string[]
  children: React.ReactNode
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.replace('/login')
          return
        }

        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
          return
        }

        const user = await res.json()
        
        // Vérifier le rôle unique OU les rôles multiples
        const userRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0 
          ? user.roles 
          : [user.role];
        
        const hasAccess = allowed.length === 0 || userRoles.some((r: string) => allowed.includes(r));
        
        if (!hasAccess) {
          // Rôle non autorisé -> redirection page de login
          router.replace('/login')
          return
        }
      } catch (e) {
        router.replace('/login')
        return
      } finally {
        setChecking(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return <>{children}</>
}
