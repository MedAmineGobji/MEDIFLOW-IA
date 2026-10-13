'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Users, FileSearch, Calendar, UserCheck, ArrowLeft, LogOut, TrendingUp, BarChart3, PieChart, Activity, Award, Clock, CheckCircle2, XCircle, Download, Filter } from 'lucide-react'

interface Stats {
  totalApplications: number
  analyzedCVs: number
  scheduledInterviews: number
  hires: number
  rejections: number
  pending: number
  averageMatchScore: number
  interviewAcceptanceRate: number
  weeklyApplications: number[]
  applicationsByStatus: {
    status: string
    count: number
    percentage: number
  }[]
  topCandidates: {
    name: string
    email: string
    position: string
    score: number
    status: string
  }[]
}

export default function HRReports() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    analyzedCVs: 0,
    scheduledInterviews: 0,
    hires: 0,
    rejections: 0,
    pending: 0,
    averageMatchScore: 0,
    interviewAcceptanceRate: 0,
    weeklyApplications: [],
    applicationsByStatus: [],
    topCandidates: []
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
        fetchDetailedStats()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchDetailedStats = async () => {
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

        // Statistiques de base
        const totalApplications = applications.length
        const hires = applications.filter((app: any) => 
          app.status?.toLowerCase().includes('accept') || 
          app.status?.toLowerCase().includes('embauché') ||
          app.status === 'accepté'
        ).length
        const rejections = applications.filter((app: any) => 
          app.status?.toLowerCase().includes('rejet') || 
          app.status?.toLowerCase().includes('refus') ||
          app.status === 'rejeté'
        ).length
        const pending = applications.filter((app: any) => 
          app.status?.toLowerCase().includes('attente') || 
          app.status?.toLowerCase().includes('cours') ||
          app.status?.toLowerCase().includes('pending') ||
          app.status === 'en attente' ||
          app.status === 'En Cours'
        ).length

        // Récupérer les entretiens réels
        let scheduledInterviews = 0
        let acceptedInterviews = 0
        try {
          const interviewsResponse = await fetch('http://localhost:5000/api/interviews', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (interviewsResponse.ok) {
            const interviewsData = await interviewsResponse.json()
            const interviewsList = interviewsData.data || []
            scheduledInterviews = interviewsList.length
            acceptedInterviews = interviewsList.filter((int: any) => int.candidateResponse === 'accepted').length
          }
        } catch (err) {
          console.error('Erreur entretiens:', err)
        }

        // Taux d'acceptation des entretiens
        const interviewAcceptanceRate = scheduledInterviews > 0 
          ? Math.round((acceptedInterviews / scheduledInterviews) * 100) 
          : 0

        // Récupérer les analyses CV avec détails complets
        const analysesResponse = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let analyzedCVs = 0
        let averageMatchScore = 0
        let topCandidates: any[] = []

        if (analysesResponse.ok) {
          const analyses = await analysesResponse.json()
          const analysesData = analyses.data || []
          analyzedCVs = analysesData.length

          if (analyzedCVs > 0) {
            const totalScore = analysesData.reduce((sum: number, analysis: any) => {
              return sum + (analysis.score || 0)
            }, 0)
            averageMatchScore = Math.round(totalScore / analyzedCVs)

            // Créer la liste des top candidats depuis les données déjà jointes
            topCandidates = analysesData
              .map((analysis: any) => {
                const candidateName = `${analysis.candidateFirstName || ''} ${analysis.candidateLastName || ''}`.trim() || 'N/A'
                
                return {
                  name: candidateName,
                  email: analysis.candidateEmail || 'N/A',
                  position: analysis.jobTitle || 'N/A',
                  score: analysis.score || 0,
                  status: analysis.score >= 80 ? 'Excellent' : analysis.score >= 60 ? 'Bon' : 'Moyen'
                }
              })
              .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
              .slice(0, 5)
          }
        }

        // Applications par semaine (dernières 4 semaines)
        const weeklyApplications = [0, 0, 0, 0]
        const now = new Date()
        applications.forEach((app: any) => {
          const appDate = new Date(app.createdAt)
          const weeksDiff = Math.floor((now.getTime() - appDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
          if (weeksDiff >= 0 && weeksDiff < 4) {
            weeklyApplications[3 - weeksDiff]++
          }
        })

        // Candidatures par statut
        const statusCounts: { [key: string]: number } = {}
        applications.forEach((app: any) => {
          const status = app.status || 'inconnu'
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number,
          percentage: Math.round((count as number / totalApplications) * 100)
        }))

        setStats({
          totalApplications,
          analyzedCVs,
          scheduledInterviews,
          hires,
          rejections,
          pending,
          averageMatchScore,
          interviewAcceptanceRate,
          weeklyApplications,
          applicationsByStatus,
          topCandidates
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
    localStorage.removeItem('token')
    router.push('/')
  }

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      user: user?.email
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-rh-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
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
            <Link href="/hr-dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Rapports RH</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
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
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/hr-dashboard"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au Dashboard</span>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Rapports RH
              </h2>
            </div>
            <p className="text-lg text-gray-300 ml-14">Analyses et statistiques détaillées du recrutement</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Candidatures</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.totalApplications}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Score Moyen IA</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {loading ? '...' : `${stats.averageMatchScore}%`}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Taux Acceptation</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {loading ? '...' : `${stats.interviewAcceptanceRate}%`}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Embauches</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {loading ? '...' : stats.hires}
            </p>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications par semaine */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Tendance Hebdomadaire</h3>
            </div>
            <div className="space-y-4">
              {['Il y a 3 semaines', 'Il y a 2 semaines', 'Semaine dernière', 'Cette semaine'].map((week, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{week}</span>
                    <span className="text-lg font-bold text-white">{stats.weeklyApplications[i] || 0}</span>
                  </div>
                  <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.weeklyApplications[i] || 0) * 10)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications par statut */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Répartition par Statut</h3>
            </div>
            <div className="space-y-4">
              {stats.applicationsByStatus.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.status === 'accepté' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {item.status === 'rejeté' && <XCircle className="w-4 h-4 text-red-400" />}
                      {item.status === 'en attente' && <Clock className="w-4 h-4 text-yellow-400" />}
                      <span className="text-sm text-gray-300 capitalize">{item.status}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{item.count}</span>
                  </div>
                  <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === 'accepté' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        item.status === 'rejeté' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                        'bg-gradient-to-r from-yellow-400 to-orange-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top candidats */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Top 5 Candidats</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Poste</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Score</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">Évaluation</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCandidates.length > 0 ? (
                  stats.topCandidates.map((candidate, i) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">{candidate.name}</td>
                      <td className="py-4 px-4 text-gray-300">{candidate.email}</td>
                      <td className="py-4 px-4 text-gray-300">{candidate.position}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {candidate.score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          candidate.status === 'Excellent' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          candidate.status === 'Bon' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Aucune analyse de CV disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métriques additionnelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Acceptés</h4>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.hires}</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.totalApplications > 0 ? Math.round((stats.hires / stats.totalApplications) * 100) : 0}% du total
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <h4 className="text-lg font-semibold text-white">En attente</h4>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.totalApplications > 0 ? Math.round((stats.pending / stats.totalApplications) * 100) : 0}% du total
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <h4 className="text-lg font-semibold text-white">Rejetés</h4>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.rejections}</p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.totalApplications > 0 ? Math.round((stats.rejections / stats.totalApplications) * 100) : 0}% du total
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
