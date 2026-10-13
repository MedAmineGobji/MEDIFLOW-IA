'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Briefcase, ArrowLeft, FileText, Send } from 'lucide-react'

type JobOffer = {
  id: number
  title: string
  department: string
  location: string
  contractType: string
  status: string
}

export default function JobApplicationsPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const loadOffers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoadingOffers(true)
      const response = await fetch('http://localhost:5000/api/job-offers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setOffers(data)
        }
      } else {
        console.error('Réponse non OK pour /job-offers', await response.text())
      }
    } catch (e) {
      console.error('Erreur lors du chargement des offres:', e)
    } finally {
      setLoadingOffers(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedOfferId) {
      setError('Veuillez choisir une offre avant de postuler')
      return
    }

    if (!cvFile) {
      setError('Veuillez ajouter votre CV (PDF, Word, etc.)')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous devez être connecté pour postuler')
        setSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append('jobOfferId', String(selectedOfferId))
      formData.append('cv', cvFile)
      formData.append('coverLetter', coverLetter)

      const response = await fetch('http://localhost:5000/api/job-applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess('Votre candidature a été envoyée avec succès.')
        setCvFile(null)
        setCoverLetter('')
        setTimeout(() => {
          setSuccess('')
          router.push('/candidate-dashboard')
        }, 1500)
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de la candidature')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur de réseau. Vérifiez que le serveur backend est démarré.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl shadow-lg shadow-cyan-500/40">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Postuler à une offre
              </h1>
              <p className="text-xs text-gray-300">
                Choisissez une offre puis envoyez votre CV et votre lettre de motivation
              </p>
            </div>
          </div>

          <Link
            href="/candidate-dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mon espace
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Liste des offres */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Offres disponibles</h2>
            {loadingOffers && (
              <span className="text-xs text-gray-300">Chargement...</span>
            )}
          </div>

          {offers.length === 0 && !loadingOffers && (
            <p className="text-sm text-gray-300">
              Aucune offre n&apos;est disponible pour le moment. Revenez plus tard.
            </p>
          )}

          {offers.length > 0 && (
            <div className="space-y-3">
              {offers.map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                    selectedOfferId === offer.id
                      ? 'border-cyan-400 bg-cyan-500/15'
                      : 'border-white/15 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{offer.title}</p>
                      <p className="text-xs text-gray-300">
                        {offer.department} • {offer.location}
                      </p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                      {offer.contractType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire de candidature */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Détails de la candidature</h2>
          </div>

          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                CV (PDF, Word, etc.)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.odt"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-500/80 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-900 hover:file:bg-cyan-400"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Ajoutez un fichier CV au format PDF ou Word. Taille conseillée &lt; 5 Mo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Lettre de motivation
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
                rows={5}
                placeholder="Expliquez pourquoi vous êtes le bon profil pour ce poste..."
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/candidate-dashboard"
                className="px-4 py-2 rounded-2xl border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-medium text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Envoi...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

