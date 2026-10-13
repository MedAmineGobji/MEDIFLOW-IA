'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, Calendar, FileText, ClipboardList, ArrowLeft, LogOut, TrendingUp, Activity, BarChart3, PieChart, Clock, CheckCircle, AlertCircle, User, Briefcase, Target } from 'lucide-react'

export default function CandidateStatsPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    totalInterviews: 0,
    pastInterviews: 0,
    upcomingInterviews: 0,
    uniqueJobOffers: 0,
    nextInterview: null,
    successRate: 0
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
      
      if (userRoles.includes('candidate')) {
        setUser(parsed)
        fetchCandidateStats()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchCandidateStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/candidates/stats/dashboard', {
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
            <Link href="/candidate-dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Statistiques Candidat</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/candidate-dashboard" className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">Candidat {user.email}</span>
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
          <p className="text-gray-300">Analyse complète de votre parcours de recrutement</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Candidatures Totales</h3>
                <p className="text-sm text-gray-400">Postulations envoyées</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.totalApplications}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Candidatures Acceptées</h3>
                <p className="text-sm text-gray-400">Réussies</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.acceptedApplications}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Candidatures Rejetées</h3>
                <p className="text-sm text-gray-400">Non retenues</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.rejectedApplications}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Candidatures en Attente</h3>
                <p className="text-sm text-gray-400">En cours d'examen</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.pendingApplications}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Entretiens Totaux</h3>
                <p className="text-sm text-gray-400">RDV passés et à venir</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.totalInterviews}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Taux de Réussite</h3>
                <p className="text-sm text-gray-400">Candidatures acceptées</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {loading ? '...' : `${stats.successRate}%`}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Offres Postulées</h3>
                <p className="text-sm text-gray-400">Postes différents</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.uniqueJobOffers}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Entretiens à Venir</h3>
                <p className="text-sm text-gray-400">Prochains RDV</p>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.upcomingInterviews}
            </p>
          </div>
        </div>

        {/* Next Interview Section */}
        {stats.nextInterview && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Prochain Entretien</h3>
                <p className="text-gray-400">Votre prochaine étape de recrutement</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-white mb-2">
                    {stats.nextInterview.jobTitle}
                  </p>
                  <p className="text-lg text-cyan-300 mb-2">
                    {stats.nextInterview.company}
                  </p>
                  <p className="text-base text-white mb-2">
                    {new Date(stats.nextInterview.interviewDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-lg text-cyan-300">
                    {stats.nextInterview.interviewTime}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Statut: <span className={`font-semibold ${
                      stats.nextInterview.status === 'planifié' ? 'text-green-400' :
                      stats.nextInterview.status === 'confirmé' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {stats.nextInterview.status === 'planifié' ? 'Planifié' :
                       stats.nextInterview.status === 'confirmé' ? 'Confirmé' : stats.nextInterview.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Type d'entretien</p>
                  <p className="text-white">Entretien RH</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Résumé d'Activité</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white font-medium">Taux de réponse</span>
                <span className="text-cyan-400 font-bold">
                  {stats.totalApplications > 0 ? Math.round(((stats.acceptedApplications + stats.rejectedApplications) / stats.totalApplications) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white font-medium">Entretiens obtenus</span>
                <span className="text-purple-400 font-bold">
                  {stats.totalApplications > 0 ? Math.round((stats.totalInterviews / stats.totalApplications) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white font-medium">Diversité des postes</span>
                <span className="text-green-400 font-bold">{stats.uniqueJobOffers} postes</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">État des Candidatures</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Acceptées</span>
                </div>
                <span className="text-green-400 font-bold">{stats.acceptedApplications}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">En attente</span>
                </div>
                <span className="text-orange-400 font-bold">{stats.pendingApplications}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium">Rejetées</span>
                </div>
                <span className="text-red-400 font-bold">{stats.rejectedApplications}</span>
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