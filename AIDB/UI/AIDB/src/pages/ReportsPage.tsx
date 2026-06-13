import { useState, useEffect, useCallback } from 'react';
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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Send as SendIcon,
  Storage as StorageIcon,
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
import type { JsonSchema, ChartRecommendation } from '../types/Schema';
import type { AIRecommendChartsRequest } from '../types/AIRecommendChartsRequest';
import type { ChartConfig } from '../types/ChartConfig';
import ReportChart from '../components/ReportChart';



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

  // ── Pagination state ───────────────────────────────────────────────────────
  const DATA_TABLE_PAGE_SIZE = 10;
  const [dataTablePage, setDataTablePage] = useState<number>(1);

  // ── Chart state ────────────────────────────────────────────────────────────
  const [chartParsed, setChartParsed] = useState<Record<string, unknown>[] | null>(null);
  const [chartSchema, setChartSchema] = useState<JsonSchema | null>(null);
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [chartActiveTab, setChartActiveTab] = useState<string>('table');
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartIsAnalyzing, setChartIsAnalyzing] = useState(false);
  const [chartRecommendationMode, setChartRecommendationMode] = useState<'algorithm' | 'ai'>('algorithm');

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

    const run = async () => {
      try {
        if (!Array.isArray(rows) || rows.length === 0)
          throw new Error('Query returned no data to visualise.');
        const data = convertToJSON(rows);
        const inferredSchema = inferSchema(data);

        let recs: ChartRecommendation[];

        if (chartRecommendationMode === 'ai') {
          // ── AI-powered chart recommendation ────────────────────────────
          const request: AIRecommendChartsRequest = {
            aiService: selectedAiService || undefined,
            aiModel: selectedAiModel || undefined,
            title: inferredSchema.domain || 'Chart Recommendations',
            schema: inferredSchema.fields.map((f) => ({
              key: f.key,
              type: f.type,
              isString: f.type === 'string',
              isNumeric: f.isNumeric,
              isDate: f.isDate,
              isCategorical: f.isCategorical,
            })),
          };
          console.log("request ", JSON.stringify(request));
          const response = await AIAPI.AIrecommendCharts(request);
          const raw: string =
            typeof response === 'string'
              ? response
              : (response as any)?.data ?? JSON.stringify(response);
          // Parse AI response — expected to be a JSON array of ChartRecommendation
          const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          const parsed = JSON.parse(cleaned) as ChartRecommendation | ChartRecommendation[];
          recs = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          // ── Algorithm-based chart recommendation ───────────────────────
          await new Promise<void>((resolve) => setTimeout(resolve, 400));
          recs = recommendCharts(inferredSchema);
        }

        const configs: ChartConfig[] = recs.map((rec) => {
          const { chartData, chartOptions } = buildChartConfig(data, inferredSchema, rec);
          return { recommendation: rec, chartData, chartOptions };
        });

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
    };

    run();
  }, [chartRecommendationMode, selectedAiService, selectedAiModel]);

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
    setDataTablePage(1);

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
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.0 }}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} >
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
      {
        hasSubmitted && (
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
              <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
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
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
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
                      <Typography variant="caption" color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
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
                      <Typography variant="caption" color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
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
              {!isLoading && !resultError && dataTable && (() => {
                // rows[0] is the header array; rows[1..n] are data arrays
                const headers = dataTable.rows[0] as unknown as string[];
                const dataRows = dataTable.rows.slice(1);
                const totalRows = dataRows.length;
                return (
                  <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>

                    {/* Label row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
                      >
                        Data Table
                      </Typography>
                      <Chip
                        label={`${totalRows} row${totalRows !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </Box>

                    {/* Table panel — same border/bg as Summary & Generated SQL */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.35)'
                            : 'rgba(240,244,255,0.8)',
                      }}
                    >
                      {totalRows === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                          <BarChartIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">Query returned no rows.</Typography>
                        </Box>
                      ) : (
                        <>
                          <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ minWidth: 500 }}>
                              <TableHead>
                                <TableRow>
                                  {headers.map((col, i) => (
                                    <TableCell key={i}>{col}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dataRows
                                  .slice(
                                    (dataTablePage - 1) * DATA_TABLE_PAGE_SIZE,
                                    dataTablePage * DATA_TABLE_PAGE_SIZE,
                                  )
                                  .map((row, idx) => (
                                    <TableRow
                                      key={(dataTablePage - 1) * DATA_TABLE_PAGE_SIZE + idx}
                                      hover
                                    >
                                      {(row as unknown as unknown[]).map((cell, ci) => (
                                        <TableCell key={ci}>
                                          {String(cell ?? '—')}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {totalRows > DATA_TABLE_PAGE_SIZE && (
                            <>
                              <Divider />
                              <Box
                                sx={{
                                  px: 2, py: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                }}
                              >
                                <Typography variant="caption" color="text.disabled">
                                  Showing{' '}
                                  {Math.min((dataTablePage - 1) * DATA_TABLE_PAGE_SIZE + 1, totalRows)}–
                                  {Math.min(dataTablePage * DATA_TABLE_PAGE_SIZE, totalRows)}{' '}
                                  of {totalRows} record{totalRows !== 1 ? 's' : ''}
                                  {selectedDb ? ` from "${selectedDb}"` : ''}
                                </Typography>
                                <Pagination
                                  count={Math.ceil(totalRows / DATA_TABLE_PAGE_SIZE)}
                                  page={dataTablePage}
                                  onChange={(_, p) => setDataTablePage(p)}
                                  size="small"
                                  color="primary"
                                  shape="rounded"
                                  siblingCount={1}
                                />
                              </Box>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })()}
            </CardContent>
          </Card>
        )
      }


      {/* ── Chart Visualisation Panel ─────────────────────────────────────────── */}
      {
        hasSubmitted && !isLoading && (
          <ReportChart
            chartIsAnalyzing={chartIsAnalyzing}
            chartError={chartError}
            chartParsed={chartParsed}
            chartSchema={chartSchema}
            chartConfigs={chartConfigs}
            chartActiveTab={chartActiveTab}
            onTabChange={setChartActiveTab}
            chartRecommendationMode={chartRecommendationMode}
            onRecommendationModeChange={setChartRecommendationMode}
          />
        )
      }
    </Box >
  );
};
