'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, ArrowLeft, Eye, Download, Clock, CheckCircle, XCircle, AlertCircle, X, Calendar, User } from 'lucide-react'

interface JobApplication {
  id: number
  jobOfferId: number
  candidateUserId: number
  cvUrl: string
  coverLetter: string
  status: string
  createdAt: string
  updatedAt: string
  jobOffer: {
    title: string
    department: string
    location: string
  }
}

interface Interview {
  id: number
  applicationId: number
  interviewerId: number
  interviewDate: string
  interviewTime: string
  status: string
  candidateResponse: string
  notes: string
  interviewer: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [allInterviews, setAllInterviews] = useState<Record<number, Interview[]>>({})
  const [loadingInterviews, setLoadingInterviews] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Non authentifié')
        return
      }

      const response = await fetch('http://localhost:5000/api/job-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
        
        // Charger les entretiens pour chaque candidature
        for (const app of data) {
          fetchInterviewsForApplication(app.id)
        }
      } else {
        setError('Erreur lors du chargement de vos candidatures')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const fetchInterviewsForApplication = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔍 Chargement entretiens pour candidature:', applicationId)
      const response = await fetch(`http://localhost:5000/api/interviews/application/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📥 Réponse API:', response.status, response.ok)
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Entretiens reçus pour candidature', applicationId, ':', result.data)
        setAllInterviews(prev => {
          const updated = {
            ...prev,
            [applicationId]: result.data || []
          }
          console.log('📦 AllInterviews mis à jour:', updated)
          return updated
        })
      } else {
        console.error('❌ Erreur API:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entretiens:', error)
    }
  }

  const handleViewDetails = (app: JobApplication) => {
    setSelectedApplication(app)
    setInterviews(allInterviews[app.id] || [])
  }

  const closeModal = () => {
    setSelectedApplication(null)
    setInterviews([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acceptée':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'refusée':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'en cours':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'soumise':
        return 'Soumise'
      case 'en cours':
        return 'En cours de traitement'
      case 'acceptée':
        return 'Acceptée'
      case 'refusée':
        return 'Refusée'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acceptée':
        return 'border-green-500/30 bg-green-500/10'
      case 'refusée':
        return 'border-red-500/30 bg-red-500/10'
      case 'en cours':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement de vos candidatures...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
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

      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Mes Candidatures
              </h1>
              <p className="text-xs text-gray-300">Suivez l'état de vos candidatures</p>
            </div>
          </div>

          <Link
            href="/candidate-dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Mes Candidatures ({applications.length})
          </h2>
          <p className="text-gray-300">Suivez l'évolution de vos candidatures et restez informé</p>
        </div>

        {applications.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune candidature</h3>
            <p className="text-gray-400 mb-6">Vous n'avez pas encore postulé à des offres d'emploi.</p>
            <Link
              href="/job-applications"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <Briefcase className="w-5 h-5" />
              Voir les offres disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const appInterviews = allInterviews[app.id] || []
              const nextInterview = appInterviews.find(i => i.status === 'scheduled')
              
              console.log(`🎯 Candidature ${app.id}:`, {
                titre: app.jobOffer.title,
                entretiens: appInterviews,
                prochainEntretien: nextInterview,
                allInterviews: allInterviews
              })
              
              return (
              <div key={app.id} className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 ${getStatusColor(app.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {app.jobOffer.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {app.jobOffer.department} • {app.jobOffer.location}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <span className="text-sm font-medium text-white">{getStatusText(app.status)}</span>
                        </div>
                        {nextInterview && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/30 text-blue-200 flex items-center gap-1 border border-blue-500/50">
                            <Calendar className="w-3 h-3" />
                            Entretien planifié
                          </span>
                        )}
                      </div>
                      {nextInterview && (
                        <p className="text-sm text-blue-300 mt-2 flex items-center gap-1">
                          <span>📅</span>
                          {new Date(nextInterview.interviewDate).toLocaleDateString('fr-FR', { 
                            weekday: 'long',
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })} à {nextInterview.interviewTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Soumise le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {app.updatedAt !== app.createdAt && (
                      <p className="text-xs text-gray-400">
                        Dernière mise à jour: {new Date(app.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Lettre de motivation</h4>
                    <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-xl line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleViewDetails(app)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-all text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                  </button>
                  {app.cvUrl && (
                    <a
                      href={`http://localhost:5000${app.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger mon CV
                    </a>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modale de détails */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedApplication.jobOffer.title}
                </h2>
                <p className="text-gray-300">
                  {selectedApplication.jobOffer.department} • {selectedApplication.jobOffer.location}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Statut */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(selectedApplication.status)}
                <span className="font-semibold text-white">{getStatusText(selectedApplication.status)}</span>
              </div>
              <p className="text-sm text-gray-400">
                Candidature soumise le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {selectedApplication.updatedAt !== selectedApplication.createdAt && (
                <p className="text-sm text-gray-400 mt-1">
                  Dernière mise à jour: {new Date(selectedApplication.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Lettre de motivation */}
            {selectedApplication.coverLetter && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Lettre de motivation</h3>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Entretiens */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Entretiens planifiés
              </h3>
              {loadingInterviews ? (
                <p className="text-gray-400">Chargement...</p>
              ) : interviews.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">Aucun entretien planifié pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {new Date(interview.interviewDate).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
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
                      
                      {interview.interviewer && (
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                          <User className="w-4 h-4" />
                          <span>
                            <strong>Intervieweur:</strong> {interview.interviewer.firstName} {interview.interviewer.lastName}
                          </span>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="mt-2 p-3 bg-white/5 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1"><strong>Notes:</strong></p>
                          <p className="text-sm text-gray-300">{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedApplication.cvUrl && (
                <a
                  href={`http://localhost:5000${selectedApplication.cvUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Télécharger mon CV
                </a>
              )}
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                Fermer
              </button>
            </div>
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

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}