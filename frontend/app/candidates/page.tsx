'use client';

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Users, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/useAuth'

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  skills: string
  experience: string
  status: string
  aiAnalysis: string
}

interface Interview {
  id: number
  interviewDate: string
  interviewTime: string
  status: string
  notes: string
  feedback: string
  createdAt: string
  interviewer: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

interface AnalysisResult {
  id: number
  applicationId: number
  score: number
  recommandation: string
  pointsForts: string[]
  lacunes: string[]
  competences: string[]
  analyseDetaillee: string
  createdAt: string
}

export default function CandidatesPage() {
  const { user, loading: authLoading } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<Record<number, AnalysisResult>>({})
  const [interviews, setInterviews] = useState<Record<string, Interview[]>>({})

  useEffect(() => {
    if (!authLoading && user?.role === 'hrRecruiter') {
      fetchCandidates()
    }
  }, [authLoading, user])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/candidates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des candidats')
      }

      const data = await response.json()
      setCandidates(data)
      await loadExistingAnalyses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadExistingAnalyses = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const analyses = await response.json()
        const analysisMap: Record<number, AnalysisResult> = {}
        
        analyses.data?.forEach((analysis: AnalysisResult) => {
          analysisMap[analysis.applicationId] = analysis
        })
        
        setAnalysisResults(analysisMap)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analyses:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!user || user.role !== 'hrRecruiter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
          <p className="text-gray-300">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Liste des Candidats
              </h1>
              <p className="text-xs text-gray-300">Vue globale des profils en recrutement</p>
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
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Candidats actifs</h2>
            <span className="text-sm text-gray-300">{candidates.length} candidat{candidates.length > 1 ? 's' : ''}</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
              <span className="text-gray-300">Chargement des candidats...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-4 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-300">Aucun candidat trouvé.</p>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm text-white font-medium">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        candidate.status === 'En cours'
                          ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40'
                          : candidate.status === 'Entretien prévu'
                          ? 'bg-green-500/20 text-green-200 border border-green-400/40'
                          : 'bg-gray-500/20 text-gray-200 border border-gray-400/40'
                      }`}>
                        {candidate.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p><strong>Email:</strong> {candidate.email}</p>
                      <p><strong>Téléphone:</strong> {candidate.phone}</p>
                      <p><strong>Compétences:</strong> {candidate.skills}</p>
                      <p><strong>Expérience:</strong> {candidate.experience}</p>
                      {analysisResults[parseInt(candidate.id)] ? (
                        <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-purple-300">Analyse IA:</span>
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-200 rounded-full">
                              {analysisResults[parseInt(candidate.id)].score}/100 - {analysisResults[parseInt(candidate.id)].recommandation}
                            </span>
                          </div>
                          {analysisResults[parseInt(candidate.id)].competences?.length > 0 && (
                            <div className="text-xs text-gray-400">
                              <strong>Compétences:</strong> {analysisResults[parseInt(candidate.id)].competences.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        candidate.aiAnalysis && (
                          <p><strong>Analyse IA:</strong> {candidate.aiAnalysis}</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

