'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, CheckCircle2, UserCircle2 } from 'lucide-react'

export default function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role, firstName, lastName }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.message || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      setError('Erreur de réseau. Vérifiez que le serveur backend est démarré.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Logo and Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 backdrop-blur-md bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-white"
      >
        <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-1.5 rounded-lg">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold">MediFlow AI</span>
      </Link>

      {/* Signup Form Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Créer un compte
            </h2>
            <p className="text-gray-300">
              Rejoignez MediFlow AI aujourd'hui
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  Type de compte
                </div>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              >
                <option value="patient" className="bg-slate-800">Patient</option>
                <option value="doctor" className="bg-slate-800">Médecin</option>
                <option value="hrRecruiter" className="bg-slate-800">Recruteur RH</option>
                <option value="candidate" className="bg-slate-800">Candidat</option>
              </select>
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              S'inscrire
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-300">
                Déjà inscrit ?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <p className="text-center text-gray-400 text-sm mt-6">
          En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
        </p>
      </div>

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