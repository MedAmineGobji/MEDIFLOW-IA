'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, Users, TrendingUp, TrendingDown, Star, Filter, SortAsc, SortDesc, Eye, Download, CheckCircle, XCircle, Clock, AlertCircle, Brain, X } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

interface JobApplication {
  id: number;
  jobOfferId: number;
  candidateUserId: number;
  cvUrl: string;
  coverLetter: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobOffer: {
    id: number | null;
    title: string;
    department: string;
    location: string;
  };
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CandidateAnalysis {
  id: number;
  applicationId: number;
  score: number;
  recommandation: string;
  competences: string[];
  pointsForts: string[];
  lacunes: string[];
  experience: string;
  formation: string;
  niveauConfiance: string;
  adequationPoste?: {
    score: number;
    exigencesSatisfaites: string[];
    exigencesManquantes: string[];
  };
  aiPowered: boolean;
  analyzedAt: string;
}

interface RankedCandidate extends JobApplication {
  analysis?: CandidateAnalysis;
}

export default function CandidateRankingPage() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterJobOffer, setFilterJobOffer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role === 'hrRecruiter') {
      fetchApplicationsWithAnalysis();
    }
  }, [authLoading, user]);

  const fetchApplicationsWithAnalysis = async () => {
    try {
      setLoading(true);

      // Récupérer toutes les candidatures
      const token = localStorage.getItem('token');
      const applicationsResponse = await fetch('http://localhost:5000/api/job-applications/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!applicationsResponse.ok) {
        throw new Error('Erreur lors de la récupération des candidatures');
      }

      const applicationsData = await applicationsResponse.json();

      // Récupérer les analyses
      const analysesResponse = await fetch('http://localhost:5000/api/cv-analysis/analyses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let analysesData = [];
      if (analysesResponse.ok) {
        const analysesResult = await analysesResponse.json();
        analysesData = analysesResult.data || [];
      }

      // Combiner les candidatures avec leurs analyses
      const applicationsWithAnalysis = applicationsData.map((app: JobApplication) => {
        const analysis = analysesData.find((a: CandidateAnalysis) => a.applicationId === app.id);
        return { ...app, analysis };
      });

      setApplications(applicationsWithAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction temporaire pour simuler la récupération d'analyses
  // TODO: Remplacer par un appel API réel
  const getAnalysisForApplication = async (applicationId: number): Promise<CandidateAnalysis | undefined> => {
    // Simulation d'analyses pour démonstration
    const mockAnalyses: Record<number, CandidateAnalysis> = {
      1: {
        id: 1,
        applicationId: 1,
        score: 92,
        recommandation: 'RECOMMANDÉ',
        competences: ['Échocardiographie', 'Cathétérisme cardiaque', 'Urgences cardiologiques'],
        pointsForts: ['Expérience clinique solide', 'Formation universitaire complète', 'Recherche clinique'],
        lacunes: ['Anglais intermédiaire', 'Pas d\'expérience en cardiologie pédiatrique'],
        experience: '9 ans en cardiologie hospitalière',
        formation: 'DES de Cardiologie + Doctorat',
        niveauConfiance: 'ÉLEVÉ',
        adequationPoste: {
          score: 95,
          exigencesSatisfaites: ['DES cardiologie', '5+ ans expérience', 'Échocardiographie'],
          exigencesManquantes: ['Cardiologie interventionnelle']
        },
        aiPowered: true,
        analyzedAt: '2024-01-16T10:30:00Z'
      },
      2: {
        id: 2,
        applicationId: 2,
        score: 78,
        recommandation: 'À CONSIDÉRER',
        competences: ['Consultation générale', 'Suivi patient', 'Prescription'],
        pointsForts: ['Expérience généraliste', 'Relation patient'],
        lacunes: ['Spécialisation limitée', 'Manque d\'expérience hospitalière'],
        experience: '5 ans en médecine générale',
        formation: 'DES de Médecine Générale',
        niveauConfiance: 'MOYEN',
        adequationPoste: {
          score: 75,
          exigencesSatisfaites: ['DES médecine', 'Expérience clinique'],
          exigencesManquantes: ['Spécialisation cardiologie', 'Échocardiographie']
        },
        aiPowered: true,
        analyzedAt: '2024-01-16T10:35:00Z'
      }
    };

    return mockAnalyses[applicationId];
  };

  // Trier et filtrer les candidatures
  const filteredAndSortedApplications = applications
    .filter(app => {
      const jobFilter = filterJobOffer === 'all' || (app.jobOffer?.id?.toString() === filterJobOffer);
      const statusFilter = filterStatus === 'all' || app.status === filterStatus;
      return jobFilter && statusFilter;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'score':
          aValue = a.analysis?.score || 0;
          bValue = b.analysis?.score || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'name':
          aValue = `${a.candidate.firstName} ${a.candidate.lastName}`.toLowerCase();
          bValue = `${b.candidate.firstName} ${b.candidate.lastName}`.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Obtenir les offres d'emploi uniques pour le filtre
  const uniqueJobOffers = Array.from(
    new Set(applications.map(app => app.jobOffer?.id).filter(id => id != null))
  ).map(jobId => {
    const app = applications.find(a => a.jobOffer?.id === jobId);
    return app?.jobOffer;
  }).filter(offer => offer && offer.id != null);

  const handleViewDetails = (candidate: RankedCandidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const handleDownloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000${cvUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${candidateName.replace(' ', '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      alert('Erreur lors du téléchargement du CV');
    }
  };

  const getRecommendationColor = (recommandation: string) => {
    switch (recommandation) {
      case 'RECOMMANDÉ': return 'bg-green-100 text-green-800 border-green-200';
      case 'À CONSIDÉRER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NON RECOMMANDÉ': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepté': return 'bg-green-100 text-green-800';
      case 'refusé': return 'bg-red-100 text-red-800';
      case 'en cours': return 'bg-blue-100 text-blue-800';
      case 'entretien prévu': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepté': return <CheckCircle className="w-4 h-4" />;
      case 'refusé': return <XCircle className="w-4 h-4" />;
      case 'en cours': return <Clock className="w-4 h-4" />;
      case 'entretien prévu': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'hrRecruiter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Accès non autorisé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/hr-dashboard"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour au tableau de bord RH
              </Link>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Classement des Candidatures</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et tri */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">Filtres:</span>
              </div>

              <select
                value={filterJobOffer}
                onChange={(e) => setFilterJobOffer(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">Toutes les offres</option>
                {uniqueJobOffers.map(offer => (
                  <option key={offer?.id || `deleted-${Math.random()}`} value={offer?.id?.toString() || ''}>
                    {offer?.title} - {offer?.department}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="en cours">En cours</option>
                <option value="entretien prévu">Entretien prévu</option>
                <option value="accepté">Accepté</option>
                <option value="refusé">Refusé</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
                >
                  <option value="score">Score IA</option>
                  <option value="date">Date</option>
                  <option value="name">Nom</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-white" /> : <SortDesc className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des candidatures */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Chargement des candidatures...
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-6">
            <p className="text-red-200">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedApplications.map((application, index) => (
              <div
                key={application.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* En-tête avec rang et candidat */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {application.candidate.firstName} {application.candidate.lastName}
                          </h3>
                          <p className="text-white/60 text-sm">{application.candidate.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Offre d'emploi */}
                    <div className="mb-4">
                      <p className="text-white/80">
                        <span className="font-medium">Poste:</span> {application.jobOffer.title} - {application.jobOffer.department}
                      </p>
                      <p className="text-white/60 text-sm">
                        Candidature du {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    {/* Analyse IA */}
                    {application.analysis ? (
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-medium">Analyse IA</span>
                            {application.analysis.aiPowered && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs">
                                IA Active
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-white">
                              {application.analysis.score}/100
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRecommendationColor(application.analysis.recommandation)}`}>
                              {application.analysis.recommandation}
                            </span>
                          </div>
                        </div>

                        {/* Adéquation au poste */}
                        {application.analysis.adequationPoste && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-white/80 text-sm">
                                Adéquation au poste: {application.analysis.adequationPoste.score}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Points forts et faibles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-green-200 font-medium text-sm">Points forts</span>
                            </div>
                            <ul className="text-white/80 text-sm space-y-1">
                              {application.analysis.pointsForts.slice(0, 3).map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="w-4 h-4 text-red-400" />
                              <span className="text-red-200 font-medium text-sm">Points à améliorer</span>
                            </div>
                            <ul className="text-white/80 text-sm space-y-1">
                              {application.analysis.lacunes.slice(0, 3).map((lacune, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-red-400 mt-1">•</span>
                                  {lacune}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Compétences */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-200 font-medium text-sm">Compétences détectées</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {application.analysis.competences.slice(0, 5).map((competence, idx) => (
                              <span key={idx} className="px-2 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-xs">
                                {competence}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-yellow-200">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Analyse non disponible</span>
                        </div>
                        <p className="text-yellow-200/80 text-sm mt-1">
                          Cliquez sur "Analyser CV" pour obtenir une évaluation IA de ce candidat.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadCV(application.cvUrl, `${application.candidate.firstName} ${application.candidate.lastName}`)}
                      className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white"
                      title="Télécharger le CV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAndSortedApplications.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Aucune candidature trouvée avec ces filtres</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de détails du candidat */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCandidate?.candidate?.firstName?.[0] || '?'}{selectedCandidate?.candidate?.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCandidate?.candidate?.firstName || 'Prénom'} {selectedCandidate?.candidate?.lastName || 'Nom'}
                    </h2>
                    <p className="text-gray-600">{selectedCandidate?.candidate?.email || 'email@exemple.com'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de candidature</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Poste:</span> {selectedCandidate?.jobOffer?.title || 'Non spécifié'}</p>
                    <p><span className="font-medium">Département:</span> {selectedCandidate?.jobOffer?.department || 'Non spécifié'}</p>
                    <p><span className="font-medium">Localisation:</span> {selectedCandidate?.jobOffer?.location || 'Non spécifiée'}</p>
                    <p><span className="font-medium">Statut:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCandidate?.status || 'en cours')}`}>
                        {selectedCandidate?.status || 'En cours'}
                      </span>
                    </p>
                    <p><span className="font-medium">Date de candidature:</span> {selectedCandidate?.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Lettre de motivation</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedCandidate?.coverLetter || 'Aucune lettre de motivation fournie.'}</p>
                  </div>
                </div>
              </div>

              {/* Analyse IA détaillée */}
              {selectedCandidate.analysis ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    Analyse IA Détaillée
                    {selectedCandidate.analysis.aiPowered && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        IA Active
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score principal */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {selectedCandidate.analysis.score}/100
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getRecommendationColor(selectedCandidate?.analysis?.recommandation || 'NON RECOMMANDÉ')}`}>
                        {selectedCandidate?.analysis?.recommandation || 'Non analysé'}
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        Niveau de confiance: {selectedCandidate?.analysis?.niveauConfiance || 'N/A'}
                      </p>
                    </div>

                    {/* Adéquation au poste */}
                    {selectedCandidate?.analysis?.adequationPoste && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-gray-900">Adéquation au poste</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {selectedCandidate.analysis.adequationPoste.score}%
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-green-700">Exigences satisfaites:</p>
                            <ul className="text-sm text-green-600 space-y-1">
                              {selectedCandidate.analysis.adequationPoste.exigencesSatisfaites?.map((exigence, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  {exigence}
                                </li>
                              )) || []}
                            </ul>
                          </div>
                          {selectedCandidate.analysis.adequationPoste.exigencesManquantes?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700">Exigences manquantes:</p>
                              <ul className="text-sm text-red-600 space-y-1">
                                {selectedCandidate.analysis.adequationPoste.exigencesManquantes.map((exigence, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    {exigence}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Informations professionnelles */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-gray-900">Profil professionnel</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Expérience:</span> {selectedCandidate?.analysis?.experience || 'Non spécifiée'}</p>
                        <p><span className="font-medium">Formation:</span> {selectedCandidate?.analysis?.formation || 'Non spécifiée'}</p>
                        <p><span className="font-medium">Analysé le:</span> {selectedCandidate?.analysis?.analyzedAt ? new Date(selectedCandidate.analysis.analyzedAt).toLocaleDateString('fr-FR') : 'Non analysé'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Points forts et lacunes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-800">Points forts</span>
                      </div>
                      <ul className="space-y-2">
                        {selectedCandidate?.analysis?.pointsForts?.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-green-700">
                            <span className="text-green-500 mt-1">•</span>
                            <span className="text-sm">{point}</span>
                          </li>
                        )) || []}
                      </ul>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-800">Points à améliorer</span>
                      </div>
                      <ul className="space-y-2">
                        {selectedCandidate?.analysis?.lacunes?.map((lacune, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-red-700">
                            <span className="text-red-500 mt-1">•</span>
                            <span className="text-sm">{lacune}</span>
                          </li>
                        )) || []}
                      </ul>
                    </div>
                  </div>

                  {/* Compétences */}
                  <div className="bg-yellow-50 rounded-xl p-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-800">Compétences détectées</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate?.analysis?.competences?.map((competence, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                          {competence}
                        </span>
                      )) || []}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Analyse non disponible</h3>
                  <p className="text-yellow-700">
                    Aucune analyse IA n'a encore été réalisée pour ce candidat.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleDownloadCV(selectedCandidate?.cvUrl || '', `${selectedCandidate?.candidate?.firstName || 'Candidat'} ${selectedCandidate?.candidate?.lastName || ''}`.trim())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger CV
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}