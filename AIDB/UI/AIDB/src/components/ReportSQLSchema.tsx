import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Drawer,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  ContentCopy as CopyIcon,
  Add as InsertIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import type { DatabaseSchema } from '../types/Schema';

interface ReportSQLSchemaProps {
  open: boolean;
  onClose: () => void;
  selectedDb: string;
  isSchemaLoading: boolean;
  schemaError: string | null;
  schemaData: DatabaseSchema | null;
  onInsertIntoPrompt: (text: string) => void;
  onRetry: () => void;
}

export const ReportSQLSchema: React.FC<ReportSQLSchemaProps> = ({
  open,
  onClose,
  selectedDb,
  isSchemaLoading,
  schemaError,
  schemaData,
  onInsertIntoPrompt,
  onRetry,
}) => {
  const [schemaSearchQuery, setSchemaSearchQuery] = useState<string>('');
  const [expandedSchemaTables, setExpandedSchemaTables] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Clear query and expansion state when selected DB changes
  useEffect(() => {
    setSchemaSearchQuery('');
    setExpandedSchemaTables({});
  }, [selectedDb]);

  // Auto-expand tables when searching
  useEffect(() => {
    if (schemaSearchQuery.trim() && schemaData?.schemaStructured) {
      const expanded: Record<string, boolean> = {};
      schemaData.schemaStructured.forEach((table) => {
        const tableMatches = table.tableName.toLowerCase().includes(schemaSearchQuery.toLowerCase());
        const columnMatches = table.columns.some((col) =>
          col.toLowerCase().includes(schemaSearchQuery.toLowerCase())
        );
        if (tableMatches || columnMatches) {
          expanded[table.tableName] = true;
        }
      });
      setExpandedSchemaTables(expanded);
    }
  }, [schemaSearchQuery, schemaData]);

  // Expand first few tables by default when schema data is loaded
  useEffect(() => {
    if (schemaData?.schemaStructured) {
      const initialExpanded: Record<string, boolean> = {};
      if (schemaData.schemaStructured.length <= 5) {
        schemaData.schemaStructured.forEach((t) => {
          initialExpanded[t.tableName] = true;
        });
      } else {
        schemaData.schemaStructured.slice(0, 3).forEach((t) => {
          initialExpanded[t.tableName] = true;
        });
      }
      setExpandedSchemaTables(initialExpanded);
    }
  }, [schemaData]);

  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const toggleTableExpanded = (tableName: string) => {
    setExpandedSchemaTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Filter schemaStructured based on schemaSearchQuery
  const filteredSchemaStructured = schemaData?.schemaStructured?.map(table => {
    const tableMatches = table.tableName.toLowerCase().includes(schemaSearchQuery.toLowerCase());
    const matchedColumns = table.columns.filter(col => 
      col.toLowerCase().includes(schemaSearchQuery.toLowerCase())
    );
    
    if (tableMatches || matchedColumns.length > 0) {
      return {
        ...table,
        columns: tableMatches && matchedColumns.length === 0 ? table.columns : matchedColumns,
        isTableMatch: tableMatches
      };
    }
    return null;
  }).filter((t): t is NonNullable<typeof t> => t !== null) ?? [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          borderLeft: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Database Schema
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Active DB: {selectedDb}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Search/Filter */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search tables or columns..."
          value={schemaSearchQuery}
          onChange={(e) => setSchemaSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: schemaSearchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSchemaSearchQuery('')} edge="end">
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 2.5 }
          }}
        />
      </Box>

      {/* Drawer Scrollable Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {/* Loading State */}
        {isSchemaLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Loading database schema...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {schemaError && (
          <Box sx={{ py: 2 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              {schemaError}
            </Alert>
          </Box>
        )}

        {/* Empty State */}
        {!isSchemaLoading && !schemaError && filteredSchemaStructured.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
            <StorageIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No matching tables or columns found
            </Typography>
          </Box>
        )}

        {/* Table List */}
        {!isSchemaLoading && !schemaError && filteredSchemaStructured.length > 0 && (
          <List disablePadding>
            {filteredSchemaStructured.map((table) => {
              const isExpanded = !!expandedSchemaTables[table.tableName];
              const tableKey = `t:${table.tableName}`;
              const isTableCopied = copiedKey === tableKey;

              return (
                <Box
                  key={table.tableName}
                  sx={{
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.01)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                    }
                  }}
                >
                  {/* Table Name Header */}
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                        <Tooltip title="Insert into prompt" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onInsertIntoPrompt(table.tableName)}
                            sx={{ color: 'primary.main' }}
                          >
                            <InsertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isTableCopied ? "Copied!" : "Copy table name"} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(table.tableName, tableKey)}
                            sx={{ color: isTableCopied ? 'success.main' : 'text.secondary' }}
                          >
                            {isTableCopied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemButton
                      onClick={() => toggleTableExpanded(table.tableName)}
                      sx={{ py: 1.25, pr: 12 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <TableChartIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={table.tableName}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 600,
                          color: 'text.primary',
                          sx: {
                            wordBreak: 'break-word',
                            textDecoration: table.isTableMatch && schemaSearchQuery ? 'underline' : 'none'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>

                  {/* Columns Sublist */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Divider />
                    <List component="div" disablePadding sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.015)' }}>
                      {table.columns.map((col) => {
                        const colKey = `c:${table.tableName}.${col}`;
                        const isColCopied = copiedKey === colKey;
                        const isColMatched = schemaSearchQuery && col.toLowerCase().includes(schemaSearchQuery.toLowerCase());

                        return (
                          <ListItem
                            key={col}
                            sx={{
                              py: 0.75,
                              pl: 4,
                              pr: 12,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                                <Tooltip title="Insert into prompt" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => onInsertIntoPrompt(col)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <InsertIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isColCopied ? "Copied!" : "Copy column name"} arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopyToClipboard(col, colKey)}
                                    sx={{ color: isColCopied ? 'success.main' : 'text.secondary' }}
                                  >
                                    {isColCopied ? <CheckIcon sx={{ fontSize: 16 }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <ViewColumnIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={col}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: {
                                  wordBreak: 'break-word',
                                  fontWeight: isColMatched ? 700 : 400,
                                  color: isColMatched ? 'primary.main' : 'text.secondary'
                                }
                              }}
                            />
                          </ListItem>
                        );
                      })}
                      {table.columns.length === 0 && (
                        <Box sx={{ py: 1.5, px: 4 }}>
                          <Typography variant="caption" color="text.disabled">
                            No matching columns
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default ReportSQLSchema;
