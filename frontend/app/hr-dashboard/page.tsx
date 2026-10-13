'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, FileSearch, Calendar, UserCheck, ArrowRight, LogOut, Bell, Briefcase, TrendingUp, Activity, Star, Award, Clock, CheckCircle2, BarChart3, Zap } from 'lucide-react'
import { NotificationDropdown } from '../../components/NotificationDropdown'

export default function HRDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalApplications: 0,
    analyzedCVs: 0,
    scheduledInterviews: 0,
    hires: 0,
    weeklyGrowth: 0
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
      
      if (userRoles.includes('hrRecruiter')) {
        setUser(parsed)
        fetchStats() // Récupérer les statistiques après avoir défini l'utilisateur
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Récupérer toutes les candidatures
      const applicationsResponse = await fetch('http://localhost:5000/api/job-applications/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (applicationsResponse.ok) {
        const applications = await applicationsResponse.json()

        // Calculer les statistiques
        const totalApplications = applications.length
        const hires = applications.filter((app: any) => app.status === 'accepté').length

        // Récupérer les entretiens réels depuis la table interviews
        let scheduledInterviews = 0
        try {
          const interviewsResponse = await fetch('http://localhost:5000/api/interviews', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (interviewsResponse.ok) {
            const interviewsData = await interviewsResponse.json()
            console.log('📅 Entretiens récupérés:', interviewsData)
            // Compter tous les entretiens planifiés (peu importe le statut de réponse)
            scheduledInterviews = interviewsData.data ? interviewsData.data.length : 0
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des entretiens:', err)
        }

        // Récupérer les analyses pour compter les CV analysés
        const analysesResponse = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let analyzedCVs = 0
        if (analysesResponse.ok) {
          const analyses = await analysesResponse.json()
          analyzedCVs = analyses.data ? analyses.data.length : 0
        }

        // Calculer la croissance hebdomadaire (simplifié - candidatures de cette semaine)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weeklyApplications = applications.filter((app: any) =>
          new Date(app.createdAt) > oneWeekAgo
        ).length

        setStats({
          totalApplications,
          analyzedCVs,
          scheduledInterviews,
          hires,
          weeklyGrowth: weeklyApplications
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
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
                <p className="text-xs text-gray-300">Recrutement RH</p>
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
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Recrutement Intelligent
            </h2>
          </div>
          <p className="text-lg text-gray-300 ml-14">Trouvez les meilleurs talents avec l'IA • Dashboard RH</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">+{stats.weeklyGrowth}</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Candidatures</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.totalApplications}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{width: '75%'}}></div>
              </div>
              <span className="text-xs text-gray-400">75%</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg">
                <FileSearch className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">IA</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">CV Analysés</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.analyzedCVs}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" style={{width: `${stats.totalApplications > 0 ? (stats.analyzedCVs / stats.totalApplications * 100) : 0}%`}}></div>
              </div>
              <span className="text-xs text-gray-400">{stats.totalApplications > 0 ? Math.round(stats.analyzedCVs / stats.totalApplications * 100) : 0}%</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <Clock className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Entretiens</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.scheduledInterviews}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{width: '60%'}}></div>
              </div>
              <span className="text-xs text-gray-400">À venir</span>
            </div>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <Award className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Embauches</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              {loading ? '...' : stats.hires}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{width: '45%'}}></div>
              </div>
              <span className="text-xs text-gray-400">Ce mois</span>
            </div>
          </div>
        </div>

        {/* Actions and Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Actions Rapides
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <span className="text-xs font-semibold text-cyan-300">7 Actions</span>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                href="/recruitment"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-cyan-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Gérer Candidatures</span>
                    <span className="text-cyan-300/70 text-sm">Voir et gérer toutes les candidatures</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/candidate-ranking"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl hover:from-yellow-500/30 hover:to-orange-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-yellow-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Classement IA Candidats</span>
                    <span className="text-yellow-300/70 text-sm">Voir le classement par l'IA</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/job-offers"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl hover:from-amber-500/30 hover:to-orange-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Offres d&apos;emploi</span>
                    <span className="text-amber-300/70 text-sm">Consulter les offres actives</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/job-offers/new"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl hover:from-emerald-500/30 hover:to-green-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/40 to-green-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Créer une offre</span>
                    <span className="text-emerald-300/70 text-sm">Publier une nouvelle offre</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/candidates"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-emerald-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-green-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Base Candidats</span>
                    <span className="text-green-300/70 text-sm">Tous les profils disponibles</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/cv-analysis"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl hover:from-blue-500/30 hover:to-cyan-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Analyse IA</span>
                    <span className="text-blue-300/70 text-sm">Analyser les CV avec l'IA</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/hr-stats"
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-purple-200" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-base block">Statistiques Détaillées</span>
                    <span className="text-purple-300/70 text-sm">Tableaux de bord complets</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Candidats Récents
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <span className="text-xs font-semibold text-purple-300">Top 4</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Marie Dupont', role: 'Infirmière', score: 85, status: 'Recommandé', statusColor: 'green', bgColor: 'cyan' },
                { name: 'Jean Martin', role: 'Médecin', score: 92, status: 'Recommandé', statusColor: 'green', bgColor: 'green' },
                { name: 'Sophie Leroy', role: 'Administratif', score: 78, status: 'À considérer', statusColor: 'yellow', bgColor: 'purple' },
                { name: 'Pierre Bernard', role: 'Technicien', score: 88, status: 'Recommandé', statusColor: 'green', bgColor: 'orange' }
              ].map((candidate, i) => (
                <div key={i} className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base text-white font-semibold truncate">{candidate.name}</p>
                      {candidate.score >= 85 && (
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{candidate.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      candidate.statusColor === 'green' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {candidate.status}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-bold text-white">{candidate.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/candidates"
              className="mt-6 flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group"
            >
              <span className="font-medium">Voir tous les candidats</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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