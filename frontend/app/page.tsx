'use client'

import Link from 'next/link'
import { Heart, Calendar, Users, FileText, Briefcase, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'

export default function Home() {
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
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MediFlow AI
                </h1>
                <p className="text-xs text-gray-300">Powered by Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/signup" 
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                S'inscrire
              </Link>
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-6 py-2.5 backdrop-blur-md bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">Intelligence Artificielle Intégrée</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Révolutionnez
            </span>
            <br />
            <span className="text-white">votre gestion médicale</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            MediFlow AI combine puissance de l'IA et simplicité d'utilisation pour transformer votre clinique en une organisation ultra-moderne
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features"
              className="px-8 py-4 backdrop-blur-md bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
          {[
            { label: 'Cliniques', value: '500+' },
            { label: 'Patients', value: '100K+' },
            { label: 'Rendez-vous/jour', value: '5K+' },
            { label: 'Satisfaction', value: '99%' }
          ].map((stat, i) => (
            <div key={i} className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tout ce dont vous avez besoin
          </h3>
          <p className="text-xl text-gray-300">
            Une plateforme complète pour gérer votre clinique efficacement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Gestion Patients',
              description: 'Centralisez tous les dossiers patients avec un accès instantané et sécurisé',
              color: 'from-cyan-400 to-blue-500',
              link: '/patients'
            },
            {
              icon: Calendar,
              title: 'Rendez-vous Intelligents',
              description: 'Planification automatisée avec rappels et gestion des disponibilités',
              color: 'from-purple-400 to-pink-500',
              link: '/appointments'
            },
            {
              icon: FileText,
              title: 'Dossiers Médicaux',
              description: 'Historique complet avec analyses IA et recommandations personnalisées',
              color: 'from-green-400 to-emerald-500',
              link: '/medical-records'
            },
            {
              icon: Briefcase,
              title: 'Recrutement RH',
              description: 'Analyse automatique des CV par IA pour trouver les meilleurs talents',
              color: 'from-orange-400 to-red-500',
              link: '/hr-dashboard'
            },
            {
              icon: Heart,
              title: 'Espace Médecins',
              description: 'Interface dédiée pour les médecins avec outils de diagnostic avancés',
              color: 'from-pink-400 to-rose-500',
              link: '/doctor-dashboard'
            },
            {
              icon: Sparkles,
              title: 'Tableau de Bord',
              description: 'Statistiques en temps réel et insights pour optimiser vos opérations',
              color: 'from-indigo-400 to-purple-500',
              link: '/dashboard'
            }
          ].map((feature, i) => (
            <Link
              key={i}
              href={feature.link}
              className="group relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                   style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
              
              <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {feature.title}
              </h4>
              
              <p className="text-gray-300 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              <div className="flex items-center gap-2 text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                En savoir plus
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="backdrop-blur-lg bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-white/20 rounded-3xl p-12 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-6">
                Pourquoi choisir MediFlow AI ?
              </h3>
              <div className="space-y-4">
                {[
                  'IA intégrée pour des diagnostics assistés',
                  'Interface intuitive et moderne',
                  'Sécurité des données certifiée',
                  'Support client 24/7',
                  'Mises à jour gratuites à vie',
                  'Intégration avec vos outils existants'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-200 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
                <p className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  3x
                </p>
                <p className="text-gray-300">Plus rapide que les systèmes traditionnels</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
                <p className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  50%
                </p>
                <p className="text-gray-300">Réduction du temps administratif</p>
              </div>
              
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
                <p className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                  100%
                </p>
                <p className="text-gray-300">Conforme aux normes RGPD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center backdrop-blur-lg bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-white/20 rounded-3xl p-16">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre clinique ?
          </h3>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Rejoignez des centaines de professionnels de santé qui ont déjà fait le choix de l'excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
            >
              <Sparkles className="w-5 h-5" />
              Commencer maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-black/30 border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-cyan-400 to-purple-600 p-2 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white">MediFlow AI</h4>
              </div>
              <p className="text-gray-400">
                La plateforme de gestion médicale nouvelle génération
              </p>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Liens rapides</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Tableau de bord</Link></li>
                <li><Link href="/patients" className="hover:text-cyan-400 transition-colors">Patients</Link></li>
                <li><Link href="/appointments" className="hover:text-cyan-400 transition-colors">Rendez-vous</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@mediflow.ai</li>
                <li>Tél: +33 1 23 45 67 89</li>
                <li>Support 24/7 disponible</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MediFlow AI. Tous droits réservés.</p>
            <p className="mt-2 text-sm">Système CRM pour cliniques médicales avec IA intégrée</p>
          </div>
        </div>
      </footer>

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