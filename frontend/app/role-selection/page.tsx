'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Shield, Stethoscope, User, Briefcase, UserCheck, ArrowRight } from 'lucide-react'

export default function RoleSelection() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      router.push('/login')
      return
    }

    const parsed = JSON.parse(userData)
    
    // Si l'utilisateur n'a qu'un seul rôle, rediriger directement
    if (!parsed.roles || parsed.roles.length <= 1) {
      redirectToRoleDashboard(parsed.role)
      return
    }

    setUser(parsed)
  }, [router])

  const redirectToRoleDashboard = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/dashboard')
        break
      case 'doctor':
        router.push('/doctor-dashboard')
        break
      case 'patient':
        router.push('/patient-dashboard')
        break
      case 'hrRecruiter':
        router.push('/hr-dashboard')
        break
      case 'candidate':
        router.push('/candidate-dashboard')
        break
      default:
        router.push('/dashboard')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield
      case 'doctor':
        return Stethoscope
      case 'patient':
        return User
      case 'hrRecruiter':
        return Briefcase
      case 'candidate':
        return UserCheck
      default:
        return User
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur'
      case 'doctor':
        return 'Médecin'
      case 'patient':
        return 'Patient'
      case 'hrRecruiter':
        return 'RH Recruteur'
      case 'candidate':
        return 'Candidat'
      default:
        return role
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Gérer les utilisateurs et le système'
      case 'doctor':
        return 'Consulter et gérer les patients'
      case 'patient':
        return 'Voir mes rendez-vous et dossiers'
      case 'hrRecruiter':
        return 'Gérer les recrutements'
      case 'candidate':
        return 'Voir mes candidatures'
      default:
        return ''
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-400 to-pink-500'
      case 'doctor':
        return 'from-green-400 to-emerald-500'
      case 'patient':
        return 'from-cyan-400 to-blue-500'
      case 'hrRecruiter':
        return 'from-orange-400 to-red-500'
      case 'candidate':
        return 'from-yellow-400 to-amber-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-3 rounded-2xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MediFlow AI
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenue, {user.firstName || user.email}
          </h2>
          <p className="text-gray-300 text-lg">
            Vous avez plusieurs rôles. Choisissez celui que vous souhaitez utiliser :
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {user.roles.map((role: string) => {
            const Icon = getRoleIcon(role)
            return (
              <button
                key={role}
                onClick={() => redirectToRoleDashboard(role)}
                className="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getRoleColor(role)} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${getRoleColor(role)} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {getRoleLabel(role)}
                  </h3>
                  
                  <p className="text-gray-300 mb-6">
                    {getRoleDescription(role)}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold">
                    <span>Accéder</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            💡 Vous pouvez changer de rôle à tout moment depuis votre profil
          </p>
        </div>
      </div>
    </div>
  )
}
