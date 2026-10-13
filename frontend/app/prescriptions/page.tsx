'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Calendar, FileText, User, Stethoscope, ArrowLeft, LogOut, Bell, Download, Eye, X, Printer } from 'lucide-react'

export default function PrescriptionsPage() {
  const [user, setUser] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      fetchPrescriptions()
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPrescriptions(Array.isArray(data) ? data : [])
        setFilteredPrescriptions(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du chargement des ordonnances')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les ordonnances selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrescriptions(prescriptions)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = prescriptions.filter((prescription) => {
      const patientName = `${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}`.toLowerCase()
      const doctorName = `${prescription.doctorFirstName || ''} ${prescription.doctorLastName || ''}`.toLowerCase()
      const diagnosis = (prescription.diagnosis || '').toLowerCase()
      const medications = prescription.medications?.map((m: any) => m.name.toLowerCase()).join(' ') || ''
      
      return patientName.includes(term) || 
             doctorName.includes(term) || 
             diagnosis.includes(term) ||
             medications.includes(term)
    })
    
    setFilteredPrescriptions(filtered)
  }, [searchTerm, prescriptions])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleDownloadPrescription = (prescription: any) => {
    // Créer le contenu HTML pour l'ordonnance
    const medicationsList = prescription.medications.map((med: any, index: number) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="color: #2563eb; font-size: 18px; font-weight: bold; margin: 0;">${med.name}</h4>
          <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">#${index + 1}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          ${med.dosage ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Dosage</p><p style="color: #111827; font-size: 14px;">${med.dosage}</p></div>` : ''}
          ${med.frequency ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Fréquence</p><p style="color: #111827; font-size: 14px;">${med.frequency}</p></div>` : ''}
          ${med.duration ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Durée</p><p style="color: #111827; font-size: 14px;">${med.duration}</p></div>` : ''}
        </div>
        ${med.instructions ? `<div style="margin-top: 15px; padding: 12px; background: #f3f4f6; border-radius: 6px;"><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Instructions</p><p style="color: #374151; font-size: 14px;">${med.instructions}</p></div>` : ''}
      </div>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ordonnance - ${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ordonnance Médicale</h1>
          <p>MediFlow AI - Système de gestion médicale</p>
        </div>

        <div class="section">
          <div class="info-item">
            <div class="info-label">Patient</div>
            <div>${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Médecin prescripteur</div>
            <div>Dr. ${prescription.doctorFirstName || ''} ${prescription.doctorLastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de prescription</div>
            <div>${new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        ${prescription.diagnosis ? `
        <div class="section">
          <div class="section-title">📋 Diagnostic</div>
          <div>${prescription.diagnosis}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">💊 Médicaments prescrits</div>
          ${medicationsList}
        </div>

        ${prescription.additionalNotes ? `
        <div class="section">
          <div class="section-title">📄 Notes et recommandations</div>
          <div>${prescription.additionalNotes.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>MediFlow AI - Système de gestion médicale</p>
        </div>
      </body>
      </html>
    `

    // Créer un blob avec le contenu HTML
    const blob = new Blob([printContent], { type: 'text/html' })
    
    // Créer un URL d'objet pour le blob
    const url = URL.createObjectURL(blob)
    
    // Créer un élément <a> temporaire pour le téléchargement
    const a = document.createElement('a')
    a.href = url
    a.download = `ordonnance-${prescription.patientFirstName || 'patient'}-${prescription.patientLastName || ''}-${new Date().toISOString().split('T')[0]}.html`
    
    // Ajouter à la page, cliquer et supprimer
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Libérer l'URL d'objet
    URL.revokeObjectURL(url)
  }

  const handlePrintPrescription = (prescription: any) => {
    // Créer le contenu HTML pour l'impression avec un bouton d'impression intégré
    const medicationsList = prescription.medications.map((med: any, index: number) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="color: #2563eb; font-size: 18px; font-weight: bold; margin: 0;">${med.name}</h4>
          <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">#${index + 1}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          ${med.dosage ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Dosage</p><p style="color: #111827; font-size: 14px;">${med.dosage}</p></div>` : ''}
          ${med.frequency ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Fréquence</p><p style="color: #111827; font-size: 14px;">${med.frequency}</p></div>` : ''}
          ${med.duration ? `<div><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Durée</p><p style="color: #111827; font-size: 14px;">${med.duration}</p></div>` : ''}
        </div>
        ${med.instructions ? `<div style="margin-top: 15px; padding: 12px; background: #f3f4f6; border-radius: 6px;"><p style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Instructions</p><p style="color: #374151; font-size: 14px;">${med.instructions}</p></div>` : ''}
      </div>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ordonnance - ${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .print-button:hover {
            background: #1d4ed8;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            .print-button { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Imprimer</button>
        
        <div class="header">
          <h1>Ordonnance Médicale</h1>
          <p>MediFlow AI - Système de gestion médicale</p>
        </div>

        <div class="section">
          <div class="info-item">
            <div class="info-label">Patient</div>
            <div>${prescription.patientFirstName || ''} ${prescription.patientLastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Médecin prescripteur</div>
            <div>Dr. ${prescription.doctorFirstName || ''} ${prescription.doctorLastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de prescription</div>
            <div>${new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        ${prescription.diagnosis ? `
        <div class="section">
          <div class="section-title">📋 Diagnostic</div>
          <div>${prescription.diagnosis}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">💊 Médicaments prescrits</div>
          ${medicationsList}
        </div>

        ${prescription.additionalNotes ? `
        <div class="section">
          <div class="section-title">📄 Notes et recommandations</div>
          <div>${prescription.additionalNotes.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>MediFlow AI - Système de gestion médicale</p>
        </div>
      </body>
      </html>
    `

    // Ouvrir une nouvelle fenêtre avec le contenu pour prévisualisation
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // La fenêtre s'ouvre avec un bouton "Imprimer" intégré
      // L'utilisateur peut décider quand imprimer
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href={user?.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard'} className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">MediFlow AI</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/appointments" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
                Rendez-vous
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Mes ordonnances</h1>
              <p className="text-gray-400 mt-1">
                {user?.role === 'patient' ? 'Toutes vos ordonnances médicales' : 'Ordonnances que vous avez prescrites'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {/* Barre de recherche */}
        {prescriptions.length > 0 && (
          <div className="mb-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par patient, médecin, diagnostic ou médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                {filteredPrescriptions.length} résultat{filteredPrescriptions.length !== 1 ? 's' : ''} trouvé{filteredPrescriptions.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Liste des ordonnances */}
        {filteredPrescriptions.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Aucune ordonnance ne correspond à votre recherche' : 'Aucune ordonnance disponible'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedPrescription(prescription)
                  setShowDetailsModal(true)
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {prescription.diagnosis || 'Consultation médicale'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all">
                    <Eye className="w-5 h-5 text-cyan-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  {user?.role === 'patient' && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Stethoscope className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">
                        Dr. {prescription.doctorFirstName} {prescription.doctorLastName}
                      </span>
                      {prescription.doctorSpecialty && (
                        <span className="text-xs text-gray-500">• {prescription.doctorSpecialty}</span>
                      )}
                    </div>
                  )}
                  {user?.role === 'doctor' && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">
                        {prescription.patientFirstName} {prescription.patientLastName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-300">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm">
                      {prescription.medications.length} médicament{prescription.medications.length > 1 ? 's' : ''} prescrit{prescription.medications.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de détails de l'ordonnance */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Ordonnance médicale
                    </h3>
                    <p className="text-gray-400">
                      {new Date(selectedPrescription.createdAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPrescription(null)
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {user?.role === 'patient' ? 'Médecin prescripteur' : 'Patient'}
                  </h4>
                  <p className="text-white font-semibold">
                    {user?.role === 'patient' 
                      ? `Dr. ${selectedPrescription.doctorFirstName} ${selectedPrescription.doctorLastName}`
                      : `${selectedPrescription.patientFirstName} ${selectedPrescription.patientLastName}`
                    }
                  </p>
                  {user?.role === 'patient' && selectedPrescription.doctorSpecialty && (
                    <p className="text-gray-400 text-sm">{selectedPrescription.doctorSpecialty}</p>
                  )}
                </div>
                {selectedPrescription.diagnosis && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Diagnostic
                    </h4>
                    <p className="text-white">{selectedPrescription.diagnosis}</p>
                  </div>
                )}
              </div>

              {/* Médicaments */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Médicaments prescrits</h4>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med: any, index: number) => (
                    <div key={index} className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-lg font-bold text-cyan-300">{med.name}</h5>
                        <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs font-semibold text-cyan-400">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                        {med.dosage && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dosage</p>
                            <p className="text-white text-sm">{med.dosage}</p>
                          </div>
                        )}
                        {med.frequency && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Fréquence</p>
                            <p className="text-white text-sm">{med.frequency}</p>
                          </div>
                        )}
                        {med.duration && (
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Durée</p>
                            <p className="text-white text-sm">{med.duration}</p>
                          </div>
                        )}
                      </div>
                      {med.instructions && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Instructions</p>
                          <p className="text-gray-200 text-sm">{med.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes complémentaires */}
              {selectedPrescription.additionalNotes && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">
                    Notes et recommandations
                  </h4>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedPrescription.additionalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
              <div className="flex gap-3">
                <button
                  onClick={() => handlePrintPrescription(selectedPrescription)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-300 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button
                  onClick={() => handleDownloadPrescription(selectedPrescription)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Télécharger
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPrescription(null)
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                >
                  Fermer
                </button>
              </div>
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
      `}</style>
    </div>
  )
}
