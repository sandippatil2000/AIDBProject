import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Send as SendIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  AccountTree as AccountTreeIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ConnectionAPI } from '../services/ConnactionAPI';
import { mockConnections } from '../services/data';
import type { Connection } from '../types/Connection';
import { AIAPI } from '../services/AIAPI';
import { AiService, AiModel } from '../types/DBTypes';
import type { AISqlQuery } from '../types/AISqlQuery';
import { DatabaseAPI } from '../services/DatabaseAPI';
import { inferSchema } from '../utils/schemaInference';
import { recommendCharts } from '../utils/chartRecommender';
import { buildChartConfig } from '../utils/chartDataBuilder';
import DynamicChart from '../components/DynamicChart';
import SchemaView from '../components/SchemaView';
import type { JsonSchema, ChartRecommendation } from '../types/schema';
import type { ChartData, ChartOptions } from 'chart.js';

// ─── Chart config type ────────────────────────────────────────────────────────
interface ChartConfig {
  recommendation: ChartRecommendation;
  chartData: ChartData;
  chartOptions: ChartOptions;
}

const CHART_META: Record<string, { icon: string; label: string }> = {
  bar: { icon: '📊', label: 'Bar' },
  line: { icon: '📈', label: 'Line' },
  area: { icon: '🏔️', label: 'Area' },
  pie: { icon: '🥧', label: 'Pie' },
  doughnut: { icon: '🍩', label: 'Doughnut' },
  radar: { icon: '🕸️', label: 'Radar' },
  polarArea: { icon: '🎯', label: 'Polar' },
  bubble: { icon: '🫧', label: 'Bubble' },
  scatter: { icon: '✨', label: 'Scatter' },
  mixed: { icon: '🎨', label: 'Mixed' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ReportsPage = () => {
  const theme = useTheme();

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

  // ── Chart state ────────────────────────────────────────────────────────────
  const [chartParsed, setChartParsed] = useState<Record<string, unknown>[] | null>(null);
  const [chartSchema, setChartSchema] = useState<JsonSchema | null>(null);
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [chartActiveTab, setChartActiveTab] = useState<string>('table');
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartIsAnalyzing, setChartIsAnalyzing] = useState(false);

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

  // ── Auto-analyse dataTable for charts whenever it changes ──────────────────
  const analyseDataTable = useCallback((rows: Record<string, unknown>[]) => {
    setChartError(null);
    setChartIsAnalyzing(true);
    setTimeout(() => {
      try {
        if (!Array.isArray(rows) || rows.length === 0)
          throw new Error('Query returned no data to visualise.');
        const data = convertToJSON(rows);
        const inferredSchema = inferSchema(data);
        const recs = recommendCharts(inferredSchema);
        const configs: ChartConfig[] = recs.map((rec) => {
          const { chartData, chartOptions } = buildChartConfig(data, inferredSchema, rec);
          return { recommendation: rec, chartData, chartOptions };
        });
        console.log(JSON.stringify(data))
        setChartParsed(rows);
        setChartSchema(inferredSchema);
        setChartConfigs(configs);
        setChartActiveTab(configs[0]?.recommendation.chartType ?? 'table');
      } catch (e) {
        setChartError(e instanceof Error ? e.message : 'Could not build charts.');
        setChartConfigs([]);
      } finally {
        setChartIsAnalyzing(false);
      }
    }, 400);
  }, []);

  function convertToJSON(data: Record<string, unknown>[]): Record<string, unknown>[] {
    if (data.length < 2) {
      return [];
    }

    // First row contains the headers
    const headers = data[0] as unknown as string[];

    const result: Record<string | number, unknown>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as unknown as (string | number)[];
      const obj: Record<string | number, unknown> = {};

      headers.forEach((header, index) => {
        const cell = row[index];
        if (typeof cell === "string" && isStringNumber(cell)) {
          obj[header] = Number(cell); // convert numeric string to number
        } else {
          obj[header] = cell;
        }
      });

      result.push(obj);
    }

    return result;
  }

  function isStringNumber(value: string): boolean {
    return /^-?\d+(\.\d+)?$/.test(value);
  }
  useEffect(() => {
    if (dataTable && dataTable.rows.length > 0) {
      // Reset chart state first
      setChartParsed(null);
      setChartSchema(null);
      setChartConfigs([]);
      setChartError(null);
      analyseDataTable(dataTable.rows);
    } else {
      setChartParsed(null);
      setChartSchema(null);
      setChartConfigs([]);
      setChartError(null);
    }
  }, [dataTable, analyseDataTable]);

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

      {/* ── Chart Visualisation Panel ─────────────────────────────────────────── */}
      {hasSubmitted && !isLoading && (
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Chart Panel header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(248,250,252,0.8)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Chart Visualisation
              </Typography>
              {chartIsAnalyzing && <CircularProgress size={16} />}
            </Box>
            {chartConfigs.length > 0 && (
              <Chip
                label={`${chartConfigs.length} Chart${chartConfigs.length > 1 ? ' Types' : ' Type'}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              />
            )}
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Analysing state */}
            {chartIsAnalyzing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={36} />
              </Box>
            )}

            {/* Chart error */}
            {!chartIsAnalyzing && chartError && (
              <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  {chartError}
                </Alert>
              </Box>
            )}

            {/* No data yet */}
            {!chartIsAnalyzing && !chartError && chartConfigs.length === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">
                  Submit a query to visualise the results as charts.
                </Typography>
              </Box>
            )}

            {/* ── Chart Results ── */}
            {!chartIsAnalyzing && !chartError && chartParsed && chartSchema && chartConfigs.length > 0 && (() => {
              const bestRec = chartConfigs[0]?.recommendation;
              const activeConfig = chartConfigs.find((c) => c.recommendation.chartType === chartActiveTab);
              return (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, animation: 'fadeUp 0.4s ease' }}>

                  {/* Summary banner */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.primary.light}55`,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}0d, ${theme.palette.primary.light}0a)`,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography fontSize="2rem" lineHeight={1} sx={{ filter: 'drop-shadow(0 0 6px rgba(25,118,210,0.4))' }}>
                      {CHART_META[bestRec.chartType]?.icon ?? '📊'}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Chip
                          label={`${chartConfigs.length} Chart${chartConfigs.length > 1 ? ' Types' : ' Type'} Supported`}
                          size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={chartSchema.domain}
                          size="small" color="info" variant="outlined" sx={{ fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={`${chartSchema.rowCount} rows · ${chartSchema.fields.length} fields`}
                          size="small" variant="outlined" sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                        {bestRec.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {chartConfigs.map((c, i) => (
                          <Chip
                            key={c.recommendation.chartType}
                            label={`${CHART_META[c.recommendation.chartType]?.icon} ${CHART_META[c.recommendation.chartType]?.label}${i === 0 ? ' ★ Best' : ''}`}
                            size="small"
                            color={i === 0 ? 'primary' : 'default'}
                            variant={i === 0 ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.72rem', fontWeight: i === 0 ? 700 : 400 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Paper>

                  {/* Tabs */}
                  <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Tabs
                        value={chartActiveTab}
                        onChange={(_, v: string) => { if (v !== 'divider') setChartActiveTab(v); }}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                          minHeight: 44,
                          '& .MuiTab-root': {
                            minHeight: 44,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 1.5,
                          },
                        }}
                      >
                        {chartConfigs.map((c, i) => {
                          const meta = CHART_META[c.recommendation.chartType];
                          return (
                            <Tooltip key={c.recommendation.chartType} title={c.recommendation.reasoning} arrow>
                              <Tab
                                value={c.recommendation.chartType}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{ fontSize: '1rem' }}>{meta?.icon}</span>
                                    <span>{meta?.label}</span>
                                    {i === 0 && (
                                      <Chip label="★ Best" size="small" color="warning" sx={{ height: 16, fontSize: '0.58rem', ml: 0.3 }} />
                                    )}
                                  </Box>
                                }
                              />
                            </Tooltip>
                          );
                        })}

                        {/* Divider Tab */}
                        <Tab
                          value="divider"
                          disabled
                          label={<Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto', mx: 0.5 }} />}
                          sx={{ minWidth: 'auto', p: 0, cursor: 'default' }}
                        />

                        {/* Data tabs */}
                        <Tab
                          value="table"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TableChartIcon sx={{ fontSize: 15 }} />
                              <span>Table</span>
                            </Box>
                          }
                        />
                        <Tab
                          value="schema"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccountTreeIcon sx={{ fontSize: 15 }} />
                              <span>Schema</span>
                            </Box>
                          }
                        />
                      </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ p: 3, minHeight: 400 }}>
                      {/* Active chart */}
                      {activeConfig && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography fontSize="1.1rem">
                                {CHART_META[activeConfig.recommendation.chartType]?.icon}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                {activeConfig.recommendation.title}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                              <PsychologyIcon sx={{ fontSize: 14, color: 'primary.light', mt: 0.2, flexShrink: 0 }} />
                              <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                                {activeConfig.recommendation.reasoning}
                              </Typography>
                            </Box>
                          </Box>
                          <Box key={activeConfig.recommendation.chartType} sx={{ width: '100%', height: 360, position: 'relative' }}>
                            <DynamicChart
                              chartType={activeConfig.recommendation.chartType}
                              chartData={activeConfig.chartData}
                              chartOptions={activeConfig.chartOptions}
                            />
                          </Box>
                        </Box>
                      )}

                      {/* Table tab */}
                      {chartActiveTab === 'table' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <TableChartIcon fontSize="small" color="primary" />
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                              Data Table — {chartParsed.length} rows
                            </Typography>
                          </Box>
                          <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                              <Box component="thead">
                                <Box component="tr">
                                  {chartSchema.fields.map((f) => (
                                    <Box
                                      component="th"
                                      key={f.key}
                                      sx={{
                                        px: 2, py: 1.5,
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        color: 'primary.contrastText',
                                        fontSize: '0.78rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        whiteSpace: 'nowrap',
                                        bgcolor: 'primary.main',
                                        borderBottom: '2px solid',
                                        borderColor: 'primary.dark',
                                      }}
                                    >
                                      {f.label}
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                              <Box component="tbody">
                                {chartParsed.map((row, idx) => (
                                  <Box
                                    component="tr"
                                    key={idx}
                                    sx={{
                                      bgcolor: idx % 2 === 0 ? 'background.paper' : (t) =>
                                        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(25,118,210,0.03)',
                                      transition: 'background 0.15s',
                                      '&:hover': {
                                        background: (t) =>
                                          t.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(25,118,210,0.06)',
                                      },
                                    }}
                                  >
                                    {chartSchema.fields.map((f) => (
                                      <Box
                                        component="td"
                                        key={f.key}
                                        sx={{
                                          px: 2, py: 1.25,
                                          color: 'text.secondary',
                                          fontSize: '0.85rem',
                                          borderBottom: '1px solid',
                                          borderColor: 'divider',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {String(row[f.key] ?? '—')}
                                      </Box>
                                    ))}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Schema tab */}
                      {chartActiveTab === 'schema' && (
                        <SchemaView
                          fields={chartSchema.fields}
                          rowCount={chartSchema.rowCount}
                          domain={chartSchema.domain}
                        />
                      )}
                    </Box>
                  </Paper>
                </Box>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
