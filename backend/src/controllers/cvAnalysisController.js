const CVAnalyzer = require('../utils/cvAnalyzer');
const { eq, sql, and } = require('drizzle-orm');
const CVExtractor = require('../utils/cvExtractor');
const { jobOffers, jobApplications, cvAnalyses, users } = require('../../../database/schema');
const db = require('../config/database');
const { notifyAdmins } = require('../utils/notificationUtils');
const path = require('path');
const fs = require('fs');

class CVAnalysisController {
  constructor() {
    this.cvAnalyzer = new CVAnalyzer();
    this.cvExtractor = new CVExtractor();
  }

  /**
   * Analyse un CV existant via URL
   */
  async analyzeExistingCV(req, res) {
    try {
      const { jobOfferId, applicationId, cvUrl } = req.body;

      if (!cvUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL du CV requise'
        });
      }

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
      }

      // Vérifier que l'utilisateur est autorisé (HR ou admin)
      if (!['hrRecruiter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      // Extraire le chemin relatif du CV de l'URL
      const relativePath = cvUrl.replace('/uploads/cv/', '');
      const filePath = path.join(__dirname, '../../uploads/cv', relativePath);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Fichier CV introuvable'
        });
      }

      console.log('Chemin du fichier CV:', filePath);
      console.log('Fichier existe:', fs.existsSync(filePath));

      // Extraire le texte du CV
      console.log('Extraction du texte du CV...');
      const rawText = await this.cvExtractor.extractText(filePath);
      const cvText = this.cvExtractor.preprocessText(rawText);

      // Obtenir les informations du poste si fourni
      let jobInfo = { title: '', description: '', requirements: '' };
      if (jobOfferId) {
        try {
          const offer = await db.select().from(jobOffers).where(eq(jobOffers.id, parseInt(jobOfferId))).limit(1);
          if (offer.length > 0) {
            jobInfo = {
              title: offer[0].title,
              description: offer[0].description,
              requirements: offer[0].requirements
            };
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'offre:', error);
          // Continuer avec jobInfo vide
        }
      }

      // Analyser le CV avec l'IA
      console.log('Analyse du CV avec l\'IA...');
      const analysis = await this.cvAnalyzer.analyzeCV(
        cvText,
        jobInfo.title,
        jobInfo.description,
        jobInfo.requirements
      );

      // Ajouter des métadonnées
      const metadata = this.cvExtractor.getFileMetadata(filePath);
      console.log('Métadonnées extraites:', metadata);
      analysis.metadata = metadata;
      console.log('Analyse complète avec métadonnées:', JSON.stringify(analysis, null, 2));
      analysis.cvText = cvText.substring(0, 500) + '...'; // Aperçu limité

      // Sauvegarder l'analyse en base de données
      try {
        const [analysisId] = await db.insert(cvAnalyses).values({
          applicationId: parseInt(applicationId),
          score: analysis.score,
          recommandation: analysis.recommandation,
          pointsForts: analysis.pointsForts || [],
          lacunes: analysis.lacunes || [],
          competences: analysis.competences || [],
          analyseDetaillee: analysis.analyseDetaillee || ''
        }).returning({ id: cvAnalyses.id });

        // Notifier les admins
        await notifyAdmins({
          title: 'Analyse IA terminée',
          message: `L'IA a terminé l'analyse d'un CV avec un score de ${analysis.score}/100.`,
          type: 'cv_analysis_completed',
          relatedId: analysisId.id
        });
        console.log('✅ Analyse CV sauvegardée avec succès pour applicationId:', applicationId);
      } catch (dbError) {
        console.error('❌ ERREUR CRITIQUE: Impossible de sauvegarder l\'analyse CV:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la sauvegarde de l\'analyse en base de données',
          error: dbError.message
        });
      }

      res.json({
        success: true,
        message: 'CV analysé avec succès',
        data: {
          ...analysis,
          metadata: metadata
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'analyse du CV:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse du CV',
        error: error.message
      });
    }
  }
  async analyzeCV(req, res) {
    try {
      const { jobOfferId, applicationId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier CV fourni'
        });
      }

      // applicationId est optionnel pour les analyses directes de CV
      // if (!applicationId) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'ID de candidature requis'
      //   });
      // }

      // Vérifier que l'utilisateur est autorisé (HR ou admin)
      if (!['hrRecruiter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      const filePath = path.join(__dirname, '../../uploads/cv', file.filename);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Fichier CV introuvable'
        });
      }

      console.log('Chemin du fichier uploadé:', filePath);
      console.log('Nom du fichier:', file.filename);
      console.log('Fichier existe:', fs.existsSync(filePath));

      // Extraire le texte du CV
      console.log('Extraction du texte du CV...');
      const rawText = await this.cvExtractor.extractText(filePath);
      const cvText = this.cvExtractor.preprocessText(rawText);
      console.log('Texte extrait (longueur):', cvText.length);

      // Obtenir les informations du poste si fourni
      let jobInfo = { title: '', description: '', requirements: '' };
      if (jobOfferId) {
        try {
          const offer = await db.select().from(jobOffers).where(eq(jobOffers.id, parseInt(jobOfferId))).limit(1);
          if (offer.length > 0) {
            jobInfo = {
              title: offer[0].title,
              description: offer[0].description,
              requirements: offer[0].requirements
            };
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'offre:', error);
          // Continuer avec jobInfo vide
        }
      }

      // Analyser le CV avec l'IA
      console.log('Analyse du CV avec l\'IA...');
      console.log('Texte du CV (aperçu):', cvText.substring(0, 200) + '...');
      const analysis = await this.cvAnalyzer.analyzeCV(
        cvText,
        jobInfo.title,
        jobInfo.description,
        jobInfo.requirements
      );

      console.log('✅ Analyse terminée:', analysis);
      console.log('✅ Type d\'analyse:', typeof analysis);
      console.log('✅ Score obtenu:', analysis?.score);
      console.log('✅ Recommandation:', analysis?.recommandation);

      // Vérifier que l'analyse a réussi
      if (!analysis || typeof analysis.score !== 'number') {
        console.error('❌ Analyse échouée - données invalides:', analysis);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'analyse du CV - données invalides'
        });
      }

      // Ajouter des métadonnées
      const metadata = this.cvExtractor.getFileMetadata(filePath);
      console.log('Métadonnées extraites:', metadata);
      analysis.metadata = metadata;
      console.log('Analyse complète avec métadonnées:', JSON.stringify(analysis, null, 2));
      analysis.cvText = cvText.substring(0, 500) + '...'; // Aperçu limité

      // Sauvegarder l'analyse en base de données seulement si applicationId est fourni
      if (applicationId) {
        try {
          await db.insert(cvAnalyses).values({
            applicationId: parseInt(applicationId),
            score: analysis.score,
            recommandation: analysis.recommandation,
            pointsForts: analysis.pointsForts || [],
            lacunes: analysis.lacunes || [],
            competences: analysis.competences || [],
            analyseDetaillee: analysis.analyseDetaillee || ''
          });
          console.log('✅ Analyse CV sauvegardée avec succès pour applicationId:', applicationId);
        } catch (dbError) {
          console.error('❌ ERREUR CRITIQUE: Impossible de sauvegarder l\'analyse CV:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde de l\'analyse en base de données',
            error: dbError.message
          });
        }
      } else {
        // Sauvegarder l'analyse sans applicationId pour les analyses indépendantes
        try {
          await db.insert(cvAnalyses).values({
            applicationId: null,
            score: analysis.score,
            recommandation: analysis.recommandation,
            pointsForts: analysis.pointsForts || [],
            lacunes: analysis.lacunes || [],
            competences: analysis.competences || [],
            analyseDetaillee: analysis.analyseDetaillee || ''
          });
          console.log('✅ Analyse CV indépendante sauvegardée avec succès');
        } catch (dbError) {
          console.error('❌ ERREUR: Impossible de sauvegarder l\'analyse CV indépendante:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde de l\'analyse en base de données',
            error: dbError.message
          });
        }
      }

      res.json({
        success: true,
        message: 'CV analysé avec succès',
        data: {
          ...analysis,
          metadata: metadata
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'analyse du CV:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse du CV',
        error: error.message
      });
    }
  }

  /**
   * Compare plusieurs CV pour un poste
   */
  async compareCVs(req, res) {
    try {
      const { cvAnalyses, jobRequirements } = req.body;

      if (!cvAnalyses || !Array.isArray(cvAnalyses) || cvAnalyses.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Au moins 2 analyses de CV sont requises pour la comparaison'
        });
      }

      // Vérifier que l'utilisateur est autorisé
      if (!['hrRecruiter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      console.log('Comparaison des CV...');
      const comparison = await this.cvAnalyzer.compareCVs(cvAnalyses, jobRequirements || {});

      res.json({
        success: true,
        message: 'Comparaison effectuée avec succès',
        data: comparison
      });

    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la comparaison des CV',
        error: error.message
      });
    }
  }

  /**
   * Valide un fichier CV avant analyse
   */
  async validateCV(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const filePath = path.join(__dirname, '../../uploads/cv', file.filename);

      const isValid = await this.cvExtractor.validateCV(filePath);
      const metadata = this.cvExtractor.getFileMetadata(filePath);

      res.json({
        success: true,
        data: {
          isValid,
          metadata,
          message: isValid ? 'CV valide' : 'CV invalide ou illisible'
        }
      });

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation du CV',
        error: error.message
      });
    }
  }

  /**
   * Récupère toutes les analyses CV existantes avec détails complets
   */
  async getAllAnalyses(req, res) {
    try {
      // Vérifier que l'utilisateur est autorisé
      if (!['hrRecruiter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      // Récupérer d'abord les analyses simples
      const analyses = await db.select().from(cvAnalyses);

      // Pour chaque analyse, récupérer les détails associés
      const analysesWithDetails = await Promise.all(
        analyses.map(async (analysis) => {
          try {
            // Récupérer l'application
            const [application] = await db
              .select()
              .from(jobApplications)
              .where(eq(jobApplications.id, analysis.applicationId))
              .limit(1);

            if (!application) {
              return {
                ...analysis,
                candidateEmail: 'N/A',
                candidateFirstName: 'N/A',
                candidateLastName: 'N/A',
                jobTitle: 'N/A'
              };
            }

            // Récupérer l'utilisateur pour avoir l'email
            const { users } = require('../../../database/schema');
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.id, application.candidateUserId))
              .limit(1);

            // Récupérer le candidat pour avoir le nom
            const { candidates } = require('../../../database/schema');
            const [candidate] = await db
              .select()
              .from(candidates)
              .where(eq(candidates.email, user?.email))
              .limit(1);

            // Récupérer l'offre d'emploi
            const [offer] = await db
              .select()
              .from(jobOffers)
              .where(eq(jobOffers.id, application.jobOfferId))
              .limit(1);

            return {
              ...analysis,
              candidateEmail: user?.email || 'N/A',
              candidateFirstName: candidate?.firstName || 'N/A',
              candidateLastName: candidate?.lastName || 'N/A',
              jobTitle: offer?.title || 'N/A'
            };
          } catch (err) {
            console.error('Erreur détails analyse:', err);
            return {
              ...analysis,
              candidateEmail: 'N/A',
              candidateFirstName: 'N/A',
              candidateLastName: 'N/A',
              jobTitle: 'N/A'
            };
          }
        })
      );

      res.json({
        success: true,
        message: 'Analyses récupérées avec succès',
        data: analysesWithDetails
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des analyses',
        error: error.message
      });
    }
  }

  /**
   * Obtient les statistiques d'analyse des CV
   */
  async getAnalysisStats(req, res) {
    try {
      // Vérifier que l'utilisateur est autorisé
      if (!['hrRecruiter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      // Ici on pourrait récupérer des statistiques depuis la DB
      // Pour l'instant, on retourne des stats fictives
      const stats = {
        totalAnalyses: 45,
        recommandations: {
          recommande: 18,
          aConsiderer: 22,
          nonRecommande: 5
        },
        moyenneScore: 72,
        domainesPlusDemandes: ['Médecine générale', 'Soins infirmiers', 'Administration'],
        dernieresAnalyses: [
          { date: '2024-01-15', score: 85, recommandation: 'RECOMMANDÉ' },
          { date: '2024-01-14', score: 78, recommandation: 'À CONSIDÉRER' }
        ]
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }
}

module.exports = {
  analyzeCV: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.analyzeCV(req, res);
  },
  analyzeExistingCV: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.analyzeExistingCV(req, res);
  },
  compareCVs: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.compareCVs(req, res);
  },
  validateCV: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.validateCV(req, res);
  },
  getAllAnalyses: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.getAllAnalyses(req, res);
  },
  getAnalysisStats: async (req, res) => {
    const controller = new CVAnalysisController();
    return controller.getAnalysisStats(req, res);
  }
};