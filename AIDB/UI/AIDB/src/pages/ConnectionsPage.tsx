import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DBTypes } from '../types/DBTypes';
import type { Connection } from '../types/Connection';
import { ConnectionDialog } from '../components/ConnectionDialog';
import { ConnectionAPI } from '../services/ConnactionAPI';
import { DatabaseAPI } from '../services/DatabaseAPI';
import { mockConnections } from '../services/data';

const getStatusColor = (status: Connection['status']) => {
  switch (status) {
    case 'connected':
      return { bg: '#e8f5e9', text: '#2e7d32' };
    case 'offline':
      return { bg: '#f1f5f9', text: '#64748b' };
    case 'error':
      return { bg: '#fee2e2', text: '#ef4444' };
    default:
      return { bg: '#f1f5f9', text: '#64748b' };
  }
};

const getEngineIconBg = (type: string) => {
  switch (type) {
    case 'PostgreSQL':
      return '#e0f2fe'; // light blue
    case 'MySQL':
      return '#ffedd5'; // light orange
    case 'MongoDB':
      return '#dcfce7'; // light green
    case 'Snowflake':
      return '#e0e7ff'; // light indigo
    default:
      return '#f1f5f9';
  }
};

const getEngineIconColor = (type: string) => {
  switch (type) {
    case 'PostgreSQL':
      return '#0284c7';
    case 'MySQL':
      return '#ea580c';
    case 'MongoDB':
      return '#16a34a';
    case 'Snowflake':
      return '#4f46e5';
    default:
      return '#64748b';
  }
};

export const ConnectionsPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await ConnectionAPI.getConnections();
        const data = Array.isArray(response) ? response : (response as any).data || [];
        if (data && data.length > 0) {
          setConnections(data);
        } else {
          setConnections(mockConnections);
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        setConnections(mockConnections);
      }
    };
    fetchConnections();
  }, []);

  const handleAdd = () => {
    setEditingConnection(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (conn: Connection) => {
    setEditingConnection(conn);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: any) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async (savedConn: Connection) => {
    try {
      if (editingConnection) {
        setConnections((prev) => prev.map((c) => (c.id === savedConn.id ? savedConn : c)));
      } else {
        await ConnectionAPI.addConnection(savedConn);
        setConnections((prev) => [...prev, savedConn]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleTest = async (conn: Connection) => {
    try {
      await DatabaseAPI.getSchema(conn.name);
      alert(`Test successful for ${conn.name}`);
    } catch (error) {
      console.error('Failed to test connection:', error);
      alert(`Test failed for ${conn.name}`);
    }
  };

  return (
    <Box>
      <ConnectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        connection={editingConnection}
      />
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Database Connections
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage and monitor your database connections across all environments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, px: 3 }}
          onClick={handleAdd}
        >
          Add Connection
        </Button>
      </Box>

      {/* Grid of Connections */}
      <Grid container spacing={3}>
        {connections.map((conn) => {
          const statusColors = getStatusColor(conn.status);

          return (
            <Grid item xs={12} sm={6} lg={4} key={conn.id}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(25,118,210,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: getEngineIconBg(conn.databaseType),
                          color: getEngineIconColor(conn.databaseType),
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                        }}
                      >
                        <StorageIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap title={conn.name}>
                          {conn.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {conn.databaseType}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Host</Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">{conn.host}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Port</Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">{conn.port}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Database</Typography>
                      <Typography variant="body2" fontWeight={500} color="text.primary">{conn.database}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={conn.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: statusColors.bg,
                        color: statusColors.text,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Last ping: {conn.lastPing}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Button size="small" startIcon={<RefreshIcon />} color="inherit" sx={{ color: 'text.secondary' }} onClick={() => handleTest(conn)}>
                    Test
                  </Button>
                  <Box>
                    <IconButton size="small" sx={{ color: 'text.secondary', mr: 0.5 }} onClick={() => handleEdit(conn)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDelete(conn.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
