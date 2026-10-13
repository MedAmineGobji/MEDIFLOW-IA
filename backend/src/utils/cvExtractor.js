const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class CVExtractor {
  constructor() {
    this.supportedFormats = ['.pdf', '.txt'];
  }

  /**
   * Extrait le texte d'un fichier CV
   * @param {string} filePath - Chemin vers le fichier CV
   * @returns {Promise<string>} Texte extrait du CV
   */
  async extractText(filePath) {
    try {
      const extension = path.extname(filePath).toLowerCase();

      if (!this.supportedFormats.includes(extension)) {
        throw new Error(`Format de fichier non supporté: ${extension}. Formats acceptés: ${this.supportedFormats.join(', ')}`);
      }

      switch (extension) {
        case '.pdf':
          return await this.extractFromPDF(filePath);
        case '.txt':
          return await this.extractFromTXT(filePath);
        default:
          throw new Error(`Format non supporté: ${extension}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error);
      throw new Error(`Impossible d'extraire le texte du CV: ${error.message}`);
    }
  }

  /**
   * Extrait le texte d'un fichier PDF
   */
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdf = new pdfParse.PDFParse({data: dataBuffer});
      const data = await pdf.getText();

      // Nettoyer et normaliser le texte
      let text = data.text;

      // Supprimer les espaces multiples et les sauts de ligne excessifs
      text = text.replace(/\n+/g, '\n');
      text = text.replace(/\s+/g, ' ');
      text = text.trim();

      return text;
    } catch (error) {
      throw new Error(`Erreur lors de l'extraction PDF: ${error.message}`);
    }
  }

  /**
   * Extrait le texte d'un fichier TXT
   */
  async extractFromTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf8');

      // Nettoyer le texte
      return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    } catch (error) {
      throw new Error(`Erreur lors de la lecture du fichier TXT: ${error.message}`);
    }
  }

  /**
   * Valide si un fichier est un CV valide
   * @param {string} filePath - Chemin vers le fichier
   * @returns {Promise<boolean>} True si le fichier contient du texte extractible
   */
  async validateCV(filePath) {
    try {
      const text = await this.extractText(filePath);

      // Vérifications de base pour s'assurer que c'est un CV
      const minLength = 100; // Minimum 100 caractères
      const hasEmail = /\S+@\S+\.\S+/.test(text);
      const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);

      return text.length >= minLength && (hasEmail || hasPhone);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient des métadonnées sur le fichier CV
   * @param {string} filePath - Chemin vers le fichier
   * @returns {Object} Métadonnées du fichier
   */
  getFileMetadata(filePath) {
    try {
      const stats = fs.statSync(filePath);

      return {
        fileName: path.basename(filePath),
        fileSize: stats.size,
        fileExtension: path.extname(filePath).toLowerCase(),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isValid: this.supportedFormats.includes(path.extname(filePath).toLowerCase())
      };
    } catch (error) {
      throw new Error(`Impossible d'obtenir les métadonnées du fichier: ${error.message}`);
    }
  }

  /**
   * Nettoie et prétraite le texte extrait pour l'analyse IA
   * @param {string} text - Texte brut extrait
   * @returns {string} Texte nettoyé et optimisé
   */
  preprocessText(text) {
    // Supprimer les caractères de contrôle et les espaces excessifs
    let cleaned = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    // Normaliser les espaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Supprimer les lignes vides répétées
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');

    // Limiter la longueur si nécessaire (certains modèles ont des limites)
    const maxLength = 10000;
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength) + '...';
    }

    return cleaned.trim();
  }
}

module.exports = CVExtractor;