'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Briefcase, ArrowLeft } from 'lucide-react'

type JobForm = {
  title: string
  department: string
  location: string
  contractType: string
  description: string
  requirements: string
}

export default function NewJobOfferPage() {
  const router = useRouter()

  const [form, setForm] = useState<JobForm>({
    title: '',
    department: '',
    location: '',
    contractType: '',
    description: '',
    requirements: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vous devez être connecté pour créer une offre')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/job-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        // Rediriger vers la liste des offres après un court délai
        setTimeout(() => {
          router.push('/job-offers')
        }, 1200)
      } else {
        setError(data.message || 'Erreur lors de la création de l\'offre')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur de réseau. Vérifiez que le serveur backend est démarré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl shadow-lg shadow-amber-500/40">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Nouvelle offre d&apos;emploi
              </h1>
              <p className="text-xs text-gray-300">
                Créez une nouvelle opportunité et publiez-la pour les candidats
              </p>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
          {submitted && (
            <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              ✓ L&apos;offre a été créée avec succès, redirection vers la liste...
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
                Titre du poste
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                placeholder="Ex : Infirmier(ère) diplômé(e), Médecin généraliste..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Service / Département
                </label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  placeholder="Urgences, Cardiologie, RH..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  placeholder="Ville, établissement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Type de contrat
                </label>
                <select
                  name="contractType"
                  value={form.contractType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                >
                  <option value="" className="bg-slate-900">
                    Sélectionner
                  </option>
                  <option value="CDI" className="bg-slate-900">CDI</option>
                  <option value="CDD" className="bg-slate-900">CDD</option>
                  <option value="Stage" className="bg-slate-900">Stage</option>
                  <option value="Intérim" className="bg-slate-900">Intérim</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Description du poste
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                placeholder="Missions principales, contexte, équipe..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Profil recherché / Prérequis
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                required
                rows={3}
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                placeholder="Diplômes, expériences, compétences attendues..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/job-offers"
                className="px-4 py-2 rounded-2xl border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-medium text-slate-900 hover:from-amber-300 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer l\'offre'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

