'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, LogOut, Bell, User, Mail, Search, Edit2, Trash2, CheckCircle, X, Shield, UsersIcon } from 'lucide-react'

export default function UsersManagement() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (!userData || !token) {
        router.push('/login')
        return
      }

      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      if (!userRoles.includes('admin')) {
        router.push('/login')
        return
      }

      setUser(parsed)
      fetchUsers()
    }

    checkAuth()
  }, [router])

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (selectedUser: any) => {
    setEditingUser(selectedUser)
    // Initialize with existing roles
    const currentRoles = selectedUser.roles && Array.isArray(selectedUser.roles) && selectedUser.roles.length > 0
      ? selectedUser.roles 
      : [selectedUser.role]
    setSelectedRoles(currentRoles)
    setShowEditModal(true)
    setError('')
    setSuccess('')
  }

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const handleUpdateRole = async () => {
    if (!editingUser || selectedRoles.length === 0) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: selectedRoles })
      })

      if (response.ok) {
        setSuccess('Rôle(s) modifié(s) avec succès !')
        setShowEditModal(false)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      setError('Erreur de réseau')
    }
  }

  // Get available secondary roles based on primary role
  const getAvailableSecondaryRoles = (primaryRole: string) => {
    if (primaryRole === 'doctor') {
      return [{ value: 'hrRecruiter', label: 'RH Recruteur', color: 'from-orange-400 to-red-500' }]
    } else if (primaryRole === 'patient') {
      return [{ value: 'candidate', label: 'Candidat', color: 'from-yellow-400 to-amber-500' }]
    }
    return []
  }



  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setSuccess('Utilisateur supprimé avec succès')
        fetchUsers()
      } else {
        setError('Erreur lors de la suppression')
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

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-purple-400 to-pink-500'
      case 'doctor': return 'from-green-400 to-emerald-500'
      case 'patient': return 'from-cyan-400 to-blue-500'
      case 'hrRecruiter': return 'from-orange-400 to-red-500'
      case 'candidate': return 'from-yellow-400 to-amber-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur'
      case 'doctor': return 'Médecin'
      case 'patient': return 'Patient'
      case 'hrRecruiter': return 'RH Recruteur'
      case 'candidate': return 'Candidat'
      default: return role
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-2xl">Chargement...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

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
                <p className="text-xs text-gray-300">Gestion des Utilisateurs</p>
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
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Gestion des Utilisateurs
          </h2>
          <p className="text-gray-300">Gérez les rôles et permissions de tous les utilisateurs</p>
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date création</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium">ID: {u.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleBadgeColor(u.role)} text-white`}>
                          {getRoleLabel(u.role)}
                        </span>
                        {u.roles && Array.isArray(u.roles) && u.roles.length > 1 && (
                          u.roles.filter((r: string) => r !== u.role).map((role: string) => (
                            <span
                              key={role}
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleBadgeColor(role)} text-white`}
                            >
                              {getRoleLabel(role)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {(u.role === 'doctor' || u.role === 'patient') && (
                          <button
                            onClick={() => handleEditRole(u)}
                            className="p-2 bg-cyan-500/10 rounded-xl hover:bg-cyan-500/20 text-cyan-400 transition-all"
                            title="Ajouter un rôle secondaire"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 bg-red-500/10 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Role Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-slate-900/90 border border-white/20 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Gérer les Rôles</h3>
                <p className="text-gray-400">{editingUser.email}</p>
              </div>
            </div>

            <div className="mb-6">
              {/* Primary Role (read-only) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Rôle Principal
                </label>
                <div className="p-3 bg-white/5 border border-white/20 rounded-xl">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleBadgeColor(editingUser.role)} text-white`}>
                    {getRoleLabel(editingUser.role)}
                  </span>
                </div>
              </div>

              {/* Secondary Roles */}
              {getAvailableSecondaryRoles(editingUser.role).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Rôle Secondaire (optionnel)
                  </label>
                  <div className="space-y-2">
                    {getAvailableSecondaryRoles(editingUser.role).map((role) => (
                      <div
                        key={role.value}
                        onClick={() => toggleRole(role.value)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedRoles.includes(role.value)
                            ? 'bg-gradient-to-r ' + role.color + ' bg-opacity-20 border-2 border-white/40'
                            : 'bg-white/5 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedRoles.includes(role.value)
                            ? 'bg-white border-white'
                            : 'border-white/40'
                        }`}>
                          {selectedRoles.includes(role.value) && (
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <span className="text-white font-medium">{role.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {editingUser.role === 'doctor' 
                      ? 'Ajoutez le rôle RH Recruteur pour permettre au médecin de gérer les recrutements'
                      : 'Ajoutez le rôle Candidat pour permettre au patient de postuler aux offres d\'emploi'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateRole}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmer
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
