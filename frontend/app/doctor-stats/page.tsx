'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, Calendar, FileText, ClipboardList, ArrowLeft, LogOut, TrendingUp, Activity, BarChart3, PieChart } from 'lucide-react'

export default function DoctorStatsPage() {
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
    localStorage.removeItem('token')
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
            <Link href="/doctor-dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Statistiques Médecin</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/doctor-dashboard" className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
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
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Statistiques Détaillées
          </h2>
          <p className="text-gray-300">Analyse complète de votre activité médicale</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Patients Aujourd'hui</h3>
                <p className="text-sm text-gray-400">Rendez-vous confirmés</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.patientsToday}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rendez-vous Semaine</h3>
                <p className="text-sm text-gray-400">Cette semaine</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.appointmentsThisWeek}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dossiers Médicaux</h3>
                <p className="text-sm text-gray-400">Ce mois</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.medicalRecordsThisMonth}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Prescriptions</h3>
                <p className="text-sm text-gray-400">Aujourd'hui</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.prescriptionsToday}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Patients Totaux</h3>
                <p className="text-sm text-gray-400">Patients uniques</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.totalUniquePatients}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">En Attente</h3>
                <p className="text-sm text-gray-400">À confirmer</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.pendingAppointments}
            </p>
          </div>
        </div>

        {/* Chart Section - Activity Week */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Activité de la Semaine
          </h3>
          
          <div className="flex items-end justify-around gap-4 h-64">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
              // Simulation de données - en production, ces données viendraient de l'API
              const appointments = [3, 5, 2, 4, 6, 1, 3][index];
              const maxAppointments = 6;
              const heightPercent = (appointments / maxAppointments) * 100;
              
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className="flex items-end" style={{ height: '180px' }}>
                    <div 
                      className="bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-300 hover:scale-110 cursor-pointer" 
                      style={{ 
                        width: '50px', 
                        height: `${heightPercent}%`,
                        minHeight: '30px'
                      }}
                      title={`${appointments} rendez-vous`}
                    />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{day}</p>
                  <p className="text-lg font-bold text-white">{appointments}</p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-gradient-to-t from-cyan-500 to-blue-500 rounded"></div>
              <span>Nombre de rendez-vous par jour</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance Mensuelle
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm text-gray-400">Taux de consultation</p>
                  <p className="text-2xl font-bold text-white">{loading ? '...' : Math.round((stats.medicalRecordsThisMonth / stats.appointmentsThisWeek) * 100)}%</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm text-gray-400">Prescriptions / Dossier</p>
                  <p className="text-2xl font-bold text-white">{loading ? '...' : (stats.medicalRecordsThisMonth > 0 ? (stats.prescriptionsToday / stats.medicalRecordsThisMonth * 30).toFixed(1) : 0)}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm text-gray-400">Moyenne par semaine</p>
                  <p className="text-2xl font-bold text-white">{loading ? '...' : Math.round(stats.medicalRecordsThisMonth / (new Date().getDate() / 7))}</p>
                </div>
                <Calendar className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Répartition des Rendez-vous
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Confirmés</span>
                  <span className="text-sm font-bold text-white">{loading ? '...' : stats.patientsToday}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full" style={{ width: `${loading ? 0 : (stats.patientsToday / stats.appointmentsThisWeek) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">En attente</span>
                  <span className="text-sm font-bold text-white">{loading ? '...' : stats.pendingAppointments}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" style={{ width: `${loading ? 0 : (stats.pendingAppointments / stats.appointmentsThisWeek) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Cette semaine</span>
                  <span className="text-sm font-bold text-white">{loading ? '...' : stats.appointmentsThisWeek}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
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
