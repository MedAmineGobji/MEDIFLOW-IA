'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, ArrowLeft, Users, FileSearch, Eye, Download, CheckCircle, XCircle, Clock, X, Mail, MapPin, Calendar, FileText, Brain, Sparkles, Loader2, Filter, Phone, MessageSquare, Star, ThumbsUp, ThumbsDown, AlertCircle, UserCheck, Target } from 'lucide-react'

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
  candidate: {
    firstName: string
    lastName: string
    email: string
  }
}

interface Interview {
  id: number
  applicationId: number
  interviewerId: number
  interviewDate: string
  interviewTime: string
  status: string
  notes: string
  feedback: string
  createdAt: string
  interviewer: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function RecruitmentPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [analyzingApplications, setAnalyzingApplications] = useState<Set<number>>(new Set())
  const [analysisResults, setAnalysisResults] = useState<Record<number, any>>({})
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRecommendation, setFilterRecommendation] = useState<string>('all')
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [interviews, setInterviews] = useState<Record<number, Interview[]>>({})

  useEffect(() => {
    // Load saved analyses from localStorage
    const saved = localStorage.getItem('analysisResults')
    if (saved) {
      try {
        setAnalysisResults(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing saved analyses:', e)
      }
    }

    fetchApplications()
  }, [])

  // Save analyses to localStorage when they change
  useEffect(() => {
    localStorage.setItem('analysisResults', JSON.stringify(analysisResults))
  }, [analysisResults])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Non authentifié')
        return
      }

      const response = await fetch('http://localhost:5000/api/job-applications/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
        
        // Charger les analyses existantes
        await loadExistingAnalyses(data)
      } else {
        setError('Erreur lors du chargement des candidatures')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingAnalyses = async (apps: JobApplication[]) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const analysisMap: Record<number, any> = {}
        
        result.data?.forEach((analysis: any) => {
          analysisMap[analysis.applicationId] = analysis
        })
        
        setAnalysisResults(analysisMap)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analyses:', error)
    }
  }

  const analyzeApplication = async (application: JobApplication) => {
    if (!application.cvUrl) {
      alert('Aucun CV disponible pour cette candidature')
      return
    }

    setAnalyzingApplications(prev => new Set(prev).add(application.id))

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Non authentifié')
      }

      // Récupérer le CV
      const cvResponse = await fetch(`http://localhost:5000${application.cvUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!cvResponse.ok) {
        throw new Error('Erreur lors de la récupération du CV')
      }

      const cvBlob = await cvResponse.blob()
      const cvFile = new File([cvBlob], 'cv.pdf', { type: 'application/pdf' })

      // Analyser le CV en utilisant l'URL existante
      const analysisResponse = await fetch('http://localhost:5000/api/cv-analysis/analyze-existing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cvUrl: application.cvUrl,
          jobOfferId: application.jobOfferId.toString(),
          applicationId: application.id.toString()
        })
      })

      if (!analysisResponse.ok) {
        throw new Error('Erreur lors de l\'analyse IA')
      }

      const analysisResult = await analysisResponse.json()
      
      console.log('📊 Analyse reçue:', analysisResult)
      console.log('📊 Structure complète:', JSON.stringify(analysisResult, null, 2))

      if (!analysisResult.success || !analysisResult.data) {
        console.error('❌ Échec:', analysisResult)
        throw new Error('Analyse IA échouée: données manquantes')
      }

      // Extraire l'objet analysis de data (l'API retourne data.analysis au lieu de data directement)
      const analysisData = analysisResult.data.analysis || analysisResult.data
      console.log('📊 Données analyse extraites:', analysisData)
      
      if (!analysisData.score && analysisData.score !== 0) {
        console.error('❌ Score manquant:', analysisData)
        throw new Error('Score d\'analyse manquant')
      }
      
      if (!analysisData.recommandation) {
        console.error('❌ Recommandation manquante:', analysisData)
        throw new Error('Recommandation d\'analyse manquante')
      }

      // Mettre à jour les résultats d'analyse immédiatement
      setAnalysisResults(prev => {
        const newResults = { ...prev }
        newResults[application.id] = analysisData
        console.log('📝 analysisResults mis à jour:', newResults)
        return newResults
      })

      // Forcer un re-render en mettant à jour selectedApplication si c'est la même application
      if (selectedApplication && selectedApplication.id === application.id) {
        setSelectedApplication({ ...selectedApplication })
      }

      // Message de succès avec détails de la recommandation
      const recommendationEmoji = analysisData.recommandation === 'RECOMMANDÉ' ? '✅' : 
                                  analysisData.recommandation === 'À CONSIDÉRER' ? '⚠️' : '❌'
      const scoreColor = analysisData.score >= 80 ? 'Excellent' : 
                         analysisData.score >= 60 ? 'Bon' : 'Faible'
      
      alert(`${recommendationEmoji} Analyse IA terminée !\n\nScore: ${analysisData.score}/100 (${scoreColor})\nRecommandation: ${analysisData.recommandation}\n\nConsultez les détails dans le modal.`)
    } catch (error) {
      console.error('Erreur d\'analyse:', error)
      alert('Erreur lors de l\'analyse IA: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setAnalyzingApplications(prev => {
        const newSet = new Set(prev)
        newSet.delete(application.id)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acceptée':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'refusée':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'en cours':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'soumise':
        return 'Soumise'
      case 'en cours':
        return 'En cours'
      case 'acceptée':
        return 'Acceptée'
      case 'refusée':
        return 'Refusée'
      default:
        return status
    }
  }

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/job-applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ))
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus })
        }
        alert(`Candidature ${newStatus === 'acceptée' ? 'acceptée' : 'refusée'} avec succès`)
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const scheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      alert('Veuillez sélectionner une date et une heure')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Non authentifié')
        return
      }

      const response = await fetch('http://localhost:5000/api/interviews/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApplication?.id,
          interviewDate: interviewDate,
          interviewTime: interviewTime,
          notes: interviewNotes
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Entretien planifié avec succès pour le ${interviewDate} à ${interviewTime}`)
        setShowInterviewModal(false)
        setInterviewDate('')
        setInterviewTime('')
        setInterviewNotes('')
        // Recharger les candidatures pour voir le changement de statut
        fetchApplications()
        // Recharger les entretiens pour cette candidature
        if (selectedApplication) {
          fetchInterviewsForApplication(selectedApplication.id)
        }
      } else {
        const error = await response.json()
        alert('Erreur lors de la planification: ' + error.message)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la planification de l\'entretien')
    }
  }

  const fetchInterviewsForApplication = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/interviews/application/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📅 Entretiens récupérés pour application', applicationId, ':', result.data)
        setInterviews(prev => ({
          ...prev,
          [applicationId]: result.data || []
        }))
      } else {
        console.error('❌ Erreur lors de la récupération des entretiens:', response.status)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des entretiens:', error)
    }
  }

  const getRecommendationBadge = (analysis: any) => {
    if (!analysis) return null
    
    const { recommandation, score } = analysis
    
    if (recommandation === 'RECOMMANDÉ') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
          <ThumbsUp className="w-4 h-4" />
          <span>Recommandé ({score}/100)</span>
        </div>
      )
    } else if (recommandation === 'À CONSIDÉRER') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>À considérer ({score}/100)</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
          <ThumbsDown className="w-4 h-4" />
          <span>Non recommandé ({score}/100)</span>
        </div>
      )
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false
    if (filterRecommendation !== 'all') {
      const analysis = analysisResults[app.id]
      if (!analysis) return filterRecommendation === 'none'
      if (filterRecommendation === 'recommended' && analysis.recommandation !== 'RECOMMANDÉ') return false
      if (filterRecommendation === 'consider' && analysis.recommandation !== 'À CONSIDÉRER') return false
      if (filterRecommendation === 'not-recommended' && analysis.recommandation !== 'NON RECOMMANDÉ') return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement des candidatures...</div>
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
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Gestion des Candidatures
              </h1>
              <p className="text-xs text-gray-300">Vue RH des processus de recrutement</p>
            </div>
          </div>

          <Link
            href="/hr-dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord RH
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Toutes les Candidatures ({filteredApplications.length}/{applications.length})
            </h2>
            <p className="text-gray-300">Gérez et suivez l'ensemble des candidatures reçues</p>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800">Tous les statuts</option>
                <option value="soumise" className="bg-slate-800">Soumise</option>
                <option value="en cours" className="bg-slate-800">En cours</option>
                <option value="acceptée" className="bg-slate-800">Acceptée</option>
                <option value="refusée" className="bg-slate-800">Refusée</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <select
                value={filterRecommendation}
                onChange={(e) => setFilterRecommendation(e.target.value)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800">Toutes recommandations</option>
                <option value="recommended" className="bg-slate-800">Recommandé</option>
                <option value="consider" className="bg-slate-800">À considérer</option>
                <option value="not-recommended" className="bg-slate-800">Non recommandé</option>
                <option value="none" className="bg-slate-800">Sans analyse</option>
              </select>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune candidature</h3>
              <p className="text-gray-400">
                {applications.length === 0 
                  ? 'Les candidatures apparaîtront ici une fois reçues.' 
                  : 'Aucune candidature ne correspond aux filtres sélectionnés.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {app.candidate.firstName} {app.candidate.lastName}
                      </h3>
                      <p className="text-sm text-gray-300">{app.candidate.email}</p>
                      <p className="text-sm text-cyan-400 font-medium">
                        {app.jobOffer.title} - {app.jobOffer.department}
                      </p>
                      <p className="text-xs text-gray-400">
                        Soumise le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Badge de recommandation IA */}
                    {analysisResults[app.id] && (
                      <div className="mr-2">
                        {getRecommendationBadge(analysisResults[app.id])}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span className="text-sm text-gray-300">{getStatusText(app.status)}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Bouton Analyse IA */}
                      <button
                        onClick={() => analyzeApplication(app)}
                        disabled={analyzingApplications.has(app.id)}
                        className={`p-2 border rounded-lg transition-all flex items-center gap-1 ${
                          analysisResults[app.id]
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                            : analyzingApplications.has(app.id)
                            ? 'bg-gray-500/20 border-gray-500/30 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                        }`}
                        title={analysisResults[app.id] ? 'Analyse IA disponible' : analyzingApplications.has(app.id) ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
                      >
                        {analyzingApplications.has(app.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : analysisResults[app.id] ? (
                          <Brain className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {analyzingApplications.has(app.id) && <span className="text-xs">IA</span>}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApplication(app)
                          setShowModal(true)
                          fetchInterviewsForApplication(app.id)
                        }}
                        className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.cvUrl && (
                        <a
                          href={`http://localhost:5000${app.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de détails de candidature */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  Détails de la Candidature
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations du candidat */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Informations du Candidat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Nom complet</p>
                      <p className="text-white font-medium">{selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="text-white font-medium">{selectedApplication.candidate.email}</p>
                    </div>
                  </div>
                </div>

                {/* Informations du poste */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-400" />
                    Poste Postulé
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Titre du poste</p>
                      <p className="text-white font-medium">{selectedApplication.jobOffer.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Département</p>
                      <p className="text-white font-medium">{selectedApplication.jobOffer.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Lieu
                      </p>
                      <p className="text-white font-medium">{selectedApplication.jobOffer.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date de candidature
                      </p>
                      <p className="text-white font-medium">{new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Statut de la Candidature</h3>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedApplication.status)}
                    <span className="text-white font-medium">{getStatusText(selectedApplication.status)}</span>
                  </div>
                </div>

                {/* Entretiens planifiés */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-400" />
                    Entretiens Planifiés
                  </h3>
                  {interviews[selectedApplication.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {interviews[selectedApplication.id].map((interview) => (
                        <div key={interview.id} className="bg-black/30 rounded-xl p-4 border border-gray-600/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium">
                                {new Date(interview.interviewDate).toLocaleDateString('fr-FR')} à {interview.interviewTime}
                              </span>
                            </div>
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
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            Intervieweur: {interview.interviewer.firstName} {interview.interviewer.lastName}
                          </div>
                          {interview.notes && (
                            <div className="text-sm text-gray-300">
                              <strong>Notes:</strong> {interview.notes}
                            </div>
                          )}
                          {interview.feedback && (
                            <div className="text-sm text-gray-300 mt-2">
                              <strong>Feedback:</strong> {interview.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun entretien planifié</p>
                      <p className="text-gray-500 text-sm">Utilisez le bouton d'entretien pour en planifier un</p>
                    </div>
                  )}
                </div>

                {/* Lettre de motivation */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Lettre de Motivation
                  </h3>
                  <div className="bg-black/30 rounded-xl p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedApplication.coverLetter || 'Aucune lettre de motivation fournie.'}
                    </p>
                  </div>
                </div>

                {/* Analyse IA */}
                {(() => {
                  const analysis = analysisResults[selectedApplication.id]
                  console.log('🔍 Affichage analyse pour application', selectedApplication.id, ':', analysis)
                  
                  if (!analysis) {
                    return (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-yellow-400" />
                          <div>
                            <h4 className="text-yellow-300 font-medium">Analyse IA non disponible</h4>
                            <p className="text-yellow-200/80 text-sm">
                              Cliquez sur le bouton IA pour analyser ce CV avec l'intelligence artificielle.
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Analyse IA du CV
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        IA Active
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Questions d'entretien - Affiché en premier */}
                      {analysis.questionsEntretien && analysis.questionsEntretien.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-4">
                          <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Questions d'entretien suggérées
                          </h4>
                          <div className="space-y-2">
                            {analysis.questionsEntretien.slice(0, 5).map((question: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/30 text-blue-300 rounded-full flex items-center justify-center text-xs font-medium">
                                  {idx + 1}
                                </span>
                                <p className="text-blue-200 text-sm leading-relaxed">{question}</p>
                              </div>
                            ))}
                          </div>
                          {analysis.questionsEntretien.length > 5 && (
                            <p className="text-blue-400/60 text-xs mt-2 text-center">
                              +{analysis.questionsEntretien.length - 5} autres questions disponibles
                            </p>
                          )}
                        </div>
                      )}

                      {/* Recommandation principale - Grand Banner */}
                      <div className={`p-5 rounded-2xl border-2 ${
                        analysis.recommandation === 'RECOMMANDÉ' 
                          ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/50' 
                          : analysis.recommandation === 'À CONSIDÉRER'
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50'
                          : 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {analysis.recommandation === 'RECOMMANDÉ' && (
                              <div className="p-2 bg-green-500/30 rounded-xl">
                                <UserCheck className="w-6 h-6 text-green-300" />
                              </div>
                            )}
                            {analysis.recommandation === 'À CONSIDÉRER' && (
                              <div className="p-2 bg-yellow-500/30 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-yellow-300" />
                              </div>
                            )}
                            {analysis.recommandation === 'NON RECOMMANDÉ' && (
                              <div className="p-2 bg-red-500/30 rounded-xl">
                                <XCircle className="w-6 h-6 text-red-300" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider">Verdict IA</p>
                              <p className={`text-2xl font-bold ${
                                analysis.recommandation === 'RECOMMANDÉ' ? 'text-green-300' :
                                analysis.recommandation === 'À CONSIDÉRER' ? 'text-yellow-300' : 'text-red-300'
                              }`}>
                                {analysis.recommandation}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Score de compatibilité</p>
                            <div className="flex items-center gap-2">
                              <div className="relative w-20 h-20">
                                <svg className="transform -rotate-90 w-20 h-20">
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-gray-700"
                                  />
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 32}`}
                                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - analysis.score / 100)}`}
                                    className={analysis.score >= 80 ? 'text-green-400' : analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-2xl font-bold text-white">{analysis.score}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Suggestion d'action basée sur le score */}
                        <div className={`mt-4 p-3 rounded-xl border ${
                          analysis.recommandation === 'RECOMMANDÉ' 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : analysis.recommandation === 'À CONSIDÉRER'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          <p className="text-sm font-medium mb-1 ${
                            analysis.recommandation === 'RECOMMANDÉ' ? 'text-green-300' :
                            analysis.recommandation === 'À CONSIDÉRER' ? 'text-yellow-300' : 'text-red-300'
                          }">
                            💡 Suggestion d'action
                          </p>
                          <p className="text-sm text-gray-300">
                            {analysis.recommandation === 'RECOMMANDÉ' 
                              ? '✅ Profil hautement qualifié ! Planifier un entretien rapidement.' 
                              : analysis.recommandation === 'À CONSIDÉRER'
                              ? '⚠️ Profil intéressant avec quelques réserves. Évaluer les lacunes identifiées.'
                              : '❌ Profil ne correspond pas aux critères requis pour ce poste.'}
                          </p>
                        </div>
                      </div>

                      {/* Points forts et faibles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Points forts
                          </h4>
                          <ul className="text-sm text-green-200 space-y-1">
                            {analysis.pointsForts?.slice(0, 3).map((point: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                {point}
                              </li>
                            )) || []}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Points à améliorer
                          </h4>
                          <ul className="text-sm text-red-200 space-y-1">
                            {analysis.lacunes?.slice(0, 3).map((lacune: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                {lacune}
                              </li>
                            )) || []}
                          </ul>
                        </div>
                      </div>

                      {/* Compétences détectées */}
                      {analysis.competences?.length > 0 && (
                        <div>
                          <h4 className="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Compétences détectées
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.competences.slice(0, 6).map((competence: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-xs">
                                {competence}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analyse détaillée et justification */}
                      {analysis.analyseDetaillee && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Analyse détaillée
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {analysis.analyseDetaillee}
                          </p>
                        </div>
                      )}

                      {/* Adéquation au poste */}
                      {analysis.adequationPoste && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                          <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Adéquation au poste
                          </h4>
                          
                          {analysis.adequationPoste.exigencesSatisfaites?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-green-400 font-semibold mb-2">✓ Exigences satisfaites :</p>
                              <ul className="text-sm text-green-200 space-y-1">
                                {analysis.adequationPoste.exigencesSatisfaites.map((exigence: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                    {exigence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analysis.adequationPoste.exigencesManquantes?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-orange-400 font-semibold mb-2">✗ Exigences manquantes :</p>
                              <ul className="text-sm text-orange-200 space-y-1">
                                {analysis.adequationPoste.exigencesManquantes.map((exigence: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <XCircle className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                                    {exigence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analysis.adequationPoste.commentaires && (
                            <p className="text-xs text-gray-300 italic mt-2 pt-2 border-t border-purple-500/20">
                              {analysis.adequationPoste.commentaires}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Questions d'entretien suggérées */}
                      {analysis.questionsEntretien?.length > 0 && (
                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                          <h4 className="text-cyan-300 font-medium mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Questions d'entretien suggérées
                          </h4>
                          <ul className="text-sm text-gray-300 space-y-2">
                            {analysis.questionsEntretien.map((question: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5">{idx + 1}.</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  )
                })()}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedApplication.cvUrl && (
                    <a
                      href={`http://localhost:5000${selectedApplication.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger le CV
                    </a>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 rounded-xl text-gray-300 hover:bg-gray-500/30 transition-all"
                  >
                    Fermer
                  </button>
                </div>

                {/* Action buttons based on AI recommendation */}
                {analysisResults[selectedApplication?.id] && (
                  <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'acceptée')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Accepter
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setShowInterviewModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      Planifier Entretien
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'refusée')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Planifier un Entretien</h3>
                  <p className="text-sm text-gray-400">
                    {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName} - {selectedApplication.jobOffer.title}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de l'Entretien
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes / Ordre du jour
                  </label>
                  <textarea
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    rows={4}
                    placeholder="Ajouter des notes pour l'entretien (points à discuter, questions...)"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => scheduleInterview()}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                  >
                    Confirmer l'Entretien
                  </button>
                  <button
                    onClick={() => {
                      setShowInterviewModal(false);
                      setInterviewDate('');
                      setInterviewTime('');
                      setInterviewNotes('');
                    }}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

