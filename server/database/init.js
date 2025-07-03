const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');
let db = null;

const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
};

// Initialiser la base de données
const initDatabase = () => {
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // Vérifier si la table users existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification de la table users:', err);
        return;
      }

      if (!row) {
        // Créer la table users si elle n'existe pas
        db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'technicien', 'collaborateur')),
            service TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Erreur lors de la création de la table users:', err);
          } else {
            console.log('✅ Table users créée');
          }
        });
      } else {
        // Vérifier si la colonne service existe
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (err) {
            console.error('Erreur lors de la vérification des colonnes:', err);
            return;
          }

          const hasServiceColumn = columns.some(col => col.name === 'service');
          
          if (!hasServiceColumn) {
            // Ajouter la colonne service
            db.run("ALTER TABLE users ADD COLUMN service TEXT", (err) => {
              if (err) {
                console.error('Erreur lors de l\'ajout de la colonne service:', err);
              } else {
                console.log('✅ Colonne service ajoutée à la table users');
              }
            });
          }
        });
      }
    });

    // Vérifier si la table tickets existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'", (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification de la table tickets:', err);
        return;
      }

      if (!row) {
        // Créer la table tickets si elle n'existe pas
        db.run(`
          CREATE TABLE tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'termine', 'annule')),
            priority TEXT NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute')),
            service TEXT NOT NULL,
            service_demandeur TEXT NOT NULL,
            nom_demandeur TEXT NOT NULL,
            estimated_time INTEGER,
            user_id INTEGER NOT NULL,
            assigned_to INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (assigned_to) REFERENCES users (id)
          )
        `, (err) => {
          if (err) {
            console.error('Erreur lors de la création de la table tickets:', err);
          } else {
            console.log('✅ Table tickets créée');
          }
        });
      } else {
        // Vérifier si les nouvelles colonnes existent
        db.all("PRAGMA table_info(tickets)", (err, columns) => {
          if (err) {
            console.error('Erreur lors de la vérification des colonnes tickets:', err);
            return;
          }

          const columnNames = columns.map(col => col.name);
          
          if (!columnNames.includes('service_demandeur')) {
            db.run("ALTER TABLE tickets ADD COLUMN service_demandeur TEXT NOT NULL DEFAULT ''", (err) => {
              if (err) {
                console.error('Erreur lors de l\'ajout de service_demandeur:', err);
              } else {
                console.log('✅ Colonne service_demandeur ajoutée');
              }
            });
          }

          if (!columnNames.includes('nom_demandeur')) {
            db.run("ALTER TABLE tickets ADD COLUMN nom_demandeur TEXT NOT NULL DEFAULT ''", (err) => {
              if (err) {
                console.error('Erreur lors de l\'ajout de nom_demandeur:', err);
              } else {
                console.log('✅ Colonne nom_demandeur ajoutée');
              }
            });
          }

          if (!columnNames.includes('estimated_time')) {
            db.run("ALTER TABLE tickets ADD COLUMN estimated_time INTEGER", (err) => {
              if (err) {
                console.error('Erreur lors de l\'ajout de estimated_time:', err);
              } else {
                console.log('✅ Colonne estimated_time ajoutée');
              }
            });
          }

          // Supprimer la contrainte CHECK sur le service si elle existe
          db.run("PRAGMA foreign_keys=off", (err) => {
            if (err) {
              console.error('Erreur lors de la désactivation des clés étrangères:', err);
              return;
            }
            // Correction : supprimer tickets_new si elle existe
            db.run("DROP TABLE IF EXISTS tickets_new", (err) => {
              if (err) {
                console.error('Erreur lors de la suppression de tickets_new:', err);
                return;
              }
              // Créer une nouvelle table sans contrainte
              db.run(`
                CREATE TABLE tickets_new (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  description TEXT NOT NULL,
                  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'termine', 'annule')),
                  priority TEXT NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute')),
                  service TEXT NOT NULL,
                  service_demandeur TEXT NOT NULL,
                  nom_demandeur TEXT NOT NULL,
                  estimated_time INTEGER,
                  user_id INTEGER NOT NULL,
                  assigned_to INTEGER,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id),
                  FOREIGN KEY (assigned_to) REFERENCES users (id)
                )
              `, (err) => {
                if (err) {
                  console.error('Erreur lors de la création de la nouvelle table:', err);
                  return;
                }
                // Copier les données avec user_id par défaut si NULL
                db.run(`
                  INSERT INTO tickets_new (
                    id, title, description, status, priority, service, service_demandeur, nom_demandeur, estimated_time, user_id, assigned_to, created_at, updated_at
                  )
                  SELECT
                    id, title, description, status, priority, service, service_demandeur, nom_demandeur, estimated_time,
                    COALESCE(user_id, 1),
                    assigned_to, created_at, updated_at
                  FROM tickets
                `, (err) => {
                  if (err) {
                    console.error('Erreur lors de la copie des données:', err);
                    return;
                  }
                  // Supprimer l'ancienne table et renommer la nouvelle
                  db.run("DROP TABLE tickets", (err) => {
                    if (err) {
                      console.error('Erreur lors de la suppression de l\'ancienne table:', err);
                      return;
                    }
                    db.run("ALTER TABLE tickets_new RENAME TO tickets", (err) => {
                      if (err) {
                        console.error('Erreur lors du renommage de la table:', err);
                      } else {
                        console.log('✅ Contrainte CHECK sur service supprimée');
                      }
                    });
                  });
                });
              });
            });
            db.run("PRAGMA foreign_keys=on");
          });
        });
      }
    });

    // Attendre un peu pour que les tables soient créées, puis insérer les utilisateurs
    setTimeout(() => {
      // Vérifier si les utilisateurs par défaut existent déjà
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          console.error('Erreur lors de la vérification des utilisateurs:', err);
          return;
        }

        if (row.count === 0) {
          // Insérer les utilisateurs par défaut
          const users = [
            {
              username: 'admin',
              email: 'admin@test.com',
              password: bcrypt.hashSync('admin123', 10),
              role: 'admin',
              service: null
            },
            {
              username: 'technicien',
              email: 'tech@test.com',
              password: bcrypt.hashSync('tech123', 10),
              role: 'technicien',
              service: 'technique'
            },
            {
              username: 'collaborateur1',
              email: 'colab1@test.com',
              password: bcrypt.hashSync('colab123', 10),
              role: 'collaborateur',
              service: null
            },
            {
              username: 'collaborateur2',
              email: 'colab2@test.com',
              password: bcrypt.hashSync('colab123', 10),
              role: 'collaborateur',
              service: null
            },
            {
              username: 'collaborateur3',
              email: 'colab3@test.com',
              password: bcrypt.hashSync('colab123', 10),
              role: 'collaborateur',
              service: null
            },
            {
              username: 'collaborateur4',
              email: 'colab4@test.com',
              password: bcrypt.hashSync('colab123', 10),
              role: 'collaborateur',
              service: null
            },
            {
              username: 'collaborateur5',
              email: 'colab5@test.com',
              password: bcrypt.hashSync('colab123', 10),
              role: 'collaborateur',
              service: null
            }
          ];

          const insertUser = db.prepare(`
            INSERT INTO users (username, email, password, role, service)
            VALUES (?, ?, ?, ?, ?)
          `);

          users.forEach(user => {
            insertUser.run(user.username, user.email, user.password, user.role, user.service);
          });

          insertUser.finalize();
          console.log('✅ Utilisateurs par défaut créés');
          console.log('👤 Comptes de test :');
          console.log('   Admin: admin@test.com / admin123');
          console.log('   Technicien: tech@test.com / tech123');
          console.log('   Collaborateurs: colab1@test.com à colab5@test.com / colab123 (service spécifié dans les tickets)');
        } else {
          console.log('✅ Utilisateurs existants détectés');
        }
      });
    }, 1000);
  });
};

// Exécuter l'initialisation si le fichier est appelé directement
if (require.main === module) {
  initDatabase();
  db.close();
  console.log('✅ Base de données initialisée avec succès');
}

module.exports = { getDatabase, initDatabase }; 