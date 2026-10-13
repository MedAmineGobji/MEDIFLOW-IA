'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, ArrowLeft } from 'lucide-react'

type JobOffer = {
  id: number
  title: string
  department: string
  location: string
  contractType: string
  status: string
  createdAt: string | null
}

export default function JobOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)

  const loadOffers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoadingOffers(true)
      const response = await fetch('http://localhost:5000/api/job-offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setOffers(data)
        }
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
                Gestion des offres d&apos;emploi
              </h1>
              <p className="text-xs text-gray-300">Consultez les offres publiées dans l&apos;établissement</p>
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
        {/* Section liste des offres existantes – interface type tableau */}
        <div
          id="offers-list"
          className="backdrop-blur-xl bg-slate-900/60 border border-amber-500/30 rounded-3xl p-6 shadow-lg shadow-amber-500/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-amber-200">Offres d&apos;emploi publiées</h2>
              <p className="text-xs text-gray-400 mt-1">
                Vue synthétique de toutes les offres actives dans l&apos;établissement
              </p>
            </div>
            {loadingOffers && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/40">
                Chargement...
              </span>
            )}
          </div>

          {offers.length === 0 && !loadingOffers && (
            <div className="rounded-2xl border border-dashed border-amber-500/40 bg-slate-900/60 px-4 py-6 text-center">
              <p className="text-sm text-gray-200 font-medium mb-1">Aucune offre enregistrée pour le moment.</p>
              <p className="text-xs text-gray-400">
                Utilisez la section &laquo; Créer une nouvelle offre &raquo; ci-dessous pour ajouter votre première annonce.
              </p>
            </div>
          )}

          {offers.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-white/10 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <span>Poste</span>
                <span>Service / Lieu</span>
                <span>Contrat</span>
                <span className="text-right">Statut / Création</span>
              </div>
              <div className="divide-y divide-white/5">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="grid grid-cols-4 gap-3 px-4 py-3 text-xs text-gray-100 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white">{offer.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-200">{offer.department}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{offer.location}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200 border border-amber-500/40">
                        {offer.contractType}
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="inline-flex justify-end rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200 border border-emerald-500/40">
                        {offer.status || 'active'}
                      </span>
                      {offer.createdAt && (
                        <p className="text-[11px] text-gray-400">
                          Créée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

