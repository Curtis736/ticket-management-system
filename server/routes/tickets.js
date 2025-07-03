const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('./auth');
const { sendNewTicketNotification, sendStatusUpdateNotification } = require('../services/emailService');

const router = express.Router();

// Middleware pour vérifier les permissions admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Middleware pour vérifier les permissions admin ou technicien
const requireAdminOrTechnicien = (req, res, next) => {
  if (!['admin', 'technicien'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs et techniciens' });
  }
  next();
};

// Obtenir tous les tickets selon le rôle
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { role, id: userId } = req.user;

  let query, params;

  if (role === 'admin' || role === 'technicien') {
    // Admin et technicien voient TOUS les tickets
    query = `
      SELECT t.*, u.username as user_name, a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      ORDER BY t.created_at DESC
    `;
    params = [];
  } else {
    // Collaborateurs voient seulement leurs tickets
    query = `
      SELECT t.*, u.username as user_name, a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    params = [userId];
  }

  db.all(query, params, (err, tickets) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
    }
    res.json(tickets);
  });
});

// Obtenir un ticket spécifique
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { role, id: userId, service } = req.user;

  let query, params;

  if (['admin', 'technicien'].includes(role)) {
    query = `
      SELECT t.*, u.username as user_name, a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ?
    `;
    params = [id];
  } else if (['commercial', 'technicien', 'support'].includes(role)) {
    query = `
      SELECT t.*, u.username as user_name, a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ? AND (t.service = ? OR t.assigned_to = ?)
    `;
    params = [id, service, userId];
  } else {
    query = `
      SELECT t.*, u.username as user_name, a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ? AND t.user_id = ?
    `;
    params = [id, userId];
  }

  db.get(query, params, (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    res.json(ticket);
  });
});

// Créer un nouveau ticket
router.post('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { title, description, priority, service, service_demandeur, nom_demandeur, estimated_time } = req.body;
  const { id: userId } = req.user;

  if (!title || !description || !service_demandeur || !nom_demandeur) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  // Utiliser le service fourni ou "Général" par défaut
  const ticketService = service || 'Général';

  const query = `
    INSERT INTO tickets (title, description, priority, service, service_demandeur, nom_demandeur, estimated_time, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, description, priority || 'normale', ticketService, service_demandeur, nom_demandeur, estimated_time || null, userId], async function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la création du ticket' });
    }

    // Envoyer une notification email à l'admin
    const ticketData = {
      title,
      description,
      priority: priority || 'normale',
      service: ticketService,
      service_demandeur,
      nom_demandeur,
      estimated_time
    };

    try {
      await sendNewTicketNotification(ticketData);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas bloquer la création du ticket si l'email échoue
    }

    res.status(201).json({ 
      id: this.lastID,
      message: 'Ticket créé avec succès'
    });
  });
});

// Mettre à jour le statut d'un ticket
router.patch('/:id/status', authenticateToken, requireAdminOrTechnicien, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['nouveau', 'en_cours', 'termine', 'annule'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const db = getDatabase();
  
  // D'abord récupérer les données du ticket pour l'email
  db.get('SELECT * FROM tickets WHERE id = ?', [id], async (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    // Mettre à jour le statut
    db.run(
      'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id],
      async function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du ticket' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Ticket non trouvé' });
        }

        // Envoyer une notification email à l'admin
        try {
          await sendStatusUpdateNotification(ticket, status);
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
          // Ne pas bloquer la mise à jour si l'email échoue
        }

        res.json({ message: 'Statut mis à jour avec succès' });
      }
    );
  });
});

// Assigner un ticket à un utilisateur
router.patch('/:id/assign', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  const db = getDatabase();
  
  db.run(
    'UPDATE tickets SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [assigned_to, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'assignation du ticket' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Ticket non trouvé' });
      }

      res.json({ message: 'Ticket assigné avec succès' });
    }
  );
});

// Mettre à jour l'estimation de temps d'un ticket
router.patch('/:id/estimated-time', authenticateToken, requireAdminOrTechnicien, (req, res) => {
  const { id } = req.params;
  const { estimated_time } = req.body;

  if (estimated_time !== null && (isNaN(estimated_time) || estimated_time < 0)) {
    return res.status(400).json({ error: 'L\'estimation de temps doit être un nombre positif ou null' });
  }

  const db = getDatabase();
  
  db.run(
    'UPDATE tickets SET estimated_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [estimated_time, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'estimation' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Ticket non trouvé' });
      }

      res.json({ message: 'Estimation de temps mise à jour avec succès' });
    }
  );
});

// Obtenir la liste des services
router.get('/services/list', authenticateToken, (req, res) => {
  const services = [
    { id: 'commercial', name: 'Commercial', description: 'Gestion commerciale et ventes' },
    { id: 'technique', name: 'Technique', description: 'Support technique et maintenance' },
    { id: 'support', name: 'Support', description: 'Support client et assistance' },
    { id: 'client', name: 'Client', description: 'Demandes clients générales' }
  ];
  res.json(services);
});

// Obtenir la liste des utilisateurs (pour l'assignation)
router.get('/users/list', authenticateToken, requireAdmin, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT id, username, email, role, service FROM users WHERE role != "admin" ORDER BY username', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.json(users);
  });
});

// Obtenir les statistiques
router.get('/stats/overview', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { role, id: userId, service } = req.user;

  let whereClause = '';
  let params = [];

  if (role === 'admin' || role === 'technicien') {
    whereClause = '';
    params = [];
  } else if (role === 'collaborateur') {
    whereClause = 'WHERE user_id = ?';
    params = [userId];
  } else {
    whereClause = 'WHERE service = ? OR assigned_to = ?';
    params = [service, userId];
  }

  // Helper pour ajouter WHERE ou AND selon le cas, et retourner clause + params
  const addStatusClause = (status) => {
    if (whereClause) {
      return { clause: `${whereClause} AND status = ?`, params: [...params, status] };
    } else {
      return { clause: `WHERE status = ?`, params: [status] };
    }
  };

  db.get(`SELECT COUNT(*) as total FROM tickets ${whereClause}`, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    const stats = { total: result.total };

    const nouveau = addStatusClause('nouveau');
    db.get(`SELECT COUNT(*) as nouveau FROM tickets ${nouveau.clause}`, nouveau.params, (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
      stats.nouveau = result.nouveau;

      const en_cours = addStatusClause('en_cours');
      db.get(`SELECT COUNT(*) as en_cours FROM tickets ${en_cours.clause}`, en_cours.params, (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
        stats.en_cours = result.en_cours;

        const termine = addStatusClause('termine');
        db.get(`SELECT COUNT(*) as termine FROM tickets ${termine.clause}`, termine.params, (err, result) => {
          if (err) return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
          stats.termine = result.termine;

          res.json(stats);
        });
      });
    });
  });
});

// Obtenir la liste des utilisateurs (admin uniquement)
router.get('/users/list', authenticateToken, requireAdmin, (req, res) => {
  const db = getDatabase();
  db.all('SELECT id, username, email, role, service FROM users ORDER BY username', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.json(users);
  });
});

// Obtenir les services disponibles
router.get('/services/list', authenticateToken, (req, res) => {
  const services = [
    { id: 'commercial', name: 'Commercial', description: 'Tickets liés aux ventes et clients' },
    { id: 'technique', name: 'Technique', description: 'Tickets liés aux problèmes techniques' },
    { id: 'support', name: 'Support Client', description: 'Tickets de support utilisateur' },
    { id: 'client', name: 'Client', description: 'Demandes générales des clients' },
    { id: 'management', name: 'Management', description: 'Tickets de gestion et administration' }
  ];
  res.json(services);
});

module.exports = router; 