'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  ArrowLeft, 
  LogOut, 
  Bell, 
  Save, 
  CheckCircle, 
  X, 
  Edit2, 
  Search, 
  Plus, 
  Trash2, 
  ChevronRight,
  Heart,
  User,
  Briefcase,
  Shield
} from 'lucide-react'

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialty: string
}

export default function DoctorsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          router.push('/login')
          return
        }
        
        const userData = await response.json()
        
        if (userData.role !== 'admin') {
          router.push('/login')
          return
        }
        
        setUser(userData)
        
        // Fetch doctors
        const doctorsResponse = await fetch('http://localhost:5000/api/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json()
          setDoctors(doctorsData)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const fillForm = (doctor: Doctor) => {
    setFirstName(doctor.firstName || '')
    setLastName(doctor.lastName || '')
    setEmail(doctor.email || '')
    setPhone(doctor.phone || '')
    setSpecialty(doctor.specialty || '')
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setSpecialty('')
    setPassword('')
  }

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token || !selectedDoctor) return

    try {
      const body: any = {
        firstName,
        lastName,
        email,
        phone,
        specialty
      }
      
      // Only include password if it's not empty
      if (password) {
        body.password = password
      }

      const response = await fetch(`http://localhost:5000/api/doctors/${selectedDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const updated = await response.json()
        setSuccess('Médecin mis à jour avec succès !')
        setEditMode(false)
        setPassword('') // Clear password field after successful update
        setDoctors(doctors.map(d => d.id === updated.id ? updated : d))
        setSelectedDoctor(updated)
        fillForm(updated)
      } else {
        setError('Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
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
          specialty,
          password
        })
      })

      if (response.ok) {
        const newDoctor = await response.json()
        setSuccess('Médecin créé avec succès !')
        setShowAddForm(false)
        setEditMode(false)
        setDoctors([...doctors, newDoctor])
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la création')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const deleteDoctor = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setDoctors(doctors.filter(d => d.id !== id))
        if (selectedDoctor?.id === id) {
          setSelectedDoctor(null)
          resetForm()
        }
        setSuccess('Médecin supprimé avec succès')
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  const filteredDoctors = doctors.filter(d =>
    d.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Chargement...</div>
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
                  Gestion des Médecins
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/admin-dashboard" className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <button className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <Bell className="w-5 h-5 text-gray-300" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{user?.email}</span>
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

        {/* LIST VIEW */}
        {!selectedDoctor && !showAddForm && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Liste des Médecins
                </h2>
                <p className="text-gray-300">Gérez les médecins de la plateforme ({filteredDoctors.length})</p>
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
                  <span className="hidden sm:inline">Ajouter un Médecin</span>
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
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDoctor(doctor.id)
                        }}
                        className="p-2 bg-red-500/10 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor)
                          fillForm(doctor)
                          setEditMode(false)
                        }}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/20 transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Dr. {doctor.firstName} {doctor.lastName}</h3>
                  <p className="text-sm text-cyan-300 mb-4">{doctor.specialty || 'Médecin généraliste'}</p>

                  <div className="space-y-2 text-sm text-gray-300 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span>{doctor.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* DETAIL/EDIT/ADD VIEW */}
        {(selectedDoctor || showAddForm) && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedDoctor(null)
                    setShowAddForm(false)
                    setEditMode(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {showAddForm ? 'Nouveau Médecin' : `Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`}
                  </h2>
                  <p className="text-gray-300">
                    {showAddForm ? 'Ajouter un nouveau médecin à la plateforme' : 'Consultation et modification du dossier médecin'}
                  </p>
                </div>
              </div>

              {!editMode && !showAddForm && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                  Modifier
                </button>
              )}
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-200">
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

            <form onSubmit={showAddForm ? handleCreateDoctor : handleUpdateDoctor} className="space-y-6">
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
                      required
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
                      required
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
                      required
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
                </div>
              </div>

              {/* Professional Information */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Informations Professionnelles
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    disabled={!editMode}
                    placeholder="Ex: Cardiologie, Pédiatrie, Médecine générale..."
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white disabled:opacity-60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                        ? "Le médecin utilisera ce mot de passe pour se connecter" 
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
                        if (selectedDoctor) {
                          fillForm(selectedDoctor)
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