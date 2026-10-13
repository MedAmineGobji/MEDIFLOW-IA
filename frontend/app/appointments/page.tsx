'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Calendar, Clock, User, Stethoscope, ArrowRight, ArrowLeft, LogOut, Bell, CheckCircle, X, Users, Check, XCircle, AlertCircle, Search } from 'lucide-react'

export default function AppointmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments')
  const [showProposeDateModal, setShowProposeDateModal] = useState(false)
  const [proposedDate, setProposedDate] = useState('')
  const [proposedTime, setProposedTime] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [medications, setMedications] = useState<Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const [diagnosis, setDiagnosis] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false)
  const [medicalRecordData, setMedicalRecordData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: ''
  })

  // Fonction pour traduire les statuts
  const translateStatus = (status: string) => {
    switch (status) {
      case 'en attente':
        return 'En attente'
      case 'accepté':
        return 'Accepté'
      case 'refusé':
        return 'Refusé'
      case 'date_proposée':
        return 'Date proposée'
      case 'prévu':
        return 'Prévu'
      case 'terminé':
        return 'Terminé'
      case 'annulé':
        return 'Annulé'
      default:
        return 'En attente'
    }
  }

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en attente':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
      case 'accepté':
        return 'bg-green-500/20 border-green-500/50 text-green-300'
      case 'refusé':
        return 'bg-red-500/20 border-red-500/50 text-red-300'
      case 'date_proposée':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300'
      case 'prévu':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
      case 'terminé':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
      case 'annulé':
        return 'bg-red-500/20 border-red-500/50 text-red-300'
      default:
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
    }
  }

  // Form state (for doctors)
  const [patientId, setPatientId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [reason, setReason] = useState('')

  // Form state (for patients)
  const [doctorId, setDoctorId] = useState('')

  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      setUser(parsed)
      fetchAppointments()

      // Charger patients pour médecins et admins, médecins pour patients et admins
      if (userRoles.includes('doctor')) {
        fetchPatients()
      }
      if (userRoles.includes('patient')) {
        fetchDoctors()
      }
      if (userRoles.includes('admin')) {
        fetchPatients()
        fetchDoctors()
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(Array.isArray(data) ? data : [])
        setFilteredAppointments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les rendez-vous selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = appointments.filter((appointment) => {
      const patientName = `${appointment.patientFirstName || ''} ${appointment.patientLastName || ''}`.toLowerCase()
      const doctorName = `${appointment.doctorFirstName || ''} ${appointment.doctorLastName || ''}`.toLowerCase()
      const status = translateStatus(appointment.status).toLowerCase()
      const notes = (appointment.notes || '').toLowerCase()
      const symptoms = (appointment.symptoms || '').toLowerCase()
      const proposedDates = appointment.proposedDates?.join(' ').toLowerCase() || ''

      return patientName.includes(term) ||
        doctorName.includes(term) ||
        status.includes(term) ||
        notes.includes(term) ||
        symptoms.includes(term) ||
        proposedDates.includes(term)
    })

    setFilteredAppointments(filtered)
  }, [searchTerm, appointments])

  const fetchDoctors = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDoctors(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Déterminer les données selon le rôle
      let appointmentData: any = {
        appointmentDate: `${appointmentDate}T${appointmentTime}:00`,
        notes: reason
      };

      if (user?.role === 'doctor') {
        appointmentData.patientId = parseInt(patientId);
      } else if (user?.role === 'patient') {
        appointmentData.doctorId = parseInt(doctorId);
      } else if (user?.role === 'admin') {
        appointmentData.patientId = parseInt(patientId);
        appointmentData.doctorId = parseInt(doctorId);
      }

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        setSuccess('Rendez-vous créé avec succès !')
        setShowNewForm(false)
        setDoctorId('')
        setPatientId('')
        setAppointmentDate('')
        setAppointmentTime('')
        setReason('')
        fetchAppointments()
      } else {
        setError('Erreur lors de la création du rendez-vous')
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

  const handleAcceptAppointment = async (appointmentId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setSuccess('Rendez-vous accepté avec succès !')
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors de l\'acceptation du rendez-vous')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleRejectAppointment = async () => {
    if (!selectedAppointmentId) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointmentId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      })

      if (response.ok) {
        setSuccess('Rendez-vous refusé')
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedAppointmentId(null)
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors du refus du rendez-vous')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleProposeNewDate = async () => {
    if (!selectedAppointmentId || !proposedDate || !proposedTime) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const dateTime = new Date(`${proposedDate}T${proposedTime}`)

      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointmentId}/propose-date`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ proposedDate: dateTime.toISOString() })
      })

      if (response.ok) {
        setSuccess('Nouvelle date proposée au patient')
        setShowProposeDateModal(false)
        setProposedDate('')
        setProposedTime('')
        setSelectedAppointmentId(null)
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors de la proposition de date')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAcceptProposedDate = async (appointmentId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/accept-proposed-date`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setSuccess('Date acceptée avec succès !')
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors de l\'acceptation de la date')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCounterProposeDate = async () => {
    if (!selectedAppointmentId || !proposedDate || !proposedTime) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const dateTime = new Date(`${proposedDate}T${proposedTime}`)

      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointmentId}/counter-propose-date`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ proposedDate: dateTime.toISOString() })
      })

      if (response.ok) {
        setSuccess('Contre-proposition envoyée avec succès !')
        setShowProposeDateModal(false)
        setProposedDate('')
        setProposedTime('')
        setSelectedAppointmentId(null)
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Erreur lors de la contre-proposition')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index)
    setMedications(newMedications.length > 0 ? newMedications : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const newMedications = [...medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setMedications(newMedications)
  }

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Valider que tous les médicaments ont au moins un nom
    const validMedications = medications.filter(med => med.name.trim() !== '')
    if (validMedications.length === 0) {
      setError('Veuillez ajouter au moins un médicament')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          medications: validMedications,
          diagnosis,
          additionalNotes
        })
      })

      if (response.ok) {
        setSuccess('Ordonnance créée et envoyée au patient avec succès !')
        setShowPrescriptionModal(false)
        setShowDetailsModal(false)
        // Reset form
        setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
        setDiagnosis('')
        setAdditionalNotes('')
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création de l\'ordonnance')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCreateMedicalRecord = async () => {
    if (!selectedAppointment) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Valider qu'au moins un champ est rempli
    if (!medicalRecordData.diagnosis && !medicalRecordData.treatment && !medicalRecordData.notes) {
      setError('Veuillez remplir au moins un champ')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          patientId: selectedAppointment.patientId,
          doctorId: user.sub,
          diagnosis: medicalRecordData.diagnosis,
          treatment: medicalRecordData.treatment,
          prescription: medicalRecordData.prescription,
          notes: medicalRecordData.notes,
          consultationDate: selectedAppointment.appointmentDate,
          recordDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        setSuccess('Dossier médical créé avec succès !')
        setShowMedicalRecordModal(false)
        setShowDetailsModal(false)
        // Reset form
        setMedicalRecordData({
          diagnosis: '',
          treatment: '',
          prescription: '',
          notes: ''
        })
        fetchAppointments()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création du dossier médical')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur de réseau')
      setTimeout(() => setError(''), 3000)
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
                <p className="text-xs text-gray-300">Mes Rendez-vous</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={user.role === 'admin' ? '/admin-dashboard' : '/patient-dashboard'} className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {user.role === 'doctor' ? 'Gestion des Rendez-vous' : 'Mes Rendez-vous'}
              </h2>
              <p className="text-gray-300">Gérez vos consultations médicales</p>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Nouveau RDV
            </button>
          </div>

          {/* Onglets pour les patients */}
          {user.role === 'patient' && (
            <div className="flex gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/5'
                  }`}
              >
                <Calendar className="w-5 h-5" />
                Mes Rendez-vous ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'doctors'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/5'
                  }`}
              >
                <Stethoscope className="w-5 h-5" />
                Médecins Disponibles ({doctors.length})
              </button>
            </div>
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

        {/* Barre de recherche */}
        {activeTab === 'appointments' && appointments.length > 0 && (
          <div className="mb-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par patient, médecin, statut, symptômes..."
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
                {filteredAppointments.length} résultat{filteredAppointments.length !== 1 ? 's' : ''} trouvé{filteredAppointments.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* New Appointment Form */}
        {showNewForm && (
          <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Prendre un Rendez-vous
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {(user.role === 'doctor' || user.role === 'admin') && (
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
              )}

              {(user.role === 'patient' || user.role === 'admin') && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Médecin
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" className="bg-slate-800">Sélectionner un médecin</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id} className="bg-slate-800">
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {user.role === 'patient' ? (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-cyan-400" />
                      Décrivez vos symptômes et votre maladie
                    </span>
                  ) : (
                    'Motif de consultation'
                  )}
                </label>
                {user.role === 'patient' && (
                  <p className="text-xs text-gray-400 mb-2">
                    Soyez aussi précis que possible : type de douleur, localisation, depuis quand, intensité...
                  </p>
                )}
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={user.role === 'patient' ? 5 : 3}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={user.role === 'patient'
                    ? "Ex: Douleurs abdominales depuis 3 jours, fièvre à 38°C, maux de tête persistants, fatigue intense, difficultés à digerer..."
                    : "Décrivez brièvement le motif..."}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirmer le RDV
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

        {/* Doctors List for Patients */}
        {user.role === 'patient' && activeTab === 'doctors' && doctors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block">Médecins Disponibles</span>
                <span className="text-sm text-gray-400 font-normal">Choisissez votre médecin pour prendre rendez-vous</span>
              </div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-xs font-semibold">
                      Disponible
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h4>
                  <p className="text-sm text-cyan-400 mb-3">{doctor.specialty}</p>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>{doctor.email}</span>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-purple-400 flex items-center justify-center text-xs">📞</span>
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setDoctorId(doctor.id.toString())
                      setShowNewForm(true)
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Prendre RDV
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments List */}
        {(user.role === 'doctor' || (user.role === 'patient' && activeTab === 'appointments')) && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block">{user.role === 'doctor' ? 'Rendez-vous à gérer' : 'Mes Rendez-vous'}</span>
                <span className="text-sm text-gray-400 font-normal">
                  {appointments.filter(apt => apt.status === 'en attente').length > 0 && user.role === 'doctor'
                    ? `${appointments.filter(apt => apt.status === 'en attente').length} en attente de validation`
                    : 'Historique de vos consultations'}
                </span>
              </div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-white py-12">Chargement...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="col-span-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {searchTerm ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous'}
                  </h3>
                  <p className="text-gray-300">
                    {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Cliquez sur "Nouveau RDV" pour prendre un rendez-vous'}
                  </p>
                </div>
              ) : (
                filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      if (user.role === 'doctor') {
                        setSelectedAppointment(apt)
                        setShowDetailsModal(true)
                      }
                    }}
                    className={`group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 ${user.role === 'doctor' ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {translateStatus(apt.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {user.role === 'doctor'
                        ? `${apt.patientFirstName || 'Patient'} ${apt.patientLastName || ''}`
                        : `Dr. ${apt.doctorFirstName || 'Médecin'} ${apt.doctorLastName || ''}`
                      }
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span>{new Date(apt.appointmentDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{new Date(apt.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {apt.notes && (
                        <div className={`mt-3 p-3 rounded-xl border ${user.role === 'doctor'
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-white/5 border-white/10'
                          }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className={`w-4 h-4 ${user.role === 'doctor' ? 'text-cyan-400' : 'text-gray-400'
                              }`} />
                            <p className={`text-xs font-semibold ${user.role === 'doctor' ? 'text-cyan-300' : 'text-gray-400'
                              }`}>
                              {user.role === 'doctor' ? 'Symptômes du patient :' : 'Vos symptômes :'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{apt.notes}</p>
                        </div>
                      )}
                      {apt.rejectionReason && apt.status === 'refusé' && (
                        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400">Raison du refus:</p>
                          <p className="text-sm text-red-300">{apt.rejectionReason}</p>
                        </div>
                      )}

                      {/* Afficher la date proposée */}
                      {apt.proposedDate && apt.status === 'date_proposée' && (
                        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                          <p className="text-xs font-semibold text-purple-300 mb-2">
                            📅 Nouvelle date proposée {apt.proposedBy === 'doctor' ? 'par le médecin' : 'par le patient'} :
                          </p>
                          <div className="flex items-center gap-2 text-purple-200">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">{new Date(apt.proposedDate).toLocaleDateString('fr-FR')}</span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span className="font-semibold">{new Date(apt.proposedDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions pour médecins - Afficher uniquement pour les RDV en attente */}
                    {((user.roles && user.roles.includes('doctor')) || user.role === 'doctor') && apt.status === 'en attente' && (
                      <div className="mt-4 space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptAppointment(apt.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointmentId(apt.id)
                              setShowProposeDateModal(true)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-all"
                          >
                            <Calendar className="w-4 h-4" />
                            Proposer date
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(apt.id)
                            setShowRejectModal(true)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    )}

                    {/* Actions pour médecins - Date proposée par patient */}
                    {((user.roles && user.roles.includes('doctor')) || user.role === 'doctor') && apt.status === 'date_proposée' && apt.proposedBy === 'patient' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleAcceptProposedDate(apt.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          Accepter cette date
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(apt.id)
                            setShowProposeDateModal(true)
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Contre-proposer
                        </button>
                      </div>
                    )}

                    {/* Actions pour patients - Date proposée par médecin */}
                    {((user.roles && user.roles.includes('patient')) || user.role === 'patient') && apt.status === 'date_proposée' && apt.proposedBy === 'doctor' && (
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => handleAcceptProposedDate(apt.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          Accepter cette date
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointmentId(apt.id)
                              setShowProposeDateModal(true)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-all"
                          >
                            <Calendar className="w-4 h-4" />
                            Proposer autre date
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointmentId(apt.id)
                              setShowRejectModal(true)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de détails du rendez-vous (médecins uniquement) */}
      {showDetailsModal && selectedAppointment && user.role === 'doctor' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
                    </h3>
                    <p className="text-gray-400">Détails du rendez-vous</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedAppointment(null)
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Statut */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Statut</h4>
                <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                  {translateStatus(selectedAppointment.status)}
                </span>
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</h4>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-semibold">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Heure</h4>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-lg font-semibold">
                      {new Date(selectedAppointment.appointmentDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date proposée */}
              {selectedAppointment.proposedDate && selectedAppointment.status === 'date_proposée' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-3">
                    📅 Date proposée {selectedAppointment.proposedBy === 'doctor' ? 'par vous' : 'par le patient'}
                  </h4>
                  <div className="flex items-center gap-4 text-purple-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">
                        {new Date(selectedAppointment.proposedDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">
                        {new Date(selectedAppointment.proposedDate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptômes du patient */}
              {selectedAppointment.notes && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                      Symptômes et Motif de consultation
                    </h4>
                  </div>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Raison du refus */}
              {selectedAppointment.rejectionReason && selectedAppointment.status === 'refusé' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-red-300 uppercase tracking-wider mb-2">
                    Raison du refus
                  </h4>
                  <p className="text-red-200">{selectedAppointment.rejectionReason}</p>
                </div>
              )}

              {/* Informations complémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Créé le
                  </h4>
                  <p className="text-gray-200">
                    {new Date(selectedAppointment.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedAppointment.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Dernière mise à jour
                  </h4>
                  <p className="text-gray-200">
                    {new Date(selectedAppointment.updatedAt).toLocaleDateString('fr-FR')} à {new Date(selectedAppointment.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
              {selectedAppointment.status === 'en attente' && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleAcceptAppointment(selectedAppointment.id)
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all font-semibold"
                    >
                      <Check className="w-5 h-5" />
                      Accepter le rendez-vous
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointmentId(selectedAppointment.id)
                        setShowDetailsModal(false)
                        setShowProposeDateModal(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-all font-semibold"
                    >
                      <Calendar className="w-5 h-5" />
                      Proposer une date
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointmentId(selectedAppointment.id)
                      setShowDetailsModal(false)
                      setShowRejectModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all font-semibold"
                  >
                    <XCircle className="w-5 h-5" />
                    Refuser le rendez-vous
                  </button>
                </div>
              )}

              {selectedAppointment.status === 'date_proposée' && selectedAppointment.proposedBy === 'patient' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleAcceptProposedDate(selectedAppointment.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-all font-semibold"
                  >
                    <Check className="w-5 h-5" />
                    Accepter cette date
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppointmentId(selectedAppointment.id)
                      setShowDetailsModal(false)
                      setShowProposeDateModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-all font-semibold"
                  >
                    <Calendar className="w-5 h-5" />
                    Contre-proposer
                  </button>
                </div>
              )}

              {(selectedAppointment.status === 'accepté' || selectedAppointment.status === 'refusé' ||
                (selectedAppointment.status === 'date_proposée' && selectedAppointment.proposedBy === 'doctor')) && (
                  <div className="space-y-3">
                    {selectedAppointment.status === 'accepté' && (
                      <>
                        <button
                          onClick={() => {
                            setShowDetailsModal(false)
                            setShowMedicalRecordModal(true)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                        >
                          <User className="w-5 h-5" />
                          Créer un dossier médical
                        </button>
                        <button
                          onClick={() => {
                            setShowDetailsModal(false)
                            setShowPrescriptionModal(true)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold shadow-lg"
                        >
                          <Stethoscope className="w-5 h-5" />
                          Générer une ordonnance
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setSelectedAppointment(null)
                      }}
                      className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de proposition de date */}
      {showProposeDateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {user.role === 'doctor' ? 'Proposer une nouvelle date' : 'Proposer une autre date'}
                </h3>
                <p className="text-sm text-gray-400">
                  {user.role === 'doctor'
                    ? 'Indiquez votre disponibilité'
                    : 'Suggérez une date qui vous convient'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={user.role === 'doctor' ? handleProposeNewDate : handleCounterProposeDate}
                disabled={!proposedDate || !proposedTime}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
              >
                Proposer cette date
              </button>
              <button
                onClick={() => {
                  setShowProposeDateModal(false)
                  setProposedDate('')
                  setProposedTime('')
                  setSelectedAppointmentId(null)
                }}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de refus */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Refuser le rendez-vous</h3>
                <p className="text-sm text-gray-400">Indiquez la raison du refus</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Raison du refus
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Ex: Non disponible à cette date, Créneau déjà réservé..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectAppointment}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
              >
                Confirmer le refus
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setSelectedAppointmentId(null)
                }}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications de succès et d'erreur */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-4 rounded-xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl backdrop-blur-md flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Modal de création de dossier médical */}
      {showMedicalRecordModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Créer un dossier médical
                    </h3>
                    <p className="text-gray-400">
                      Pour {selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMedicalRecordModal(false)
                    setMedicalRecordData({
                      diagnosis: '',
                      treatment: '',
                      prescription: '',
                      notes: ''
                    })
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Diagnostic *
                </label>
                <input
                  type="text"
                  value={medicalRecordData.diagnosis}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, diagnosis: e.target.value })}
                  placeholder="Ex: Grippe saisonnière, Hypertension artérielle..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Traitement */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Traitement recommandé
                </label>
                <textarea
                  value={medicalRecordData.treatment}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, treatment: e.target.value })}
                  rows={4}
                  placeholder="Décrivez le traitement recommandé, la posologie, la durée..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Prescription */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Médicaments prescrits
                </label>
                <textarea
                  value={medicalRecordData.prescription}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, prescription: e.target.value })}
                  rows={3}
                  placeholder="Liste des médicaments prescrits..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={medicalRecordData.notes}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, notes: e.target.value })}
                  rows={5}
                  placeholder="Observations, antécédents, recommandations, suivi nécessaire..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Info importante */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium mb-1">
                      Information importante
                    </p>
                    <p className="text-xs text-blue-200">
                      Ce dossier médical sera ajouté à l'historique du patient et pourra être consulté lors des prochaines consultations. Assurez-vous d'inclure toutes les informations pertinentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
              <div className="flex gap-3">
                <button
                  onClick={handleCreateMedicalRecord}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Créer le dossier médical
                </button>
                <button
                  onClick={() => {
                    setShowMedicalRecordModal(false)
                    setMedicalRecordData({
                      diagnosis: '',
                      treatment: '',
                      prescription: '',
                      notes: ''
                    })
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'ordonnance */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Créer une ordonnance
                    </h3>
                    <p className="text-gray-400">
                      Pour {selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false)
                    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
                    setDiagnosis('')
                    setAdditionalNotes('')
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Diagnostic
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Ex: Grippe saisonnière, Infection virale..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Médicaments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Médicaments prescrits</h4>
                  <button
                    onClick={addMedication}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm font-medium"
                  >
                    <span className="text-xl">+</span>
                    Ajouter un médicament
                  </button>
                </div>

                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-700/30 border border-gray-600 rounded-xl space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-400">Médicament {index + 1}</span>
                        {medications.length > 1 && (
                          <button
                            onClick={() => removeMedication(index)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Nom du médicament *
                          </label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="Ex: Paracétamol 500mg"
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="Ex: 1 comprimé"
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Fréquence
                          </label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="Ex: 3 fois par jour"
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Durée
                          </label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="Ex: 7 jours"
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            placeholder="Ex: À prendre après les repas"
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes complémentaires */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                  placeholder="Recommandations, conseils pour le patient..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
              <div className="flex gap-3">
                <button
                  onClick={handleCreatePrescription}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Créer et envoyer l'ordonnance
                </button>
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false)
                    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
                    setDiagnosis('')
                    setAdditionalNotes('')
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                >
                  Annuler
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