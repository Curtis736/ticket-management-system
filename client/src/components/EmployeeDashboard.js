import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

const EmployeeDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'normale',
    service_demandeur: '',
    nom_demandeur: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tickets');
      setTickets(response.data);
    } catch (error) {
      setError('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await axios.post('/api/tickets', newTicket);
      setOpenCreateDialog(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'normale',
        service_demandeur: '',
        nom_demandeur: ''
      });
      fetchTickets();
      setSuccess('Ticket créé avec succès !');
    } catch (error) {
      setError('Erreur lors de la création du ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'nouveau': return 'primary';
      case 'en_cours': return 'warning';
      case 'termine': return 'success';
      case 'annule': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'haute': return 'error';
      case 'normale': return 'primary';
      case 'basse': return 'success';
      default: return 'default';
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'commercial': return <BusinessIcon />;
      case 'technique': return <BuildIcon />;
      case 'support': return <SupportIcon />;
      default: return <BusinessIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* En-tête */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Mes Tickets
            </Typography>
            <Box display="flex" gap={2}>
              <Tooltip title="Actualiser">
                <IconButton onClick={fetchTickets} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Nouveau Ticket
              </Button>
            </Box>
          </Box>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Grid>
        )}

        {/* Statistiques simples */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Mes Statistiques
            </Typography>
            <Box display="flex" justifyContent="space-around" mt={2}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {tickets.filter(t => t.status === 'nouveau').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nouveaux
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="warning.main">
                  {tickets.filter(t => t.status === 'en_cours').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En cours
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {tickets.filter(t => t.status === 'termine').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Terminés
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Liste des tickets */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mes Tickets ({tickets.length})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : tickets.length === 0 ? (
              <Box textAlign="center" p={4}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucun ticket créé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Créez votre premier ticket pour commencer
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {tickets.map((ticket) => (
                  <Grid item xs={12} key={ticket.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                              #{ticket.id} - {ticket.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {ticket.description}
                            </Typography>
                            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                              <Chip
                                label={ticket.service}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={ticket.priority}
                                color={getPriorityColor(ticket.priority)}
                                size="small"
                              />
                              <Chip
                                label={ticket.status}
                                color={getStatusColor(ticket.status)}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Service demandeur: {ticket.service_demandeur}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Demandeur: {ticket.nom_demandeur}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Créé le {formatDate(ticket.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de création de ticket */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau ticket</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre du ticket"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <MenuItem value="basse">Basse</MenuItem>
                  <MenuItem value="normale">Normale</MenuItem>
                  <MenuItem value="haute">Haute</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service demandeur"
                value={newTicket.service_demandeur}
                onChange={(e) => setNewTicket({ ...newTicket, service_demandeur: e.target.value })}
                placeholder="Ex: Marketing, IT, RH..."
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du demandeur"
                value={newTicket.nom_demandeur}
                onChange={(e) => setNewTicket({ ...newTicket, nom_demandeur: e.target.value })}
                placeholder="Ex: Jean Dupont"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateTicket}
            variant="contained"
            disabled={!newTicket.title || !newTicket.description || !newTicket.service_demandeur || !newTicket.nom_demandeur}
          >
            Créer le Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeDashboard; 