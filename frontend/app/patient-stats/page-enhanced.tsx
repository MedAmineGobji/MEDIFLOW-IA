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

export default function PatientStatsPageEnhanced() {
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
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      const userRoles = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 
        ? parsed.roles 
        : [parsed.role];
      
      if (userRoles.includes('patient')) {
        setUser(parsed)
        fetchPatientStats()
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchPatientStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/patients/stats/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Chargement...</div>
    </div>
  }

  const appointmentStatusData = [
    { name: 'Acceptés', value: stats.acceptedAppointments, color: '#10b981' },
    { name: 'En attente', value: stats.pendingAppointments, color: '#f97316' },
    { name: 'Autres', value: stats.totalAppointments - stats.acceptedAppointments - stats.pendingAppointments, color: '#6366f1' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-cyan-500/50 rounded-lg p-2 text-white text-sm">
          <p>{`${payload[0].payload.month}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/patient-dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Tableau de Bord Complet</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/patient-dashboard" className="p-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 backdrop-blur-md bg-white/10 rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-200">Patient {user.email}</span>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white">Vos Statistiques de Santé</h2>
          </div>
          <p className="text-gray-300 ml-11">Analyse complète et en temps réel de votre suivi médical</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Rendez-vous Totaux</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.totalAppointments}</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Acceptés</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.acceptedAppointments}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">À Venir</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{stats.upcomingAppointments}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Trend */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tendance Annuelle</h3>
                <p className="text-sm text-gray-400">Évolution sur 12 mois</p>
              </div>
            </div>
            {stats.monthlyChartData && stats.monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Rendez-vous"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucune donnée disponible
              </div>
            )}
          </div>

          {/* Pie Chart - Status Distribution */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Répartition des RDV</h3>
                <p className="text-sm text-gray-400">État des rendez-vous</p>
              </div>
            </div>
            {stats.totalAppointments > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={appointmentStatusData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Analyse de Tendance</h3>
              <p className="text-sm text-gray-400">Comparaison des statuts par mois</p>
            </div>
          </div>
          {stats.appointmentTrendData && stats.appointmentTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={stats.appointmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total" fill="#06b6d4" name="Total" />
                <Bar dataKey="accepted" fill="#10b981" name="Acceptés" />
                <Bar dataKey="pending" fill="#f97316" name="En attente" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Diagnostics Section */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Vos Diagnostics</h3>
              <p className="text-gray-400">Historique complet des maladies traitées</p>
            </div>
          </div>

          {stats.diagnoses && stats.diagnoses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.diagnoses.map((diagnosis: any, index: number) => (
                <div key={index} className="group p-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl hover:from-red-500/20 hover:to-pink-500/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg mt-1">
                      <Pill className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{diagnosis.name}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">{diagnosis.count} traitement{diagnosis.count > 1 ? 's' : ''}</p>
                        <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300">
                          Traité
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Dernière: {new Date(diagnosis.lastDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
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
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Dossiers Récents</h3>
                <p className="text-gray-400">Vos 10 derniers dossiers médicaux</p>
              </div>
            </div>

            <div className="space-y-3">
              {stats.recentMedicalRecords.map((record: any, index: number) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{record.recordType || 'Consultation générale'}</h4>
                        <p className="text-sm text-gray-400 mt-1">{record.notes || 'Aucune note'}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          📅 {new Date(record.createdAt).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300">
                        Archivé
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Médecins Consultés</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.uniqueDoctors}</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Dossiers Médicaux</p>
            <p className="text-2xl font-bold text-green-400">{stats.medicalRecords}</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Prescriptions</p>
            <p className="text-2xl font-bold text-purple-400">{stats.prescriptions}</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Taux de Confirmation</p>
            <p className="text-2xl font-bold text-orange-400">
              {stats.totalAppointments > 0 ? Math.round((stats.acceptedAppointments / stats.totalAppointments) * 100) : 0}%
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}