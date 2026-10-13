'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Lock, Sparkles, ArrowRight, AlertCircle, UserCircle2, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({ 
          role: data.role, 
          roles: data.roles || [data.role],
          email: data.email,
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName
        }))

        // Si l'utilisateur a plusieurs rôles, rediriger vers la page de sélection
        const userRoles = data.roles && Array.isArray(data.roles) && data.roles.length > 1 
          ? data.roles 
          : [data.role];

        if (userRoles.length > 1) {
          router.push('/role-selection')
          return
        }

        // Redirection selon le rôle unique
        switch (data.role) {
          case 'admin':
            router.push('/dashboard')
            break
          case 'doctor':
            router.push('/doctor-dashboard')
            break
          case 'patient':
            router.push('/patient-dashboard')
            break
          case 'hrRecruiter':
            router.push('/hr-dashboard')
            break
          case 'candidate':
            router.push('/candidate-dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        setError(data.message || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Erreur de réseau. Vérifiez que le serveur backend est démarré.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Floating Hearts */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <Heart className="w-8 h-8 text-cyan-300 opacity-60" />
        </div>
        <div className="absolute top-40 right-20 animate-float-medium">
          <Heart className="w-6 h-6 text-purple-300 opacity-50" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float-fast">
          <Heart className="w-5 h-5 text-pink-400 opacity-40" />
        </div>

        {/* Medical Crosses */}
        <div className="absolute top-60 left-1/4 animate-spin-slow">
          <div className="w-6 h-6 border-2 border-cyan-400 rounded-sm opacity-30"></div>
        </div>
        <div className="absolute bottom-40 right-1/3 animate-float-medium">
          <div className="w-4 h-4 border-2 border-purple-400 rounded-sm opacity-40"></div>
        </div>

        {/* Pills/Capsules */}
        <div className="absolute top-32 right-10 animate-float-slow">
          <div className="w-3 h-6 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full opacity-50"></div>
        </div>
        <div className="absolute bottom-20 left-1/3 animate-float-fast">
          <div className="w-4 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-40"></div>
        </div>
        <div className="absolute top-80 left-2/3 animate-float-medium">
          <div className="w-2 h-5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full opacity-45"></div>
        </div>

        {/* DNA/Helix */}
        <div className="absolute bottom-60 right-10 animate-spin-very-slow">
          <div className="relative">
            <div className="w-1 h-8 bg-cyan-300 rounded-full opacity-30"></div>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full opacity-40"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-400 rounded-full opacity-40"></div>
          </div>
        </div>

        {/* Stethoscope */}
        <div className="absolute top-1/2 left-10 animate-float-medium">
          <div className="relative">
            <div className="w-6 h-3 bg-cyan-400 rounded-full opacity-25"></div>
            <div className="absolute -right-2 top-1 w-2 h-2 bg-purple-500 rounded-full opacity-30"></div>
          </div>
        </div>

        {/* Syringe */}
        <div className="absolute top-20 right-1/3 animate-float-slow">
          <div className="relative">
            <div className="w-1 h-6 bg-purple-300 rounded opacity-35"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded opacity-40"></div>
          </div>
        </div>

        {/* Medical Icons */}
        <div className="absolute bottom-32 right-20 animate-pulse-slow">
          <div className="w-8 h-8 border-2 border-cyan-400 rounded-full flex items-center justify-center opacity-30">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/2 animate-float-fast">
          <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-float-medium">
          <div className="w-1 h-1 bg-purple-400 rounded-full opacity-40"></div>
        </div>
        <div className="absolute top-3/4 left-1/5 animate-float-slow">
          <div className="w-1 h-1 bg-pink-400 rounded-full opacity-45"></div>
        </div>
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

      {/* Login Form Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Bon retour !
            </h2>
            <p className="text-gray-300">
              Connectez-vous à votre compte MediFlow AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
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

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 mt-6"
            >
              <Sparkles className="w-5 h-5" />
              Se connecter
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Signup Link */}
            <div className="text-center pt-4">
              <p className="text-gray-300">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  S'inscrire gratuitement
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Connexion sécurisée avec chiffrement SSL
          </p>
          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
            <a href="#" className="hover:text-cyan-400 transition-colors">Confidentialité</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Conditions</a>
            <span>•</span>
            <a href="#" className="hover:text-cyan-400 transition-colors">Aide</a>
          </div>
        </div>
      </div>
    </div>
  )
}