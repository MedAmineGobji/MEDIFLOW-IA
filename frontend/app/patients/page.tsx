'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, User, Mail, Phone, Calendar, MapPin, Shield, ArrowLeft, LogOut, Bell, Save, CheckCircle, X, Edit2, Search, Plus, Trash2, ChevronRight } from 'lucide-react'

export default function PatientsPage() {
  const [user, setUser] = useState<any>(null)

  // State for Patient Role (My Profile)
  const [patientData, setPatientData] = useState<any>(null)

  // State for Doctor/Admin Role (Patients List)
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Form fields (Reusable)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [allergies, setAllergies] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      setUser(parsed)

      if (userRoles.includes('patient') && !userRoles.includes('admin') && !userRoles.includes('doctor')) {
        fetchPatientProfile()
      } else {
        fetchPatientsList()
      }
    } else {
      router.push('/login')
    }
  }, [router])

  // Fetch single profile (Patient role)
  const fetchPatientProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/patients/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPatientData(data)
        fillForm(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all patients (Doctor/Admin role)
  const fetchPatientsList = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPatientsList(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fillForm = (data: any) => {
    setFirstName(data.firstName || '')
    setLastName(data.lastName || '')
    setEmail(data.email || '')
    setPhone(data.phone || '')
    setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '')
    setAddress(data.address || '')
    setBloodGroup(data.bloodGroup || '')
    setAllergies(data.allergies || '')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Endpoint diffèere selon si c'est le patient lui-même ou un admin modifiant un patient
      const url = user.role === 'patient'
        ? 'http://localhost:5000/api/patients/profile'
        : `http://localhost:5000/api/patients/${selectedPatient.id}`

      const method = 'PUT'

      const body: any = {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        bloodGroup,
        allergies
      }
      
      // Only include password if it's not empty
      if (password) {
        body.password = password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setSuccess('Profil mis à jour avec succès !')
        setEditMode(false)
        setPassword('') // Clear password field after successful update
        if (user.role === 'patient') {
          fetchPatientProfile()
        } else {
          fetchPatientsList()
          // Update selected patient view
          const updated = await response.json()
          setSelectedPatient(updated)
        }
      } else {
        setError('Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setDateOfBirth('')
    setAddress('')
    setBloodGroup('')
    setAllergies('')
    setPassword('')
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          address,
          bloodGroup,
          allergies,
          password
        })
      })

      if (response.ok) {
        setSuccess('Patient créé avec succès !')
        setShowAddForm(false)
        setEditMode(false)
        fetchPatientsList()
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const handleDeletePatient = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setPatientsList(patientsList.filter(p => p.id !== id))
        if (selectedPatient?.id === id) {
          setSelectedPatient(null)
          resetForm()
        }
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const filteredPatients = patientsList.filter(p =>
    p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  {user.role === 'patient' ? 'Mon Profil' : 'Gestion des Patients'}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={user.role === 'patient' ? "/patient-dashboard" : "/doctor-dashboard"} className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
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

        {/* DOCTOR/ADMIN VIEW: LIST OF PATIENTS */}
        {user.role !== 'patient' && !selectedPatient && !showAddForm && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Liste des Patients
                </h2>
                <p className="text-gray-300">Gérez les dossiers patients ({filteredPatients.length})</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowAddForm(true)
                    resetForm()
                    setEditMode(true)
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nouveau Patient</span>
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map(patient => (
                <div key={patient.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePatient(patient.id)
                        }}
                        className="p-2 bg-red-500/10 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient)
                          fillForm(patient)
                          setEditMode(false)
                        }}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/20 transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{patient.firstName} {patient.lastName}</h3>
                  <p className="text-sm text-gray-400 mb-4">{patient.email}</p>

                  <div className="space-y-2 text-sm text-gray-300 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>{patient.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PATIENT PROFILE VIEW (Or Selected Patient Detail View OR Add Form) */}
        {(user.role === 'patient' || selectedPatient || showAddForm) && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(selectedPatient || showAddForm) && (
                  <button
                    onClick={() => {
                      setSelectedPatient(null)
                      setShowAddForm(false)
                      setError('')
                      setSuccess('')
                    }}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {showAddForm ? 'Nouveau Patient' : selectedPatient ? `Dossier: ${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Mon Profil'}
                  </h2>
                  <p className="text-gray-300">
                    {showAddForm ? 'Ajouter un nouveau patient au système' : selectedPatient ? 'Consultation et modification du dossier patient' : 'Gérez vos informations personnelles'}
                  </p>
                </div>
              </div>

              {!editMode && !showAddForm && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Edit2 className="w-5 h-5" />
                  Modifier
                </button>
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

            {loading ? (
              <div className="text-center text-white py-12">Chargement...</div>
            ) : (
              <form onSubmit={showAddForm ? handleCreatePatient : handleUpdateProfile} className="space-y-6">
                {/* Personal Information */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Date de naissance</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Groupe sanguin</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="" className="bg-slate-800">Sélectionner</option>
                        <option value="A+" className="bg-slate-800">A+</option>
                        <option value="A-" className="bg-slate-800">A-</option>
                        <option value="B+" className="bg-slate-800">B+</option>
                        <option value="B-" className="bg-slate-800">B-</option>
                        <option value="AB+" className="bg-slate-800">AB+</option>
                        <option value="AB-" className="bg-slate-800">AB-</option>
                        <option value="O+" className="bg-slate-800">O+</option>
                        <option value="O-" className="bg-slate-800">O-</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Informations Médicales
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Allergies</label>
                    <textarea
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      disabled={!editMode}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Mentionnez vos allergies éventuelles..."
                    />
                  </div>
                </div>

                {/* Password Section - Show only for admins when creating or editing */}
                {editMode && user?.role === 'admin' && (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      Sécurité
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Mot de passe</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={showAddForm}
                        placeholder={showAddForm ? "Entrez un mot de passe sécurisé" : "Laissez vide pour ne pas modifier le mot de passe"}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {showAddForm 
                          ? "Le patient utilisera ce mot de passe pour se connecter" 
                          : "Entrez un nouveau mot de passe pour le modifier (optionnel)"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {editMode && (
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Enregistrer
                    </button>
                    <button
                      type="button"
                        onClick={() => {
                          if (showAddForm) {
                            setShowAddForm(false)
                          } else {
                            setEditMode(false)
                            // Reload data
                            if (selectedPatient) {
                              fillForm(selectedPatient)
                            } else {
                              fetchPatientProfile()
                            }
                          }
                        }}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        )}
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