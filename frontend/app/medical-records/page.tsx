'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, FileText, Calendar, User as UserIcon, Stethoscope, ArrowLeft, LogOut, Bell, Download, ChevronDown, ChevronUp, Plus, CheckCircle, X, Edit2, Printer } from 'lucide-react'

export default function MedicalRecordsPage() {
  const [user, setUser] = useState<any>(null)
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])

  // Form state
  const [patientId, setPatientId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [prescription, setPrescription] = useState('')
  const [notes, setNotes] = useState('')

  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      setUser(parsed)
      fetchMedicalRecords()
      if (userRoles.includes('doctor')) {
        fetchPatients()
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchMedicalRecords = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/medical-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dossiers médicaux récupérés:', data)
        setMedicalRecords(Array.isArray(data) ? data : [])
        setFilteredRecords(Array.isArray(data) ? data : [])
      } else {
        console.error('Erreur HTTP:', response.status, response.statusText)
        setError('Erreur lors du chargement des dossiers médicaux')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      setError('Erreur de réseau')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les dossiers selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecords(medicalRecords)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = medicalRecords.filter((record) => {
      const patientName = `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`.toLowerCase()
      const doctorName = `${record.doctor?.firstName || ''} ${record.doctor?.lastName || ''}`.toLowerCase()
      const diagnosis = (record.diagnosis || '').toLowerCase()
      const treatment = (record.treatment || '').toLowerCase()
      const notes = (record.notes || '').toLowerCase()
      
      return patientName.includes(term) || 
             doctorName.includes(term) || 
             diagnosis.includes(term) ||
             treatment.includes(term) ||
             notes.includes(term)
    })
    
    setFilteredRecords(filtered)
  }, [searchTerm, medicalRecords])

  const fetchPatients = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }



  const resetForm = () => {
    setPatientId('')
    setDiagnosis('')
    setTreatment('')
    setPrescription('')
    setNotes('')
    setEditingRecord(null)
  }

  const handleDownload = (record: any) => {
    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dossier Médical - ${record.patient?.firstName || ''} ${record.patient?.lastName || ''}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
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
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .section-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            padding: 10px;
            background: white;
            border-radius: 5px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 MediFlow AI</h1>
          <h2>Dossier Médical</h2>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Patient</div>
            <div>${record.patient?.firstName || ''} ${record.patient?.lastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Médecin</div>
            <div>Dr. ${record.doctor?.firstName || ''} ${record.doctor?.lastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de consultation</div>
            <div>${new Date(record.consultationDate || record.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de création du dossier</div>
            <div>${new Date(record.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        ${record.diagnosis ? `
        <div class="section">
          <div class="section-title">📋 Diagnostic</div>
          <div>${record.diagnosis}</div>
        </div>
        ` : ''}

        ${record.treatment ? `
        <div class="section">
          <div class="section-title">💊 Traitement</div>
          <div>${record.treatment.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${record.prescription ? `
        <div class="section">
          <div class="section-title">📝 Prescription</div>
          <div>${record.prescription.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${record.notes ? `
        <div class="section">
          <div class="section-title">📄 Notes complémentaires</div>
          <div>${record.notes.replace(/\n/g, '<br>')}</div>
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
    a.download = `dossier-medical-${record.patient?.firstName || 'patient'}-${record.patient?.lastName || ''}-${new Date().toISOString().split('T')[0]}.html`
    
    // Ajouter à la page, cliquer et supprimer
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Libérer l'URL d'objet
    URL.revokeObjectURL(url)
  }

  const handlePrint = (record: any) => {
    // Créer le contenu HTML pour l'impression avec un bouton d'impression intégré
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dossier Médical - ${record.patient?.firstName || ''} ${record.patient?.lastName || ''}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
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
          <h1>Dossier Médical</h1>
          <p>MediFlow AI - Système de gestion médicale</p>
        </div>

        <div class="section">
          <div class="info-item">
            <div class="info-label">Patient</div>
            <div>${record.patient?.firstName || ''} ${record.patient?.lastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Médecin</div>
            <div>Dr. ${record.doctor?.firstName || ''} ${record.doctor?.lastName || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de consultation</div>
            <div>${new Date(record.consultationDate || record.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de création du dossier</div>
            <div>${new Date(record.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        ${record.diagnosis ? `
        <div class="section">
          <div class="section-title">📋 Diagnostic</div>
          <div>${record.diagnosis}</div>
        </div>
        ` : ''}

        ${record.treatment ? `
        <div class="section">
          <div class="section-title">💊 Traitement</div>
          <div>${record.treatment.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${record.prescription ? `
        <div class="section">
          <div class="section-title">📝 Prescription</div>
          <div>${record.prescription.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${record.notes ? `
        <div class="section">
          <div class="section-title">📄 Notes complémentaires</div>
          <div>${record.notes.replace(/\n/g, '<br>')}</div>
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
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // La fenêtre s'ouvre avec un bouton "Imprimer" intégré
      // L'utilisateur peut décider quand imprimer
    }
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setPatientId(record.patientId || record.patient?.id || '')
    setDiagnosis(record.diagnosis || '')
    setTreatment(record.treatment || '')
    setPrescription(record.prescription || '')
    setNotes(record.notes || '')
    setShowNewForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const url = editingRecord
        ? `http://localhost:5000/api/medical-records/${editingRecord.id}`
        : 'http://localhost:5000/api/medical-records'

      const method = editingRecord ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: parseInt(patientId),
          diagnosis,
          treatment,
          prescription,
          notes
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Dossier créé avec succès:', result)
        setSuccess(editingRecord ? 'Dossier mis à jour avec succès !' : 'Dossier médical créé avec succès !')
        setShowNewForm(false)
        resetForm()
        setSearchTerm('') // Vider la recherche pour voir tous les dossiers
        console.log('Appel de fetchMedicalRecords...')
        // Petit délai pour s'assurer que la DB est à jour
        setTimeout(() => {
          fetchMedicalRecords()
        }, 500)
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la création:', errorData)
        setError(errorData.message || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const toggleRecord = (id: number) => {
    setExpandedRecord(expandedRecord === id ? null : id)
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
                <p className="text-xs text-gray-300">
                  {user.role === 'doctor' ? 'Gestion des Dossiers' : 'Mes Dossiers Médicaux'}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={user.role === 'doctor' ? "/doctor-dashboard" : "/patient-dashboard"} className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <button className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <Bell className="w-5 h-5 text-gray-300" />
              </button>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {user.role === 'doctor' ? 'Dossiers Patients' : 'Mes Dossiers Médicaux'}
            </h2>
            <p className="text-gray-300">
              {user.role === 'doctor' ? 'Gérez et consultez les dossiers de vos patients' : 'Consultez l\'historique de vos consultations'}
            </p>
          </div>

          {user.role === 'doctor' && (
            <button
              onClick={() => {
                setShowNewForm(!showNewForm)
                if (!showNewForm) resetForm()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nouveau Dossier
            </button>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={user.role === 'doctor' 
                ? "Rechercher par patient, diagnostic, traitement..." 
                : "Rechercher par médecin, diagnostic, traitement..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-400">
              {filteredRecords.length} résultat{filteredRecords.length > 1 ? 's' : ''} trouvé{filteredRecords.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            <X className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* New Medical Record Form (Doctor only) */}
        {showNewForm && user.role === 'doctor' && (
          <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              {editingRecord ? 'Modifier le Dossier' : 'Créer un Nouveau Dossier'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Patient
                </label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" className="bg-slate-800">Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id} className="bg-slate-800">
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Diagnostic
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: Grippe saisonnière"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Traitement
                  </label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: Repos, Paracétamol"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Prescription
                </label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Détails de la prescription..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Observations supplémentaires..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  {editingRecord ? 'Mettre à jour' : 'Créer le Dossier'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medical Records List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-white py-12">Chargement...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun dossier médical'}
              </h3>
              <p className="text-gray-300">
                {searchTerm 
                  ? 'Essayez avec d\'autres termes de recherche'
                  : user.role === 'doctor' 
                    ? 'Commencez par créer un nouveau dossier' 
                    : 'Vos dossiers médicaux apparaîtront ici après vos consultations'
                }
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden transition-all duration-300">
                {/* Record Header */}
                <div
                  onClick={() => toggleRecord(record.id)}
                  className="p-6 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {user.role === 'doctor'
                            ? `${record.patient?.firstName || 'Patient'} ${record.patient?.lastName || ''}`
                            : `Consultation du ${new Date(record.consultationDate || record.createdAt || record.recordDate).toLocaleDateString('fr-FR')}`
                          }
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            {user.role === 'doctor' ? <UserIcon className="w-4 h-4 text-cyan-400" /> : <Stethoscope className="w-4 h-4 text-cyan-400" />}
                            <span>
                              {user.role === 'doctor'
                                ? `Consultation du ${new Date(record.consultationDate || record.createdAt || record.recordDate).toLocaleDateString('fr-FR')}`
                                : `Dr. ${record.doctor?.firstName || 'Médecin'} ${record.doctor?.lastName || ''}`
                              }
                            </span>
                          </div>
                          {record.diagnosis && (
                            <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-xs">
                              {record.diagnosis.substring(0, 30)}{record.diagnosis.length > 30 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      {expandedRecord === record.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecord === record.id && (
                  <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                    {record.diagnosis && (
                      <div>
                        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Diagnostic</h4>
                        <p className="text-white p-3 bg-white/5 rounded-xl">{record.diagnosis}</p>
                      </div>
                    )}

                    {record.treatment && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">Traitement</h4>
                        <p className="text-white p-3 bg-white/5 rounded-xl">{record.treatment}</p>
                      </div>
                    )}

                    {record.prescription && (
                      <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-2">Prescription</h4>
                        <p className="text-white p-3 bg-white/5 rounded-xl">{record.prescription}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-2">Notes</h4>
                        <p className="text-gray-300 p-3 bg-white/5 rounded-xl">{record.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {user.role === 'doctor' && (
                        <button
                          onClick={() => handleEdit(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-xl hover:bg-blue-500/30 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint(record)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/50 rounded-xl hover:bg-green-500/30 transition-all"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimer
                      </button>
                      <button 
                        onClick={() => handleDownload(record)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
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