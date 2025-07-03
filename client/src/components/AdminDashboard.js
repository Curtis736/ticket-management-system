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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Support as SupportIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openEstimatedTimeDialog, setOpenEstimatedTimeDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterService, setFilterService] = useState('tous');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, usersRes, statsRes] = await Promise.all([
        axios.get('/api/tickets'),
        axios.get('/api/tickets/users/list'),
        axios.get('/api/tickets/stats/overview')
      ]);
      setTickets(ticketsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.patch(`/api/tickets/${ticketId}/status`, { status: newStatus });
      setOpenStatusDialog(false);
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAssignTicket = async (ticketId, assignedTo) => {
    try {
      await axios.patch(`/api/tickets/${ticketId}/assign`, { assigned_to: assignedTo });
      setOpenAssignDialog(false);
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      setError('Erreur lors de l\'assignation du ticket');
    }
  };

  const handleEstimatedTimeChange = async (ticketId, newEstimatedTime) => {
    try {
      const timeValue = newEstimatedTime === '' ? null : parseFloat(newEstimatedTime);
      await axios.patch(`/api/tickets/${ticketId}/estimated-time`, { estimated_time: timeValue });
      setOpenEstimatedTimeDialog(false);
      setSelectedTicket(null);
      setEstimatedTime('');
      fetchData();
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'estimation de temps');
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

  // Filtrer les tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'tous' && ticket.status !== filterStatus) return false;
    if (filterService !== 'tous' && ticket.service !== filterService) return false;
    return true;
  });

  // Statistiques par service
  const statsByService = {};
  tickets.forEach(ticket => {
    if (!statsByService[ticket.service]) {
      statsByService[ticket.service] = 0;
    }
    statsByService[ticket.service]++;
  });

  // Top 3 des services les plus utilisés
  const topServices = Object.entries(statsByService)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Employés par service
  const employeesByService = {
    commercial: users.filter(u => u.role === 'commercial'),
    technique: users.filter(u => u.role === 'technicien'),
    support: users.filter(u => u.role === 'support')
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* En-tête Admin */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <AdminIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Administration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestion complète des tickets et des collaborateurs
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Actualiser">
              <span>
                <IconButton onClick={fetchData} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Statistiques globales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {stats.total || 0}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Total Tickets
              </Typography>
              <Box display="flex" justifyContent="space-around" mt={2}>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {stats.nouveau || 0}
                  </Typography>
                  <Typography variant="caption">À traiter</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {stats.en_cours || 0}
                  </Typography>
                  <Typography variant="caption">En cours</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {stats.termine || 0}
                  </Typography>
                  <Typography variant="caption">Terminés</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques par service */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par Service
            </Typography>
            <Grid container spacing={2}>
              {topServices.map(([service, count], index) => (
                <Grid item xs={12} md={4} key={service}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 40, color: `primary.${index === 0 ? 'main' : index === 1 ? 'light' : 'dark'}`, mb: 1 }} />
                      <Typography variant="h4" color={`primary.${index === 0 ? 'main' : index === 1 ? 'light' : 'dark'}`}>
                        {count}
                      </Typography>
                      <Typography variant="h6">{service}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        tickets
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {topServices.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Aucun ticket créé
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Filtres */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="h6">Filtres:</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="nouveau">Nouveau</MenuItem>
                  <MenuItem value="en_cours">En cours</MenuItem>
                  <MenuItem value="termine">Terminé</MenuItem>
                  <MenuItem value="annule">Annulé</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Service</InputLabel>
                <Select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="technique">Technique</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        {/* Tableau des tickets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tickets à Traiter ({filteredTickets.filter(t => t.status === 'nouveau').length} nouveaux)
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Titre</TableCell>
                      <TableCell>Demandeur</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Service Demandeur</TableCell>
                      <TableCell>Nom Demandeur</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Priorité</TableCell>
                      <TableCell>Temps estimé</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTickets
                      .sort((a, b) => {
                        // Prioriser les tickets nouveaux, puis par priorité
                        if (a.status === 'nouveau' && b.status !== 'nouveau') return -1;
                        if (a.status !== 'nouveau' && b.status === 'nouveau') return 1;
                        if (a.priority === 'haute' && b.priority !== 'haute') return -1;
                        if (a.priority !== 'haute' && b.priority === 'haute') return 1;
                        return new Date(b.created_at) - new Date(a.created_at);
                      })
                      .map((ticket) => (
                      <TableRow 
                        key={ticket.id}
                        sx={{
                          backgroundColor: ticket.status === 'nouveau' ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                          '&:hover': {
                            backgroundColor: ticket.status === 'nouveau' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setOpenStatusDialog(false);
                          setOpenAssignDialog(false);
                          setOpenDetailDialog(true);
                        }}
                      >
                        <TableCell>#{ticket.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {ticket.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{ticket.user_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.service}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{ticket.service_demandeur}</TableCell>
                        <TableCell>{ticket.nom_demandeur}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'pre-line' }}>
                            {ticket.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status}
                            color={getStatusColor(ticket.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.priority}
                            color={getPriorityColor(ticket.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {ticket.estimated_time ? (
                              <Chip 
                                label={`${ticket.estimated_time}h`} 
                                size="small" 
                                variant="outlined"
                                color="info"
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Non estimé
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(ticket.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Changer le statut">
                              <IconButton
                                size="small"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedTicket(ticket);
                                  setOpenStatusDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier l'estimation de temps">
                              <IconButton
                                size="small"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedTicket(ticket);
                                  setEstimatedTime(ticket.estimated_time ? ticket.estimated_time.toString() : '');
                                  setOpenEstimatedTimeDialog(true);
                                }}
                              >
                                <AccessTimeIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Tickets urgents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tickets Urgents
            </Typography>
            {tickets
              .filter(t => t.priority === 'haute' && t.status !== 'termine')
              .slice(0, 5)
              .map((ticket) => (
                <Card key={ticket.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          #{ticket.id} - {ticket.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {ticket.user_name} - {ticket.service}
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip label="URGENT" color="error" size="small" />
                          {ticket.estimated_time && (
                            <Chip 
                              label={`${ticket.estimated_time}h`} 
                              size="small" 
                              variant="outlined"
                              color="info"
                            />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(ticket.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de changement de statut */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Changer le statut du ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Ticket: {selectedTicket?.title}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Nouveau statut</InputLabel>
            <Select
              defaultValue={selectedTicket?.status}
              onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
            >
              <MenuItem value="nouveau">Nouveau</MenuItem>
              <MenuItem value="en_cours">En cours</MenuItem>
              <MenuItem value="termine">Terminé</MenuItem>
              <MenuItem value="annule">Annulé</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détail du ticket */}
      <Dialog open={!!openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Détail du ticket</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box>
              <Typography variant="h6">{selectedTicket.title}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                #{selectedTicket.id} - {selectedTicket.user_name} - {formatDate(selectedTicket.created_at)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {selectedTicket.description}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip label={selectedTicket.status} color={getStatusColor(selectedTicket.status)} size="small" />
                <Chip label={selectedTicket.priority} color={getPriorityColor(selectedTicket.priority)} size="small" variant="outlined" />
                <Chip label={selectedTicket.service} size="small" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Service demandeur : {selectedTicket.service_demandeur}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nom du demandeur : {selectedTicket.nom_demandeur}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Temps estimé : {selectedTicket.estimated_time ? `${selectedTicket.estimated_time} heures` : 'Non estimé'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'estimation de temps */}
      <Dialog open={openEstimatedTimeDialog} onClose={() => setOpenEstimatedTimeDialog(false)}>
        <DialogTitle>Modifier l'estimation de temps</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Ticket: {selectedTicket?.title}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Temps estimé (heures)"
            type="number"
            fullWidth
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            inputProps={{ min: 0, step: 0.5 }}
            helperText="Laissez vide pour supprimer l'estimation"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEstimatedTimeDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => handleEstimatedTimeChange(selectedTicket.id, estimatedTime)}
            variant="contained"
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 