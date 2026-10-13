const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Groq = require('groq-sdk');

async function debugGroqConnection() {
  console.log('🔍 Débogage de la connexion Groq...\n');

  const apiKey = process.env.GROQ_API_KEY;
  console.log('Clé API présente:', apiKey ? 'Oui' : 'Non');
  console.log('Longueur de la clé:', apiKey ? apiKey.length : 0);
  console.log('Format de la clé:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');

  if (!apiKey) {
    console.log('❌ Aucune clé API configurée');
    return;
  }

  try {
    const groq = new Groq({
      apiKey: apiKey,
    });

    console.log('🔗 Tentative de connexion à Groq...');

    // Test simple avec un prompt minimal
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: "Bonjour, pouvez-vous répondre en français ?"
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    console.log('✅ Connexion réussie !');
    console.log('Réponse:', response.choices[0].message.content);

  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);

    if (error.status) {
      console.log('Code d\'erreur HTTP:', error.status);
    }

    if (error.error && error.error.error) {
      console.log('Détails de l\'erreur:', error.error.error);
    }

    // Conseils de dépannage
    console.log('\n💡 Conseils de dépannage:');
    console.log('1. Vérifiez que votre clé API Groq est valide sur https://console.groq.com/');
    console.log('2. Assurez-vous que votre compte Groq est actif');
    console.log('3. Vérifiez les restrictions géographiques de Groq');
    console.log('4. Essayez de régénérer votre clé API');
  }
}

debugGroqConnection();