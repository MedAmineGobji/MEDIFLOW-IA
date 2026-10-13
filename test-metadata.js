const CVExtractor = require('./backend/src/utils/cvExtractor');

const extractor = new CVExtractor();

const testFilePath = 'c:\\Users\\gobji\\MediFlowAI\\backend\\uploads\\cv\\test-metadata.txt';

try {
  const metadata = extractor.getFileMetadata(testFilePath);
  console.log('Métadonnées extraites:');
  console.log(JSON.stringify(metadata, null, 2));
} catch (error) {
  console.error('Erreur:', error.message);
}