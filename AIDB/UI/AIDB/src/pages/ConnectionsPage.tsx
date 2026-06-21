import React, { useState, useEffect } from 'react';
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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as StorageIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandLess,
  ExpandMore,
  TableChart,
  ViewColumn,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DBTypes } from '../types/DBTypes';
import type { DBConnection } from '../types/DBConnection';
import { ConnectionDialog } from '../components/ConnectionDialog';
import { DBConnectionAPI } from '../services/DBConnectionAPI';
import { DatabaseAPI } from '../services/DatabaseAPI';
import { mockConnections } from '../services/data';
import type { DatabaseSchema } from '../types/Schema';

const getStatusColor = (status: DBConnection['status']) => {
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
  const [connections, setConnections] = useState<DBConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DBConnection | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [schemaData, setSchemaData] = useState<DatabaseSchema | null>(null);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const fetchConnections = async () => {
    try {
      const response = await DBConnectionAPI.getDBConnections();
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

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAdd = () => {
    setEditingConnection(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (conn: DBConnection) => {
    setEditingConnection(conn);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await DBConnectionAPI.deleteDBConnection(id);
      await fetchConnections();
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const handleSave = async (savedConn: DBConnection) => {
    try {
      if (editingConnection && editingConnection.id) {
        await DBConnectionAPI.updateDBConnection(editingConnection.id, savedConn);
      } else {
        await DBConnectionAPI.createDBConnection(savedConn);
      }
      setIsDialogOpen(false);
      await fetchConnections();
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleTest = async (conn: DBConnection) => {
    try {
      const response: any = await DatabaseAPI.getSchema(conn.name);
      const schema: DatabaseSchema = response?.data || response;

      console.log('Schema parsed:', schema);
      if (schema && schema.schemaStructured) {
        setSchemaData(schema);
        setIsDrawerOpen(true);
      } else {
        alert(`Test successful for ${conn.name}, but no schema returned.`);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      alert(`Test failed for ${conn.name}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
      <Box sx={{ flexGrow: 1, width: isDrawerOpen ? 'calc(100% - 350px)' : '100%', transition: 'width 0.3s' }}>
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

      {/* Right Side Panel */}
      {isDrawerOpen && (
        <Card sx={{ width: 350, flexShrink: 0, height: 'calc(100vh - 120px)', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6">Database Schema</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
            <List disablePadding>
              {schemaData?.schemaStructured?.map((table) => (
                <React.Fragment key={table.tableName}>
                  <ListItemButton onClick={() => toggleTable(table.tableName)}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {expandedTables[table.tableName] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TableChart fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={table.tableName}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItemButton>
                  <Collapse in={expandedTables[table.tableName]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {table.columns.map((col, idx) => (
                        <ListItemButton key={idx} sx={{ pl: 9 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <ViewColumn fontSize="small" sx={{ color: 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={col}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
              {(!schemaData?.schemaStructured || schemaData.schemaStructured.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No tables found.
                </Typography>
              )}
            </List>
          </Box>
        </Card>
      )}
    </Box>
  );
};
