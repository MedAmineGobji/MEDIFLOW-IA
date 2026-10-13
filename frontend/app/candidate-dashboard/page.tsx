'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, CheckCircle, TrendingUp, Briefcase, Mail, ArrowRight, LogOut, Bell, User, Target, FileText } from 'lucide-react'
import { NotificationDropdown } from '../../components/NotificationDropdown'

export default function CandidateDashboard() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [jobOffers, setJobOffers] = useState<any[]>([])
  const [cvAnalyses, setCvAnalyses] = useState<any[]>([])
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
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
        setProfileData({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phone: parsed.phone || ''
        })
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (user) {
      fetchUserApplications()
      fetchJobOffers()
      fetchCvAnalyses()
    }
  }, [user])

  const respondToInterview = async (interviewId: number, response: 'accepted' | 'declined') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response_api = await fetch(`http://localhost:5000/api/interviews/${interviewId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response })
      })

      if (response_api.ok) {
        alert(`Entretien ${response === 'accepted' ? 'accepté' : 'refusé'} avec succès`)
        // Recharger les entretiens
        fetchUserApplications()
      } else {
        const error = await response_api.json()
        alert('Erreur: ' + error.message)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réponse à l\'entretien')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const result = await response.json()
        // Mettre à jour localStorage
        const updatedUser = { ...user, ...result.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setShowEditProfile(false)
        alert('Profil mis à jour avec succès!')
      } else {
        const error = await response.json()
        alert('Erreur: ' + error.message)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  const fetchUserApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return

      console.log('🔍 Chargement des candidatures pour user:', user.id)
      
      const response = await fetch('http://localhost:5000/api/job-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📦 Toutes les candidatures:', result)
        
        // Filtrer les candidatures de l'utilisateur connecté
        const allApps = result.data || result || []
        const userApplications = allApps.filter((app: any) => app.candidateUserId === user.id)
        console.log('✅ Candidatures de l\'utilisateur:', userApplications)
        setApplications(userApplications)

        // Charger les entretiens pour chaque candidature
        const allInterviews: any[] = []
        for (const app of userApplications) {
          try {
            console.log('🔍 Chargement entretien pour application:', app.id)
            const interviewResponse = await fetch(`http://localhost:5000/api/interviews/application/${app.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            if (interviewResponse.ok) {
              const interviewResult = await interviewResponse.json()
              console.log('📅 Entretiens trouvés:', interviewResult.data)
              allInterviews.push(...(interviewResult.data || []))
            }
          } catch (error) {
            console.error('Erreur lors du chargement des entretiens:', error)
          }
        }
        console.log('✅ Tous les entretiens:', allInterviews)
        setInterviews(allInterviews)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error)
    }
  }

  const fetchJobOffers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔍 Chargement des offres d\'emploi')
      
      const response = await fetch('http://localhost:5000/api/job-offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('💼 Offres d\'emploi trouvées:', result.data?.length || 0)
        setJobOffers(result.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error)
    }
  }

  const fetchCvAnalyses = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return

      console.log('🔍 Chargement analyses CV pour user:', user.id)
      
      const response = await fetch(`http://localhost:5000/api/cv-analysis/candidate/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📄 Analyses CV trouvées:', result.data)
        setCvAnalyses(result.data || [])
      } else {
        console.log('❌ Erreur API analyses CV:', response.status)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analyses CV:', error)
    }
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
                <p className="text-xs text-gray-300">Espace Candidat</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{user.email}</span>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-xl text-blue-200 hover:bg-blue-500/30 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </button>
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
            Mon Espace Candidature
          </h2>
          <p className="text-gray-300">Suivez votre parcours professionnel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Statut Candidature</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {applications.length === 0 ? 'Aucune' :
               applications.filter(app => app.status === 'acceptée').length > 0 ? 'Acceptée' :
               applications.filter(app => app.status === 'en cours').length > 0 ? 'En cours' :
               applications.filter(app => app.status === 'soumise').length > 0 ? 'Soumise' : 'Refusée'}
            </p>
            <p className="text-xs text-gray-400 mt-2">{applications.length} candidature{applications.length > 1 ? 's' : ''}</p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Score IA</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {cvAnalyses.length > 0 && cvAnalyses[0].matchScore ? 
                `${cvAnalyses[0].matchScore}%` : 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {cvAnalyses.length > 0 && cvAnalyses[0].matchScore ? 
                (cvAnalyses[0].matchScore >= 80 ? 'Excellent profil' :
                 cvAnalyses[0].matchScore >= 60 ? 'Bon profil' : 'Profil à améliorer') :
                'Aucune analyse'}
            </p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Postes Disponibles</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{jobOffers.length}</p>
            <p className="text-xs text-gray-400 mt-2">Correspondances</p>
          </div>

          <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Messages RH</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{interviews.filter(i => i.candidateResponse === 'pending').length}</p>
            <p className="text-xs text-gray-400 mt-2">En attente de réponse</p>
          </div>
        </div>

        {/* Button to Stats */}
        <div className="mb-8">
          <Link
            href="/candidate-stats"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Voir Statistiques Détaillées</h3>
              <p className="text-sm text-cyan-100">Analyse complète de votre parcours</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* Candidatures et Entretiens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-400" />
              Mes Candidatures
            </h3>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune candidature en cours</p>
                  <Link
                    href="/job-offers"
                    className="inline-block mt-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                  >
                    Voir les offres
                  </Link>
                </div>
              ) : (
                applications.slice(0, 3).map((application) => {
                  // Trouver l'entretien correspondant à cette candidature
                  const applicationInterview = interviews.find(i => i.applicationId === application.id)
                  
                  return (
                  <div key={application.id} className="p-4 bg-black/30 rounded-xl border border-gray-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{application.jobOffer.title}</h4>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'soumise' ? 'bg-blue-500/20 text-blue-300' :
                          application.status === 'en cours' ? 'bg-yellow-500/20 text-yellow-300' :
                          application.status === 'acceptée' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {application.status === 'soumise' ? 'Soumise' :
                           application.status === 'en cours' ? 'En cours' :
                           application.status === 'acceptée' ? 'Acceptée' : 'Refusée'}
                        </span>
                        {applicationInterview && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/30 text-blue-200 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Entretien planifié
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{application.jobOffer.department} • {application.jobOffer.location}</p>
                    {applicationInterview && (
                      <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                        <span>📅</span>
                        Entretien le {new Date(applicationInterview.interviewDate).toLocaleDateString('fr-FR')} à {applicationInterview.interviewTime}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Candidature du {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Entretiens Planifiés
            </h3>
            <div className="space-y-3">
              {interviews.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun entretien planifié</p>
                  <p className="text-gray-500 text-sm">Les RH vous contacteront bientôt</p>
                </div>
              ) : (
                interviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="p-4 bg-black/30 rounded-xl border border-gray-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <div>
                          <h4 className="text-white font-medium">
                            {new Date(interview.interviewDate).toLocaleDateString('fr-FR')}
                          </h4>
                          <p className="text-sm text-gray-400">à {interview.interviewTime}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          interview.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          interview.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {interview.status === 'scheduled' ? 'Planifié' :
                           interview.status === 'completed' ? 'Terminé' :
                           interview.status === 'cancelled' ? 'Annulé' : interview.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.candidateResponse === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          interview.candidateResponse === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          interview.candidateResponse === 'declined' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {interview.candidateResponse === 'pending' ? 'En attente' :
                           interview.candidateResponse === 'accepted' ? 'Accepté' :
                           interview.candidateResponse === 'declined' ? 'Refusé' : interview.candidateResponse}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>Intervieweur:</strong> {interview.interviewer?.email || 'Non spécifié'}
                    </p>
                    {interview.notes && (
                      <p className="text-sm text-gray-400 mt-1">
                        <strong>Notes:</strong> {interview.notes}
                      </p>
                    )}
                    {interview.status === 'scheduled' && interview.candidateResponse === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => respondToInterview(interview.id, 'accepted')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => respondToInterview(interview.id, 'declined')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions and CV Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <Link
                href="/job-applications"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/30 rounded-xl">
                    <Briefcase className="w-5 h-5 text-cyan-300" />
                  </div>
                  <span className="text-white font-medium">Postuler à un Poste</span>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/my-applications"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/30 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <span className="text-white font-medium">Suivre Ma Candidature</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setShowEditProfile(true)}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/30 rounded-xl">
                    <User className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white font-medium">Modifier Mon Profil</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Analyse de Mon CV
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Compétences techniques', score: 90, color: 'cyan' },
                { label: 'Expérience pertinente', score: 85, color: 'green' },
                { label: 'Formation', score: 80, color: 'purple' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 text-${item.color}-400`} />
                      <span className="text-sm text-white font-medium">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold text-${item.color}-400`}>{item.score}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600`} style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                <p className="text-sm text-orange-200 font-medium">💡 Suggestion</p>
                <p className="text-xs text-gray-300 mt-1">Ajouter plus de détails sur vos projets récents</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modale de modification du profil */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Modifier mon profil</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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