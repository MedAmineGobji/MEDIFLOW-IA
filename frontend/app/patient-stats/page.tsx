'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Calendar, FileText, ClipboardList, ArrowLeft, LogOut, TrendingUp, Activity, BarChart3, PieChart, Clock, CheckCircle, AlertCircle, User, Stethoscope, Pill, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

const COLORS = ['#06b6d4', '#0ea5e9', '#06b6d4', '#06b6d4'];
const CHART_COLORS = {
  total: '#06b6d4',
  accepted: '#10b981',
  pending: '#f97316'
};

export default function PatientStatsPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    totalAppointments: 0,
    pastAppointments: 0,
    upcomingAppointments: 0,
    acceptedAppointments: 0,
    pendingAppointments: 0,
    medicalRecords: 0,
    prescriptions: 0,
    uniqueDoctors: 0,
    nextAppointment: null,
    monthlyChartData: [],
    appointmentTrendData: [],
    diagnoses: [],
    recentMedicalRecords: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
        setUser(userData)
        
        // Fetch patient stats - L'ID vient du token, pas de l'URL
        const statsResponse = await fetch(`http://localhost:5000/api/patients/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          console.error('Failed to fetch stats:', statsResponse.status)
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/patient-dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-cyan-400" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Statistiques de Santé
              </h1>
              <p className="text-gray-400">Bienvenue, {user?.email || 'Patient'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-400 border border-red-500/30"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* KPI Cards - 4 Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Total Rendez-vous</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {stats.totalAppointments || 0}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Acceptés</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {stats.acceptedAppointments || 0}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">En attente</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {stats.pendingAppointments || 0}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">À Venir</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.upcomingAppointments || 0}
            </p>
          </div>
        </div>

        {/* Charts Section - 12 Month Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Monthly Trend */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Tendance Mensuelle</h3>
                <p className="text-gray-400">12 derniers mois</p>
              </div>
            </div>
            {stats.monthlyChartData && stats.monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid #06b6d4',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">Pas de données disponibles</div>
            )}
          </div>

          {/* Pie Chart - Status Distribution */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">État des Rendez-vous</h3>
                <p className="text-gray-400">Distribution des statuts</p>
              </div>
            </div>
            {stats.appointmentTrendData && stats.appointmentTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Acceptés', value: stats.acceptedAppointments },
                      { name: 'En attente', value: stats.pendingAppointments },
                      { name: 'Autres', value: Math.max(0, stats.totalAppointments - stats.acceptedAppointments - stats.pendingAppointments) }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f97316" />
                    <Cell fill="#06b6d4" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid #06b6d4',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">Pas de données disponibles</div>
            )}
          </div>
        </div>

        {/* Composed Chart - Trend Analysis */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Analyse des Tendances</h3>
              <p className="text-gray-400">Total vs Acceptés vs En attente</p>
            </div>
          </div>
          {stats.appointmentTrendData && stats.appointmentTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={stats.appointmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #06b6d4',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#06b6d4" name="Total" />
                <Bar dataKey="accepted" fill="#10b981" name="Acceptés" />
                <Bar dataKey="pending" fill="#f97316" name="En attente" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-400 flex items-center justify-center text-gray-400">Pas de données disponibles</div>
          )}
        </div>

        {/* Diagnostics Section */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Diagnostics et Maladies</h3>
              <p className="text-gray-400">Historique médical</p>
            </div>
          </div>
          {stats.diagnoses && stats.diagnoses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.diagnoses.map((diagnosis: any, index: number) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Pill className="w-5 h-5 text-red-400" />
                    <h4 className="text-white font-semibold">{diagnosis.name}</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{diagnosis.count} cas enregistré{diagnosis.count > 1 ? 's' : ''}</p>
                  {diagnosis.lastDate && (
                    <p className="text-xs text-cyan-400">Dernière date: {new Date(diagnosis.lastDate).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <Stethoscope className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun diagnostic enregistré</p>
            </div>
          )}
        </div>

        {/* Recent Medical Records */}
        {stats.recentMedicalRecords && stats.recentMedicalRecords.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Dossiers Récents</h3>
                <p className="text-gray-400">Dernières consultations</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.recentMedicalRecords.map((record: any, index: number) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{record.recordType || 'Consultation'}</h4>
                      <p className="text-sm text-gray-400 mb-2">{record.notes || 'Aucune note'}</p>
                      <p className="text-xs text-cyan-400">📅 {new Date(record.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Résumé Général</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Médecins Consultés</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.uniqueDoctors || 0}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Dossiers Médicaux</p>
              <p className="text-2xl font-bold text-green-400">{stats.medicalRecords || 0}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Prescriptions</p>
              <p className="text-2xl font-bold text-purple-400">{stats.prescriptions || 0}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Taux Confirmation</p>
              <p className="text-2xl font-bold text-orange-400">
                {stats.totalAppointments > 0 ? Math.round((stats.acceptedAppointments / stats.totalAppointments) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
