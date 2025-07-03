const bcrypt = require('bcryptjs');
const { getDatabase } = require('./database/init');

async function testAuth() {
  const db = getDatabase();
  
  console.log('🔍 Vérification des utilisateurs dans la base de données...');
  
  db.all('SELECT id, username, email, role FROM users', (err, users) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', err);
      return;
    }
    
    console.log('📋 Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé. Recréation des comptes de test...');
      createTestUsers();
    } else {
      console.log('✅ Utilisateurs existants trouvés.');
    }
  });
}

function createTestUsers() {
  const db = getDatabase();
  
  // Créer un utilisateur admin par défaut
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT INTO users (username, email, password, role)
    VALUES ('admin', 'admin@entreprise.com', ?, 'admin')
  `, [adminPassword], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la création de l\'admin:', err);
    } else {
      console.log('✅ Admin créé avec succès');
    }
  });

  // Créer un utilisateur client de test
  const clientPassword = bcrypt.hashSync('client123', 10);
  db.run(`
    INSERT INTO users (username, email, password, role)
    VALUES ('client', 'client@entreprise.com', ?, 'client')
  `, [clientPassword], function(err) {
    if (err) {
      console.error('❌ Erreur lors de la création du client:', err);
    } else {
      console.log('✅ Client créé avec succès');
      console.log('\n🎯 Comptes de test créés :');
      console.log('   Admin: admin@entreprise.com / admin123');
      console.log('   Client: client@entreprise.com / client123');
    }
  });
}

// Exécuter le test
testAuth(); 