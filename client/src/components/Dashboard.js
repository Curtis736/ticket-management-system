import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'normale',
    service: 'client',
    service_demandeur: '',
    nom_demandeur: '',
    estimated_time: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, servicesRes] = await Promise.all([
        axios.get('/api/tickets'),
        axios.get('/api/tickets/services/list')
      ]);
      setTickets(ticketsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      setError('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await axios.post('/api/tickets', newTicket);
      setNewTicket({
        title: '',
        description: '',
        priority: 'normale',
        service: 'client',
        service_demandeur: '',
        nom_demandeur: '',
        estimated_time: ''
      });
      setOpenDialog(false);
      fetchData();
      setSuccess('Ticket créé avec succès !');
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la création du ticket');
    } finally {
      setSubmitting(false);
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

  const getServiceColor = (service) => {
    switch (service) {
      case 'commercial': return 'primary';
      case 'technique': return 'warning';
      case 'support': return 'info';
      case 'client': return 'success';
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Mes Tickets
            </Typography>
            <Box>
              <Tooltip title="Actualiser">
                <IconButton onClick={fetchData} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ ml: 1 }}
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

        <Grid item xs={12}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun ticket trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez votre premier ticket pour commencer
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tickets.map((ticket) => (
                <Grid item xs={12} md={6} lg={4} key={ticket.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '70%' }}>
                          {ticket.title}
                        </Typography>
                        <Tooltip title="Voir les détails">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {ticket.description.length > 100 
                          ? `${ticket.description.substring(0, 100)}...` 
                          : ticket.description
                        }
                      </Typography>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={ticket.service}
                          color={getServiceColor(ticket.service)}
                          size="small"
                          variant="outlined"
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
                          {ticket.estimated_time && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Temps estimé: {ticket.estimated_time} heures
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Créé le {formatDate(ticket.created_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un nouveau ticket</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            fullWidth
            variant="outlined"
            value={newTicket.title}
            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Service</InputLabel>
            <Select
              value={newTicket.service}
              label="Service"
              onChange={(e) => setNewTicket({ ...newTicket, service: e.target.value })}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} - {service.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={newTicket.priority}
              label="Priorité"
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
            >
              <MenuItem value="basse">Basse</MenuItem>
              <MenuItem value="normale">Normale</MenuItem>
              <MenuItem value="haute">Haute</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Service demandeur"
            fullWidth
            value={newTicket.service_demandeur}
            onChange={(e) => setNewTicket({ ...newTicket, service_demandeur: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Nom du demandeur"
            fullWidth
            value={newTicket.nom_demandeur}
            onChange={(e) => setNewTicket({ ...newTicket, nom_demandeur: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Temps estimé (heures)"
            type="number"
            fullWidth
            value={newTicket.estimated_time}
            onChange={(e) => setNewTicket({ ...newTicket, estimated_time: e.target.value })}
            inputProps={{ min: 0, step: 0.5 }}
            helperText="Laissez vide si non estimé"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateTicket} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 