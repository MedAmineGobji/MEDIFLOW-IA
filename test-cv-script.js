const fs = require('fs');
const path = require('path');

// Créer un fichier de test simple
const testCVContent = `
Dr. Jean Dupont
Médecin Généraliste

FORMATION
- Doctorat en Médecine - Université Paris Descartes (2015)
- Master en Biologie - Université Paris Descartes (2012)

EXPÉRIENCE PROFESSIONNELLE
- Médecin Généraliste - Clinique Saint-Joseph (2018-Présent)
- Interne en Médecine - Hôpital Cochin (2015-2018)

COMPÉTENCES
- Diagnostic médical
- Soins d'urgence
- Pédiatrie
- Cardiologie

CONTACT
jean.dupont@email.com
06 12 34 56 78
`;

const testFilePath = path.join(__dirname, 'test-cv.txt');
fs.writeFileSync(testFilePath, testCVContent);

console.log('Fichier de test créé:', testFilePath);