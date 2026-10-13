'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, Calendar, FileText, ClipboardList, ArrowRight, LogOut, Bell, Stethoscope, TrendingUp, Activity } from 'lucide-react'
import { NotificationDropdown } from '../../components/NotificationDropdown'

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    patientsToday: 0,
    appointmentsThisWeek: 0,
    medicalRecordsThisMonth: 0,
    prescriptionsToday: 0,
    totalUniquePatients: 0,
    pendingAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      if (userRoles.includes('doctor')) {
        setUser(parsed)
        fetchDoctorStats()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchDoctorStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/doctors/stats/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
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
                <p className="text-xs text-gray-300">Espace Médecin</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">Dr. {user.email}</span>
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
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Consultations Médicales
            </h2>
          </div>
          <p className="text-lg text-gray-300 ml-14">Gérez vos patients efficacement • Dashboard Médecin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Patients Aujourd'hui</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.patientsToday}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{width: '80%'}}></div>
              </div>
              <span className="text-xs text-gray-400">Confirmés</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Rendez-vous</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.appointmentsThisWeek}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" style={{width: '65%'}}></div>
              </div>
              <span className="text-xs text-gray-400">Cette semaine</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <FileText className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Dossiers Consultés</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.medicalRecordsThisMonth}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{width: '70%'}}></div>
              </div>
              <span className="text-xs text-gray-400">Ce mois</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <ClipboardList className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Prescriptions</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.prescriptionsToday}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{width: '55%'}}></div>
              </div>
              <span className="text-xs text-gray-400">Aujourd'hui</span>
            </div>
          </div>
        </div>
        {/* Button to Stats */}
        <div className="mb-8">
          <Link
            href="/doctor-stats"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Voir Statistiques Détaillées</h3>
              <p className="text-sm text-cyan-100">Analyse complète de votre activité</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* Actions and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Actions Rapides
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <span className="text-xs font-semibold text-cyan-300">4 Actions</span>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                href="/appointments"
                className="group relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/30 hover:to-blue-500/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/30 rounded-xl backdrop-blur-sm">
                    <Calendar className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Voir Rendez-vous</span>
                    <span className="text-cyan-200 text-xs">Gérer votre planning</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/prescriptions"
                className="group relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/30 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Ordonnances Prescrites</span>
                    <span className="text-purple-200 text-xs">Consulter les prescriptions</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/medical-records"
                className="group relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-emerald-500/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/30 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Accéder Dossiers Médicaux</span>
                    <span className="text-green-200 text-xs">Historique des patients</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/patients"
                className="group relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl hover:from-orange-500/30 hover:to-red-500/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/30 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6 text-orange-300" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Gérer Patients</span>
                    <span className="text-orange-200 text-xs">Liste complète des patients</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Rendez-vous du Jour
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <span className="text-xs font-semibold text-purple-300">4 Patients</span>
              </div>
            </div>
            <div className="space-y-4">
              {['09:00 - M. Dupont (Consultation)', '10:30 - Mme. Martin (Suivi)', '14:00 - M. Leroy (Urgence)', '15:45 - Mme. Bernard (Contrôle)'].map((appt, i) => (
                <div key={i} className="group flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className={`p-3 ${i % 2 === 0 ? 'bg-cyan-500/20' : 'bg-purple-500/20'} rounded-lg`}>
                    <Calendar className={`w-5 h-5 ${i % 2 === 0 ? 'text-cyan-400' : 'text-purple-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold mb-1">{appt}</p>
                    <p className="text-xs text-gray-400">Salle {i + 1}</p>
                  </div>
                  <div className={`px-3 py-1 ${i % 2 === 0 ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-purple-500/20 border-purple-500/30'} border rounded-full`}>
                    <span className={`text-xs font-semibold ${i % 2 === 0 ? 'text-cyan-300' : 'text-purple-300'}`}>
                      {i === 2 ? 'Urgent' : 'Planifié'}
                    </span>
                  </div>
                </div>
              ))}
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