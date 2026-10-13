'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, Calendar, FileText, ClipboardList, ArrowLeft, LogOut, TrendingUp, Activity, BarChart3, PieChart, Clock, CheckCircle, AlertCircle, User, Briefcase, Target, Building, UserCheck, FileBarChart } from 'lucide-react'

export default function HRStatsPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    // Statistiques des candidatures
    totalApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    submittedApplications: 0,
    applicationsThisWeek: 0,
    applicationsThisMonth: 0,

    // Statistiques des entretiens
    totalInterviews: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    cancelledInterviews: 0,

    // Statistiques des offres d'emploi
    totalJobOffers: 0,
    activeJobOffers: 0,
    inactiveJobOffers: 0,

    // Statistiques des analyses CV
    totalCvAnalyses: 0,
    excellentCvAnalyses: 0,
    goodCvAnalyses: 0,
    needsImprovementCvAnalyses: 0,

    // Taux et métriques
    successRate: 0,
    interviewConversionRate: 0,

    // Statistiques des utilisateurs
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalCandidates: 0,
    totalHR: 0,

    // Statistiques médicales
    totalAppointments: 0,
    completedAppointments: 0,
    scheduledAppointments: 0,
    cancelledAppointments: 0
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
      
      if (userRoles.includes('hrRecruiter') || userRoles.includes('admin')) {
        setUser(parsed)
        fetchHRStats()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchHRStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/hr/stats/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Erreur lors de la récupération des statistiques')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/hr-dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Retour</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Statistiques RH</h1>
                <p className="text-gray-300">Vue d'ensemble des recrutements et plateforme</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{user?.email}</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Candidatures Totales */}
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Candidatures Totales</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.totalApplications}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              +{stats.applicationsThisWeek} cette semaine
            </p>
          </div>

          {/* Taux de Réussite */}
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Taux de Réussite</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {loading ? '...' : `${stats.successRate}%`}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {stats.acceptedApplications} acceptations
            </p>
          </div>

          {/* Entretiens Planifiés */}
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Entretiens Planifiés</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.scheduledInterviews}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {stats.totalInterviews} au total
            </p>
          </div>

          {/* Offres d'Emploi Actives */}
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Offres Actives</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.activeJobOffers}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              sur {stats.totalJobOffers} totales
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Candidatures par Statut */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Candidatures par Statut
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Acceptées</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{stats.acceptedApplications}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">En cours</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.pendingApplications}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Soumises</span>
                </div>
                <span className="text-2xl font-bold text-blue-400">{stats.submittedApplications}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium">Refusées</span>
                </div>
                <span className="text-2xl font-bold text-red-400">{stats.rejectedApplications}</span>
              </div>
            </div>
          </div>

          {/* Analyses CV */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Analyses CV par Score
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white font-medium">Excellent (80-100%)</span>
                </div>
                <span className="text-2xl font-bold text-green-400">{stats.excellentCvAnalyses}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-white font-medium">Bon (60-79%)</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.goodCvAnalyses}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-white font-medium">À améliorer (&lt;60%)</span>
                </div>
                <span className="text-2xl font-bold text-red-400">{stats.needsImprovementCvAnalyses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            Vue d'ensemble de la Plateforme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
              <p className="text-sm text-gray-300">Utilisateurs</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <User className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{stats.totalDoctors}</p>
              <p className="text-sm text-gray-300">Médecins</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
              <Heart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{stats.totalPatients}</p>
              <p className="text-sm text-gray-300">Patients</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
              <UserCheck className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">{stats.totalCandidates}</p>
              <p className="text-sm text-gray-300">Candidats</p>
            </div>
          </div>
        </div>

        {/* Medical Stats */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Activité Médicale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
              <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-cyan-400">{stats.totalAppointments}</p>
              <p className="text-sm text-gray-300">Rendez-vous</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{stats.completedAppointments}</p>
              <p className="text-sm text-gray-300">Terminés</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{stats.scheduledAppointments}</p>
              <p className="text-sm text-gray-300">Planifiés</p>
            </div>
          </div>
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
    </div>
  )
}