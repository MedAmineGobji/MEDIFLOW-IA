'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/useAuth'
import Link from 'next/link'
import RoleGuard from '../../lib/RoleGuard'
import { Heart, Users, Calendar, Stethoscope, FileText, ArrowRight, Bell, Settings, Home, LogOut, TrendingUp, Activity, Shield } from 'lucide-react'

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalDoctors: 0,
    totalRecords: 0,
  })

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        // Récupérer le nombre total de patients
        const patientsRes = await fetch('http://localhost:5000/api/patients', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const patients = await patientsRes.json()

        // Récupérer le nombre total de médecins
        const doctorsRes = await fetch('http://localhost:5000/api/doctors', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const doctors = await doctorsRes.json()

        // Récupérer les rendez-vous d'aujourd'hui
        const appointmentsRes = await fetch('http://localhost:5000/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const appointments = await appointmentsRes.json()
        const today = new Date().toISOString().split('T')[0]
        const todayAppointments = appointments.filter((apt: any) =>
          apt.appointmentDate.startsWith(today)
        )

        // Récupérer le nombre total de dossiers médicaux
        const recordsRes = await fetch('http://localhost:5000/api/medical-records', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const records = await recordsRes.json()

        setStats({
          totalPatients: Array.isArray(patients) ? patients.length : 0,
          todayAppointments: todayAppointments.length,
          totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
          totalRecords: Array.isArray(records) ? records.length : 0,
        })
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      }
    }

    fetchStats()
  }, [user])

  return (
    <RoleGuard allowed={['admin']}>
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
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      MediFlow AI
                    </h1>
                    <p className="text-xs text-gray-300">Admin Dashboard</p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin-dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="hidden sm:inline">Statistiques</span>
                </Link>
                <button className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                  <Bell className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-200">{user?.email}</span>
                </div>
                <button
                  onClick={logout}
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Tableau de Bord Administrateur
            </h2>
            <p className="text-gray-300">Vue d'ensemble de votre clinique</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">Total Patients</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {stats.totalPatients}
              </p>
              <p className="text-xs text-gray-400 mt-2">+12% ce mois</p>
            </div>

            <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">RDV Aujourd'hui</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stats.todayAppointments}
              </p>
              <p className="text-xs text-gray-400 mt-2">8 confirmés</p>
            </div>

            <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">Médecins Actifs</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stats.totalDoctors}
              </p>
              <p className="text-xs text-gray-400 mt-2">Tous disponibles</p>
            </div>

            <div className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">Dossiers Médicaux</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {stats.totalRecords}
              </p>
              <p className="text-xs text-gray-400 mt-2">5 mis à jour</p>
            </div>
          </div>

          {/* Actions and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actions Rapides */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-cyan-400" />
                Actions Rapides
              </h3>
              <div className="space-y-3">
                <Link
                  href="/patients"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/30 rounded-xl">
                      <Users className="w-5 h-5 text-cyan-300" />
                    </div>
                    <span className="text-white font-medium">Gérer les Patients</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/doctors"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/30 rounded-xl">
                      <Stethoscope className="w-5 h-5 text-green-300" />
                    </div>
                    <span className="text-white font-medium">Gérer les Médecins</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/appointments"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/30 rounded-xl">
                      <Calendar className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-white font-medium">Planifier Rendez-vous</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/medical-records"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/30 rounded-xl">
                      <FileText className="w-5 h-5 text-orange-300" />
                    </div>
                    <span className="text-white font-medium">Accéder Dossiers Médicaux</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/users-management"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/30 rounded-xl">
                      <Shield className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-white font-medium">Gestion des Rôles</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Notifications Récentes
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Nouveau patient inscrit</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 5 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Rendez-vous annulé</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 12 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">CV analysé avec succès</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 1 heure</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Rapport mensuel généré</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
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
    </RoleGuard>
  )
}