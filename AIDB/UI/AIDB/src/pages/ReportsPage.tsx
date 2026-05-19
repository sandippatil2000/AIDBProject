import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Send as SendIcon,
  Storage as StorageIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ConnectionAPI } from '../services/ConnactionAPI';
import { mockConnections } from '../services/data';
import type { Connection } from '../types/Connection';
import { AIAPI } from '../services/AIAPI';
import { AiService, AiModel } from '../types/DBTypes';
import type { AISqlQuery } from '../types/AISqlQuery';
import { DatabaseAPI } from '../services/DatabaseAPI';

// ─── Component ────────────────────────────────────────────────────────────────
export const ReportsPage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [selectedAiService, setSelectedAiService] = useState<string>('');
  const [selectedAiModel, setSelectedAiModel] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AISqlQuery | null>(null);
  const [dataTable, setDataTable] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // ── Fetch connections ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await ConnectionAPI.getConnections();
        const data = Array.isArray(response) ? response : (response as any).data || [];
        setConnections(data && data.length > 0 ? data : mockConnections);
      } catch {
        setConnections(mockConnections);
      }
    };
    fetchConnections();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDbChange = (event: SelectChangeEvent<string>) => {
    setSelectedDb(event.target.value);
    // Reset results when DB selection changes
    setResult(null);
    setDataTable(null);
    setResultError(null);
    setHasSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedDb || !userPrompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    setDataTable(null);
    setResultError(null);
    setHasSubmitted(true);

    try {
      const response = await AIAPI.generateSqlQuery({
        connectionName: selectedDb,
        userPrompt: userPrompt.trim(),
        aiService: selectedAiService || undefined,
        aiModel: selectedAiModel || undefined,
      });
      // Normalise to a raw string first, then parse into AISqlQuery
      const raw: string =
        typeof response === 'string'
          ? response
          : (response as any)?.data ?? JSON.stringify(response);
      const parsed: AISqlQuery = typeof raw === 'string' && raw.trim().startsWith('{')
        ? (JSON.parse(raw) as AISqlQuery)
        : { summary: undefined, query: raw };
      setResult(parsed);

      // ── Execute the generated SQL to fetch actual data ──────────────────────
      if (parsed.query) {
        const tableResponse = await DatabaseAPI.getDataTable(selectedDb, { sqlQuery: parsed.query });
        const tableData = Array.isArray(tableResponse)
          ? tableResponse
          : (tableResponse as any)?.data ?? tableResponse;
        if (tableData && typeof tableData === 'object' && !Array.isArray(tableData)) {
          // API may return { columns: [], rows: [] } shape
          setDataTable(tableData as { columns: string[]; rows: Record<string, unknown>[] });
        } else if (Array.isArray(tableData) && tableData.length > 0) {
          // API may return a plain array of row objects
          const columns = Object.keys(tableData[0] as object);
          setDataTable({ columns, rows: tableData as Record<string, unknown>[] });
        }
      }
    } catch (err: any) {
      setResultError(err?.message ?? 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = selectedDb !== '' && userPrompt.trim() !== '' && !isLoading;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '100%' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(25,118,210,0.35)',
          }}
        >
          <BarChartIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={500} color="text.primary" lineHeight={1.0}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Run AI-powered queries against your databases and explore results.
          </Typography>
        </Box>
      </Box>

      {/* ── Top Input Panel ──────────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(248,250,252,0.8)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Panel heading */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Query Builder
            </Typography>
          </Box> */}

          {/* ── Dropdowns row ─────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>

            {/* DB Name */}
            <FormControl sx={{ width: '25%', minWidth: 200 }}>
              <InputLabel id="db-name-label" size="small">DB Name</InputLabel>
              <Select
                labelId="db-name-label"
                id="db-name-select"
                value={selectedDb}
                size="small"
                label="DB Name"
                onChange={handleDbChange}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                {connections.length === 0 && (
                  <MenuItem disabled value="">
                    <em>No connections available</em>
                  </MenuItem>
                )}
                {connections.map((conn) => (
                  <MenuItem key={conn.id ?? conn.name} value={conn.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <StorageIcon sx={{ fontSize: 12, color: 'primary.main', opacity: 0.9 }} />
                      <Typography variant="body2" fontWeight={400}>{conn.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* AI Service */}
            <FormControl sx={{ width: '20%', minWidth: 170 }}>
              <InputLabel id="ai-service-label" size="small">AI Service</InputLabel>
              <Select
                labelId="ai-service-label"
                id="ai-service-select"
                value={selectedAiService}
                size="small"
                label="AI Service"
                onChange={(e) => setSelectedAiService(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Default</em></MenuItem>
                {Object.values(AiService).map((svc) => (
                  <MenuItem key={svc} value={svc}>{svc}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* AI Model */}
            <FormControl sx={{ width: '20%', minWidth: 180 }}>
              <InputLabel id="ai-model-label" size="small">AI Model</InputLabel>
              <Select
                labelId="ai-model-label"
                id="ai-model-select"
                value={selectedAiModel}
                size="small"
                label="AI Model"
                onChange={(e) => setSelectedAiModel(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Default</em></MenuItem>
                {Object.values(AiModel).map((mdl) => (
                  <MenuItem key={mdl} value={mdl}>{mdl}</MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>

          {/* User Prompt Text Field */}
          <TextField
            id="user-prompt"
            label="User Prompt"
            placeholder="Describe what data you want to retrieve or analyse…"
            multiline
            minRows={4}
            maxRows={10}
            size='small'
            fullWidth
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
            inputProps={{ 'aria-label': 'User Prompt' }}
          />

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              id="submit-report-btn"
              variant="contained"
              size="small"
              disabled={!canSubmit}
              onClick={handleSubmit}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: canSubmit ? '0 4px 14px rgba(25,118,210,0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                },
              }}
            >
              {isLoading ? 'Running…' : 'Submit'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Result Panel ─────────────────────────────────────────────────────── */}
      {hasSubmitted && (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Result Panel header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(248,250,252,0.8)',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Results
            </Typography>
            {result && (
              <Chip
                label="AI Response"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            )}
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Loading state */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Error state */}
            {!isLoading && resultError && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {resultError}
                </Alert>
              </Box>
            )}

            {/* Empty state — API returned an empty result */}
            {!isLoading && !resultError && result && !result.summary && !result.query && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
                <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try refining your prompt or selecting a different database.
                </Typography>
              </Box>
            )}

            {/* AISqlQuery result — summary + SQL query */}
            {!isLoading && !resultError && result && (result.summary || result.query) && (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Summary */}
                {result.summary && (
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      Summary
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        mt: 0.75,
                        mb: 0,
                        p: 2.5,
                        borderRadius: 2,
                        overflowX: 'auto',
                        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                        fontSize: '0.82rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.35)'
                            : 'rgba(240,244,255,0.8)',
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.primary',
                      }}
                    >
                      {result.summary}
                    </Box>
                  </Box>
                )}

                {/* SQL Query */}
                {result.query && (
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      Generated SQL
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        mt: 0.75,
                        mb: 0,
                        p: 2.5,
                        borderRadius: 2,
                        overflowX: 'auto',
                        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                        fontSize: '0.82rem',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.35)'
                            : 'rgba(240,244,255,0.8)',
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.primary',
                      }}
                    >
                      {result.query}
                    </Box>
                  </Box>
                )}

                <Divider />

              </Box>
            )}

            {/* ── Data Table — result of executing the generated SQL ──── */}
            {!isLoading && !resultError && dataTable && (
              <Box>
                {/* Table header bar */}
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(248,250,252,0.8)',
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    Results
                  </Typography>
                  <Chip
                    label={`${dataTable.rows.length} row${dataTable.rows.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </Box>

                {dataTable.rows.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                    <BarChartIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">Query returned no rows.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <Box component="thead">
                        <Box component="tr">
                          {dataTable.columns.map((col) => (
                            <Box
                              component="th"
                              key={col}
                              sx={{
                                px: 3, py: 1.5,
                                textAlign: 'left',
                                fontWeight: 700,
                                color: 'text.secondary',
                                fontSize: '0.78rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                whiteSpace: 'nowrap',
                                background: (theme) =>
                                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                borderBottom: '2px solid',
                                borderColor: 'divider',
                              }}
                            >
                              {col}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {dataTable.rows.map((row, idx) => (
                          <Box
                            component="tr"
                            key={idx}
                            sx={{
                              transition: 'background 0.15s',
                              '&:hover': {
                                background: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(25,118,210,0.04)',
                              },
                            }}
                          >
                            {dataTable.columns.map((col) => (
                              <Box
                                component="td"
                                key={col}
                                sx={{
                                  px: 3, py: 1.5,
                                  color: 'text.primary',
                                  borderBottom: '1px solid',
                                  borderColor: 'divider',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {String(row[col] ?? '—')}
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ px: 3, py: 1.5 }}>
                      <Typography variant="caption" color="text.disabled">
                        Showing {dataTable.rows.length} record{dataTable.rows.length !== 1 ? 's' : ''}
                        {selectedDb ? ` from "${selectedDb}"` : ''}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
