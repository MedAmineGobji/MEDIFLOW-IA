'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  LogOut,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  Briefcase,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  UserCheck,
  CheckCircle,
  Clock,
  XCircle,
  Bell,
  UserPlus,
  CalendarCheck,
  Phone,
  Brain,
  Shield
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#06b6d4', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    acceptedAppointments: 0,
    pendingAppointments: 0,
    rejectedAppointments: 0,
    appointmentsThisMonth: 0,
    totalMedicalRecords: 0,
    totalPrescriptions: 0,
    totalJobOffers: 0,
    activeJobOffers: 0,
    totalApplications: 0,
    usersByRole: {},
    monthlyData: [],
    topDoctors: []
  })
  const [notifications, setNotifications] = useState<any[]>([])
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

        if (userData.role !== 'admin') {
          router.push('/login')
          return
        }

        setUser(userData)

        // Fetch global stats
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats/global', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch notifications
        const notificationsResponse = await fetch('http://localhost:5000/api/admin/notifications/recent', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData)
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Chargement...</div>
      </div>
    )
  }

  // Données pour le graphique en camembert des statuts de rendez-vous
  const appointmentStatusData = [
    { name: 'Acceptés', value: stats.acceptedAppointments },
    { name: 'En attente', value: stats.pendingAppointments },
    { name: 'Refusés', value: stats.rejectedAppointments }
  ];

  // Données pour le graphique des utilisateurs par rôle
  const userRoleData = [
    { name: 'Patients', value: stats.usersByRole.patient || 0 },
    { name: 'Médecins', value: stats.usersByRole.doctor || 0 },
    { name: 'RH', value: stats.usersByRole.hrRecruiter || 0 },
    { name: 'Candidats', value: stats.usersByRole.candidate || 0 },
    { name: 'Admins', value: stats.usersByRole.admin || 0 }
  ];

  // Fonction pour obtenir l'icône selon le type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Clock className="w-5 h-5" />;
      case 'application':
        return <FileText className="w-5 h-5" />;
      case 'patient':
        return <UserPlus className="w-5 h-5" />;
      case 'doctor':
        return <Stethoscope className="w-5 h-5" />;
      case 'appointment-accepted':
        return <CalendarCheck className="w-5 h-5" />;
      case 'record':
        return <FileText className="w-5 h-5" />;
      case 'prescription':
        return <Pill className="w-5 h-5" />;
      case 'interview':
        return <Phone className="w-5 h-5" />;
      case 'analysis':
        return <Brain className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Fonction pour obtenir la couleur selon le type
  const getNotificationColor = (color: string) => {
    switch (color) {
      case 'orange':
        return 'from-orange-400 to-red-500';
      case 'blue':
        return 'from-cyan-400 to-blue-500';
      case 'green':
        return 'from-green-400 to-emerald-500';
      case 'purple':
        return 'from-purple-400 to-pink-500';
      case 'pink':
        return 'from-pink-400 to-rose-500';
      case 'cyan':
        return 'from-cyan-400 to-blue-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Fonction pour formater le temps relatif
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Il y a quelques secondes';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return time.toLocaleDateString('fr-FR');
  };

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

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-400 mt-2">Bienvenue, {user?.email || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/users-management"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Shield className="w-5 h-5" />
              Gestion Utilisateurs
            </Link>
            <Link
              href="/admin-dashboard"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Statistiques
            </Link>
            <button
              onClick={handleLogout}
              className="p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-400 border border-red-500/30"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/users-management" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all hover:scale-105 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Gestion Rôles</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {(stats.usersByRole.admin || 0) + (stats.usersByRole.patient || 0) + (stats.usersByRole.doctor || 0) + (stats.usersByRole.hrRecruiter || 0) + (stats.usersByRole.candidate || 0)}
            </p>
            <p className="text-sm text-gray-400 mt-2">Utilisateurs totaux</p>
          </Link>

          <Link href="/patients" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Patients</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {stats.totalPatients}
            </p>
          </Link>

          <Link href="/doctors" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Médecins</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {stats.totalDoctors}
            </p>
          </Link>

          <Link href="/appointments" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Rendez-vous</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {stats.totalAppointments}
            </p>
            <p className="text-sm text-gray-400 mt-2">{stats.appointmentsThisMonth} ce mois</p>
          </Link>

          <Link href="/medical-records" className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Dossiers</h3>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stats.totalMedicalRecords}
            </p>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Appointments Line Chart */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Évolution des Rendez-vous</h3>
                <p className="text-gray-400">12 derniers mois</p>
              </div>
            </div>
            {stats.monthlyData && stats.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
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
                  <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} name="Rendez-vous" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Pas de données</div>
            )}
          </div>

          {/* Notifications Récentes */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Notifications Récentes</h3>
                <p className="text-gray-400">Activité récente</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-br ${getNotificationColor(notification.color)} rounded-xl flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{notification.title}</p>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">{getRelativeTime(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">Aucune notification récente</p>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <PieChartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Statuts des Rendez-vous</h3>
                <p className="text-gray-400">Distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
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
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #06b6d4',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Roles */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Utilisateurs par Rôle</h3>
                <p className="text-gray-400">Répartition</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #06b6d4',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" name="Nombre" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Doctors */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Top 5 Médecins</h3>
                <p className="text-gray-400">Par nombre de rendez-vous</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.topDoctors && stats.topDoctors.length > 0 ? (
                stats.topDoctors.map((doctor: any, index: number) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{doctor.specialty || 'Médecin'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">{doctor.count}</p>
                        <p className="text-xs text-gray-400">rendez-vous</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Autres Statistiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-5 h-5 text-purple-400" />
                <p className="text-gray-400 text-sm">Prescriptions</p>
              </div>
              <p className="text-3xl font-bold text-purple-400">{stats.totalPrescriptions}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <p className="text-gray-400 text-sm">Offres d'emploi</p>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{stats.totalJobOffers}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeJobOffers} actives</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <p className="text-gray-400 text-sm">Candidatures</p>
              </div>
              <p className="text-3xl font-bold text-orange-400">{stats.totalApplications}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">Taux d'acceptation</p>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {stats.totalAppointments > 0
                  ? Math.round((stats.acceptedAppointments / stats.totalAppointments) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/patients" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center">
            <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-white font-medium">Gérer Patients</p>
          </Link>

          <Link href="/doctors" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center">
            <Stethoscope className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Gérer Médecins</p>
          </Link>

          <Link href="/appointments" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center">
            <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-white font-medium">Rendez-vous</p>
          </Link>

          <Link href="/job-offers" className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-center">
            <Briefcase className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-medium">Recrutement</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
