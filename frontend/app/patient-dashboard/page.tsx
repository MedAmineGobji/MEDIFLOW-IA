'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Calendar, FileText, Pill, Mail, ArrowRight, LogOut, Settings, Bell, User, TrendingUp } from 'lucide-react'
import { NotificationDropdown } from '../../components/NotificationDropdown'

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const router = useRouter()

  // Fonction pour traduire les statuts
  const translateStatus = (status: string) => {
    switch (status) {
      case 'prévu':
        return 'Prévu'
      case 'terminé':
        return 'Terminé'
      case 'annulé':
        return 'Annulé'
      default:
        return 'Prévu'
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      if (userRoles.includes('patient')) {
        setUser(parsed)
        fetchUpcomingAppointments()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchUpcomingAppointments = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        // Filtrer les rendez-vous à venir (date >= aujourd'hui) et trier par date
        const now = new Date()
        const upcoming = Array.isArray(data) 
          ? data.filter((apt: any) => new Date(apt.appointmentDate) >= now)
               .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
               .slice(0, 3) // Afficher seulement les 3 prochains
          : []
        setUpcomingAppointments(upcoming)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Chargement...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Portail Patient</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Mon Espace Patient
          </h2>
          <p className="text-gray-300">Gérez votre santé en toute simplicité</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Prochains RDV</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{upcomingAppointments.length}</p>
            <p className="text-xs text-gray-400 mt-2">Cette semaine</p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Dossiers Médicaux</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">5</p>
            <p className="text-xs text-gray-400 mt-2">Consultations</p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Pill className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Prescriptions</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">3</p>
            <p className="text-xs text-gray-400 mt-2">Actives</p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Messages</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">1</p>
            <p className="text-xs text-gray-400 mt-2">Non lu</p>
          </div>
        </div>

        {/* Actions and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <Link
                href="/appointments"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/30 rounded-xl">
                    <Calendar className="w-5 h-5 text-cyan-300" />
                  </div>
                  <span className="text-white font-medium">Prendre Rendez-vous</span>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/prescriptions"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/30 rounded-xl">
                    <Pill className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white font-medium">Mes Ordonnances</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/medical-records"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/30 rounded-xl">
                    <FileText className="w-5 h-5 text-green-300" />
                  </div>
                  <span className="text-white font-medium">Mes Dossiers Médicaux</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/patient-stats"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/30 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-orange-300" />
                  </div>
                  <span className="text-white font-medium">Mes Statistiques</span>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Rendez-vous à Venir
            </h3>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Aucun rendez-vous à venir</p>
                  <Link
                    href="/appointments"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Prendre RDV
                  </Link>
                </div>
              ) : (
                upcomingAppointments.map((apt, index) => (
                  <div key={apt.id} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className={`p-2 rounded-lg ${index % 2 === 0 ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                      <Calendar className={`w-5 h-5 ${index % 2 === 0 ? 'text-cyan-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">
                        {new Date(apt.appointmentDate).toLocaleDateString('fr-FR')} - {new Date(apt.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dr. {apt.doctorFirstName} {apt.doctorLastName} - {apt.notes || 'Consultation'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}